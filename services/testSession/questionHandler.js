// /services/testSession/questionHandler.js - Server-Driven Version with Skip Functionality
const createError = require('http-errors');
const TestSession = require('../../models/TestSession');
const { runCodeTests, gradeFillInBlanks, validateGradingConfig } = require('../grading');

/**
 * Get current question formatted for student display
 * @param {string} sessionId - Session ID
 * @returns {object} Question data and context
 */
const getCurrentQuestion = async (sessionId) => {
  const session = await TestSession.findById(sessionId);
  if (!session) {
    throw createError(404, 'Session not found');
  }

  if (session.status !== 'inProgress') {
    throw createError(400, `Test session is not in progress. Status: ${session.status}`);
  }

  // Get current question
  const currentQuestion = getCurrentQuestionFromSession(session);
  if (!currentQuestion) {
    throw createError(404, 'Current question not found');
  }

  // Update view tracking
  await updateQuestionViewTracking(session, currentQuestion);

  return {
    success: true,
    sessionId: session._id,
    sessionInfo: {
      title: session.testSnapshot.title,
      description: session.testSnapshot.description,
      totalQuestions: session.testSnapshot.totalQuestions,
      totalPoints: session.testSnapshot.totalPoints,
      timeLimit: session.testSnapshot.settings.timeLimit,
      useSections: session.testSnapshot.settings.useSections,
      sectionCount: session.testSnapshot.sections?.length || 0
    },
    questionState: {
      questionIndex: session.currentQuestionIndex,
      questionData: sanitizeQuestionForStudent(currentQuestion),
      currentAnswer: currentQuestion.studentAnswer,
      status: currentQuestion.status,
      timeSpent: currentQuestion.timeSpentOnQuestion,
      viewCount: currentQuestion.viewCount,
      isReviewPhase: session.reviewPhase || false,
      skippedQuestionsRemaining: session.skippedQuestions?.length || 0
    },
    navigationContext: buildNavigationContext(session),
    timeRemaining: session.calculateTimeRemaining()
  };
};

/**
 * Process answer submission and determine next action (SERVER-DRIVEN)
 * @param {string} sessionId - Session ID
 * @param {object} answerData - Answer data from student
 * @returns {object} Next action result
 */
const submitAnswer = async (sessionId, answerData) => {
  const session = await TestSession.findById(sessionId);
  if (!session) {
    throw createError(404, 'Session not found');
  }

  if (session.status !== 'inProgress') {
    throw createError(400, 'Test session is not in progress');
  }

  const { answer, timeSpent = 0, action = 'submit' } = answerData;

  // Get current question
  const currentQuestion = getCurrentQuestionFromSession(session);
  if (!currentQuestion) {
    throw createError(404, 'Current question not found');
  }

  // Handle skip vs submit
  if (action === 'skip') {
    // Initialize skippedQuestions array if it doesn't exist
    if (!session.skippedQuestions) {
      session.skippedQuestions = [];
    }

    // Mark question as skipped
    session.skippedQuestions.push(session.currentQuestionIndex);
    currentQuestion.status = 'skipped';
    currentQuestion.timeSpentOnQuestion += timeSpent; // Track time even for skipped
    currentQuestion.lastViewedAt = new Date();

    console.log(`Question ${session.currentQuestionIndex} skipped`);
  } else {
    // Normal answer submission
    await saveAnswerToQuestion(session, currentQuestion, answer, timeSpent);
    await gradeQuestionAnswer(currentQuestion, answer);
  }

  // SERVER-DRIVEN: Determine what happens next
  const nextAction = determineNextAction(session);

  // Execute the next action
  const result = await executeNextAction(session, nextAction);

  await session.save();

  return {
    success: true,
    action: result.type || nextAction.type,
    ...result
  };
};

/**
 * Determine what happens after answer submission (Updated for Skip)
 * @param {object} session - Test session
 * @returns {object} Next action
 */
