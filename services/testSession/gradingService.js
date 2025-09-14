// /services/testSession/gradingService.js - ENHANCED VERSION with Full Question Details
const mongoose = require('mongoose');
const createError = require('http-errors');
const { gradeFillInBlanks } = require('../grading');

// SIMPLIFIED: Submit final test session with complete grading
const submitTestSession = async (sessionId, submissionData, user) => {
  const mongoSession = await mongoose.startSession();

  let transactionCommitted = false;

  try {
    mongoSession.startTransaction();

    const TestSession = require('../../models/TestSession');
    const Test = require('../../models/Test');
    const Result = require('../../models/Result');

    const { finalCheck = false, forceSubmit = false } = submissionData;

    const session = await TestSession.findById(sessionId).session(mongoSession);
    if (!session) {
      throw createError(404, 'Test session not found');
    }

    // Validate access
    if (session.userId.toString() !== user.userId.toString()) {
      throw createError(403, 'Unauthorized to submit this test session');
    }

    if (session.status !== 'inProgress') {
      throw createError(400, 'Test session is not in progress');
    }

    // SIMPLIFIED: Check section completion for sectioned tests
    if (session.testSnapshot.settings.useSections && !forceSubmit) {
      const totalSections = session.testSnapshot.sections.length;
      const completedSections = session.completedSections.length;

      if (completedSections < totalSections) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();

        return {
          success: false,
          error: 'All sections must be completed before final submission',
          completedSections: session.completedSections,
          totalSections: totalSections
        };
      }
    }

    // Grade all questions and calculate final score
    const gradingResults = await gradeAllQuestions(session);

    // Update session with final results
    session.finalScore = gradingResults.finalScore;
    session.status = 'completed';
    session.completedAt = new Date();

    await session.save({ session: mongoSession });

    // Create Result document with enhanced details
    const result = await createResultDocument(session, gradingResults, mongoSession);

    // Update Test statistics
    await updateTestStatistics(session, gradingResults.finalScore, mongoSession);

    // Commit transaction
    await mongoSession.commitTransaction();
    transactionCommitted = true;

    // SIMPLIFIED: Clear timer through socket service (avoid circular dependency)
    try {
      // The socket service will clean up its own timers when the session completes
      // No need to call external functions
      console.log(`Test session ${sessionId} completed successfully`);
    } catch (error) {
      console.warn('Timer cleanup note:', error.message);
    }

    return {
      success: true,
      sessionId: session._id,
      status: session.status,
      finalScore: session.finalScore,
      resultId: result._id,
      completedAt: session.completedAt,
      message: gradingResults.finalScore.passed ?
        'Congratulations! You passed the test.' :
        'Test completed. Better luck next time!'
    };

  } catch (error) {
    if (!transactionCommitted) {
      try {
        await mongoSession.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
    }
    throw error;
  } finally {
    try {
      mongoSession.endSession();
    } catch (endError) {
      console.error('Error ending session:', endError);
    }
  }
};

// SIMPLIFIED: Grade all questions in the session
const gradeAllQuestions = async (session) => {
  let totalEarnedPoints = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;

  const gradeQuestion = async (question) => {
    console.log(`Grading question ${question.questionId}: type=${question.questionData.type}, answer=${question.studentAnswer}`);

    // Check if question has been answered
    if (question.studentAnswer === null ||
      question.studentAnswer === undefined ||
      question.studentAnswer === '') {
      unansweredQuestions++;
      question.isCorrect = false;
      question.pointsEarned = 0;
      console.log(`Question ${question.questionId}: unanswered`);
      return;
    }

    let isCorrect = false;
    let pointsEarned = 0;

    switch (question.questionData.type) {
      case 'multipleChoice':
        isCorrect = gradeMultipleChoice(question);
        pointsEarned = isCorrect ? question.points : 0;
        break;

      case 'trueFalse':
        isCorrect = gradeTrueFalse(question);
        pointsEarned = isCorrect ? question.points : 0;
        break;

      case 'fillInTheBlank':
        await gradeFillInBlankFinal(question);
        isCorrect = question.isCorrect;
        pointsEarned = question.pointsEarned;
        break;

      case 'codeChallenge':
      case 'codeDebugging':
        if (question.questionData.category === 'logic') {
          await gradeCodeQuestionFinal(question);
          isCorrect = question.isCorrect;
          pointsEarned = question.pointsEarned;
        } else {
          // UI questions - should use fillInTheBlank instead
          console.warn(`UI ${question.questionData.type} question should use fillInTheBlank type`);
          isCorrect = false;
          pointsEarned = 0;
        }
        break;

      default:
        console.warn(`Unknown question type: ${question.questionData.type}`);
        isCorrect = false;
        pointsEarned = 0;
    }

    // Update grading results
    question.isCorrect = isCorrect;
    question.pointsEarned = pointsEarned;

    totalEarnedPoints += question.pointsEarned;

    if (question.isCorrect) {
      correctAnswers++;
    } else {
      incorrectAnswers++;
    }

    console.log(`Question ${question.questionId}: isCorrect=${isCorrect}, pointsEarned=${pointsEarned}`);
  };

  // Grade all questions
  if (session.testSnapshot.settings.useSections) {
    for (const section of session.testSnapshot.sections) {
      for (const question of section.questions) {
        await gradeQuestion(question);
      }
    }
  } else {
    for (const question of session.testSnapshot.questions) {
      await gradeQuestion(question);
    }
  }

  // Calculate final score
  const totalPoints = session.testSnapshot.totalPoints;
  const percentage = totalPoints > 0 ? (totalEarnedPoints / totalPoints) * 100 : 0;
  const passed = percentage >= 70; // Default passing threshold

  const finalScore = {
    totalPoints,
    earnedPoints: totalEarnedPoints,
    percentage: Math.round(percentage * 100) / 100,
    passed,
    passingThreshold: 70,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    totalTimeUsed: Math.floor((Date.now() - session.startedAt.getTime()) / 1000)
  };

  console.log(`Final grading results: ${totalEarnedPoints}/${totalPoints} points, ${correctAnswers} correct, ${incorrectAnswers} incorrect, ${unansweredQuestions} unanswered`);

  return {
    finalScore,
    totalEarnedPoints,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions
  };
};

