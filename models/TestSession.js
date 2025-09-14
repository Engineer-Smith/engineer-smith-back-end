// /models/TestSession.js - Updated for Server-Driven Architecture
const { Schema, model } = require('mongoose');

const testSessionSchema = new Schema({
  // Core identification - KEEP AS IS
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  attemptNumber: {
    type: Number,
    required: true,
  },

  // Status and timing - Enhanced for server-driven approach
  status: {
    type: String,
    enum: ['inProgress', 'paused', 'completed', 'expired', 'abandoned'],
    default: 'inProgress',
  },
  startedAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
    default: undefined,
  },

  // NEW: Connection tracking for grace period management
  isConnected: {
    type: Boolean,
    default: true,
  },
  disconnectedAt: {
    type: Date,
    default: null,
  },
  lastConnectedAt: {
    type: Date,
    default: null,
  },
  graceTimerId: {
    type: String, // Store timer ID for cleanup
    default: null,
  },
  gracePeriodExpired: {
    type: Boolean,
    default: false,
  },

  // Enhanced section timing for server-driven control
  currentSectionIndex: {
    type: Number,
    default: 0,
  },
  currentSectionStartedAt: {
    type: Date,
    default: null, // Set when section starts
  },
  completedSections: {
    type: [Number], // Array of completed section indices
    default: [],
  },

  // NEW: Track timing per section for accurate resume
  sectionStartTimes: {
    type: [Date], // When each section was started
    default: [],
  },
  sectionTimeUsed: {
    type: [Number], // Cumulative time used per section (seconds)
    default: [],
  },

  // Basic navigation - Keep as is
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  answeredQuestions: {
    type: [Number], // Global question indices that have answers
    default: [],
  },

  // NEW: Server state tracking
  sessionPhase: {
    type: String,
    enum: ['question', 'section_transition', 'test_completed'],
    default: 'question',
  },
  lastServerAction: {
    type: String, // Track last action for debugging/recovery
    default: null,
  },
  lastServerActionAt: {
    type: Date,
    default: null,
  },

  // Test snapshot - KEEP AS IS
  testSnapshot: {
    originalTestId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    settings: {
      timeLimit: { type: Number, required: true }, // minutes
      attemptsAllowed: { type: Number, required: true },
      shuffleQuestions: { type: Boolean, default: false },
      useSections: { type: Boolean, default: false },
    },
    sections: [{
      name: { type: String, required: true },
      timeLimit: { type: Number, required: true }, // minutes
      questions: [{
        questionId: { type: Schema.Types.ObjectId, required: true },
        questionData: { type: Schema.Types.Mixed, required: true },
        points: { type: Number, required: true },
        originalOrder: { type: Number, required: true },
        finalOrder: { type: Number, required: true },
        // Student data
        studentAnswer: { type: Schema.Types.Mixed, default: null },
        status: {
          type: String,
          enum: ['not_viewed', 'viewed', 'answered', 'skipped'],
          default: 'not_viewed',
        },
        timeSpentOnQuestion: { type: Number, default: 0 }, // seconds
        viewCount: { type: Number, default: 0 },
        firstViewedAt: { type: Date, default: null },
        lastViewedAt: { type: Date, default: null },
        // NEW: Server grading tracking
        isCorrect: { type: Boolean, default: null },
        pointsEarned: { type: Number, default: 0 },
      }]
    }],
    questions: [{
      // Same structure as section questions for non-sectioned tests
      questionId: { type: Schema.Types.ObjectId, required: true },
      questionData: { type: Schema.Types.Mixed, required: true },
      points: { type: Number, required: true },
      originalOrder: { type: Number, required: true },
      finalOrder: { type: Number, required: true },
      studentAnswer: { type: Schema.Types.Mixed, default: null },
      status: {
        type: String,
        enum: ['not_viewed', 'viewed', 'answered', 'skipped'],
        default: 'not_viewed',
      },
      timeSpentOnQuestion: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 },
      firstViewedAt: { type: Date, default: null },
      lastViewedAt: { type: Date, default: null },
      // NEW: Server grading tracking
      isCorrect: { type: Boolean, default: null },
      pointsEarned: { type: Number, default: 0 },
    }],
  },

  // Final score - KEEP AS IS
  finalScore: {
    totalPoints: { type: Number, default: 0 },
    earnedPoints: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    passingThreshold: { type: Number, default: 70 },
    correctAnswers: { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    unansweredQuestions: { type: Number, default: 0 },
    totalTimeUsed: { type: Number, default: 0 },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  skippedQuestions: {
    type: [Number], // Array of question indices that were skipped
    default: []
  },
  reviewPhase: {
    type: Boolean,
    default: false
  },
  reviewStartedAt: {
    type: Date,
    default: null
  }
});