const determineNextAction = (session) => {
  // If we're in review phase, handle differently
  if (session.reviewPhase) {
    return { type: 'advance_in_review' };
  }

  const isLastQuestionInSection = session.isLastQuestionInSection();
  const isLastSection = session.isLastSection();

  // ADD DEBUGGING
  console.log(`Determining next action for session ${session._id}:`, {
    currentQuestionIndex: session.currentQuestionIndex,
    currentSectionIndex: session.currentSectionIndex,
    totalQuestions: session.testSnapshot.totalQuestions,
    isLastQuestionInSection,
    isLastSection,
    sectionsCompleted: session.completedSections,
    answeredQuestions: session.answeredQuestions?.length || 0
  });

  // Check if we've reached the end but have skipped questions
  if (isLastQuestionInSection && isLastSection) {
    const hasSkippedQuestions = session.skippedQuestions && session.skippedQuestions.length > 0;

    console.log(`Reached end of test: hasSkippedQuestions=${hasSkippedQuestions}, reviewPhase=${session.reviewPhase}`);

    if (hasSkippedQuestions && !session.reviewPhase) {
      return { type: 'start_review_phase' };
    } else {
      return { type: 'complete_test' };
    }
  }

  // Normal progression
  if (isLastQuestionInSection) {
    console.log(`Last question in section ${session.currentSectionIndex}, advancing to next section`);
    return { type: 'advance_to_next_section' };
  } else {
    console.log(`Not last question in section, advancing to next question`);
    return { type: 'advance_to_next_question' };
  }
};

/**
 * Execute the determined next action (Updated for Skip)
 * @param {object} session - Test session
 * @param {object} nextAction - Action to execute
 * @returns {object} Action result
 */
const executeNextAction = async (session, nextAction) => {
  switch (nextAction.type) {
    case 'advance_to_next_question':
      return await advanceToNextQuestion(session);

    case 'advance_to_next_section':
      return await advanceToNextSection(session);

    case 'complete_test':
      return await prepareTestCompletion(session);

    case 'start_review_phase':
      return await startReviewPhase(session);

    case 'advance_in_review':
      return await advanceInReview(session);

    default:
      throw createError(500, `Unknown next action: ${nextAction.type}`);
  }
};

/**
 * Advance to next question in same section
 * @param {object} session - Test session
 * @returns {object} Next question data
 */
const advanceToNextQuestion = async (session) => {
  console.log(`Advancing from question ${session.currentQuestionIndex} to ${session.currentQuestionIndex + 1}`);

  // Move to next question
  session.currentQuestionIndex += 1;
  session.updateServerState('advanced_to_next_question');

  // CRITICAL: Save session BEFORE getting question to ensure state is committed
  await session.save();
  console.log(`Session saved after advancing to question ${session.currentQuestionIndex}`);

  // Get the new current question
  const nextQuestion = getCurrentQuestionFromSession(session);
  if (!nextQuestion) {
    console.error(`Failed to get question after advancing:`, {
      currentQuestionIndex: session.currentQuestionIndex,
      currentSectionIndex: session.currentSectionIndex,
      totalQuestions: session.testSnapshot.totalQuestions,
      useSections: session.testSnapshot.settings.useSections,
      currentSectionQuestionsLength: session.testSnapshot.settings.useSections ?
        session.testSnapshot.sections?.[session.currentSectionIndex]?.questions?.length :
        session.testSnapshot.questions?.length
    });
    throw createError(500, 'Failed to load next question');
  }

  console.log(`Retrieved next question: ${nextQuestion.questionId} at index ${session.currentQuestionIndex}`);

  // Mark as viewed
  await updateQuestionViewTracking(session, nextQuestion);

  const result = {
    type: 'next_question',
    questionState: {
      questionIndex: session.currentQuestionIndex,
      questionData: sanitizeQuestionForStudent(nextQuestion),
      currentAnswer: nextQuestion.studentAnswer,
      status: nextQuestion.status,
      timeSpent: nextQuestion.timeSpentOnQuestion,
      viewCount: nextQuestion.viewCount,
      isReviewPhase: false,
      skippedQuestionsRemaining: session.skippedQuestions?.length || 0
    },
    navigationContext: buildNavigationContext(session),
    message: 'Advanced to next question'
  };

  console.log(`Question advance complete:`, {
    questionIndex: result.questionState.questionIndex,
    hasQuestionData: !!result.questionState.questionData,
    questionTitle: result.questionState.questionData?.title
  });

  return result;
};
/**
 * Advance to next section
 * @param {object} session - Test session  
 * @returns {object} Section transition data
 */
