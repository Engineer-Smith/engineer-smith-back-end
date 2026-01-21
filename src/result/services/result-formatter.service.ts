// src/result/services/result-formatter.service.ts
import { Injectable } from '@nestjs/common';
import { ResultDocument, ResultQuestion } from '../../schemas/result.schema';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ResultFormatterService {
  /**
   * Format a single result response
   */
  formatResultResponse(result: ResultDocument, user?: RequestUser, includeQuestionDetails = true): any {
    const baseResponse: any = {
      _id: result._id,
      sessionId: result.sessionId,
      testId: result.testId,
      userId: result.userId,
      organizationId: result.organizationId,
      attemptNumber: result.attemptNumber,
      status: result.status,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent,
      score: result.score,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    // Add question details based on user role and request
    if (includeQuestionDetails && this.canAccessQuestionDetails(user)) {
      baseResponse.questions = result.questions.map((question) =>
        this.formatQuestionForResponse(question, user),
      );
    } else {
      // Provide basic question summary for students
      baseResponse.questionSummary = {
        totalQuestions: result.score.totalQuestions,
        correctAnswers: result.score.correctAnswers,
        incorrectAnswers: result.score.incorrectAnswers,
        unansweredQuestions: result.score.unansweredQuestions,
      };
    }

    // Add convenience fields
    baseResponse.summary = {
      score: result.score.percentage,
      passed: result.score.passed,
      correct: result.score.correctAnswers,
      total: result.score.totalQuestions,
      timeSpent: result.timeSpent,
    };

    return baseResponse;
  }

  /**
   * Format result list response
   */
  formatResultListResponse(results: ResultDocument[]): any[] {
    return results.map((result) => ({
      _id: result._id,
      sessionId: result.sessionId,
      testId: result.testId,
      userId: result.userId,
      organizationId: result.organizationId,
      attemptNumber: result.attemptNumber,
      status: result.status,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent,
      score: {
        percentage: result.score.percentage,
        passed: result.score.passed,
        totalPoints: result.score.totalPoints,
        earnedPoints: result.score.earnedPoints,
        correctAnswers: result.score.correctAnswers,
        totalQuestions: result.score.totalQuestions,
      },
      createdAt: result.createdAt,
    }));
  }

  /**
   * Format analytics response
   */
  formatAnalyticsResponse(analytics: any[]): any[] {
    return analytics.map((item) => ({
      testId: item._id?.testId || item.testId,
      organizationId: item._id?.organizationId || item.organizationId,
      totalResults: item.totalResults,
      averageScore: this.roundToTwo(item.averageScore),
      passRate: this.roundToTwo(item.passRate * 100),
      averageTime: Math.round(item.averageTime),
    }));
  }

  /**
   * Format user analytics response
   */
  formatUserAnalyticsResponse(analytics: any[]): any[] {
    return analytics.map((item) => ({
      userId: item.userId,
      organizationId: item.organizationId,
      totalTests: item.totalTests,
      averageScore: this.roundToTwo(item.averageScore),
      passRate: this.roundToTwo(item.passRate),
      averageTime: Math.round(item.averageTime),
      totalTimeSpent: item.totalTimeSpent,
      tests: item.tests.map((test: any) => ({
        testId: test.testId,
        attemptNumber: test.attemptNumber,
        score: test.score,
        totalPoints: test.totalPoints,
        percentage: this.roundToTwo(test.percentage),
        passed: test.passed,
        timeSpent: test.timeSpent,
        completedAt: test.completedAt,
      })),
    }));
  }

  /**
   * Format section analytics response
   */
  formatSectionAnalyticsResponse(analytics: any[], sectionNames: any[] = []): any[] {
    return analytics.map((item) => ({
      testId: item.testId || item._id?.testId,
      sectionIndex: item.sectionIndex || item._id?.sectionIndex,
      sectionName:
        item.sectionName ||
        item._id?.sectionName ||
        sectionNames.find((s) => s.index === (item.sectionIndex || item._id?.sectionIndex))?.name ||
        `Section ${((item.sectionIndex || item._id?.sectionIndex) || 0) + 1}`,
      totalQuestions: item.totalQuestions,
      averageScore: this.roundToTwo(item.averageScore),
      successRate: this.roundToTwo(item.successRate),
      averageTime: Math.round(item.averageTime),
      totalAttempts: item.totalAttempts,
      correctAttempts: item.correctAttempts,
    }));
  }

  /**
   * Format question analytics response
   */
  formatQuestionAnalyticsResponse(analytics: any[]): any[] {
    return analytics.map((item) => ({
      questionId: item.questionId,
      questionTitle: item.questionTitle,
      questionType: item.questionType,
      language: item.language,
      category: item.category,
      difficulty: item.difficulty,
      totalAttempts: item.totalAttempts,
      correctAttempts: item.correctAttempts,
      successRate: this.roundToTwo(item.successRate),
      averageTime: Math.round(item.averageTime),
      averagePoints: this.roundToTwo(item.averagePoints),
    }));
  }

  /**
   * Format score breakdown response
   */
  formatScoreBreakdownResponse(result: ResultDocument): any {
    const breakdown: any = {
      overall: {
        totalPoints: result.score.totalPoints,
        earnedPoints: result.score.earnedPoints,
        percentage: result.score.percentage,
        passed: result.score.passed,
        passingThreshold: result.score.passingThreshold,
      },
      questionBreakdown: {
        total: result.score.totalQuestions,
        correct: result.score.correctAnswers,
        incorrect: result.score.incorrectAnswers,
        unanswered: result.score.unansweredQuestions,
      },
      timeBreakdown: {
        totalTimeSpent: result.timeSpent,
        averageTimePerQuestion:
          result.score.totalQuestions > 0
            ? Math.round(result.timeSpent / result.score.totalQuestions)
            : 0,
      },
    };

    // Add section breakdown if questions have section info
    const sectionsMap = new Map<string, any>();
    result.questions.forEach((question) => {
      if (question.sectionIndex !== null && question.sectionIndex !== undefined) {
        const sectionKey = `${question.sectionIndex}_${question.sectionName || 'Section ' + (question.sectionIndex + 1)}`;
        if (!sectionsMap.has(sectionKey)) {
          sectionsMap.set(sectionKey, {
            sectionIndex: question.sectionIndex,
            sectionName: question.sectionName || `Section ${question.sectionIndex + 1}`,
            totalQuestions: 0,
            correctAnswers: 0,
            totalPoints: 0,
            earnedPoints: 0,
            totalTime: 0,
          });
        }
        const section = sectionsMap.get(sectionKey);
        section.totalQuestions++;
        section.totalPoints += question.pointsPossible;
        section.earnedPoints += question.pointsEarned;
        section.totalTime += question.timeSpent || 0;
        if (question.isCorrect) section.correctAnswers++;
      }
    });

    if (sectionsMap.size > 0) {
      breakdown.sectionBreakdown = Array.from(sectionsMap.values()).map((section) => ({
        ...section,
        percentage:
          section.totalPoints > 0
            ? this.roundToTwo((section.earnedPoints / section.totalPoints) * 100)
            : 0,
        successRate:
          section.totalQuestions > 0
            ? this.roundToTwo((section.correctAnswers / section.totalQuestions) * 100)
            : 0,
        averageTime:
          section.totalQuestions > 0 ? Math.round(section.totalTime / section.totalQuestions) : 0,
      }));
    }

    return breakdown;
  }

  /**
   * Filter sensitive data from question for student view
   */
  filterSensitiveDataForStudent(question: ResultQuestion): any {
    const filtered: any = { ...question };

    // Remove sensitive fields
    delete filtered.correctAnswer;

    // Filter details object if it exists
    if (filtered.details) {
      // Remove correct answers from fill-in-blank details
      if (filtered.details.blanks) {
        filtered.details.blanks = filtered.details.blanks.map((blank: any) => ({
          id: blank.id,
          studentAnswer: blank.studentAnswer,
          isCorrect: blank.isCorrect,
          hint: blank.hint,
          // correctAnswers removed
        }));
      }

      // Remove correct option from multiple choice
      if (filtered.details.correctOption !== undefined) {
        delete filtered.details.correctOption;
      }
    }

    return filtered;
  }

  // Private helper methods

  private formatQuestionForResponse(question: ResultQuestion, user?: RequestUser): any {
    const baseQuestion: any = {
      questionNumber: question.questionNumber,
      questionId: question.questionId,
      title: question.title,
      type: question.type,
      language: question.language,
      category: question.category,
      difficulty: question.difficulty,
      pointsPossible: question.pointsPossible,
      pointsEarned: question.pointsEarned,
      isCorrect: question.isCorrect,
      timeSpent: question.timeSpent,
      viewCount: question.viewCount,
    };

    // Add section info if available
    if (question.sectionIndex !== null && question.sectionIndex !== undefined) {
      baseQuestion.sectionIndex = question.sectionIndex;
      baseQuestion.sectionName = question.sectionName;
    }

    // Include answers based on user permissions
    if (this.canAccessAnswers(user)) {
      baseQuestion.studentAnswer = question.studentAnswer;
      baseQuestion.correctAnswer = question.correctAnswer;

      // Add type-specific details
      if (question.details) {
        baseQuestion.details = question.details;
      }
    }

    // Add manual grading info if applicable
    if (question.manuallyGraded) {
      baseQuestion.manuallyGraded = question.manuallyGraded;
      baseQuestion.feedback = question.feedback;
    }

    return baseQuestion;
  }

  private canAccessQuestionDetails(user?: RequestUser): boolean {
    if (!user) return true;
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    return isSuperOrgAdminOrInstructor || user.role === 'admin' || user.role === 'instructor';
  }

  private canAccessAnswers(user?: RequestUser): boolean {
    if (!user) return true;
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    return isSuperOrgAdminOrInstructor || user.role === 'admin' || user.role === 'instructor';
  }

  private roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}