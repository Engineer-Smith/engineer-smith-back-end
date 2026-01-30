// src/types/type-guards.ts - Type guard utilities
import type {
  Difficulty,
  Language,
  Organization,
  Question,
  QuestionCategory,
  QuestionStatus,
  QuestionType,
  Result,
  Role,
  SessionFinalScore,
  SessionStatus,
  Tags,
  Test,
  TestSection,
  TestSession,
  TestStatus,
  TestType,
  User
} from './index';

// =====================
// CORE ENTITY TYPE GUARDS
// =====================

/**
 * Type guard to check if an object is a User
 */
export const isUser = (obj: any): obj is User => {
  return obj && 
    typeof obj === 'object' &&
    typeof obj._id === 'string' && 
    typeof obj.loginId === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.organizationId === 'string' &&
    typeof obj.role === 'string' &&
    typeof obj.isSSO === 'boolean' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string';
};

/**
 * Type guard to check if an object is an Organization
 */
export const isOrganization = (obj: any): obj is Organization => {
  return obj && 
    typeof obj === 'object' &&
    typeof obj._id === 'string' && 
    typeof obj.name === 'string' &&
    typeof obj.isSuperOrg === 'boolean' &&
    typeof obj.inviteCode === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string';
};

/**
 * Type guard to check if an object is a Question
 */
export const isQuestion = (obj: any): obj is Question => {
  return obj && 
    typeof obj === 'object' &&
    typeof obj._id === 'string' && 
    typeof obj.title === 'string' && 
    typeof obj.description === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.language === 'string' &&
    typeof obj.difficulty === 'string' &&
    typeof obj.status === 'string' &&
    Array.isArray(obj.tags) &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string';
};

/**
 * Type guard to check if an object is a Test
 */
export const isTest = (obj: any): obj is Test => {
  return obj && 
    typeof obj === 'object' &&
    typeof obj._id === 'string' && 
    typeof obj.title === 'string' && 
    typeof obj.description === 'string' &&
    typeof obj.testType === 'string' &&
    Array.isArray(obj.languages) &&
    Array.isArray(obj.tags) &&
    typeof obj.settings === 'object' &&
    typeof obj.status === 'string' &&
    typeof obj.stats === 'object' &&
    typeof obj.isGlobal === 'boolean' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string';
};

/**
 * Type guard to check if an object is a TestSession
 */
export const isTestSession = (obj: any): obj is TestSession => {
  return obj && 
    typeof obj === 'object' &&
    typeof obj._id === 'string' && 
    typeof obj.testId === 'string' && 
    typeof obj.userId === 'string' &&
    typeof obj.organizationId === 'string' &&
    typeof obj.attemptNumber === 'number' &&
    typeof obj.status === 'string' &&
    typeof obj.startedAt === 'string' &&
    typeof obj.timeSpent === 'number' &&
    typeof obj.testSnapshot === 'object' &&
    typeof obj.navigation === 'object' &&
    typeof obj.progress === 'object' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string';
};

/**
 * Type guard to check if an object is a Result
 */
export const isResult = (obj: any): obj is Result => {
  return obj && 
    typeof obj === 'object' &&
    typeof obj._id === 'string' && 
    typeof obj.sessionId === 'string' && 
    typeof obj.testId === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.organizationId === 'string' &&
    typeof obj.attemptNumber === 'number' &&
    typeof obj.status === 'string' &&
    typeof obj.timeSpent === 'number' &&
    Array.isArray(obj.questions) &&
    typeof obj.score === 'object' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string';
};

// =====================
// ENUM VALUE TYPE GUARDS
// =====================

/**
 * Type guard to check if a value is a valid Role
 */
export const isValidRole = (value: any): value is Role => {
  return typeof value === 'string' && ['admin', 'instructor', 'student'].includes(value);
};

/**
 * Type guard to check if a value is a valid Language
 */
export const isValidLanguage = (value: any): value is Language => {
  return typeof value === 'string' && [
    'javascript', 'css', 'html', 'sql', 'dart', 'react', 
    'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'
  ].includes(value);
};

/**
 * Type guard to check if a value is a valid QuestionType
 */