const advanceToNextSection = async (session) => {
  console.log(`Starting section transition from section ${session.currentSectionIndex}`);

  // Complete current section
  const completionResult = session.completeCurrentSection();
  console.log(`Completed section ${session.currentSectionIndex}, hasMoreSections: ${completionResult.hasMoreSections}`);

  if (!completionResult.hasMoreSections) {
    return await prepareTestCompletion(session);
  }

  // Start the next section
  session.startSection(completionResult.nextSectionIndex);
  console.log(`Started section ${session.currentSectionIndex}, questionIndex now: ${session.currentQuestionIndex}`);

  // CRITICAL: Save session BEFORE getting question to ensure state is committed
  await session.save();
  console.log(`Session saved after section transition`);

  // Get first question of new section
  const nextQuestion = getCurrentQuestionFromSession(session);
  if (!nextQuestion) {
    console.error(`Failed to get question after section transition:`, {
      currentSectionIndex: session.currentSectionIndex,
      currentQuestionIndex: session.currentQuestionIndex,
      sectionsLength: session.testSnapshot.sections?.length,
      currentSectionQuestionsLength: session.testSnapshot.sections?.[session.currentSectionIndex]?.questions?.length
    });
    throw createError(500, 'Failed to load first question of next section');
  }

  console.log(`Retrieved next question: ${nextQuestion.questionId} at index ${session.currentQuestionIndex}`);

  // Mark as viewed
  await updateQuestionViewTracking(session, nextQuestion);

  const currentSection = session.testSnapshot.sections[session.currentSectionIndex];

  const result = {
    type: 'section_transition',
    newSection: {
      index: session.currentSectionIndex,
      name: currentSection.name,
      timeLimit: currentSection.timeLimit,
      questionsCount: currentSection.questions.length
    },
    questionState: {
      questionIndex: session.currentQuestionIndex,
      questionData: sanitizeQuestionForStudent(nextQuestion),
      currentAnswer: nextQuestion.studentAnswer,
      status: nextQuestion.status,
      timeSpent: nextQuestion.timeSpentOnQuestion,
      viewCount: nextQuestion.viewCount,
      isReviewPhase: false,
      skippedQuestionsRemaining: session.skippedQuestions?.length || 0
    },
    navigationContext: buildNavigationContext(session),
    message: `Section completed! Moving to ${currentSection.name}`
  };

  console.log(`Section transition complete:`, {
    newSectionIndex: result.newSection.index,
    newSectionName: result.newSection.name,
    questionIndex: result.questionState.questionIndex,
    hasQuestionData: !!result.questionState.questionData
  });

  return result;
};

/**
 * Start review phase for skipped questions - FIXED to save session before getting question
 * @param {object} session - Test session
 * @returns {object} Review phase data
 */
const startReviewPhase = async (session) => {
  console.log(`Starting review phase with ${session.skippedQuestions.length} skipped questions`);

  session.reviewPhase = true;
  session.reviewStartedAt = new Date();
  session.updateServerState('review_phase_started');

  // Navigate to first skipped question
  const firstSkipped = Math.min(...session.skippedQuestions);
  session.currentQuestionIndex = firstSkipped;

  // Update section index if needed
  if (session.testSnapshot.settings.useSections) {
    session.currentSectionIndex = calculateSectionForQuestion(session, firstSkipped);
  }

  // CRITICAL: Save session BEFORE getting question to ensure state is committed
  await session.save();
  console.log(`Session saved after starting review phase, navigated to question ${session.currentQuestionIndex}`);

  const currentQuestion = getCurrentQuestionFromSession(session);
  if (!currentQuestion) {
    console.error(`Failed to get question in review phase:`, {
      currentQuestionIndex: session.currentQuestionIndex,
      currentSectionIndex: session.currentSectionIndex,
      firstSkipped,
      skippedQuestions: session.skippedQuestions,
      useSections: session.testSnapshot.settings.useSections
    });
    throw createError(500, 'Failed to load first review question');
  }

  console.log(`Retrieved review question: ${currentQuestion.questionId} at index ${session.currentQuestionIndex}`);

  // Mark as viewed
  await updateQuestionViewTracking(session, currentQuestion);

  const result = {
    type: 'review_phase_started',
    message: `Review phase started - ${session.skippedQuestions.length} skipped questions to review`,
    questionState: {
      questionIndex: session.currentQuestionIndex,
      questionData: sanitizeQuestionForStudent(currentQuestion),
      currentAnswer: currentQuestion.studentAnswer,
      status: currentQuestion.status,
      timeSpent: currentQuestion.timeSpentOnQuestion,
      viewCount: currentQuestion.viewCount,
      isReviewPhase: true,
      skippedQuestionsRemaining: session.skippedQuestions.length
    },
    navigationContext: buildNavigationContext(session)
  };

  console.log(`Review phase started successfully:`, {
    questionIndex: result.questionState.questionIndex,
    hasQuestionData: !!result.questionState.questionData,
    skippedRemaining: result.questionState.skippedQuestionsRemaining
  });

  return result;
};

