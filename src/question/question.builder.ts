// src/question/question.builder.ts
/**
 * Master Question Builder Factory
 *
 * Provides a unified entry point to create any question type using fluent builders.
 *
 * Usage:
 * ```typescript
 * import { QuestionBuilder } from './question.builder';
 *
 * // Multiple Choice
 * const mcQuestion = QuestionBuilder
 *   .multipleChoice()
 *   .title("What is 2 + 2?")
 *   .description("Basic math")
 *   .language("javascript")
 *   .difficulty("easy")
 *   .options(["3", "4", "5", "6"])
 *   .correctAnswer(1)
 *   .build();
 *
 * // True/False
 * const tfQuestion = QuestionBuilder
 *   .trueFalse()
 *   .title("JavaScript is statically typed")
 *   .description("About JavaScript")
 *   .language("javascript")
 *   .difficulty("easy")
 *   .answerFalse()
 *   .build();
 *
 * // Fill in the Blank
 * const fibQuestion = QuestionBuilder
 *   .fillInBlank()
 *   .title("Complete the variable declaration")
 *   .description("Fill in the blanks")
 *   .language("javascript")
 *   .difficulty("easy")
 *   .template("const {{var}} = {{value}};")
 *   .addBlank("var", "x", "y", "z")
 *   .addBlank("value", "5", "10")
 *   .build();
 *
 * // Code Challenge
 * const codeQuestion = QuestionBuilder
 *   .codeChallenge()
 *   .title("Sum of two numbers")
 *   .description("Write a function that adds two numbers")
 *   .language("javascript")
 *   .difficulty("easy")
 *   .entryFunction("add")
 *   .addTest([1, 2], 3)
 *   .addTest([5, 5], 10)
 *   .addTest([0, 0], 0, true) // hidden test
 *   .build();
 *
 * // Code Debugging
 * const debugQuestion = QuestionBuilder
 *   .codeDebugging()
 *   .title("Fix the sum function")
 *   .description("Find and fix the bug")
 *   .language("javascript")
 *   .difficulty("medium")
 *   .buggyCode("function add(a, b) { return a - b; }")
 *   .solutionCode("function add(a, b) { return a + b; }")
 *   .entryFunction("add")
 *   .addTest([1, 2], 3)
 *   .build();
 * ```
 */

import { MultipleChoiceBuilder, multipleChoice } from './multiple-choice';
import { TrueFalseBuilder, trueFalse } from './true-false';
import { FillInBlankBuilder, fillInBlank } from './fill-in-blank';
import { CodeChallengeBuilder, codeChallenge } from './code-challenge';
import { CodeDebuggingBuilder, codeDebugging } from './code-debugging';

export class QuestionBuilder {
  /**
   * Create a Multiple Choice question
   */
  static multipleChoice(): MultipleChoiceBuilder {
    return multipleChoice();
  }

  /**
   * Create a True/False question
   */
  static trueFalse(): TrueFalseBuilder {
    return trueFalse();
  }

  /**
   * Create a Fill in the Blank question
   */
  static fillInBlank(): FillInBlankBuilder {
    return fillInBlank();
  }

  /**
   * Create a Code Challenge question
   */
  static codeChallenge(): CodeChallengeBuilder {
    return codeChallenge();
  }

  /**
   * Create a Code Debugging question
   */
  static codeDebugging(): CodeDebuggingBuilder {
    return codeDebugging();
  }
}

// Also export individual builders for direct import
export {
  MultipleChoiceBuilder,
  multipleChoice,
  TrueFalseBuilder,
  trueFalse,
  FillInBlankBuilder,
  fillInBlank,
  CodeChallengeBuilder,
  codeChallenge,
  CodeDebuggingBuilder,
  codeDebugging,
};
