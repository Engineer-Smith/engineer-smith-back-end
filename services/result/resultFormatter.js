// /services/result/resultFormatter.js - UPDATED for new simplified Result model

class ResultFormatter {
  formatResultResponse(result, user, includeQuestionDetails = true) {
    const baseResponse = {
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
    if (includeQuestionDetails && this._canAccessQuestionDetails(user)) {
      baseResponse.questions = result.questions.map(question => this._formatQuestionForResponse(question, user));
    } else {
      // Provide basic question summary for students
      baseResponse.questionSummary = {
        totalQuestions: result.score.totalQuestions,
        correctAnswers: result.score.correctAnswers,
        incorrectAnswers: result.score.incorrectAnswers,
        unansweredQuestions: result.score.unansweredQuestions
      };
    }

    // Add convenience fields from the new Result model
    baseResponse.summary = {
      score: result.score.percentage,
      passed: result.score.passed,
      correct: result.score.correctAnswers,
      total: result.score.totalQuestions,
      timeSpent: result.timeSpent
    };

    return baseResponse;
  }

  formatResultListResponse(results) {
    return results.map(result => ({
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
        totalQuestions: result.score.totalQuestions
      },
      createdAt: result.createdAt
    }));
  }

  formatAnalyticsResponse(analytics) {
    return analytics.map(item => ({
      testId: item.testId,
      questionId: item.questionId,
      totalResults: item.totalResults,
      averageScore: this._roundToTwo(item.averageScore),
      passRate: this._roundToTwo(item.passRate),
      averageTime: Math.round(item.averageTime),
      questionSuccessRate: this._roundToTwo(item.questionSuccessRate),
      questionAverageTime: Math.round(item.questionAverageTime),
      questionTotalAttempts: item.questionTotalAttempts,
      correctAttempts: item.correctAttempts
    }));
  }

  formatUserAnalyticsResponse(analytics) {
    return analytics.map(item => ({
      userId: item.userId,
      organizationId: item.organizationId,
      totalTests: item.totalTests,
      averageScore: this._roundToTwo(item.averageScore),
      passRate: this._roundToTwo(item.passRate),
      averageTime: Math.round(item.averageTime),
      totalTimeSpent: item.totalTimeSpent,
      tests: item.tests.map(test => ({
        testId: test.testId,
        attemptNumber: test.attemptNumber,
        score: test.score,
        totalPoints: test.totalPoints,
        percentage: this._roundToTwo(test.percentage),
        passed: test.passed,
        timeSpent: test.timeSpent,
        completedAt: test.completedAt
      }))
    }));
  }

  formatSectionAnalyticsResponse(analytics, sectionNames = []) {
    return analytics.map(item => ({
      testId: item.testId,
      sectionIndex: item.sectionIndex,
      sectionName: item.sectionName || 
        sectionNames.find(s => s.index === item.sectionIndex)?.name || 
        `Section ${(item.sectionIndex || 0) + 1}`,
      totalQuestions: item.totalQuestions,
      averageScore: this._roundToTwo(item.averageScore),
      successRate: this._roundToTwo(item.successRate),
      averageTime: Math.round(item.averageTime),
      totalAttempts: item.totalAttempts,
      correctAttempts: item.correctAttempts
    }));
  }

  formatQuestionAnalyticsResponse(analytics) {
    return analytics.map(item => ({
      questionId: item.questionId,
      questionTitle: item.questionTitle,
      questionType: item.questionType,
      language: item.language,
      category: item.category,
      difficulty: item.difficulty,
      totalAttempts: item.totalAttempts,
      correctAttempts: item.correctAttempts,
      successRate: this._roundToTwo(item.successRate),
      averageTime: Math.round(item.averageTime),
      averagePoints: this._roundToTwo(item.averagePoints)
    }));
  }

