// /services/test/testFormatter.js - Test response formatting logic

class TestFormatter {
  formatTestResponse(test, user = null) {
    // Base response structure
    const response = {
      _id: test._id,
      title: test.title,
      description: test.description,
      testType: test.testType,
      languages: test.languages,
      tags: test.tags,
      settings: test.settings,
      organizationId: test.organizationId,
      isGlobal: test.isGlobal,
      status: test.status,
      createdBy: test.createdBy,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    };

    // Add sections or questions based on structure
    if (test.sections) {
      response.sections = this._formatSections(test.sections, user);
    }
    
    if (test.questions) {
      response.questions = this._formatQuestions(test.questions, user);
    }

    // Add stats if available
    if (test.stats) {
      response.stats = test.stats;
    }

    return response;
  }

  formatTestWithQuestionsResponse(test, questionMap, user) {
    const populatedTest = {
      _id: test._id,
      title: test.title,
      description: test.description,
      testType: test.testType,
      languages: test.languages,
      tags: test.tags,
      settings: test.settings,
      organizationId: test.organizationId,
      isGlobal: test.isGlobal,
      status: test.status,
      createdBy: test.createdBy,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    };

    if (test.settings.useSections && test.sections) {
      populatedTest.sections = test.sections.map(section => ({
        name: section.name,
        timeLimit: section.timeLimit,
        questions: section.questions.map(qRef => {
          const questionData = questionMap.get(qRef.questionId.toString());
          if (!questionData) return null;

          return {
            questionId: qRef.questionId,
            points: qRef.points,
            questionData: this._formatQuestionData(questionData, user)
          };
        }).filter(q => q !== null)
      }));
    } else if (test.questions) {
      populatedTest.questions = test.questions.map(qRef => {
        const questionData = questionMap.get(qRef.questionId.toString());
        if (!questionData) return null;

        return {
          questionId: qRef.questionId,
          points: qRef.points,
          questionData: this._formatQuestionData(questionData, user)
        };
      }).filter(q => q !== null);
    }

    return populatedTest;
  }

  // Private helper methods
  _formatSections(sections, user) {
    if (!user || user.role !== 'student') {
      return sections; // Return full sections for instructors/admins
    }

    // For students, filter sensitive data from populated questions
    return sections.map(section => ({
      ...section,
      questions: section.questions.map(q => {
        if (q.questionId && typeof q.questionId === 'object') {
          return {
            ...q,
            questionId: this._sanitizeQuestionForStudent(q.questionId)
          };
        }
        return q;
      })
    }));
  }

  _formatQuestions(questions, user) {
    if (!user || user.role !== 'student') {
      return questions; // Return full questions for instructors/admins
    }

    // For students, filter sensitive data from populated questions
    return questions.map(q => {
      if (q.questionId && typeof q.questionId === 'object') {
        return {
          ...q,
          questionId: this._sanitizeQuestionForStudent(q.questionId)
        };
      }
      return q;
    });
  }

  _formatQuestionData(questionData, user) {
    const responseData = {
      _id: questionData._id,
      title: questionData.title,
      description: questionData.description,
      type: questionData.type,
      language: questionData.language,
      category: questionData.category,
      difficulty: questionData.difficulty,
      tags: questionData.tags || [],
      options: questionData.options
    };

    // Add student-safe fields
    if (questionData.codeTemplate) {
      responseData.codeTemplate = questionData.codeTemplate;
    }
    
    if (questionData.buggyCode) {
      responseData.buggyCode = questionData.buggyCode;
    }

    // Handle blanks with FIXED id field
    if (questionData.blanks) {
      responseData.blanks = user && user.role === 'student' 
        ? questionData.blanks.map(blank => ({
            id: blank.id,  // FIXED: Use 'id' instead of '_id' to match Question model
            hint: blank.hint,
            points: blank.points
          }))
        : questionData.blanks.map(blank => ({
            id: blank.id,  // FIXED: Use 'id' instead of '_id'
            correctAnswers: blank.correctAnswers,
            caseSensitive: blank.caseSensitive,
            hint: blank.hint,
            points: blank.points
          }));
    }

    // Show filtered test cases for students
    if (questionData.testCases) {
      responseData.testCases = user && user.role === 'student'
        ? questionData.testCases.filter(tc => !tc.hidden)
        : questionData.testCases;
    }

    // Include instructor/admin only fields
    if (!user || user.role !== 'student') {
      responseData.correctAnswer = questionData.correctAnswer;
      responseData.codeConfig = questionData.codeConfig;
      responseData.solutionCode = questionData.solutionCode;
    }

    return responseData;
  }

  _sanitizeQuestionForStudent(questionData) {
    const sanitized = { ...questionData };
    
    // Remove sensitive data for students
    delete sanitized.correctAnswer;
    delete sanitized.testCases;
    delete sanitized.codeConfig;
    delete sanitized.solutionCode;
    
    // Keep blanks but remove correct answers
    if (sanitized.blanks) {
      sanitized.blanks = sanitized.blanks.map(blank => ({
        id: blank.id,  // FIXED: Use 'id' instead of '_id'
        hint: blank.hint,
        points: blank.points
      }));
    }
    
    return sanitized;
  }
}

module.exports = {
  formatTestResponse: (test, user) => new TestFormatter().formatTestResponse(test, user),
  formatTestWithQuestionsResponse: (test, questionMap, user) => new TestFormatter().formatTestWithQuestionsResponse(test, questionMap, user)
};