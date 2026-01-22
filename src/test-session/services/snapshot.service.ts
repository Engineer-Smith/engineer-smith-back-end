// src/test-session/services/snapshot.service.ts
import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TestDocument } from '../../schemas/test.schema';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class SnapshotService {
  /**
   * Create seeded random number generator for consistent shuffling
   */
  createSeededRandom(seed: string): () => number {
    let state = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    return function () {
      state = Math.imul(16807, state) | 0;
      return (state & 2147483647) / 2147483648;
    };
  }

  /**
   * Shuffle array using seeded random
   */
  shuffleArray<T>(array: T[], rng: () => number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Initialize student data for a question
   */
  private initializeStudentData(): any {
    return {
      studentAnswer: null,
      status: 'not_viewed',
      timeSpentOnQuestion: 0,
      viewCount: 0,
      firstViewedAt: null,
      lastViewedAt: null,
    };
  }

  /**
   * Create question data snapshot with all necessary fields
   */
  private createQuestionSnapshot(questionRef: any, orderIndex: number): any {
    const question = questionRef.questionId;

    const questionData: any = {
      title: question.title,
      description: question.description,
      type: question.type,
      language: question.language,
      difficulty: question.difficulty,
      tags: question.tags || [],
    };

    // Add category for code-related questions
    if (['codeChallenge', 'fillInTheBlank', 'dragDropCloze', 'codeDebugging'].includes(question.type)) {
      questionData.category = question.category;
    }

    // Add type-specific fields
    if (question.type === 'multipleChoice' || question.type === 'trueFalse') {
      questionData.options = question.options || [];
      questionData.correctAnswer = question.correctAnswer;
    }

    if (question.type === 'fillInTheBlank') {
      questionData.codeTemplate = question.codeTemplate || '';
      questionData.blanks = question.blanks || [];
    }

    if (question.type === 'dragDropCloze') {
      questionData.codeTemplate = question.codeTemplate || '';
      questionData.dragOptions = question.dragOptions || [];
      // Include full blanks with correctAnswers (needed for grading)
      // The correctAnswers are filtered out in question-handler.service.ts when sending to frontend
      questionData.blanks = question.blanks || [];
    }

    if (question.type === 'codeChallenge') {
      questionData.codeTemplate = question.codeTemplate || '';

      if (question.category === 'logic') {
        questionData.codeConfig = {
          runtime: question.codeConfig?.runtime,
          entryFunction: question.codeConfig?.entryFunction,
          timeoutMs: question.codeConfig?.timeoutMs || 3000,
          allowPreview: question.codeConfig?.allowPreview !== false,
        };
        questionData.testCases = question.testCases || [];

        // Validation warnings
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
        questionData.solutionCode = question.solutionCode || '';
        questionData.expectedOutput = question.expectedOutput || '';
      }
    }

    if (question.type === 'codeDebugging') {
      questionData.buggyCode = question.buggyCode || '';
      questionData.solutionCode = question.solutionCode || '';

      if (question.category === 'logic') {
        questionData.codeConfig = {
          runtime: question.codeConfig?.runtime,
          entryFunction: question.codeConfig?.entryFunction,
          timeoutMs: question.codeConfig?.timeoutMs || 3000,
          allowPreview: question.codeConfig?.allowPreview !== false,
        };
        questionData.testCases = question.testCases || [];
      }
    }

    return {
      questionId: question._id,
      questionData,
      points: questionRef.points,
      originalOrder: orderIndex,
      finalOrder: orderIndex,
      ...this.initializeStudentData(),
    };
  }

  /**
   * Create complete test snapshot with randomization
   */
  async createTestSnapshot(test: TestDocument, userId: string): Promise<any> {
    // Create randomization seed
    const randomSeed = `${userId}_${test._id}_${Date.now()}_${Math.random()}`;
    const rng = this.createSeededRandom(randomSeed);

    const snapshot: any = {
      originalTestId: test._id,
      title: test.title,
      description: test.description,
      settings: { ...test.settings },
      totalQuestions: 0,
      totalPoints: 0,
    };

    if (test.settings.useSections && test.sections) {
      // Process sectioned test
      snapshot.sections = test.sections.map((section, sectionIndex) => {
        let questions = section.questions.map((qRef, qIndex) =>
          this.createQuestionSnapshot(qRef, qIndex),
        );

        // Apply randomization if enabled
        if (test.settings.shuffleQuestions) {
          questions = this.shuffleArray(questions, rng);
          questions.forEach((q, index) => {
            q.finalOrder = index;
          });
        }

        snapshot.totalQuestions += questions.length;
        snapshot.totalPoints += questions.reduce((sum: number, q: any) => sum + q.points, 0);

        return {
          name: section.name,
          timeLimit: section.timeLimit,
          questions,
        };
      });

      snapshot.questions = [];
    } else if (test.questions) {
      // Process non-sectioned test
      let questions = test.questions.map((qRef, qIndex) =>
        this.createQuestionSnapshot(qRef, qIndex),
      );

      // Apply randomization if enabled
      if (test.settings.shuffleQuestions) {
        questions = this.shuffleArray(questions, rng);
        questions.forEach((q, index) => {
          q.finalOrder = index;
        });
      }

      snapshot.questions = questions;
      snapshot.sections = [];
      snapshot.totalQuestions = questions.length;
      snapshot.totalPoints = questions.reduce((sum: number, q: any) => sum + q.points, 0);
    }

    return snapshot;
  }

  /**
   * Validate test can be started by user
   */
  validateTestAccess(test: TestDocument, user: RequestUser): void {
    // Check if user is admin/instructor (they shouldn't take tests)
    if (user.role === 'instructor' || user.role === 'admin') {
      throw new ForbiddenException('Only students can start test sessions');
    }

    // Check test access permissions
    if (test.isGlobal) {
      if (user.role !== 'student') {
        throw new ForbiddenException('Only students can start global tests');
      }
    } else if (!test.organizationId || test.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException('Unauthorized to start this test');
    }

    // Check test is active
    if (test.status !== 'active') {
      throw new BadRequestException('Test is not active');
    }

    // Validate time limit is positive
    if (!test.settings?.timeLimit || test.settings.timeLimit <= 0) {
      throw new BadRequestException('Test must have a valid time limit greater than 0');
    }

    // For sectioned tests, validate each section has a valid time limit
    if (test.settings.useSections && test.sections) {
      for (const section of test.sections) {
        if (!section.timeLimit || section.timeLimit <= 0) {
          throw new BadRequestException(`Section "${section.name || 'Unnamed'}" must have a valid time limit greater than 0`);
        }
      }
    }
  }
}