// Indexes - Enhanced for new fields
testSessionSchema.index({ userId: 1, status: 1 });
testSessionSchema.index({ 'testSnapshot.originalTestId': 1, userId: 1 });
testSessionSchema.index({ status: 1, isConnected: 1 }); // For cleanup operations
testSessionSchema.index({ disconnectedAt: 1 }); // For grace period queries

// Update updatedAt on save
testSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// ENHANCED: Virtual methods for server-driven architecture

// Get current question - Keep existing logic
testSessionSchema.virtual('currentQuestion').get(function () {
  if (this.testSnapshot.settings.useSections) {
    const section = this.testSnapshot.sections[this.currentSectionIndex];
    const questionInSection = this.currentQuestionIndex - this.getSectionStartIndex(this.currentSectionIndex);
    return section?.questions[questionInSection];
  } else {
    return this.testSnapshot.questions[this.currentQuestionIndex];
  }
});

// ENHANCED: Connection state management
testSessionSchema.methods.markConnected = function () {
  this.isConnected = true;
  this.lastConnectedAt = new Date();
  this.disconnectedAt = null;
  this.graceTimerId = null;
};

testSessionSchema.methods.markDisconnected = function () {
  this.isConnected = false;
  this.disconnectedAt = new Date();
};

testSessionSchema.methods.isInGracePeriod = function () {
  if (!this.disconnectedAt || this.isConnected) return false;

  const gracePeriodMs = 5 * 60 * 1000; // 5 minutes
  const gracePeriodExpiry = new Date(this.disconnectedAt.getTime() + gracePeriodMs);

  return Date.now() < gracePeriodExpiry.getTime();
};

// ENHANCED: Section timing with pause/resume support
testSessionSchema.methods.getSectionStartIndex = function (sectionIndex) {
  if (!this.testSnapshot.settings.useSections) return 0;

  let startIndex = 0;
  for (let i = 0; i < sectionIndex; i++) {
    startIndex += this.testSnapshot.sections[i].questions.length;
  }
  return startIndex;
};

// NEW: Calculate time remaining with pause support
testSessionSchema.methods.calculateTimeRemaining = function () {
  if (this.testSnapshot.settings.useSections) {
    return this.calculateSectionTimeRemaining();
  } else {
    return this.calculateOverallTimeRemaining();
  }
};

// NEW: Section time calculation with pause/resume
testSessionSchema.methods.calculateSectionTimeRemaining = function () {
  if (!this.currentSectionStartedAt) return 0;

  const section = this.testSnapshot.sections[this.currentSectionIndex];
  const timeLimitMs = section.timeLimit * 60 * 1000;

  let timeUsed = 0;

  // Get stored time for this section
  const storedTimeSeconds = (this.sectionTimeUsed && this.sectionTimeUsed[this.currentSectionIndex]) || 0;

  if (this.status === 'inProgress' && this.isConnected && this.currentSectionStartedAt) {
    // Active: stored time + current session time
    const currentSessionTimeMs = Date.now() - this.currentSectionStartedAt.getTime();
    const currentSessionTimeSeconds = Math.floor(currentSessionTimeMs / 1000);
    timeUsed = (storedTimeSeconds + currentSessionTimeSeconds) * 1000;
  } else {
    // Paused or disconnected: just use stored time
    timeUsed = storedTimeSeconds * 1000;
  }

  const remainingMs = Math.max(0, timeLimitMs - timeUsed);
  return Math.floor(remainingMs / 1000);
};

// NEW: Overall test time calculation
testSessionSchema.methods.calculateOverallTimeRemaining = function () {
  const timeLimitMs = this.testSnapshot.settings.timeLimit * 60 * 1000;

  let timeUsed = 0;

  if (this.isConnected && this.status === 'inProgress') {
    timeUsed = Date.now() - this.startedAt.getTime();
  } else if (this.status === 'paused' && this.disconnectedAt) {
    timeUsed = this.disconnectedAt.getTime() - this.startedAt.getTime();
  } else if (this.completedAt) {
    timeUsed = this.completedAt.getTime() - this.startedAt.getTime();
  }

  const remainingMs = Math.max(0, timeLimitMs - timeUsed);
  return Math.floor(remainingMs / 1000);
};