/**
 * Advance through review phase - FIXED to save session before getting question
 * @param {object} session - Test session
 * @returns {object} Next review question data
 */
const advanceInReview = async (session) => {
  console.log(`Advancing in review from question ${session.currentQuestionIndex}, ${session.skippedQuestions.length} skipped remaining`);

  // Remove current question from skipped list
  const currentIndex = session.currentQuestionIndex;
  session.skippedQuestions = session.skippedQuestions.filter(q => q !== currentIndex);

  if (session.skippedQuestions.length === 0) {
    console.log(`No more skipped questions, completing test`);
    // No more skipped questions - complete test
    return await prepareTestCompletion(session);
  }

  // Navigate to next skipped question
  const nextSkipped = Math.min(...session.skippedQuestions);
  session.currentQuestionIndex = nextSkipped;

  // Update section if needed for sectioned tests
  if (session.testSnapshot.settings.useSections) {
    session.currentSectionIndex = calculateSectionForQuestion(session, nextSkipped);
  }

  // CRITICAL: Save session BEFORE getting question to ensure state is committed
  await session.save();
  console.log(`Session saved after advancing in review to question ${session.currentQuestionIndex}`);

  // Get the next skipped question
  const nextQuestion = getCurrentQuestionFromSession(session);
  if (!nextQuestion) {
    console.error(`Failed to get next review question:`, {
      currentQuestionIndex: session.currentQuestionIndex,
      currentSectionIndex: session.currentSectionIndex,
      nextSkipped,
      skippedQuestions: session.skippedQuestions,
      useSections: session.testSnapshot.settings.useSections
    });
    throw createError(500, 'Failed to load next review question');
  }

  console.log(`Retrieved next review question: ${nextQuestion.questionId} at index ${session.currentQuestionIndex}`);

  // Mark as viewed
  await updateQuestionViewTracking(session, nextQuestion);

  const result = {
    type: 'next_review_question',
    questionState: {
      questionIndex: session.currentQuestionIndex,
      questionData: sanitizeQuestionForStudent(nextQuestion),
      currentAnswer: nextQuestion.studentAnswer,
      status: nextQuestion.status,
      timeSpent: nextQuestion.timeSpentOnQuestion,
      viewCount: nextQuestion.viewCount,
      isReviewPhase: true,
      skippedQuestionsRemaining: session.skippedQuestions.length
    },
    navigationContext: buildNavigationContext(session),
    message: `Review question - ${session.skippedQuestions.length} remaining`
  };

  console.log(`Review advance complete:`, {
    questionIndex: result.questionState.questionIndex,
    hasQuestionData: !!result.questionState.questionData,
    skippedRemaining: result.questionState.skippedQuestionsRemaining
  });

  return result;
};

/**
 * Prepare test completion
 * @param {object} session - Test session
 * @returns {object} Completion data
 */
