// /services/question/questionFormatter.js - Fixed to preserve all fields
class QuestionFormatter {
  formatQuestionResponse(question, user, options = {}) {
    const baseResponse = {
      _id: question._id,
      title: question.title,
      description: question.description,
      type: question.type,
      language: question.language,
      category: question.category,
      organizationId: question.organizationId,
      isGlobal: question.isGlobal,
      difficulty: question.difficulty,
      status: question.status,
      createdBy: question.createdBy,
      tags: question.tags,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    // **FIXED: Always add code-related fields for code question types**
    this._addCodeFields(baseResponse, question);

    // Add role-based fields
    if (user.role !== 'student' || options.includeAnswers) {
      this._addInstructorFields(baseResponse, question);
    } else {
      this._addStudentOnlyFields(baseResponse, question);
    }

    return baseResponse;
  }

  formatQuestionListResponse(questions, user) {
    return questions.map(question => ({
      _id: question._id,
      title: question.title,
      description: question.description,
      type: question.type,
      language: question.language,
      category: question.category,
      organizationId: question.organizationId,
      isGlobal: question.isGlobal,
      difficulty: question.difficulty,
      status: question.status,
      tags: question.tags,
      createdAt: question.createdAt,
    }));
  }

  // **FIXED: New method to always preserve code-related fields**
  _addCodeFields(response, question) {
    // Always include these fields if they exist, regardless of user role
    if (question.codeTemplate !== undefined) {
      response.codeTemplate = question.codeTemplate;
    }
    
    if (question.buggyCode !== undefined) {
      response.buggyCode = question.buggyCode;
    }
    
    if (question.solutionCode !== undefined) {
      response.solutionCode = question.solutionCode;
    }

    // Always include options for multiple choice/true false
    if (question.options !== undefined) {
      response.options = question.options;
    }

    // Always include codeConfig for code questions
    if (question.codeConfig !== undefined) {
      response.codeConfig = question.codeConfig;
    }
  }

  _addInstructorFields(response, question) {
    // Fields only for instructors/admins (answers/solutions)
    if (question.correctAnswer !== undefined) {
      response.correctAnswer = question.correctAnswer;
    }

    if (question.testCases !== undefined) {
      response.testCases = question.testCases;
    }
    
    // Full blanks data with correct answers
    if (question.blanks && Array.isArray(question.blanks)) {
      response.blanks = question.blanks.map(blank => ({
        id: blank.id, 
        correctAnswers: blank.correctAnswers,
        caseSensitive: blank.caseSensitive,
        hint: blank.hint,
        points: blank.points
      }));
    }
  }

  _addStudentOnlyFields(response, question) {
    // For students, show limited blanks data (no answers)
    if (question.blanks && Array.isArray(question.blanks)) {
      response.blanks = question.blanks.map(blank => ({
        id: blank.id,
        hint: blank.hint,
        points: blank.points
        // Don't include correctAnswers or caseSensitive for students
      }));
    }

    // For students, show only non-hidden test cases
    if (question.testCases && Array.isArray(question.testCases)) {
      response.testCases = question.testCases.filter(tc => !tc.hidden);
    }
  }
}

module.exports = {
  formatQuestionResponse: (question, user, options) => new QuestionFormatter().formatQuestionResponse(question, user, options),
  formatQuestionListResponse: (questions, user) => new QuestionFormatter().formatQuestionListResponse(questions, user)
};