export const isValidQuestionType = (value: any): value is QuestionType => {
  return typeof value === 'string' && [
    'multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'
  ].includes(value);
};

/**
 * Type guard to check if a value is a valid QuestionCategory
 */
export const isValidQuestionCategory = (value: any): value is QuestionCategory => {
  return typeof value === 'string' && ['logic', 'ui', 'syntax'].includes(value);
};

/**
 * Type guard to check if a value is a valid Difficulty
 */
export const isValidDifficulty = (value: any): value is Difficulty => {
  return typeof value === 'string' && ['easy', 'medium', 'hard'].includes(value);
};

/**
 * Type guard to check if a value is a valid TestStatus
 */
export const isValidTestStatus = (value: any): value is TestStatus => {
  return typeof value === 'string' && ['draft', 'active', 'archived'].includes(value);
};

/**
 * Type guard to check if a value is a valid SessionStatus
 */
export const isValidSessionStatus = (value: any): value is SessionStatus => {
  return typeof value === 'string' && ['inProgress', 'completed', 'expired', 'abandoned'].includes(value);
};

/**
 * Type guard to check if a value is a valid QuestionStatus
 */
export const isValidQuestionStatus = (value: any): value is QuestionStatus => {
  return typeof value === 'string' && ['not_viewed', 'viewed', 'answered', 'skipped', 'flagged', 'submitted'].includes(value);
};

/**
 * Type guard to check if a value is a valid TestType
 */
export const isValidTestType = (value: any): value is TestType => {
  return typeof value === 'string' && [
    'frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'
  ].includes(value);
};

/**
 * Type guard to check if a value is a valid Tag
 */
export const isValidTag = (value: any): value is Tags => {
  const validTags = [
    'html', 'css', 'javascript', 'dom', 'events', 'async-programming', 'promises', 'async-await',
    'es6', 'closures', 'scope', 'hoisting', 'flexbox', 'grid', 'responsive-design',
    'react', 'react-native', 'components', 'hooks', 'state-management', 'props', 'context-api',
    'redux', 'react-router', 'jsx', 'virtual-dom', 'native-components', 'navigation',
    'flutter', 'widgets', 'state-management-flutter', 'dart', 'navigation-flutter', 'ui-components',
    'express', 'nodejs', 'rest-api', 'middleware', 'routing', 'authentication', 'authorization',
    'jwt', 'express-middleware', 'sql', 'queries', 'joins', 'indexes', 'transactions',
    'database-design', 'normalization', 'python', 'functions', 'classes', 'modules',
    'list-comprehensions', 'decorators', 'generators', 'python-data-structures',
    'variables', 'arrays', 'objects', 'loops', 'conditionals', 'algorithms', 'data-structures',
    'error-handling', 'testing', 'typescript', 'mobile-development'
  ];
  return typeof value === 'string' && validTags.includes(value);
};

// =====================
// SPECIALIZED TYPE GUARDS
// =====================

/**
 * Type guard to check if a user has a specific role
 */
export const userHasRole = (user: User, role: Role): boolean => {
  return isUser(user) && user.role === role;
};

/**
 * Type guard to check if a user is an admin
 */
export const isUserAdmin = (user: User): boolean => {
  return userHasRole(user, 'admin');
};

/**
 * Type guard to check if a user is an instructor
 */
export const isUserInstructor = (user: User): boolean => {
  return userHasRole(user, 'instructor');
};

/**
 * Type guard to check if a user is a student
 */
export const isUserStudent = (user: User): boolean => {
  return userHasRole(user, 'student');
};

/**
 * Type guard to check if an organization is a super organization
 */
export const isSuperOrganization = (org: Organization): boolean => {
  return isOrganization(org) && org.isSuperOrg === true;
};

/**
 * Type guard to check if a test session is completed
 */
export const isSessionCompleted = (session: TestSession): session is TestSession & { 
  completedAt: string; 
  finalScore: SessionFinalScore 
} => {
  return isTestSession(session) && 
    session.status === 'completed' && 
    typeof session.completedAt === 'string' &&
    session.finalScore !== undefined;
};