// ENHANCED: Section management for server-driven flow
testSessionSchema.methods.startSection = function (sectionIndex) {
  this.currentSectionIndex = sectionIndex;
  this.currentSectionStartedAt = new Date();

  // Initialize section timing arrays if needed
  while (this.sectionStartTimes.length <= sectionIndex) {
    this.sectionStartTimes.push(null);
    this.sectionTimeUsed.push(0);
  }

  this.sectionStartTimes[sectionIndex] = new Date();

  // Set currentQuestionIndex to first question of this section
  this.currentQuestionIndex = this.getSectionStartIndex(sectionIndex);

  // Update server state
  this.sessionPhase = 'question';
  this.lastServerAction = `started_section_${sectionIndex}`;
  this.lastServerActionAt = new Date();
};

// ENHANCED: Complete section with time tracking
testSessionSchema.methods.completeCurrentSection = function () {
  const currentSection = this.currentSectionIndex;

  // Record time used for this section
  if (this.currentSectionStartedAt) {
    const timeUsed = Math.floor((Date.now() - this.currentSectionStartedAt.getTime()) / 1000);
    this.sectionTimeUsed[currentSection] = timeUsed;
  }

  // Add to completed sections
  if (!this.completedSections.includes(currentSection)) {
    this.completedSections.push(currentSection);
  }

  // Check if there's a next section
  const nextSectionIndex = currentSection + 1;
  const hasMoreSections = nextSectionIndex < this.testSnapshot.sections.length;

  if (hasMoreSections) {
    // Prepare for section transition
    this.sessionPhase = 'section_transition';
    this.lastServerAction = `completed_section_${currentSection}`;
    this.lastServerActionAt = new Date();

    return { hasMoreSections: true, nextSectionIndex };
  } else {
    // No more sections - test complete
    this.sessionPhase = 'test_completed';
    this.lastServerAction = 'test_completed';
    this.lastServerActionAt = new Date();

    return { hasMoreSections: false, testComplete: true };
  }
};

// NEW: Navigation helpers for server-driven flow
testSessionSchema.methods.getCurrentQuestionInSection = function () {
  if (!this.testSnapshot.settings.useSections) {
    return this.currentQuestionIndex;
  }

  return this.currentQuestionIndex - this.getSectionStartIndex(this.currentSectionIndex);
};

testSessionSchema.methods.isLastQuestionInSection = function () {
  if (!this.testSnapshot.settings.useSections) {
    return this.currentQuestionIndex >= this.testSnapshot.questions.length - 1;
  }

  const section = this.testSnapshot.sections[this.currentSectionIndex];
  const questionInSection = this.getCurrentQuestionInSection();

  return questionInSection >= section.questions.length - 1;
};

testSessionSchema.methods.isLastSection = function () {
  if (!this.testSnapshot.settings.useSections) return true;

  return this.currentSectionIndex >= this.testSnapshot.sections.length - 1;
};

// NEW: Question state management
testSessionSchema.methods.updateQuestionState = function (status, answer = null, timeSpent = 0) {
  const question = this.currentQuestion;
  if (!question) return false;

  // Update question data
  if (answer !== null) question.studentAnswer = answer;
  question.status = status;
  question.timeSpentOnQuestion += timeSpent;
  question.lastViewedAt = new Date();

  if (question.status === 'viewed' && !question.firstViewedAt) {
    question.firstViewedAt = new Date();
  }

  question.viewCount += 1;

  // Update answered questions array
  if (status === 'answered' && !this.answeredQuestions.includes(this.currentQuestionIndex)) {
    this.answeredQuestions.push(this.currentQuestionIndex);
  }

  return true;
};

// SIMPLIFIED: Check if session/section is expired
testSessionSchema.methods.isExpired = function () {
  return this.calculateTimeRemaining() <= 0;
};

// NEW: Server state tracking
testSessionSchema.methods.updateServerState = function (action, phase = null) {
  this.lastServerAction = action;
  this.lastServerActionAt = new Date();

  if (phase) {
    this.sessionPhase = phase;
  }
};

module.exports = model('TestSession', testSessionSchema);