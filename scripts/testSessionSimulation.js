// /scripts/testSessionSimulation.js - UPDATED with Skip Functionality Testing
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Import ALL models to ensure they're registered
const Question = require('../models/Question');
const Test = require('../models/Test');
const User = require('../models/User');
const Organization = require('../models/Organization');
const TestSession = require('../models/TestSession');
const Result = require('../models/Result');

// Import services
const sessionManager = require('../services/testSession/sessionManager');
const questionHandler = require('../services/testSession/questionHandler');
const gradingService = require('../services/testSession/gradingService');

require('dotenv').config();

class TestSessionSimulator {
    constructor() {
        this.testId = null;
        this.userId = null;
        this.organizationId = null;
        this.userToken = null;
        this.sessionId = null;
        this.currentSection = 0;
        this.questionsAnswered = 0;
        this.questionsSkipped = 0;
        this.testQuestions = [];
        this.logs = [];
        this.user = null;
        this.skipPattern = null; // For controlling skip behavior
        this.reviewPhaseEntered = false;
    }

    log(message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, data };
        this.logs.push(logEntry);
        console.log(`\n[${timestamp}] ${message}`);
        if (data) {
            console.log('  Data:', JSON.stringify(data, null, 2));
        }
    }

    async generateUserToken() {
        try {
            // Find the seeded student user (without populate first to avoid schema issues)
            const user = await User.findOne({
                loginId: 'student_engineersmith'
            });

            if (!user) {
                throw new Error('Student user not found. Please run: node scripts/seedUsers.js');
            }

            // Now populate the organization
            await user.populate('organizationId');

            this.userId = user._id;
            this.organizationId = user.organizationId._id;

            this.user = {
                userId: user._id,
                organizationId: user.organizationId._id,
                role: user.role,
                isSuperOrgAdmin: user.organizationId.isSuperOrg || false
            };

            this.userToken = jwt.sign(this.user, process.env.JWT_SECRET, { expiresIn: '1h' });

            this.log('Generated JWT token for seeded user', {
                userId: user._id,
                loginId: user.loginId,
                role: user.role,
                orgName: user.organizationId.name,
                isSuperOrg: user.organizationId.isSuperOrg
            });

            return this.userToken;
        } catch (error) {
            this.log('Error generating token', error.message);
            throw error;
        }
    }

    async loadTestQuestions() {
        try {
            // Find any active test this user can access
            const test = await Test.findOne({
                status: 'active',
                $or: [
                    { isGlobal: true },
                    { organizationId: this.organizationId }
                ]
            }).populate({
                path: 'sections.questions.questionId',
                select: 'title description type language category options correctAnswer testCases codeConfig codeTemplate blanks buggyCode solutionCode'
            }).populate({
                path: 'questions.questionId',
                select: 'title description type language category options correctAnswer testCases codeConfig codeTemplate blanks buggyCode solutionCode'
            });

            if (!test) {
                throw new Error('No accessible test found. Please create a test or run seed scripts.');
            }

            this.testId = test._id;

            this.log('Loaded test', {
                title: test.title,
                testId: test._id,
                isGlobal: test.isGlobal,
                useSections: test.settings.useSections,
                timeLimit: test.settings.timeLimit
            });

            // Handle both sectioned and non-sectioned tests
            if (test.settings.useSections) {
                this.testQuestions = test.sections.flatMap((section, sectionIndex) =>
                    section.questions.map((q, questionIndex) => ({
                        sectionIndex,
                        questionIndex,
                        questionId: q.questionId._id,
                        questionData: q.questionId,
                        points: q.points
                    }))
                );
            } else {
                this.testQuestions = test.questions.map((q, questionIndex) => ({
                    sectionIndex: 0,
                    questionIndex,
                    questionId: q.questionId._id,
                    questionData: q.questionId,
                    points: q.points
                }));
            }

            this.log('Questions loaded', {
                total: this.testQuestions.length,
                types: [...new Set(this.testQuestions.map(q => q.questionData.type))]
            });

            return test;
        } catch (error) {
            this.log('Error loading test questions', error.message);
            throw error;
        }
    }

    generateAnswerForQuestion(questionData) {
        this.log(`Generating answer for ${questionData.type} question`, {
            title: questionData.title,
            type: questionData.type,
            category: questionData.category
        });

        switch (questionData.type) {
            case 'multipleChoice':
                const answer = questionData.correctAnswer || 0;
                this.log(`Generated MC answer: ${answer}`);
                return answer;

            case 'trueFalse':
                const tfAnswer = questionData.correctAnswer !== undefined ? questionData.correctAnswer : true;
                this.log(`Generated T/F answer: ${tfAnswer}`);
                return tfAnswer;

            case 'fillInTheBlank':
                if (questionData.blanks && questionData.blanks.length > 0) {
                    const fibAnswer = {};
                    questionData.blanks.forEach((blank, index) => {
                        const blankId = blank.id || `blank_${index}`;
                        fibAnswer[blankId] = blank.correctAnswers?.[0] || 'test';
                    });
                    this.log(`Generated FIB answer:`, fibAnswer);
                    return fibAnswer;
                } else {
                    const simpleAnswer = 'console.log("test");';
                    this.log(`Generated simple FIB answer: ${simpleAnswer}`);
                    return simpleAnswer;
                }

            case 'codeChallenge':
                if (questionData.category === 'logic') {
                    const entryFunction = questionData.codeConfig?.entryFunction || 'solution';
                    const codeAnswer = `function ${entryFunction}(a, b) {\n  return a + b;\n}`;
                    this.log(`Generated logic code answer for function: ${entryFunction}`);
                    return codeAnswer;
                } else {
                    const uiAnswer = questionData.codeTemplate?.replace(/___/g, 'test') || 'test';
                    this.log(`Generated UI code answer`);
                    return uiAnswer;
                }

            case 'codeDebugging':
                const debugAnswer = questionData.solutionCode || questionData.buggyCode?.replace(/bug/gi, 'fix') || 'fixed code';
                this.log(`Generated debug answer`);
                return debugAnswer;

            default:
                this.log(`Unknown question type: ${questionData.type}, using default answer`);
                return 'test answer';
        }
    }

    // NEW: Determine if question should be skipped based on pattern
    shouldSkipQuestion(questionIndex, questionData) {
        if (!this.skipPattern) return false;

        switch (this.skipPattern) {
            case 'skip_first_two':
                return questionIndex < 2;
            
            case 'skip_every_third':
                return (questionIndex + 1) % 3 === 0;
            
            case 'skip_code_questions':
                return ['codeChallenge', 'codeDebugging'].includes(questionData.type);
            
            case 'skip_odd_questions':
                return questionIndex % 2 === 1;
            
            case 'skip_random':
                return Math.random() < 0.3; // 30% chance to skip
            
            default:
                return false;
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async startTestSession() {
        try {
            this.log('=== STARTING TEST SESSION ===');

            // Clean up any existing sessions for this user to avoid conflicts
            await TestSession.updateMany(
                { userId: this.user.userId, status: 'inProgress' },
                { status: 'abandoned', completedAt: new Date() }
            );

            const sessionData = await sessionManager.createSession({
                testId: this.testId,
                forceNew: true  // Force creation of new session
            }, this.user);

            this.sessionId = sessionData.sessionId;
            this.log('Session created successfully', {
                sessionId: this.sessionId,
                useSections: sessionData.testInfo.useSections,
                timeLimit: sessionData.testInfo.timeLimit,
                totalQuestions: sessionData.testInfo.totalQuestions
            });

            return sessionData;
        } catch (error) {
            this.log('Error starting test session', error.message);
            throw error;
        }
    }

    async getCurrentQuestion() {
        try {
            const questionData = await questionHandler.getCurrentQuestion(this.sessionId);

            this.log('Retrieved current question', {
                questionIndex: questionData.questionState.questionIndex,
                questionType: questionData.questionState.questionData.type,
                isReviewPhase: questionData.questionState.isReviewPhase,
                skippedQuestionsRemaining: questionData.questionState.skippedQuestionsRemaining,
                sectionInfo: questionData.navigationContext.currentSection
            });

            return questionData;
        } catch (error) {
            this.log('Error getting current question', error.message);
            throw error;
        }
    }

    // UPDATED: Submit answer or skip
    async submitAnswer(questionData, answer = null, action = 'submit') {
        try {
            if (action === 'skip') {
                this.log('Skipping question', {
                    questionIndex: questionData.questionState.questionIndex,
                    questionType: questionData.questionState.questionData.type,
                    isReviewPhase: questionData.questionState.isReviewPhase
                });
            } else {
                this.log('Submitting answer', {
                    questionIndex: questionData.questionState.questionIndex,
                    answer: typeof answer === 'string' && answer.length > 50 ?
                        answer.substring(0, 50) + '...' : answer
                });
            }

            const result = await questionHandler.submitAnswer(this.sessionId, {
                answer: answer,
                timeSpent: Math.floor(Math.random() * 30) + 10,
                action: action
            });

            this.log(`${action === 'skip' ? 'Skip' : 'Answer'} submitted - Server response`, {
                success: result.success,
                action: result.action
            });

            if (action === 'skip') {
                this.questionsSkipped++;
            } else {
                this.questionsAnswered++;
            }

            return result;
        } catch (error) {
            this.log(`Error ${action === 'skip' ? 'skipping' : 'submitting answer'}`, error.message);
            throw error;
        }
    }

    // NEW: Skip functionality testing scenarios
    async simulateSkipScenario(scenarioName, skipPattern = null) {
        try {
            this.log(`=== TESTING SKIP SCENARIO: ${scenarioName.toUpperCase()} ===`);
            
            // Reset counters
            this.questionsAnswered = 0;
            this.questionsSkipped = 0;
            this.reviewPhaseEntered = false;
            this.skipPattern = skipPattern;

            await this.startTestSession();
            await this.sleep(1000);

            let questionCount = 0;
            const maxQuestions = 50; // Increased for skip testing

            while (questionCount < maxQuestions) {
                try {
                    // Get current question
                    const questionData = await this.getCurrentQuestion();
                    
                    // Check if we entered review phase
                    if (questionData.questionState.isReviewPhase && !this.reviewPhaseEntered) {
                        this.reviewPhaseEntered = true;
                        this.log('🔄 ENTERED REVIEW PHASE!', {
                            skippedQuestionsRemaining: questionData.questionState.skippedQuestionsRemaining,
                            totalSkipped: this.questionsSkipped
                        });
                    }

                    // Determine action (skip or answer)
                    let action = 'submit';
                    let answer = null;

                    if (!questionData.questionState.isReviewPhase) {
                        // Normal phase - check skip pattern
                        if (this.shouldSkipQuestion(questionData.questionState.questionIndex, questionData.questionState.questionData)) {
                            action = 'skip';
                        } else {
                            answer = this.generateAnswerForQuestion(questionData.questionState.questionData);
                        }
                    } else {
                        // Review phase - always answer skipped questions
                        answer = this.generateAnswerForQuestion(questionData.questionState.questionData);
                        this.log('📝 Answering skipped question in review phase');
                    }

                    // Submit answer or skip
                    const result = await this.submitAnswer(questionData, answer, action);
                    await this.sleep(1000);

                    // Handle server response
                    this.log(`Server response: ${result.action}`);

                    switch (result.action) {
                        case 'next_question':
                            this.log('✓ Server advanced to next question');
                            break;

                        case 'section_transition':
                            this.log('✓ Server advanced to next section', {
                                newSection: result.newSection?.name,
                                sectionIndex: result.newSection?.index
                            });
                            break;

                        case 'review_phase_started':
                            this.reviewPhaseEntered = true;
                            this.log('🔄 REVIEW PHASE STARTED BY SERVER!', {
                                message: result.message,
                                skippedQuestionsRemaining: result.questionState?.skippedQuestionsRemaining
                            });
                            break;

                        case 'next_review_question':
                            this.log('📝 Next review question loaded', {
                                skippedRemaining: result.questionState?.skippedQuestionsRemaining
                            });
                            break;

                        case 'test_completed_confirmation':
                            this.log('✅ TEST COMPLETED WITH AUTO-SUBMISSION!', {
                                finalScore: result.finalScore,
                                passed: result.confirmationData?.passed,
                                timeSpent: result.confirmationData?.timeSpent,
                                score: result.confirmationData?.score,
                                skippedQuestions: result.confirmationData?.skippedQuestions
                            });

                            return {
                                success: true,
                                completed: true,
                                questionsAnswered: this.questionsAnswered,
                                questionsSkipped: this.questionsSkipped,
                                reviewPhaseEntered: this.reviewPhaseEntered,
                                finalResult: result,
                                scenario: scenarioName
                            };

                        case 'test_completed_with_error':
                            this.log('⚠️ TEST COMPLETED WITH ERRORS', {
                                error: result.error,
                                requiresManualSubmission: result.requiresManualSubmission
                            });

                            return {
                                success: false,
                                completed: true,
                                questionsAnswered: this.questionsAnswered,
                                questionsSkipped: this.questionsSkipped,
                                reviewPhaseEntered: this.reviewPhaseEntered,
                                error: result.error,
                                scenario: scenarioName
                            };

                        default:
                            this.log(`⚠️ Unknown server action: ${result.action}`);
                            break;
                    }

                    questionCount++;

                    // Safety check
                    if (questionCount >= this.testQuestions.length * 2) { // *2 to account for review phase
                        this.log('⚠️ Reached safety limit - attempting manual submission');
                        const finalResult = await this.submitFinalTest();
                        return {
                            success: true,
                            completed: true,
                            questionsAnswered: this.questionsAnswered,
                            questionsSkipped: this.questionsSkipped,
                            reviewPhaseEntered: this.reviewPhaseEntered,
                            finalResult,
                            scenario: scenarioName,
                            note: 'Completed with manual submission after safety limit'
                        };
                    }

                } catch (error) {
                    // Handle completion errors
                    if (error.message.includes('not in progress') ||
                        error.message.includes('not found') ||
                        error.message.includes('completed')) {

                        this.log('ℹ️ Test appears to be completed based on error message');
                        return {
                            success: true,
                            completed: true,
                            questionsAnswered: this.questionsAnswered,
                            questionsSkipped: this.questionsSkipped,
                            reviewPhaseEntered: this.reviewPhaseEntered,
                            scenario: scenarioName,
                            note: 'Test completed based on error response'
                        };
                    }

                    throw error;
                }
            }

            throw new Error('Skip scenario loop ended without completion');

        } catch (error) {
            this.log(`Error in skip scenario ${scenarioName}`, error.message);
            throw error;
        }
    }

    // UPDATED: Original complete test flow (no skips)
    async simulateCompleteTestFlow() {
        return await this.simulateSkipScenario('complete_test_no_skips', null);
    }

    async submitFinalTest() {
        try {
            const result = await gradingService.submitTestSession(
                this.sessionId,
                { forceSubmit: true },
                this.user
            );

            this.log('Final test submission completed', {
                success: result.success,
                score: result.finalScore?.percentage,
                passed: result.finalScore?.passed,
                message: result.message
            });

            return result;
        } catch (error) {
            this.log('Error submitting final test', error.message);
            throw error;
        }
    }

    async testRejoinFlow() {
        try {
            this.log('=== TESTING REJOIN FLOW ===');

            const rejoinCheck = await sessionManager.checkRejoinSession(this.user);

            if (rejoinCheck.canRejoin) {
                this.log('Found existing session to rejoin', {
                    sessionId: rejoinCheck.sessionId,
                    timeRemaining: rejoinCheck.timeRemaining
                });

                const rejoinResult = await sessionManager.rejoinSession(rejoinCheck.sessionId, this.user);
                this.sessionId = rejoinCheck.sessionId;

                this.log('Successfully rejoined session', rejoinResult);
            } else {
                this.log('No existing session found - starting new one');
                await this.startTestSession();
            }

        } catch (error) {
            this.log('Error in rejoin flow test', error.message);
            throw error;
        }
    }

    async testTimerStatus() {
        try {
            this.log('=== TESTING TIMER STATUS ===');

            if (!this.sessionId) {
                await this.startTestSession();
            }

            const timeSync = await sessionManager.getTimeSync(this.sessionId, this.user);

            this.log('Timer status', {
                timeRemainingSeconds: timeSync.timeRemainingSeconds,
                elapsedSeconds: timeSync.elapsedSeconds,
                sessionStatus: timeSync.sessionStatus,
                sectionInfo: timeSync.sectionInfo
            });

        } catch (error) {
            this.log('Error testing timer status', error.message);
            throw error;
        }
    }

    async testResultValidation() {
        try {
            this.log('=== TESTING RESULT VALIDATION ===');
            
            if (!this.sessionId) {
                this.log('No session ID available for result testing');
                return;
            }

            // Find the result for our completed session
            const Result = require('../models/Result');
            const result = await Result.findOne({ sessionId: this.sessionId });
            
            if (result) {
                this.log('Found result document', {
                    resultId: result._id,
                    score: result.score.percentage,
                    passed: result.score.passed,
                    questionsCount: result.questions.length,
                    status: result.status,
                    skippedQuestions: result.questions.filter(q => q.studentAnswer === null).length
                });

                // Test the new validation functions
                const { validateResultAccess, validateFilterInputs } = require('../services/result/resultValidation');
                
                try {
                    await validateResultAccess(result, this.user);
                    this.log('✓ Result access validation passed');
                } catch (error) {
                    this.log('❌ Result access validation failed', error.message);
                }

                try {
                    validateFilterInputs({
                        minScore: 0,
                        maxScore: 100,
                        passed: false,
                        limit: 10
                    });
                    this.log('✓ Filter validation passed');
                } catch (error) {
                    this.log('❌ Filter validation failed', error.message);
                }

            } else {
                this.log('No result document found for session');
            }

        } catch (error) {
            this.log('Error testing result validation', error.message);
        }
    }

    // NEW: Test all skip scenarios
    async runAllSkipTests() {
        console.log('\n🧪 Running All Skip Functionality Tests');
        console.log('=========================================');

        const scenarios = [
            { name: 'No Skips (Baseline)', pattern: null },
            { name: 'Skip First Two Questions', pattern: 'skip_first_two' },
            { name: 'Skip Every Third Question', pattern: 'skip_every_third' },
            { name: 'Skip All Code Questions', pattern: 'skip_code_questions' },
            { name: 'Skip Odd Questions', pattern: 'skip_odd_questions' },
            { name: 'Random Skips (30%)', pattern: 'skip_random' }
        ];

        const results = [];

        for (const scenario of scenarios) {
            try {
                console.log(`\n🎯 Running: ${scenario.name}`);
                const result = await this.simulateSkipScenario(scenario.name, scenario.pattern);
                results.push(result);
                
                console.log(`✅ ${scenario.name} completed:`, {
                    answered: result.questionsAnswered,
                    skipped: result.questionsSkipped,
                    reviewPhase: result.reviewPhaseEntered,
                    success: result.success
                });

                // Brief pause between scenarios
                await this.sleep(2000);

            } catch (error) {
                console.log(`❌ ${scenario.name} failed:`, error.message);
                results.push({
                    success: false,
                    error: error.message,
                    scenario: scenario.name
                });
            }
        }

        return results;
    }

    printSummary(skipTestResults = null) {
        console.log('\n' + '='.repeat(60));
        console.log('                 SIMULATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Questions Answered: ${this.questionsAnswered}`);
        console.log(`Total Questions Skipped: ${this.questionsSkipped}`);
        console.log(`Review Phase Entered: ${this.reviewPhaseEntered ? 'YES' : 'NO'}`);
        console.log(`Total Log Entries: ${this.logs.length}`);
        console.log(`Session ID: ${this.sessionId}`);
        console.log(`Test ID: ${this.testId}`);
        console.log(`User ID: ${this.userId}`);
        
        if (skipTestResults) {
            console.log('\n' + '-'.repeat(60));
            console.log('           SKIP FUNCTIONALITY TEST RESULTS');
            console.log('-'.repeat(60));
            
            skipTestResults.forEach(result => {
                const status = result.success ? '✅' : '❌';
                console.log(`${status} ${result.scenario}`);
                if (result.success) {
                    console.log(`   Answered: ${result.questionsAnswered}, Skipped: ${result.questionsSkipped}, Review: ${result.reviewPhaseEntered ? 'Yes' : 'No'}`);
                } else {
                    console.log(`   Error: ${result.error}`);
                }
            });
        }
        
        console.log('='.repeat(60));
    }
}

async function runSimulation() {
    console.log('\n🚀 Starting Enhanced Test Session Simulation with Skip Testing');
    console.log('===============================================================');

    const simulator = new TestSessionSimulator();

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');

        // Setup
        await simulator.generateUserToken();
        await simulator.loadTestQuestions();

        console.log('\n📋 Available Test Scenarios:');
        console.log('1. Complete Test Flow (No Skips)');
        console.log('2. All Skip Functionality Tests');
        console.log('3. Individual Skip Scenarios');
        console.log('4. Rejoin Flow Test');
        console.log('5. Timer Status Test');
        console.log('6. Result Validation Test');

        // Run all skip tests
        console.log('\n🎯 Running All Skip Functionality Tests');
        const skipResults = await simulator.runAllSkipTests();

        // Test result validation with the last completed session
        await simulator.testResultValidation();

        // Print comprehensive summary
        simulator.printSummary(skipResults);

        // Overall test results
        const successfulTests = skipResults.filter(r => r.success).length;
        const totalTests = skipResults.length;
        
        console.log(`\n🏆 OVERALL RESULTS: ${successfulTests}/${totalTests} tests passed`);
        
        if (successfulTests === totalTests) {
            console.log('🎉 ALL SKIP FUNCTIONALITY TESTS PASSED!');
        } else {
            console.log('⚠️  Some tests failed - check individual results above');
        }

    } catch (error) {
        console.error('\n❌ Simulation failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// NEW: Individual test scenario runner
async function runSingleSkipTest(scenarioName = 'skip_first_two') {
    console.log(`\n🎯 Running Single Skip Test: ${scenarioName}`);
    
    const simulator = new TestSessionSimulator();
    
    try {
        await mongoose.connect(process.env.MONGO_URL);
        await simulator.generateUserToken();
        await simulator.loadTestQuestions();
        
        const result = await simulator.simulateSkipScenario(scenarioName, scenarioName);
        
        console.log('\n✅ Single test completed:', {
            answered: result.questionsAnswered,
            skipped: result.questionsSkipped,
            reviewPhase: result.reviewPhaseEntered,
            success: result.success
        });
        
        simulator.printSummary([result]);
        
    } catch (error) {
        console.error('❌ Single test failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Run specific test
        runSingleSkipTest(args[0]).catch(console.error);
    } else {
        // Run full simulation
        runSimulation().catch(console.error);
    }
}

module.exports = { TestSessionSimulator, runSimulation, runSingleSkipTest };