/**
 * Type guard to check if a test session is in progress
 */
export const isSessionInProgress = (session: TestSession): boolean => {
  return isTestSession(session) && session.status === 'inProgress';
};

/**
 * Type guard to check if a result is for a completed session
 */
export const isCompletedResult = (result: Result): result is Result & { completedAt: string } => {
  return isResult(result) && 
    result.status === 'completed' && 
    typeof result.completedAt === 'string';
};

/**
 * Type guard to check if a result represents a passed test
 */
export const isPassedResult = (result: Result): boolean => {
  return isResult(result) && result.score.passed === true;
};

/**
 * Type guard to check if a test uses sections
 */
export const testUsesSections = (test: Test): test is Test & { sections: TestSection[] } => {
  return isTest(test) && 
    test.settings.useSections === true && 
    Array.isArray(test.sections) &&
    test.sections.length > 0;
};

/**
 * Type guard to check if a test is active
 */
export const isActiveTest = (test: Test): boolean => {
  return isTest(test) && test.status === 'active';
};

/**
 * Type guard to check if a test is global
 */
export const isGlobalTest = (test: Test): boolean => {
  return isTest(test) && test.isGlobal === true;
};

/**
 * Type guard to check if a question is a code question
 */
export const isCodeQuestion = (question: Question): boolean => {
  return isQuestion(question) && 
    ['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(question.type);
};

/**
 * Type guard to check if a question is multiple choice
 */
export const isMultipleChoiceQuestion = (question: Question): boolean => {
  return isQuestion(question) && question.type === 'multipleChoice';
};

/**
 * Type guard to check if a question is true/false
 */
export const isTrueFalseQuestion = (question: Question): boolean => {
  return isQuestion(question) && question.type === 'trueFalse';
};

// =====================
// ARRAY TYPE GUARDS
// =====================

/**
 * Type guard to check if an array contains only Users
 */
export const isUserArray = (arr: any[]): arr is User[] => {
  return Array.isArray(arr) && arr.every(isUser);
};

/**
 * Type guard to check if an array contains only Organizations
 */
export const isOrganizationArray = (arr: any[]): arr is Organization[] => {
  return Array.isArray(arr) && arr.every(isOrganization);
};

/**
 * Type guard to check if an array contains only Questions
 */
export const isQuestionArray = (arr: any[]): arr is Question[] => {
  return Array.isArray(arr) && arr.every(isQuestion);
};

/**
 * Type guard to check if an array contains only Tests
 */
export const isTestArray = (arr: any[]): arr is Test[] => {
  return Array.isArray(arr) && arr.every(isTest);
};

/**
 * Type guard to check if an array contains only TestSessions
 */
export const isTestSessionArray = (arr: any[]): arr is TestSession[] => {
  return Array.isArray(arr) && arr.every(isTestSession);
};

/**
 * Type guard to check if an array contains only Results
 */
export const isResultArray = (arr: any[]): arr is Result[] => {
  return Array.isArray(arr) && arr.every(isResult);
};

// =====================
// OPTIONAL FIELD TYPE GUARDS
// =====================

/**
 * Type guard to check if a user has an email
 */
export const userHasEmail = (user: User): user is User & { email: string } => {
  return isUser(user) && typeof user.email === 'string' && user.email.length > 0;
};

/**
 * Type guard to check if a user has an organization populated
 */
export const userHasPopulatedOrganization = (user: User): user is User & { organization: Organization } => {
  return isUser(user) && user.organization !== undefined && isOrganization(user.organization);
};

/**
 * Type guard to check if a question has usage stats
 */
export const questionHasUsageStats = (question: Question): question is Question & { 
  usageStats: NonNullable<Question['usageStats']> 
} => {
  return isQuestion(question) && 
    question.usageStats !== undefined && 
    typeof question.usageStats === 'object' &&
    typeof question.usageStats.timesUsed === 'number';
};

/**
 * Type guard to check if a question has a category (for code questions)
 */
export const questionHasCategory = (question: Question): question is Question & { category: QuestionCategory } => {
  return isQuestion(question) && 
    question.category !== undefined && 
    isValidQuestionCategory(question.category);
};