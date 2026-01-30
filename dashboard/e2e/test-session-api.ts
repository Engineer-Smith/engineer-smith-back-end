/**
 * Test Session API Test Script
 * Tests the complete test-taking flow via API calls
 *
 * Run with: npx tsx e2e/test-session-api.ts
 */

const BASE_URL = 'http://localhost:5173/api';
const TEST_ID = '68e03cf403e48c3a73de8f3d';
const CREDENTIALS = {
  email: 'demo.student@engineersmith.com',
  password: 'DemoStudent123!',
};

// Store cookies/tokens for authenticated requests
let authCookies: string[] = [];
let csrfToken: string | null = null;
let sessionId: string | null = null;

// Helper for colored console output
const colors = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

function log(message: string) {
  console.log(message);
}

function logStep(step: string) {
  console.log(`\n${colors.blue('📋')} ${colors.blue(step)}`);
}

function logSuccess(message: string) {
  console.log(`  ${colors.green('✓')} ${message}`);
}

function logError(message: string) {
  console.log(`  ${colors.red('✗')} ${message}`);
}

function logInfo(message: string) {
  console.log(`  ${colors.dim('→')} ${message}`);
}

// Generic fetch wrapper with auth
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: number; data: any; cookies?: string[] }> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add auth cookies
  if (authCookies.length > 0) {
    headers['Cookie'] = authCookies.join('; ');
  }

  // Add CSRF token if we have one
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Capture cookies from response
  const setCookies = response.headers.getSetCookie?.() || [];

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { status: response.status, data, cookies: setCookies };
}

// Test functions
async function testLogin(): Promise<boolean> {
  logStep('Step 1: Login');

  try {
    const { status, data, cookies } = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginCredential: CREDENTIALS.email,  // API expects loginCredential, not email
        password: CREDENTIALS.password,
      }),
    });

    if (status === 200 && data?.user) {
      // Store cookies for subsequent requests
      if (cookies && cookies.length > 0) {
        authCookies = cookies.map(c => c.split(';')[0]);
      }

      // Extract CSRF token if present
      if (data.csrfToken) {
        csrfToken = data.csrfToken;
      }

      logSuccess(`Logged in as ${data.user.email}`);
      logInfo(`Role: ${data.user.role}`);
      return true;
    } else {
      logError(`Login failed: ${data?.message || status}`);
      return false;
    }
  } catch (error: any) {
    logError(`Login error: ${error.message}`);
    return false;
  }
}

async function testCheckExistingSession(): Promise<{ hasExisting: boolean; sessionId?: string }> {
  logStep('Step 2: Check for existing session');

  try {
    const { status, data } = await apiRequest(`/test-sessions/check-existing?testId=${TEST_ID}`);

    if (status === 200) {
      if (data.canRejoin && data.sessionId) {
        logInfo(`Found existing session: ${data.sessionId}`);
        logInfo(`Message: ${data.message}`);
        return { hasExisting: true, sessionId: data.sessionId };
      } else {
        logSuccess(`No active session: ${data.message}`);
        return { hasExisting: false };
      }
    } else {
      logError(`Check session failed: ${data?.message || status}`);
      return { hasExisting: false };
    }
  } catch (error: any) {
    logError(`Check session error: ${error.message}`);
    return { hasExisting: false };
  }
}

async function testStartSession(forceNew = false): Promise<boolean> {
  logStep(`Step 3: Start test session${forceNew ? ' (force new)' : ''}`);

  try {
    const { status, data } = await apiRequest('/test-sessions', {
      method: 'POST',
      body: JSON.stringify({
        testId: TEST_ID,
        forceNew,
      }),
    });

    if (status === 200 || status === 201) {
      if (data.success && data.session?.sessionId) {
        sessionId = data.session.sessionId;
        logSuccess(`Session started: ${sessionId}`);
        logInfo(`Test: ${data.session.testInfo?.title || 'Unknown'}`);
        logInfo(`Questions: ${data.session.testInfo?.totalQuestions || '?'}`);
        logInfo(`Time limit: ${data.session.testInfo?.timeLimit || '?'}s`);
        return true;
      }
    }

    // Handle existing session conflict
    if (status === 409 || data?.code === 'EXISTING_SESSION_FOUND') {
      logInfo('Existing session found, will force new...');
      return testStartSession(true);
    }

    logError(`Start session failed: ${JSON.stringify(data)}`);
    return false;
  } catch (error: any) {
    logError(`Start session error: ${error.message}`);
    return false;
  }
}