// Grade code questions with execution
const gradeCodeQuestionFinal = async (question) => {
  console.log(`Re-grading code question ${question.questionId}`);

  if (!question.questionData.codeConfig || !question.questionData.testCases) {
    console.error(`Code question ${question.questionId} missing config or test cases`);
    question.isCorrect = false;
    question.pointsEarned = 0;
    return;
  }

  try {
    const { runCodeTests } = require('../grading');

    const result = await runCodeTests({
      code: question.studentAnswer,
      language: question.questionData.language,
      testCases: question.questionData.testCases,
      runtime: question.questionData.codeConfig.runtime,
      entryFunction: question.questionData.codeConfig.entryFunction,
      timeoutMs: question.questionData.codeConfig.timeoutMs || 3000
    });

    console.log(`Code execution result for ${question.questionId}:`, {
      success: result.success,
      overallPassed: result.overallPassed,
      totalTestsPassed: result.totalTestsPassed,
      totalTests: result.totalTests
    });

    // Update question grading
    question.isCorrect = result.success && result.overallPassed;
    question.pointsEarned = question.isCorrect ? question.points : 0;

  } catch (error) {
    console.error(`Error grading code question ${question.questionId}:`, error);
    question.isCorrect = false;
    question.pointsEarned = 0;
  }
};