const prepareTestCompletion = async (session) => {
  console.log(`Auto-completing test session ${session._id}`);
  console.log(`Session details: userId=${session.userId}, status=${session.status}, totalQuestions=${session.testSnapshot.totalQuestions}`);

  try {
    // Mark session as completing
    session.sessionPhase = 'test_completed';
    session.updateServerState('test_auto_submitting');
    await session.save();
    console.log(`Session ${session._id} marked as completing, saved to database`);

    // Actually submit the test automatically
    console.log(`Attempting to submit test session ${session._id} for grading...`);
    const { submitTestSession } = require('./gradingService');

    const submissionResult = await submitTestSession(
      session._id,
      { forceSubmit: true, autoSubmitted: true },
      { userId: session.userId }
    );

    console.log(`Test session ${session._id} auto-submitted successfully`);
    console.log(`Submission result:`, {
      success: submissionResult.success,
      status: submissionResult.status,
      hasResultId: !!submissionResult.resultId,
      hasFinalScore: !!submissionResult.finalScore,
      completedAt: submissionResult.completedAt
    });

    // Validate the submission result
    if (!submissionResult.success) {
      throw new Error(`Submission failed: ${submissionResult.error || 'Unknown error'}`);
    }

    if (!submissionResult.finalScore) {
      console.warn(`Submission succeeded but no finalScore returned`);
    }

    if (!submissionResult.resultId) {
      console.warn(`Submission succeeded but no resultId returned - Result document may not have been created`);
    }

    return {
      type: 'test_completed_confirmation',
      message: 'All questions completed! Your test has been automatically saved.',
      submissionResult,
      sessionId: session._id,
      finalScore: submissionResult.finalScore,
      completedAt: submissionResult.completedAt,
      showConfirmation: true,
      confirmationData: {
        totalQuestions: session.testSnapshot.totalQuestions,
        answeredQuestions: session.answeredQuestions?.length || 0,
        skippedQuestions: session.skippedQuestions?.length || 0,
        timeSpent: submissionResult.finalScore?.totalTimeUsed || 0,
        score: submissionResult.finalScore?.percentage || 0,
        passed: submissionResult.finalScore?.passed || false
      }
    };

  } catch (error) {
    console.error(`Error auto-completing test session ${session._id}:`, error);
    console.error(`Error details:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Try to mark session as completed even if grading fails
    try {
      session.status = 'completed';
      session.completedAt = new Date();
      await session.save();
      console.log(`Session ${session._id} marked as completed despite grading error`);
    } catch (saveError) {
      console.error(`Failed to save session as completed:`, saveError);
    }

    return {
      type: 'test_completed_with_error',
      message: 'Test completed but automatic submission failed. Please contact support.',
      error: error.message,
      sessionId: session._id,
      showConfirmation: true,
      requiresManualSubmission: true
    };
  }
};

/**
 * Helper function to calculate which section a question belongs to
 * @param {object} session - Test session
 * @param {number} questionIndex - Global question index
 * @returns {number} Section index
 */
const calculateSectionForQuestion = (session, questionIndex) => {
  if (!session.testSnapshot.settings.useSections) return 0;

  let currentIndex = 0;
  for (let sectionIndex = 0; sectionIndex < session.testSnapshot.sections.length; sectionIndex++) {
    const sectionQuestionCount = session.testSnapshot.sections[sectionIndex].questions.length;
    if (questionIndex < currentIndex + sectionQuestionCount) {
      return sectionIndex;
    }
    currentIndex += sectionQuestionCount;
  }
  return 0; // fallback
};

/**
 * Update question view tracking
 * @param {object} session - Test session
 * @param {object} question - Question object
 */
const updateQuestionViewTracking = async (session, question) => {
  const wasFirstView = question.status === 'not_viewed';

  if (wasFirstView) {
    question.status = 'viewed';
    question.firstViewedAt = new Date();
    question.viewCount = 1;
  } else {
    question.viewCount += 1;
  }

  question.lastViewedAt = new Date();

  await session.save();
};

/**
 * Save answer to question and update tracking
 * @param {object} session - Test session
 * @param {object} question - Question object
 * @param {*} answer - Student answer
 * @param {number} timeSpent - Time spent on question
 */
const saveAnswerToQuestion = async (session, question, answer, timeSpent) => {
  // Update question data
  question.studentAnswer = answer;
  question.timeSpentOnQuestion += timeSpent;
  question.lastViewedAt = new Date();

  // Update status and session tracking
  if (answer !== null && answer !== undefined && answer !== '') {
    question.status = 'answered';

    // Add to answered questions list if not already there
    if (!session.answeredQuestions.includes(session.currentQuestionIndex)) {
      session.answeredQuestions.push(session.currentQuestionIndex);
    }
  }
};

/**
 * Grade question answer based on type
 * @param {object} question - Question object
 * @param {*} answer - Student answer
 */
const gradeQuestionAnswer = async (question, answer) => {
  const questionType = question.questionData.type;
  const category = question.questionData.category;

  try {
    switch (questionType) {
      case 'fillInTheBlank':
        await gradeFillInBlankQuestion(question, answer);
        break;

      case 'codeChallenge':
      case 'codeDebugging':
        if (category === 'logic') {
          await gradeLogicCodeQuestion(question, answer);
        } else {
          // UI/Syntax questions - store but don't auto-grade
          question.isCorrect = null;
          question.pointsEarned = 0;
        }
        break;

      case 'multipleChoice':
      case 'trueFalse':
        await gradeMultipleChoiceQuestion(question, answer);
        break;

      default:
        console.warn(`Unknown question type for grading: ${questionType}`);
        question.isCorrect = null;
        question.pointsEarned = 0;
    }
  } catch (error) {
    console.error('Grading error:', error);
    question.isCorrect = false;
    question.pointsEarned = 0;
  }
};

/**
 * Grade multiple choice and true/false questions
 */
const gradeMultipleChoiceQuestion = async (question, answer) => {
  const correctAnswer = question.questionData.correctAnswer;

  const normalizeAnswer = (ans) => {
    if (typeof ans === 'number') return ans;
    if (typeof ans === 'string') {
      const parsed = parseInt(ans.trim());
      return isNaN(parsed) ? ans.toLowerCase().trim() : parsed;
    }
    if (typeof ans === 'boolean') return ans;
    return ans;
  };

  const normalizedStudent = normalizeAnswer(answer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  const isCorrect = normalizedStudent === normalizedCorrect;

  question.isCorrect = isCorrect;
  question.pointsEarned = isCorrect ? question.points : 0;

  console.log(`MC/TF grading: ${question.questionId}`, {
    studentAnswer: normalizedStudent,
    correctAnswer: normalizedCorrect,
    isCorrect,
    pointsAwarded: question.pointsEarned
  });
};

/**
 * Grade fill-in-the-blank questions
 */
const gradeFillInBlankQuestion = async (question, answer) => {
  if (!question.questionData.blanks || !answer) {
    question.isCorrect = false;
    question.pointsEarned = 0;
    return;
  }

  try {
    const gradingResult = gradeFillInBlanks(answer, question.questionData.blanks);

    question.isCorrect = gradingResult.allCorrect;
    question.pointsEarned = gradingResult.allCorrect ? question.points : 0;

    console.log(`Fill-in-blank grading: ${question.questionId}`, {
      allCorrect: gradingResult.allCorrect,
      pointsAwarded: question.pointsEarned
    });

  } catch (error) {
    console.error('Fill-in-blank grading error:', error);
    question.isCorrect = false;
    question.pointsEarned = 0;
  }
};

/**
 * Grade logic code questions with execution
 */
const gradeLogicCodeQuestion = async (question, answer) => {
  if (!question.questionData.codeConfig || !question.questionData.testCases) {
    console.error(`Logic code question ${question.questionId} missing config or test cases`);
    question.isCorrect = false;
    question.pointsEarned = 0;
    return;
  }

  try {
    validateGradingConfig({
      runtime: question.questionData.codeConfig.runtime,
      language: question.questionData.language,
      testCases: question.questionData.testCases
    });

    const result = await runCodeTests({
      code: answer,
      language: question.questionData.language,
      testCases: question.questionData.testCases,
      runtime: question.questionData.codeConfig.runtime,
      entryFunction: question.questionData.codeConfig.entryFunction,
      timeoutMs: question.questionData.codeConfig.timeoutMs || 3000
    });

    question.isCorrect = result.overallPassed || false;
    question.pointsEarned = result.overallPassed ? question.points : 0;

    console.log(`Logic code grading: ${question.questionId}`, {
      overallPassed: result.overallPassed,
      totalTestsPassed: result.totalTestsPassed,
      totalTests: result.totalTests,
      pointsAwarded: question.pointsEarned
    });

  } catch (error) {
    console.error(`Error grading logic code question ${question.questionId}:`, error);
    question.isCorrect = false;
    question.pointsEarned = 0;
  }
};

/**
 * Sanitize question data for student display (hide sensitive info)
 */
const sanitizeQuestionForStudent = (question) => {
  const questionData = {
    title: question.questionData.title,
    description: question.questionData.description,
    type: question.questionData.type,
    language: question.questionData.language,
    difficulty: question.questionData.difficulty,
    tags: question.questionData.tags || [],
    points: question.points
  };

  // Add category for code-related questions
  if (['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(question.questionData.type)) {
    questionData.category = question.questionData.category;
  }

  // Add type-specific student-safe fields
  if (question.questionData.options) {
    questionData.options = question.questionData.options;
  }

  if (question.questionData.codeTemplate) {
    questionData.codeTemplate = question.questionData.codeTemplate;

    if (question.questionData.blanks) {
      questionData.blanks = question.questionData.blanks.map(blank => ({
        id: blank.id,
        hint: blank.hint,
        points: blank.points
      }));
    }
  }

  if (question.questionData.buggyCode) {
    questionData.buggyCode = question.questionData.buggyCode;
  }

  if (question.questionData.testCases?.length > 0) {
  questionData.testCases = question.questionData.testCases; // Remove the filter
}

  if (question.questionData.codeConfig &&
    ['codeChallenge', 'codeDebugging'].includes(question.questionData.type) &&
    question.questionData.category === 'logic') {

    questionData.codeConfig = {
      runtime: question.questionData.codeConfig.runtime,
      entryFunction: question.questionData.codeConfig.entryFunction,
      timeoutMs: question.questionData.codeConfig.timeoutMs || 3000
    };
  }

  return questionData;
};

/**
 * Get current question from session
 */
const getCurrentQuestionFromSession = (session) => {
  if (session.testSnapshot.settings.useSections) {
    const section = session.testSnapshot.sections[session.currentSectionIndex];
    const questionInSection = session.getCurrentQuestionInSection();
    return section?.questions[questionInSection];
  } else {
    return session.testSnapshot.questions[session.currentQuestionIndex];
  }
};

/**
 * Build navigation context
 */
const buildNavigationContext = (session) => {
  const context = {
    currentIndex: session.currentQuestionIndex,
    totalQuestions: session.testSnapshot.totalQuestions,
    answeredQuestions: session.answeredQuestions || [],
    skippedQuestions: session.skippedQuestions || [],
    reviewPhase: session.reviewPhase || false,
    progress: {
      answered: session.answeredQuestions?.length || 0,
      skipped: session.skippedQuestions?.length || 0,
      total: session.testSnapshot.totalQuestions,
      percentage: Math.round(((session.answeredQuestions?.length || 0) / session.testSnapshot.totalQuestions) * 100)
    }
  };

  // Add section context if using sections
  if (session.testSnapshot.settings.useSections) {
    const currentSection = session.testSnapshot.sections[session.currentSectionIndex];

    context.currentSection = {
      index: session.currentSectionIndex,
      name: currentSection?.name || `Section ${session.currentSectionIndex + 1}`,
      questionsInSection: currentSection?.questions.length || 0,
      questionInSection: session.getCurrentQuestionInSection() + 1,
      isCompleted: session.completedSections.includes(session.currentSectionIndex),
      timeLimit: currentSection?.timeLimit || 0,
      startedAt: session.currentSectionStartedAt
    };

    context.completedSections = session.completedSections || [];
    context.totalSections = session.testSnapshot.sections.length;
  } else {
    context.currentSection = null;
    context.completedSections = [];
    context.totalSections = 0;
  }

  return context;
};

module.exports = {
  getCurrentQuestion,
  submitAnswer,
  determineNextAction,
  executeNextAction,
  advanceToNextQuestion,
  advanceToNextSection,
  prepareTestCompletion,
  startReviewPhase,
  advanceInReview,
  gradeQuestionAnswer
};