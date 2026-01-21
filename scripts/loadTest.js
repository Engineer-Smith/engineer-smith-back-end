#!/usr/bin/env node
/**
 * Load Test Script - Simulates multiple students taking tests concurrently
 *
 * Usage:
 *   node scripts/loadTest.js [options]
 *
 * Options:
 *   --users=N        Number of test users to create (default: 10)
 *   --url=URL        API base URL (default: http://localhost:3000)
 *   --testId=ID      Test ID to use (required, or use --list-tests)
 *   --list-tests     List available tests and exit
 *   --cleanup-only   Only cleanup test users (no load test)
 *   --keep-users     Don't cleanup test users after test
 *   --fast           Fast mode for stress testing (bypasses realistic timing)
 *
 * Examples:
 *   node scripts/loadTest.js --list-tests
 *   node scripts/loadTest.js --testId=abc123 --users=20
 *   node scripts/loadTest.js --testId=abc123 --users=50 --fast   # Stress test
 *   node scripts/loadTest.js --cleanup-only
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// ============================================
// CONFIGURATION
// ============================================

const isFastMode = process.argv.includes('--fast');

const CONFIG = {
  mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://jordanburger22:9ibAWAvfaFCH78oo@cluster0.hazfttb.mongodb.net/engineersmith',
  apiUrl: process.argv.find(a => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000',
  numUsers: parseInt(process.argv.find(a => a.startsWith('--users='))?.split('=')[1] || '10'),
  testId: process.argv.find(a => a.startsWith('--testId='))?.split('=')[1],
  listTests: process.argv.includes('--list-tests'),
  cleanupOnly: process.argv.includes('--cleanup-only'),
  keepUsers: process.argv.includes('--keep-users'),
  fastMode: isFastMode,

  // Timing - realistic by default, fast for stress testing
  staggerDelay: isFastMode ? 500 : 3000,           // Time between user starts (3s realistic)
  minAnswerDelay: isFastMode ? 500 : 10000,        // Min time per question (10s realistic)
  maxAnswerDelay: isFastMode ? 2000 : 45000,       // Max time per question (45s realistic)
  readingDelay: isFastMode ? 200 : 5000,           // Time to "read" before starting (5s realistic)
  loginDelay: isFastMode ? 100 : 1000,             // Delay after login (1s realistic)

  testUserPrefix: 'loadtest_user_',
  testUserPassword: 'LoadTest123!',
};

// ============================================
// MONGOOSE SCHEMAS (simplified for script)
// ============================================

const userSchema = new mongoose.Schema({
  loginId: { type: String, required: true, unique: true },
  email: String,
  firstName: String,
  lastName: String,
  hashedPassword: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  role: { type: String, enum: ['admin', 'instructor', 'student'] },
  isSSO: { type: Boolean, default: false },
  unlimitedAttempts: { type: Boolean, default: true },
}, { timestamps: true, collection: 'users' });

const testSchema = new mongoose.Schema({
  title: String,
  status: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  isGlobal: Boolean,
  questions: Array,
  sections: Array,
  settings: Object,
}, { collection: 'tests' });

const orgSchema = new mongoose.Schema({
  name: String,
  isSuperOrg: Boolean,
}, { collection: 'organizations' });

const testSessionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  status: String,
}, { collection: 'testsessions' });

let User, Test, Organization, TestSession;

// ============================================
// METRICS TRACKING
// ============================================

const metrics = {
  usersCreated: 0,
  loginsSuccessful: 0,
  loginsFailed: 0,
  sessionsStarted: 0,
  sessionsStartFailed: 0,
  answersSubmitted: 0,
  answersFailed: 0,
  sessionsCompleted: 0,
  sessionsCompleteFailed: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = (min = CONFIG.minAnswerDelay, max = CONFIG.maxAnswerDelay) => 
  Math.floor(Math.random() * (max - min) + min);

// Format time nicely
const formatTime = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

async function makeRequest(method, endpoint, body = null, cookies = '') {
  const startTime = Date.now();
  const url = `${CONFIG.apiUrl}${endpoint}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookies ? { 'Cookie': cookies } : {}),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    metrics.responseTimes.push({ endpoint, responseTime, status: response.status });

    // Extract cookies from response
    const setCookies = response.headers.getSetCookie?.() || [];
    const cookieString = setCookies.map(c => c.split(';')[0]).join('; ');

    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data,
      cookies: cookieString || cookies,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    metrics.responseTimes.push({ endpoint, responseTime, status: 'error' });
    return {
      ok: false,
      status: 'error',
      data: { error: error.message },
      cookies: '',
      responseTime,
    };
  }
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function connectDB() {
  await mongoose.connect(CONFIG.mongoUrl);
  console.log('Connected to MongoDB');

  User = mongoose.model('User', userSchema);
  Test = mongoose.model('Test', testSchema);
  Organization = mongoose.model('Organization', orgSchema);
  TestSession = mongoose.model('TestSession', testSessionSchema);
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

async function getOrganization() {
  // Get the super org or first available org
  let org = await Organization.findOne({ isSuperOrg: true });
  if (!org) {
    org = await Organization.findOne();
  }
  if (!org) {
    throw new Error('No organization found in database');
  }
  return org;
}

async function listAvailableTests() {
  const tests = await Test.find({ status: 'active' })
    .select('_id title isGlobal organizationId settings')
    .lean();

  console.log('\n📋 Available Tests:\n');
  console.log('─'.repeat(80));

  for (const test of tests) {
    const questionCount = test.settings?.useSections
      ? test.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0)
      : test.questions?.length || 0;

    console.log(`  ID: ${test._id}`);
    console.log(`  Title: ${test.title}`);
    console.log(`  Global: ${test.isGlobal ? 'Yes' : 'No'}`);
    console.log(`  Questions: ${questionCount || 'Unknown'}`);
    console.log('─'.repeat(80));
  }

  if (tests.length === 0) {
    console.log('  No active tests found');
  }

  console.log(`\nTotal: ${tests.length} tests\n`);
}

async function createTestUsers(count, organizationId) {
  console.log(`\n👥 Creating ${count} test users...`);
  const users = [];
  const hashedPassword = await bcrypt.hash(CONFIG.testUserPassword, 10);

  for (let i = 0; i < count; i++) {
    const loginId = `${CONFIG.testUserPrefix}${Date.now()}_${i}`;

    try {
      const user = await User.create({
        loginId,
        firstName: 'LoadTest',
        lastName: `User${i}`,
        email: `${loginId}@loadtest.local`,
        hashedPassword,
        organizationId,
        role: 'student',
        isSSO: false,
        unlimitedAttempts: true, // So we can run multiple tests
      });

      users.push({
        _id: user._id,
        loginId,
        password: CONFIG.testUserPassword
      });
      metrics.usersCreated++;

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`  Created ${i + 1}/${count} users\r`);
      }
    } catch (error) {
      console.error(`  Failed to create user ${i}: ${error.message}`);
      metrics.errors.push({ phase: 'createUser', error: error.message });
    }
  }

  console.log(`  ✅ Created ${users.length} test users`);
  return users;
}

async function cleanupTestUsers() {
  console.log('\n🧹 Cleaning up test users...');

  // Find all load test users
  const testUsers = await User.find({
    loginId: { $regex: `^${CONFIG.testUserPrefix}` }
  }).select('_id loginId');

  if (testUsers.length === 0) {
    console.log('  No test users found to cleanup');
    return;
  }

  const userIds = testUsers.map(u => u._id);

  // Delete test sessions created by these users
  const sessionsDeleted = await TestSession.deleteMany({ userId: { $in: userIds } });
  console.log(`  Deleted ${sessionsDeleted.deletedCount} test sessions`);

  // Delete the users
  const usersDeleted = await User.deleteMany({ _id: { $in: userIds } });
  console.log(`  ✅ Deleted ${usersDeleted.deletedCount} test users`);
}

// ============================================
// LOAD TEST SIMULATION
// ============================================

async function simulateStudent(user, testId, studentNumber) {
  const shortId = user.loginId.slice(-8);
  const studentLog = (msg) => console.log(`  [Student ${studentNumber}] ${msg}`);
  let cookies = '';

  try {
    // 1. Login
    const loginResult = await makeRequest('POST', '/auth/login', {
      loginCredential: user.loginId,
      password: user.password,
    });

    if (!loginResult.ok) {
      metrics.loginsFailed++;
      studentLog(`❌ Login failed: ${loginResult.status} - ${loginResult.data?.message || 'Unknown error'}`);
      return { success: false, phase: 'login', error: loginResult.data };
    }

    metrics.loginsSuccessful++;
    cookies = loginResult.cookies;
    studentLog(`✅ Logged in (${loginResult.responseTime}ms)`);

    // Realistic delay after login - user finding the test
    await sleep(CONFIG.loginDelay);

    // 2. Start test session
    const startResult = await makeRequest('POST', '/test-sessions', { testId }, cookies);

    if (!startResult.ok) {
      metrics.sessionsStartFailed++;
      studentLog(`❌ Session start failed: ${startResult.status}`);
      return { success: false, phase: 'startSession', error: startResult.data };
    }

    metrics.sessionsStarted++;
    const sessionId = startResult.data.session?.sessionId;
    const question = startResult.data.question;
    studentLog(`✅ Test started (${startResult.responseTime}ms)`);

    if (!sessionId) {
      return { success: false, phase: 'startSession', error: 'No sessionId returned' };
    }

    // Reading delay - student reading instructions
    studentLog(`📖 Reading instructions...`);
    await sleep(CONFIG.readingDelay);

    // 3. Answer questions
    let currentQuestion = question;
    let questionIndex = 0;
    let continueAnswering = true;
    let questionsAnswered = 0;

    while (continueAnswering) {
      // Realistic thinking/answering time
      const thinkTime = randomDelay();
      if (!CONFIG.fastMode) {
        studentLog(`🤔 Thinking about Q${questionIndex + 1}... (${formatTime(thinkTime)})`);
      }
      await sleep(thinkTime);

      // Generate a random answer based on question type
      const answer = generateRandomAnswer(currentQuestion?.questionState);

      const answerResult = await makeRequest(
        'POST',
        `/test-sessions/${sessionId}/submit-answer`,
        { answer },
        cookies
      );

      if (!answerResult.ok) {
        metrics.answersFailed++;
        studentLog(`❌ Answer ${questionIndex + 1} failed: ${answerResult.status}`);
      } else {
        metrics.answersSubmitted++;
        questionsAnswered++;
        studentLog(`📝 Answered Q${questionIndex + 1} (${answerResult.responseTime}ms)`);
      }

      // Check if we should continue
      const action = answerResult.data?.action;

      if (action === 'test_complete' || action === 'confirm_submit') {
        continueAnswering = false;
      } else if (action === 'section_complete' || action === 'section_transition') {
        // Handle section transition
        studentLog(`📑 Section complete, moving to next...`);

        // Small delay between sections
        await sleep(CONFIG.fastMode ? 200 : 2000);

        // Complete the section
        const sectionResult = await makeRequest(
          'POST',
          `/test-sessions/${sessionId}/complete-section`,
          {},
          cookies
        );

        if (sectionResult.data?.data?.currentQuestionIndex !== undefined) {
          questionIndex = sectionResult.data.data.currentQuestionIndex;
        } else {
          questionIndex++;
        }

        currentQuestion = answerResult.data;
      } else if (action === 'next_question') {
        questionIndex++;
        currentQuestion = answerResult.data;
      } else if (action === 'time_expired') {
        continueAnswering = false;
        studentLog(`⏰ Time expired`);
      } else {
        // Default: try next question
        questionIndex++;
        currentQuestion = answerResult.data;

        // Safety limit
        if (questionIndex > 100) {
          continueAnswering = false;
          studentLog(`⚠️ Safety limit reached`);
        }
      }
    }

    // 4. Submit test - small delay to "review"
    if (!CONFIG.fastMode) {
      studentLog(`👀 Reviewing answers...`);
      await sleep(randomDelay(2000, 5000));
    }

    const submitResult = await makeRequest(
      'POST',
      `/test-sessions/${sessionId}/submit`,
      { forceSubmit: true },
      cookies
    );

    if (!submitResult.ok && submitResult.data?.error !== 'Test session is not in progress') {
      metrics.sessionsCompleteFailed++;
      studentLog(`❌ Submit failed: ${submitResult.status}`);
      return { success: false, phase: 'submit', error: submitResult.data };
    }

    metrics.sessionsCompleted++;
    const score = submitResult.data?.finalScore?.percentage;
    studentLog(`🎉 Completed! Score: ${score !== undefined ? `${score}%` : 'N/A'} | Questions: ${questionsAnswered}`);

    return { success: true, sessionId, score, questionsAnswered };

  } catch (error) {
    studentLog(`💥 Error: ${error.message}`);
    metrics.errors.push({ user: user.loginId, error: error.message });
    return { success: false, phase: 'unknown', error: error.message };
  }
}

function generateRandomAnswer(questionState) {
  if (!questionState) return 0;

  const type = questionState.type;

  switch (type) {
    case 'multipleChoice':
      // Random index from options
      const optionCount = questionState.options?.length || 4;
      return Math.floor(Math.random() * optionCount);

    case 'trueFalse':
      // 0 = True, 1 = False
      return Math.random() > 0.5 ? 0 : 1;

    case 'fillInTheBlank':
      // Return object with blank IDs and random values
      const blanks = questionState.blanks || [];
      const answers = {};
      blanks.forEach(blank => {
        answers[blank.id] = 'test_answer';
      });
      return answers;

    case 'codeChallenge':
    case 'codeDebugging':
      // Return simple code
      return 'function solution() { return null; }';

    default:
      return 0;
  }
}

async function runLoadTest(testId) {
  console.log('\n🚀 Starting Load Test');
  console.log('═'.repeat(60));
  console.log(`  API URL: ${CONFIG.apiUrl}`);
  console.log(`  Users: ${CONFIG.numUsers}`);
  console.log(`  Test ID: ${testId}`);
  console.log(`  Mode: ${CONFIG.fastMode ? '⚡ FAST (stress test)' : '🐢 REALISTIC (human-like timing)'}`);
  if (!CONFIG.fastMode) {
    console.log(`  Stagger: ${formatTime(CONFIG.staggerDelay)} between users`);
    console.log(`  Answer time: ${formatTime(CONFIG.minAnswerDelay)} - ${formatTime(CONFIG.maxAnswerDelay)} per question`);
  }
  console.log('═'.repeat(60));

  metrics.startTime = Date.now();

  // Get organization
  const org = await getOrganization();
  console.log(`  Organization: ${org.name}`);

  // Create test users
  const users = await createTestUsers(CONFIG.numUsers, org._id);

  if (users.length === 0) {
    console.log('\n❌ No users created, aborting test');
    return;
  }

  // Run simulations with staggered starts
  console.log('\n🏃 Starting test sessions...\n');

  const results = [];
  const runningPromises = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const studentNumber = i + 1;

    console.log(`  [Student ${studentNumber}] 🚦 Starting...`);

    // Start this student's simulation
    const promise = simulateStudent(user, testId, studentNumber)
      .then(result => {
        results.push(result);
        return result;
      });

    runningPromises.push(promise);

    // Stagger the next user start (except for the last one)
    if (i < users.length - 1) {
      await sleep(CONFIG.staggerDelay);
    }
  }

  // Wait for all students to complete
  console.log('\n⏳ Waiting for all students to complete...\n');
  await Promise.all(runningPromises);

  metrics.endTime = Date.now();

  // Cleanup unless --keep-users is specified
  if (!CONFIG.keepUsers) {
    await cleanupTestUsers();
  } else {
    console.log('\n⚠️ Keeping test users (--keep-users flag)');
  }

  // Print results
  printMetrics(results);
}

function printMetrics(results) {
  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const avgResponseTime = metrics.responseTimes.length > 0
    ? Math.round(metrics.responseTimes.reduce((sum, r) => sum + r.responseTime, 0) / metrics.responseTimes.length)
    : 0;

  const successCount = results.filter(r => r.success).length;
  const totalQuestions = results.reduce((sum, r) => sum + (r.questionsAnswered || 0), 0);

  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('═'.repeat(60));
  console.log(`  Duration: ${formatTime(duration * 1000)}`);
  console.log(`  Users: ${CONFIG.numUsers}`);
  console.log(`  Mode: ${CONFIG.fastMode ? 'Fast' : 'Realistic'}`);
  console.log('');
  console.log('  👥 Users:');
  console.log(`     Created: ${metrics.usersCreated}`);
  console.log(`     Logins Success: ${metrics.loginsSuccessful}`);
  console.log(`     Logins Failed: ${metrics.loginsFailed}`);
  console.log('');
  console.log('  📝 Sessions:');
  console.log(`     Started: ${metrics.sessionsStarted}`);
  console.log(`     Start Failed: ${metrics.sessionsStartFailed}`);
  console.log(`     Completed: ${metrics.sessionsCompleted}`);
  console.log(`     Complete Failed: ${metrics.sessionsCompleteFailed}`);
  console.log('');
  console.log('  ✏️ Answers:');
  console.log(`     Submitted: ${metrics.answersSubmitted}`);
  console.log(`     Failed: ${metrics.answersFailed}`);
  console.log(`     Total Questions: ${totalQuestions}`);
  console.log('');
  console.log('  ⚡ Performance:');
  console.log(`     Avg Response Time: ${avgResponseTime}ms`);
  console.log(`     Total Requests: ${metrics.responseTimes.length}`);
  console.log(`     Requests/sec: ${(metrics.responseTimes.length / duration).toFixed(2)}`);
  console.log('');
  console.log('  ✅ Success Rate:');
  console.log(`     ${successCount}/${results.length} (${Math.round(successCount / results.length * 100)}%)`);
  console.log('═'.repeat(60));

  if (metrics.errors.length > 0) {
    console.log('\n⚠️ Errors:');
    metrics.errors.slice(0, 10).forEach(e => {
      console.log(`  - ${e.phase || e.user}: ${e.error}`);
    });
    if (metrics.errors.length > 10) {
      console.log(`  ... and ${metrics.errors.length - 10} more`);
    }
  }

  // Response time breakdown by endpoint
  const endpointTimes = {};
  metrics.responseTimes.forEach(r => {
    if (!endpointTimes[r.endpoint]) {
      endpointTimes[r.endpoint] = { times: [], errors: 0 };
    }
    if (typeof r.responseTime === 'number') {
      endpointTimes[r.endpoint].times.push(r.responseTime);
    }
    if (r.status >= 400 || r.status === 'error') {
      endpointTimes[r.endpoint].errors++;
    }
  });

  console.log('\n📈 Response Times by Endpoint:');
  Object.entries(endpointTimes).forEach(([endpoint, data]) => {
    if (data.times.length === 0) return;
    const avg = Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length);
    const max = Math.max(...data.times);
    const min = Math.min(...data.times);
    console.log(`  ${endpoint}`);
    console.log(`    avg: ${avg}ms | min: ${min}ms | max: ${max}ms | count: ${data.times.length} | errors: ${data.errors}`);
  });
}

// ============================================
// MAIN
// ============================================

async function main() {
  try {
    await connectDB();

    if (CONFIG.listTests) {
      await listAvailableTests();
      await disconnectDB();
      return;
    }

    if (CONFIG.cleanupOnly) {
      await cleanupTestUsers();
      await disconnectDB();
      return;
    }

    if (!CONFIG.testId) {
      console.log('\n❌ Error: --testId is required');
      console.log('   Use --list-tests to see available tests');
      console.log('\n   Examples:');
      console.log('     node scripts/loadTest.js --testId=abc123 --users=10');
      console.log('     node scripts/loadTest.js --testId=abc123 --users=50 --fast\n');
      await disconnectDB();
      process.exit(1);
    }

    await runLoadTest(CONFIG.testId);
    await disconnectDB();

  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect().catch(() => { });
    process.exit(1);
  }
}

main();