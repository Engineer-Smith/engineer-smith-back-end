import { Injectable } from '@nestjs/common';
import { BlankConfig, BlankResult, FillInBlankResult } from '../dto';

@Injectable()
export class FillInBlankGraderService {
  /**
   * Grade fill-in-the-blank answers against correct answers
   * @param answers - Object mapping blank IDs to student answers
   * @param blanks - Array of blank configurations with correct answers
   * @returns Grading results with per-blank breakdown
   */
  grade(
    answers: Record<string, string> | null | undefined,
    blanks: BlankConfig[],
  ): FillInBlankResult {
    // Handle edge cases
    if (!blanks || !Array.isArray(blanks) || blanks.length === 0) {
      return {
        results: [],
        totalPoints: 0,
        allCorrect: false,
        totalPossiblePoints: 0,
        individualBlankPoints: 0,
      };
    }

    if (!answers || typeof answers !== 'object') {
      // User provided no answers - create empty results
      const results: BlankResult[] = blanks.map((blank) => ({
        blankId: blank.id,
        answer: '',
        isCorrect: false,
        pointsEarned: 0,
        possiblePoints: blank.points || 1,
      }));

      return {
        results,
        totalPoints: 0,
        allCorrect: false,
        totalPossiblePoints: blanks.reduce(
          (sum, blank) => sum + (blank.points || 1),
          0,
        ),
        individualBlankPoints: 0,
      };
    }

    const results: BlankResult[] = [];
    let individualBlankPoints = 0;

    for (const blank of blanks) {
      const userAnswer = answers[blank.id];
      const correctAnswers = blank.correctAnswers || [];
      const caseSensitive = blank.caseSensitive !== false; // Default to true

      let isCorrect = false;

      // Only check if user provided an answer
      if (
        userAnswer &&
        typeof userAnswer === 'string' &&
        userAnswer.trim() !== ''
      ) {
        const normalizedAnswer = caseSensitive
          ? userAnswer.trim()
          : userAnswer.trim().toLowerCase();

        isCorrect = correctAnswers.some((correct) => {
          if (typeof correct !== 'string') return false;
          const normalizedCorrect = caseSensitive
            ? correct.trim()
            : correct.trim().toLowerCase();
          return normalizedAnswer === normalizedCorrect;
        });
      }

      const blankPoints = isCorrect ? (blank.points || 1) : 0;
      individualBlankPoints += blankPoints;

      results.push({
        blankId: blank.id,
        answer: userAnswer || '',
        isCorrect,
        pointsEarned: blankPoints,
        possiblePoints: blank.points || 1,
      });
    }

    const totalPossiblePoints = blanks.reduce(
      (sum, blank) => sum + (blank.points || 1),
      0,
    );
    const allCorrect = results.length > 0 && results.every((r) => r.isCorrect);

    return {
      results,
      totalPoints: individualBlankPoints,
      allCorrect,
      totalPossiblePoints,
      individualBlankPoints,
    };
  }

  /**
   * Validate fill-in-blank configuration
   * @param blanks - Array of blank configurations to validate
   * @throws Error if configuration is invalid
   */
  validateConfig(blanks: BlankConfig[]): void {
    if (!Array.isArray(blanks)) {
      throw new Error('Blanks must be an array');
    }

    for (let i = 0; i < blanks.length; i++) {
      const blank = blanks[i];

      if (!blank.id || typeof blank.id !== 'string') {
        throw new Error(`Blank ${i + 1} must have a valid string id`);
      }

      if (
        !blank.correctAnswers ||
        !Array.isArray(blank.correctAnswers) ||
        blank.correctAnswers.length === 0
      ) {
        throw new Error(`Blank ${i + 1} must have at least one correct answer`);
      }

      // Validate all correct answers are strings
      for (let j = 0; j < blank.correctAnswers.length; j++) {
        if (typeof blank.correctAnswers[j] !== 'string') {
          throw new Error(
            `Blank ${i + 1}, correct answer ${j + 1} must be a string`,
          );
        }
      }

      if (
        blank.points !== undefined &&
        (typeof blank.points !== 'number' || blank.points < 0)
      ) {
        throw new Error(`Blank ${i + 1} points must be a non-negative number`);
      }
    }
  }
}