// Grade multiple choice questions
const gradeMultipleChoice = (question) => {
  const userAnswer = question.studentAnswer;
  const correctAnswer = question.questionData.correctAnswer;

  const normalizeAnswer = (answer) => {
    if (typeof answer === 'number') return answer;
    if (typeof answer === 'string') {
      const parsed = parseInt(answer.trim());
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  return normalizedUser !== null &&
    normalizedCorrect !== null &&
    normalizedUser === normalizedCorrect;
};

// Grade true/false questions  
const gradeTrueFalse = (question) => {
  const userAnswer = question.studentAnswer;
  const correctAnswer = question.questionData.correctAnswer;

  const normalizeAnswer = (answer) => {
    if (typeof answer === 'boolean') return answer;
    if (typeof answer === 'string') {
      const lower = answer.toLowerCase().trim();
      if (['true', '1', 'yes'].includes(lower)) return true;
      if (['false', '0', 'no'].includes(lower)) return false;
    }
    if (typeof answer === 'number') {
      return answer === 1;
    }
    return null;
  };

  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  return normalizedUser !== null &&
    normalizedCorrect !== null &&
    normalizedUser === normalizedCorrect;
};

// Grade fill-in-the-blank questions
const gradeFillInBlankFinal = async (question) => {
  if (!question.questionData.blanks || !question.studentAnswer) {
    question.isCorrect = false;
    question.pointsEarned = 0;
    return;
  }

  try {
    const gradingResult = gradeFillInBlanks(question.studentAnswer, question.questionData.blanks);

    question.isCorrect = gradingResult.allCorrect;
    question.pointsEarned = gradingResult.allCorrect ? question.points : 0;

    console.log(`Fill-in-blank question ${question.questionId}: allCorrect=${gradingResult.allCorrect}, pointsEarned=${question.pointsEarned}/${question.points}`);
  } catch (error) {
    console.error('Final fill-in-blank grading error:', error);
    question.isCorrect = false;
    question.pointsEarned = 0;
  }
};

// ENHANCED: Create result document with full question details
const createResultDocument = async (session, gradingResults, mongoSession) => {
  const Result = require('../../models/Result');

  // ENHANCED: Helper to create comprehensive question details for frontend
  const createQuestionDetails = (question, questionIndex) => {
    const questionData = question.questionData;
    
    // Base question details that frontend expects
    const details = {
      title: questionData.title || `Question ${questionIndex + 1}`,
      description: questionData.description || '',
      type: questionData.type || '',
      language: questionData.language || '',
      category: questionData.category || '',
      difficulty: questionData.difficulty || 'medium',
      tags: questionData.tags || [],
      points: question.points || 0
    };

    // Add type-specific details for frontend consumption
    if (questionData.type === 'multipleChoice') {
      details.options = questionData.options || [];
      details.correctAnswer = questionData.correctAnswer;
      
      // Create formatted options for display
      details.multipleChoiceOptions = (questionData.options || []).map((option, index) => ({
        value: index,
        text: option,
        isCorrect: questionData.correctAnswer === index
      }));
    }

    if (questionData.type === 'trueFalse') {
      details.correctAnswer = questionData.correctAnswer;
    }

    if (questionData.type === 'fillInTheBlank') {
      details.codeTemplate = questionData.codeTemplate || '';
      details.blanks = questionData.blanks || [];
      
      // Process correct answers from blanks
      if (questionData.blanks && questionData.blanks.length > 0) {
        details.correctAnswer = {};
        questionData.blanks.forEach(blank => {
          if (blank.correctAnswers && blank.correctAnswers.length > 0) {
            details.correctAnswer[blank.id] = blank.correctAnswers[0]; // First correct answer
          }
        });
      }
    }

    if (questionData.type === 'codeChallenge' || questionData.type === 'codeDebugging') {
      details.codeTemplate = questionData.codeTemplate || '';
      details.buggyCode = questionData.buggyCode || '';
      details.solutionCode = questionData.solutionCode || '';
      details.testCases = questionData.testCases || [];
      
      if (questionData.codeConfig) {
        details.codeConfig = {
          runtime: questionData.codeConfig.runtime,
          entryFunction: questionData.codeConfig.entryFunction,
          timeoutMs: questionData.codeConfig.timeoutMs || 3000
        };
      }
      
      // For code questions, correctAnswer is typically the solution code
      details.correctAnswer = questionData.solutionCode || questionData.codeTemplate || '';
    }

    // Add explanation if available
    if (questionData.explanation) {
      details.explanation = questionData.explanation;
    }

    return details;
  };

  // Helper to create type-specific result details (schema-compatible)
  const createResultDetails = (question, questionIndex) => {
    const details = {};

    // For fill-in-blank: create per-blank breakdown
    if (question.questionData.type === 'fillInTheBlank' && question.questionData.blanks) {
      details.blanks = question.questionData.blanks.map(blank => {
        const studentAnswer = question.studentAnswer?.[blank.id] || '';
        const correctAnswers = blank.correctAnswers || [];
        const isCorrect = correctAnswers.some(correct => 
          studentAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
        );
        
        return {
          id: blank.id,
          studentAnswer,
          correctAnswers,
          isCorrect,
          hint: blank.hint || '',
          points: blank.points || 0
        };
      });
    }

    // For multiple choice: store simple arrays that match schema
    if (question.questionData.type === 'multipleChoice') {
      details.options = question.questionData.options || []; // Simple string array
      details.selectedOption = question.studentAnswer;
      details.correctOption = question.questionData.correctAnswer;
    }

    // For true/false: simple boolean tracking
    if (question.questionData.type === 'trueFalse') {
      details.selectedAnswer = question.studentAnswer;
      details.correctAnswer = question.questionData.correctAnswer;
    }

    // For code questions: execution results and analysis
    if (['codeChallenge', 'codeDebugging'].includes(question.questionData.type) &&
        question.questionData.category === 'logic') {
      details.codeResults = {
        executed: question.studentAnswer ? true : false,
        passed: question.isCorrect || false,
        totalTests: question.questionData.testCases?.length || 0,
        passedTests: question.isCorrect ? (question.questionData.testCases?.length || 0) : 0,
        executionTime: 0, // Could be tracked during grading
        error: null,
        codeLength: question.studentAnswer ? question.studentAnswer.length : 0
      };
    }

    return details;
  };

  // ENHANCED: Convert questions with comprehensive details
  let questionNumber = 1;
  const questions = session.testSnapshot.settings.useSections ?
    session.testSnapshot.sections.flatMap((section, sectionIndex) =>
      section.questions.map((question) => ({
        questionId: question.questionId,
        questionNumber: questionNumber++,
        sectionIndex: sectionIndex,
        sectionName: section.name || `Section ${sectionIndex + 1}`,

        // ENHANCED: Full question details for frontend consumption
        questionDetails: createQuestionDetails(question, questionNumber - 1),

        // Legacy fields for backward compatibility
        title: question.questionData.title || '',
        type: question.questionData.type || '',
        language: question.questionData.language || '',
        category: question.questionData.category || '',
        difficulty: question.questionData.difficulty || 'medium',

        // Core answer data
        answer: question.studentAnswer, // This is what frontend uses
        studentAnswer: question.studentAnswer, // Alias for compatibility
        correctAnswer: question.questionData.correctAnswer || question.questionData.blanks || question.questionData.solutionCode,

        // Results
        isCorrect: question.isCorrect || false,
        pointsAwarded: question.pointsEarned || 0, // Frontend expects pointsAwarded
        pointsEarned: question.pointsEarned || 0,
        pointsPossible: question.points || 0,

        // Timing
        timeSpent: question.timeSpentOnQuestion || 0,
        viewCount: question.viewCount || 0,

        // Code submissions if applicable
        codeSubmissions: question.codeSubmissions || [],

        // Type-specific details
        details: createResultDetails(question, questionNumber - 1)
      }))
    ) :
    session.testSnapshot.questions.map((question, index) => ({
      questionId: question.questionId,
      questionNumber: questionNumber++,
      sectionIndex: null,
      sectionName: null,

      // ENHANCED: Full question details for frontend consumption
      questionDetails: createQuestionDetails(question, index),

      // Legacy fields for backward compatibility
      title: question.questionData.title || '',
      type: question.questionData.type || '',
      language: question.questionData.language || '',
      category: question.questionData.category || '',
      difficulty: question.questionData.difficulty || 'medium',

      // Core answer data
      answer: question.studentAnswer, // This is what frontend uses
      studentAnswer: question.studentAnswer, // Alias for compatibility
      correctAnswer: question.questionData.correctAnswer || question.questionData.blanks || question.questionData.solutionCode,

      // Results
      isCorrect: question.isCorrect || false,
      pointsAwarded: question.pointsEarned || 0, // Frontend expects pointsAwarded
      pointsEarned: question.pointsEarned || 0,
      pointsPossible: question.points || 0,

      // Timing
      timeSpent: question.timeSpentOnQuestion || 0,
      viewCount: question.viewCount || 0,

      // Code submissions if applicable
      codeSubmissions: question.codeSubmissions || [],

      // Type-specific details
      details: createResultDetails(question, index)
    }));

  const result = new Result({
    sessionId: session._id,
    testId: session.testSnapshot.originalTestId,
    userId: session.userId,
    organizationId: session.organizationId,
    attemptNumber: session.attemptNumber,
    status: session.status,
    completedAt: session.completedAt,
    timeSpent: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    questions: questions,
    score: {
      totalPoints: gradingResults.finalScore.totalPoints,
      earnedPoints: gradingResults.finalScore.earnedPoints,
      percentage: gradingResults.finalScore.percentage,
      passed: gradingResults.finalScore.passed,
      passingThreshold: gradingResults.finalScore.passingThreshold,
      totalQuestions: questions.length,
      correctAnswers: gradingResults.finalScore.correctAnswers,
      incorrectAnswers: gradingResults.finalScore.incorrectAnswers,
      unansweredQuestions: gradingResults.finalScore.unansweredQuestions
    }
  });

  await result.save({ session: mongoSession });
  
  console.log(`Enhanced result document created with ${questions.length} questions and full details`);
  console.log(`First question details:`, {
    title: questions[0]?.questionDetails?.title,
    type: questions[0]?.questionDetails?.type,
    hasOptions: !!questions[0]?.questionDetails?.options,
    hasCorrectAnswer: questions[0]?.questionDetails?.correctAnswer !== undefined
  });
  
  return result;
};

// Update test statistics
const updateTestStatistics = async (session, finalScore, mongoSession) => {
  const Test = require('../../models/Test');

  const test = await Test.findById(session.testSnapshot.originalTestId).session(mongoSession);
  if (!test) {
    return; // Test not found, skip stats update
  }

  const currentStats = test.stats || { totalAttempts: 0, averageScore: 0, passRate: 0 };
  const newTotalAttempts = currentStats.totalAttempts + 1;
  const newAverageScore = (currentStats.averageScore * currentStats.totalAttempts + finalScore.earnedPoints) / newTotalAttempts;
  const newPassedCount = (currentStats.passRate * currentStats.totalAttempts) + (finalScore.passed ? 1 : 0);
  const newPassRate = newPassedCount / newTotalAttempts;

  test.stats = {
    totalAttempts: newTotalAttempts,
    averageScore: Math.round(newAverageScore * 100) / 100,
    passRate: Math.round(newPassRate * 10000) / 10000
  };

  await test.save({ session: mongoSession });
};

module.exports = {
  submitTestSession,
  gradeAllQuestions
};