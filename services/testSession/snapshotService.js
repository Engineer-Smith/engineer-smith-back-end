// /services/testSession/snapshotService.js - SIMPLIFIED VERSION
const crypto = require('crypto');

// Helper function to create seeded random number generator
function createSeededRandom(seed) {
  let state = seed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  return function () {
    state = Math.imul(16807, state) | 0;
    return (state & 2147483647) / 2147483648;
  };
}

// Helper function to shuffle array with seeded random
function shuffleArray(array, rng) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// SIMPLIFIED: Initialize student data for a question
const initializeStudentData = (questionType) => {
  return {
    studentAnswer: null,
    status: 'not_viewed',
    timeSpentOnQuestion: 0,
    viewCount: 0,
    firstViewedAt: null,
    lastViewedAt: null
    // REMOVED: answerHistory, codeSubmissions, debugAttempts, flagging, grading fields
  };
};

// Create question data snapshot with ALL necessary fields - UNCHANGED
const createQuestionSnapshot = (questionRef, orderIndex) => {
  const question = questionRef.questionId;

  console.log(`Creating snapshot for question ${question._id}: type=${question.type}, category=${question.category}`);

  const questionData = {
    title: question.title,
    description: question.description,
    type: question.type,
    language: question.language,
    difficulty: question.difficulty,
    tags: question.tags || []
  };

  // Add category for code-related questions
  if (['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(question.type)) {
    questionData.category = question.category;
  }

  // Add type-specific fields with comprehensive coverage
  if (question.type === 'multipleChoice' || question.type === 'trueFalse') {
    questionData.options = question.options || [];
    questionData.correctAnswer = question.correctAnswer;
    console.log(`MC/TF Question ${question._id}: options=${question.options?.length}, correctAnswer=${question.correctAnswer}`);
  }

  if (question.type === 'fillInTheBlank') {
    questionData.codeTemplate = question.codeTemplate || '';
    questionData.blanks = question.blanks || [];
    console.log(`FIB Question ${question._id}: blanks=${question.blanks?.length}, template length=${question.codeTemplate?.length || 0}`);
  }

  if (question.type === 'codeChallenge') {
    // Always include codeTemplate for code challenges
    questionData.codeTemplate = question.codeTemplate || '';

    if (question.category === 'logic') {
      // Ensure complete codeConfig is included
      questionData.codeConfig = {
        runtime: question.codeConfig?.runtime,
        entryFunction: question.codeConfig?.entryFunction,
        timeoutMs: question.codeConfig?.timeoutMs || 3000,
        allowPreview: question.codeConfig?.allowPreview !== false
      };
      questionData.testCases = question.testCases || [];

      console.log(`Logic Code Challenge ${question._id}:`, {
        runtime: questionData.codeConfig.runtime,
        entryFunction: questionData.codeConfig.entryFunction,
        testCases: questionData.testCases.length,
        templateLength: questionData.codeTemplate.length
      });

      // Validate critical fields are present
      if (!questionData.codeConfig.entryFunction) {
        console.error(`ERROR: Logic code challenge ${question._id} missing entryFunction!`);
      }
      if (!questionData.codeConfig.runtime) {
        console.error(`ERROR: Logic code challenge ${question._id} missing runtime!`);
      }
      if (!questionData.testCases || questionData.testCases.length === 0) {
        console.error(`ERROR: Logic code challenge ${question._id} missing test cases!`);
      }

    } else if (question.category === 'ui' || question.category === 'syntax') {
      // UI/Syntax questions
      questionData.solutionCode = question.solutionCode || '';
      questionData.expectedOutput = question.expectedOutput || '';

      console.log(`UI/Syntax Code Challenge ${question._id}: solution length=${question.solutionCode?.length || 0}`);
    }
  }

  if (question.type === 'codeDebugging') {
    questionData.buggyCode = question.buggyCode || '';
    questionData.solutionCode = question.solutionCode || '';

    if (question.category === 'logic') {
      // Ensure complete codeConfig is included for debugging questions
      questionData.codeConfig = {
        runtime: question.codeConfig?.runtime,
        entryFunction: question.codeConfig?.entryFunction,
        timeoutMs: question.codeConfig?.timeoutMs || 3000,
        allowPreview: question.codeConfig?.allowPreview !== false
      };
      questionData.testCases = question.testCases || [];

      console.log(`Logic Code Debugging ${question._id}:`, {
        runtime: questionData.codeConfig.runtime,
        entryFunction: questionData.codeConfig.entryFunction,
        testCases: questionData.testCases.length,
        buggyCodeLength: questionData.buggyCode.length,
        solutionCodeLength: questionData.solutionCode.length
      });

      // Validate critical fields are present
      if (!questionData.codeConfig.entryFunction) {
        console.error(`ERROR: Logic code debugging ${question._id} missing entryFunction!`);
      }
      if (!questionData.codeConfig.runtime) {
        console.error(`ERROR: Logic code debugging ${question._id} missing runtime!`);
      }
      if (!questionData.testCases || questionData.testCases.length === 0) {
        console.error(`ERROR: Logic code debugging ${question._id} missing test cases!`);
      }
    }
  }

  const snapshot = {
    questionId: question._id,
    questionData,
    points: questionRef.points,
    originalOrder: orderIndex,
    finalOrder: orderIndex, // Will be updated after shuffle
    ...initializeStudentData(question.type)
  };

  console.log(`Question snapshot created for ${question._id}:`, {
    type: snapshot.questionData.type,
    category: snapshot.questionData.category,
    hasCodeConfig: !!snapshot.questionData.codeConfig,
    hasTestCases: !!snapshot.questionData.testCases,
    entryFunction: snapshot.questionData.codeConfig?.entryFunction
  });

  return snapshot;
};

// SIMPLIFIED: Create complete test snapshot with randomization
const createTestSnapshot = async (test, userId) => {
  console.log(`Creating test snapshot for test ${test._id}, user ${userId}`);

  // Create randomization seed
  const randomSeed = `${userId}_${test._id}_${Date.now()}_${Math.random()}`;
  const rng = createSeededRandom(randomSeed);

  const snapshot = {
    originalTestId: test._id,
    title: test.title,
    description: test.description,
    testType: test.testType,
    languages: test.languages || [],
    tags: test.tags || [],
    settings: { ...test.settings },
    randomizationSeed: randomSeed,
    wasShuffled: test.settings.shuffleQuestions || false,
    totalQuestions: 0,
    totalPoints: 0
  };

  if (test.settings.useSections) {
    console.log(`Processing sectioned test with ${test.sections.length} sections`);

    // Process sectioned test
    snapshot.sections = test.sections.map((section, sectionIndex) => {
      console.log(`Processing section ${sectionIndex}: ${section.name} with ${section.questions.length} questions`);

      let questions = section.questions.map((qRef, qIndex) =>
        createQuestionSnapshot(qRef, qIndex)
      );

      // Apply randomization if enabled
      if (test.settings.shuffleQuestions) {
        console.log(`Shuffling questions in section ${sectionIndex}`);
        questions = shuffleArray(questions, rng);
        // Update final order after shuffle
        questions.forEach((q, index) => {
          q.finalOrder = index;
        });
      }

      snapshot.totalQuestions += questions.length;
      snapshot.totalPoints += questions.reduce((sum, q) => sum + q.points, 0);

      return {
        name: section.name,
        timeLimit: section.timeLimit,
        originalSectionIndex: sectionIndex,
        questions
      };
    });

    snapshot.questions = undefined; // Ensure non-sectioned structure is not set

  } else {
    console.log(`Processing non-sectioned test with ${test.questions.length} questions`);

    // Process non-sectioned test
    let questions = test.questions.map((qRef, qIndex) =>
      createQuestionSnapshot(qRef, qIndex)
    );

    // Apply randomization if enabled
    if (test.settings.shuffleQuestions) {
      console.log('Shuffling questions in non-sectioned test');
      questions = shuffleArray(questions, rng);
      // Update final order after shuffle
      questions.forEach((q, index) => {
        q.finalOrder = index;
      });
    }

    snapshot.questions = questions;
    snapshot.sections = undefined; // Ensure sectioned structure is not set
    snapshot.totalQuestions = questions.length;
    snapshot.totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  }

  console.log(`Test snapshot created:`, {
    testId: snapshot.originalTestId,
    totalQuestions: snapshot.totalQuestions,
    totalPoints: snapshot.totalPoints,
    useSections: test.settings.useSections,
    wasShuffled: snapshot.wasShuffled,
    sectionCount: snapshot.sections?.length || 0
  });

  // Validation summary for debugging
  const allQuestions = snapshot.questions ||
    (snapshot.sections ? snapshot.sections.flatMap(s => s.questions) : []);

  const logicCodeQuestions = allQuestions.filter(q =>
    ['codeChallenge', 'codeDebugging'].includes(q.questionData.type) &&
    q.questionData.category === 'logic'
  );

  console.log(`Snapshot validation summary:`, {
    totalQuestions: allQuestions.length,
    logicCodeQuestions: logicCodeQuestions.length,
    missingEntryFunction: logicCodeQuestions.filter(q => !q.questionData.codeConfig?.entryFunction).length,
    missingRuntime: logicCodeQuestions.filter(q => !q.questionData.codeConfig?.runtime).length,
    missingTestCases: logicCodeQuestions.filter(q => !q.questionData.testCases || q.questionData.testCases.length === 0).length
  });

  return snapshot;
};

// Validate test can be started - UNCHANGED
const validateTestAccess = (test, user) => {
  // Check if user is admin/instructor by role (not org type)
  if (user.role === 'instructor' || user.role === 'admin') {
    throw new Error('Only students can start test sessions');
  }

  // Check test access permissions
  if (test.isGlobal) {
    if (user.role !== 'student') {
      throw new Error('Only students can start global tests');
    }
  } else if (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString()) {
    throw new Error('Unauthorized to start this test');
  }

  // Check test is active
  if (test.status !== 'active') {
    throw new Error('Test is not active');
  }
};

// Get populated test with all question fields - UNCHANGED
const getPopulatedTest = async (testId) => {
  const Test = require('../../models/Test');

  return await Test.findById(testId)
    .populate({
      path: 'sections.questions.questionId',
      select: 'title description type language category options correctAnswer testCases codeConfig codeTemplate blanks buggyCode solutionCode difficulty tags'
    })
    .populate({
      path: 'questions.questionId',
      select: 'title description type language category options correctAnswer testCases codeConfig codeTemplate blanks buggyCode solutionCode difficulty tags'
    });
};

module.exports = {
  createTestSnapshot,
  validateTestAccess,
  getPopulatedTest,
  createSeededRandom,
  shuffleArray
};

// REMOVED: createSessionInitializationData, initializeSectionTiming, initializeCurrentSectionTiming
// These created the complex timing data we no longer need