  // NEW: Format individual question data from the Result model
  formatQuestionDetailsResponse(questions, includeAnswers = true) {
    return questions.map(question => this._formatQuestionForResponse(question, null, includeAnswers));
  }

  // NEW: Format score breakdown for detailed analytics
  formatScoreBreakdownResponse(result) {
    const breakdown = {
      overall: {
        totalPoints: result.score.totalPoints,
        earnedPoints: result.score.earnedPoints,
        percentage: result.score.percentage,
        passed: result.score.passed,
        passingThreshold: result.score.passingThreshold
      },
      questionBreakdown: {
        total: result.score.totalQuestions,
        correct: result.score.correctAnswers,
        incorrect: result.score.incorrectAnswers,
        unanswered: result.score.unansweredQuestions
      },
      timeBreakdown: {
        totalTimeSpent: result.timeSpent,
        averageTimePerQuestion: result.score.totalQuestions > 0 ? 
          Math.round(result.timeSpent / result.score.totalQuestions) : 0
      }
    };

    // Add section breakdown if questions have section info
    const sectionsMap = new Map();
    result.questions.forEach(question => {
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
            totalTime: 0
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
      breakdown.sectionBreakdown = Array.from(sectionsMap.values()).map(section => ({
        ...section,
        percentage: section.totalPoints > 0 ? 
          this._roundToTwo((section.earnedPoints / section.totalPoints) * 100) : 0,
        successRate: section.totalQuestions > 0 ? 
          this._roundToTwo((section.correctAnswers / section.totalQuestions) * 100) : 0,
        averageTime: section.totalQuestions > 0 ? 
          Math.round(section.totalTime / section.totalQuestions) : 0
      }));
    }

    return breakdown;
  }

  // Private helper methods
  _formatQuestionForResponse(question, user = null, includeAnswers = true) {
    const baseQuestion = {
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
      viewCount: question.viewCount
    };

    // Add section info if available
    if (question.sectionIndex !== null && question.sectionIndex !== undefined) {
      baseQuestion.sectionIndex = question.sectionIndex;
      baseQuestion.sectionName = question.sectionName;
    }

    // Include answers based on user permissions and request
    if (includeAnswers && this._canAccessAnswers(user)) {
      baseQuestion.studentAnswer = question.studentAnswer;
      baseQuestion.correctAnswer = question.correctAnswer;
      
      // Add type-specific details
      if (question.details) {
        baseQuestion.details = question.details;
      }
    }

    return baseQuestion;
  }

  _canAccessQuestionDetails(user) {
    if (!user) return true; // Allow if no user context (internal usage)
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    return isSuperOrgAdminOrInstructor || user.role === 'admin' || user.role === 'instructor';
  }

  _canAccessAnswers(user) {
    if (!user) return true; // Allow if no user context (internal usage)
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    return isSuperOrgAdminOrInstructor || user.role === 'admin' || user.role === 'instructor';
  }

  _roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}

module.exports = {
  formatResultResponse: (result, user, includeQuestionDetails) => new ResultFormatter().formatResultResponse(result, user, includeQuestionDetails),
  formatResultListResponse: (results) => new ResultFormatter().formatResultListResponse(results),
  formatAnalyticsResponse: (analytics) => new ResultFormatter().formatAnalyticsResponse(analytics),
  formatUserAnalyticsResponse: (analytics) => new ResultFormatter().formatUserAnalyticsResponse(analytics),
  formatSectionAnalyticsResponse: (analytics, sectionNames) => new ResultFormatter().formatSectionAnalyticsResponse(analytics, sectionNames),
  formatQuestionAnalyticsResponse: (analytics) => new ResultFormatter().formatQuestionAnalyticsResponse(analytics),
  formatQuestionDetailsResponse: (questions, includeAnswers) => new ResultFormatter().formatQuestionDetailsResponse(questions, includeAnswers),
  formatScoreBreakdownResponse: (result) => new ResultFormatter().formatScoreBreakdownResponse(result)
};