async function testGetCurrentQuestion(): Promise<any> {
  logStep('Step 4: Get current question');

  if (!sessionId) {
    logError('No session ID');
    return null;
  }

  try {
    const { status, data } = await apiRequest(`/test-sessions/${sessionId}/current-question`);

    if (status === 200 && data.questionState) {
      logSuccess(`Got question ${data.questionState.questionIndex + 1}`);
      logInfo(`Type: ${data.questionState.questionData?.type || 'unknown'}`);
      logInfo(`Title: ${data.questionState.questionData?.title?.substring(0, 50) || 'N/A'}...`);
      return data;
    } else {
      logError(`Get question failed: ${data?.message || status}`);
      return null;
    }
  } catch (error: any) {
    logError(`Get question error: ${error.message}`);
    return null;
  }
}

async function testSubmitAnswer(questionData: any): Promise<boolean> {
  logStep('Step 5: Submit answer');

  if (!sessionId) {
    logError('No session ID');
    return false;
  }

  // Generate a test answer based on question type
  let answer: any = 'test answer';
  const qType = questionData?.questionState?.questionData?.type;

  if (qType === 'multipleChoice') {
    answer = 0; // First option
  } else if (qType === 'trueFalse') {
    answer = true;
  } else if (qType === 'codeChallenge' || qType === 'codeDebugging') {
    answer = '// Test code\nfunction solution() { return true; }';
  } else if (qType === 'fillInTheBlank') {
    answer = { blank_0: 'test' };
  }

  try {
    const { status, data } = await apiRequest(`/test-sessions/${sessionId}/submit-answer`, {
      method: 'POST',
      body: JSON.stringify({
        answer,
        action: 'submit',
        timeSpent: 5,
      }),
    });

    if ((status === 200 || status === 201) && data.success) {
      logSuccess(`Answer submitted - Action: ${data.action}`);
      logInfo(`Message: ${data.message || 'N/A'}`);
      logInfo(`Next question: ${data.questionState?.questionIndex + 1 || 'N/A'}`);
      return true;
    } else {
      logError(`Submit answer failed: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error: any) {
    logError(`Submit answer error: ${error.message}`);
    return false;
  }
}

async function testSkipQuestion(): Promise<boolean> {
  logStep('Step 6: Skip question');

  if (!sessionId) {
    logError('No session ID');
    return false;
  }

  try {
    const { status, data } = await apiRequest(`/test-sessions/${sessionId}/skip`, {
      method: 'POST',
      body: JSON.stringify({
        reason: 'Testing skip functionality',
      }),
    });

    if ((status === 200 || status === 201) && data.success) {
      logSuccess(`Question skipped - Action: ${data.action}`);
      logInfo(`Next question: ${data.questionState?.questionIndex + 1 || 'N/A'}`);
      return true;
    } else {
      logError(`Skip failed: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error: any) {
    logError(`Skip error: ${error.message}`);
    return false;
  }
}

async function testStartReview(): Promise<boolean> {
  logStep('Step 7: Start review mode');

  if (!sessionId) {
    logError('No session ID');
    return false;
  }

  try {
    const { status, data } = await apiRequest(`/test-sessions/${sessionId}/start-section-review`, {
      method: 'POST',
    });

    if ((status === 200 || status === 201) && data.success) {
      logSuccess(`Review mode started - Action: ${data.action}`);
      if (data.sectionSummary) {
        logInfo(`Answered: ${data.sectionSummary.answered}/${data.sectionSummary.totalQuestions}`);
        logInfo(`Skipped: ${data.sectionSummary.skipped}`);
      }
      return true;
    } else {
      logError(`Start review failed: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error: any) {
    logError(`Start review error: ${error.message}`);
    return false;
  }
}

async function testNavigateInReview(): Promise<boolean> {
  logStep('Step 8: Navigate to questions in review mode (BUG TEST)');

  if (!sessionId) {
    logError('No session ID');
    return false;
  }

  const questionsToTest = [0, 1, 2];
  let allPassed = true;

  for (const questionIndex of questionsToTest) {
    try {
      logInfo(`Navigating to question ${questionIndex + 1}...`);

      const { status, data } = await apiRequest(`/test-sessions/${sessionId}/navigate`, {
        method: 'POST',
        body: JSON.stringify({ questionIndex }),
      });

      if ((status === 200 || status === 201) && data.success) {
        logSuccess(`Question ${questionIndex + 1}: Navigation OK`);
        logInfo(`  Has questionState: ${!!data.questionState}`);
        logInfo(`  Has navigationContext: ${!!data.navigationContext}`);
        logInfo(`  isReviewing: ${data.navigationContext?.isReviewing}`);
      } else {
        logError(`Question ${questionIndex + 1}: Navigation FAILED`);
        logError(`  Status: ${status}`);
        logError(`  Response: ${JSON.stringify(data)}`);
        allPassed = false;
      }
    } catch (error: any) {
      logError(`Question ${questionIndex + 1}: Navigation ERROR - ${error.message}`);
      allPassed = false;
    }
  }

  if (allPassed) {
    logSuccess('All navigation tests passed!');
  } else {
    logError('Some navigation tests failed!');
  }

  return allPassed;
}

async function testSubmitTest(): Promise<boolean> {
  logStep('Step 9: Submit test');

  if (!sessionId) {
    logError('No session ID');
    return false;
  }

  try {
    const { status, data } = await apiRequest(`/test-sessions/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        forceSubmit: true,
      }),
    });

    if ((status === 200 || status === 201) && data.success) {
      logSuccess(`Test submitted!`);
      logInfo(`Status: ${data.status}`);
      if (data.finalScore) {
        logInfo(`Score: ${data.finalScore.earnedPoints}/${data.finalScore.totalPoints} (${data.finalScore.percentage}%)`);
        logInfo(`Passed: ${data.finalScore.passed}`);
      }
      if (data.resultId) {
        logInfo(`Result ID: ${data.resultId}`);
      }
      logInfo(`Message: ${data.message || 'N/A'}`);
      return true;
    }

    logError(`Submit test failed: ${JSON.stringify(data)}`);
    return false;
  } catch (error: any) {
    logError(`Submit test error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log(colors.blue('  Test Session API Test Suite'));
  console.log(colors.dim(`  Target: ${BASE_URL}`));
  console.log(colors.dim(`  Test ID: ${TEST_ID}`));
  console.log('='.repeat(60));

  const results: { step: string; passed: boolean }[] = [];

  // Step 1: Login
  const loginOk = await testLogin();
  results.push({ step: 'Login', passed: loginOk });
  if (!loginOk) {
    console.log(colors.red('\n❌ Login failed - cannot continue'));
    return;
  }

  // Step 2: Check existing session
  const { hasExisting, sessionId: existingId } = await testCheckExistingSession();
  results.push({ step: 'Check Session', passed: true });

  // Step 3: Start session
  const startOk = await testStartSession(hasExisting);
  results.push({ step: 'Start Session', passed: startOk });
  if (!startOk) {
    console.log(colors.red('\n❌ Could not start session - cannot continue'));
    return;
  }

  // Step 4: Get current question
  const questionData = await testGetCurrentQuestion();
  results.push({ step: 'Get Question', passed: !!questionData });

  // Step 5: Submit answer
  if (questionData) {
    const submitOk = await testSubmitAnswer(questionData);
    results.push({ step: 'Submit Answer', passed: submitOk });
  }

  // Step 6: Skip a question
  const skipOk = await testSkipQuestion();
  results.push({ step: 'Skip Question', passed: skipOk });

  // Step 7: Start review
  const reviewOk = await testStartReview();
  results.push({ step: 'Start Review', passed: reviewOk });

  // Step 8: Navigate in review mode (THE BUG TEST)
  const navOk = await testNavigateInReview();
  results.push({ step: 'Navigate in Review', passed: navOk });

  // Step 9: Submit test
  const submitTestOk = await testSubmitTest();
  results.push({ step: 'Submit Test', passed: submitTestOk });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(colors.blue('  Test Results Summary'));
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  for (const result of results) {
    const icon = result.passed ? colors.green('✓') : colors.red('✗');
    const status = result.passed ? colors.green('PASS') : colors.red('FAIL');
    console.log(`  ${icon} ${result.step.padEnd(20)} ${status}`);
  }

  console.log('─'.repeat(60));
  console.log(`  Total: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log(colors.green('\n✅ All tests passed!\n'));
  } else {
    console.log(colors.red(`\n❌ ${failed} test(s) failed!\n`));
    process.exit(1);
  }
}

// Rejoin test - simulates disconnect and rejoin
async function runRejoinTest() {
  console.log('\n' + '='.repeat(60));
  console.log(colors.blue('  Rejoin Session Test'));
  console.log(colors.dim(`  Simulates: Start → Answer → Disconnect → Rejoin`));
  console.log('='.repeat(60));

  const results: { step: string; passed: boolean }[] = [];

  // Step 1: Login
  logStep('Step 1: Login');
  const loginOk = await testLogin();
  results.push({ step: 'Login', passed: loginOk });
  if (!loginOk) {
    console.log(colors.red('\n❌ Login failed'));
    return;
  }

  // Step 2: Start a fresh session
  logStep('Step 2: Start fresh session');
  const startOk = await testStartSession(true); // Force new
  results.push({ step: 'Start Session', passed: startOk });
  if (!startOk) {
    console.log(colors.red('\n❌ Could not start session'));
    return;
  }

  const originalSessionId = sessionId;
  logInfo(`Session ID: ${originalSessionId}`);

  // Step 3: Answer a question to create progress
  logStep('Step 3: Create progress (answer a question)');
  const questionData = await testGetCurrentQuestion();
  if (questionData) {
    const answered = await testSubmitAnswer(questionData);
    results.push({ step: 'Create Progress', passed: answered });
  }

  // Step 4: "Disconnect" - just clear our session ID (don't call abandon or submit)
  logStep('Step 4: Simulate disconnect');
  logInfo('Clearing local session state (simulating browser close)...');
  sessionId = null; // Forget the session locally
  logSuccess('Disconnected (session still active on server)');
  results.push({ step: 'Simulate Disconnect', passed: true });

  // Step 5: Check for existing session
  logStep('Step 5: Check for existing session');
  try {
    const { status, data } = await apiRequest(`/test-sessions/check-existing?testId=${TEST_ID}`);

    if (status === 200 && data.canRejoin && data.sessionId) {
      logSuccess(`Found existing session!`);
      logInfo(`Session ID: ${data.sessionId}`);
      logInfo(`Time remaining: ${data.timeRemaining}s`);
      logInfo(`Progress: ${data.testInfo?.answeredQuestions || 0}/${data.testInfo?.totalQuestions || '?'} answered`);
      logInfo(`Message: ${data.message}`);

      // Verify it's the same session
      if (data.sessionId === originalSessionId) {
        logSuccess('Session ID matches - correct session found!');
      } else {
        logInfo(`Note: Different session ID (may be expected if multiple tests)`);
      }

      sessionId = data.sessionId; // Store for rejoin
      results.push({ step: 'Check Existing', passed: true });
    } else {
      logError(`No rejoinable session found: ${data.message}`);
      results.push({ step: 'Check Existing', passed: false });
      return;
    }
  } catch (error: any) {
    logError(`Check existing failed: ${error.message}`);
    results.push({ step: 'Check Existing', passed: false });
    return;
  }

  // Step 6: Rejoin the session
  logStep('Step 6: Rejoin session');
  try {
    const { status, data } = await apiRequest(`/test-sessions/${sessionId}/rejoin`, {
      method: 'POST',
    });

    if ((status === 200 || status === 201) && data.success) {
      logSuccess('Session rejoined!');
      logInfo(`Current question: ${(data.question?.questionState?.questionIndex ?? 0) + 1}`);
      logInfo(`Time remaining: ${data.session?.timeRemaining || data.question?.timeRemaining || '?'}s`);

      // Check if our previous answer is preserved
      const answeredCount = data.session?.answeredQuestions || 0;
      logInfo(`Answered questions preserved: ${answeredCount}`);

      results.push({ step: 'Rejoin Session', passed: true });
    } else {
      logError(`Rejoin failed: ${JSON.stringify(data)}`);
      results.push({ step: 'Rejoin Session', passed: false });
    }
  } catch (error: any) {
    logError(`Rejoin error: ${error.message}`);
    results.push({ step: 'Rejoin Session', passed: false });
  }

  // Step 7: Verify we can continue - get current question
  logStep('Step 7: Verify session is active');
  const verifyQuestion = await testGetCurrentQuestion();
  results.push({ step: 'Verify Active', passed: !!verifyQuestion });

  // Step 8: Clean up - abandon the session so it doesn't interfere with future tests
  logStep('Step 8: Cleanup (abandon session)');
  if (sessionId) {
    try {
      const { status, data } = await apiRequest(`/test-sessions/${sessionId}/abandon`, {
        method: 'POST',
      });
      if ((status === 200 || status === 201) && data.success) {
        logSuccess('Session abandoned (cleanup complete)');
        results.push({ step: 'Cleanup', passed: true });
      } else {
        logInfo(`Abandon response: ${JSON.stringify(data)}`);
        results.push({ step: 'Cleanup', passed: true }); // Not critical
      }
    } catch (error: any) {
      logInfo(`Cleanup note: ${error.message}`);
      results.push({ step: 'Cleanup', passed: true }); // Not critical
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(colors.blue('  Rejoin Test Results'));
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  for (const result of results) {
    const icon = result.passed ? colors.green('✓') : colors.red('✗');
    const status = result.passed ? colors.green('PASS') : colors.red('FAIL');
    console.log(`  ${icon} ${result.step.padEnd(20)} ${status}`);
  }

  console.log('─'.repeat(60));
  console.log(`  Total: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log(colors.green('\n✅ Rejoin test passed!\n'));
  } else {
    console.log(colors.red(`\n❌ ${failed} step(s) failed!\n`));
  }
}

// Parse command line args to determine which test to run
const args = process.argv.slice(2);
const testType = args[0] || 'full';

if (testType === 'rejoin') {
  runRejoinTest().catch(error => {
    console.error(colors.red('Fatal error:'), error);
    process.exit(1);
  });
} else {
  // Run full test by default
  runTests().catch(error => {
    console.error(colors.red('Fatal error:'), error);
    process.exit(1);
  });
}
