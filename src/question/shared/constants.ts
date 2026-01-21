// src/question/shared/constants.ts

// Re-export from schema for convenience
export {
  QUESTION_TYPES,
  LANGUAGES,
  DIFFICULTIES,
  CATEGORIES,
  STATUSES,
  RUNTIMES,
  VALID_COMBINATIONS,
  VALID_TYPE_COMBINATIONS,
  LANGUAGE_RUNTIME_MAP,
} from '../../schemas/question.schema';

export type {
  QuestionType,
  Language,
  Difficulty,
  Category,
  QuestionStatus,
  Runtime,
} from '../../schemas/question.schema';
