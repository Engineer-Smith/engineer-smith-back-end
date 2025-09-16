// /services/result/resultValidation.js - UPDATED for new simplified Result model
const createError = require('http-errors');

class ResultValidation {
  async validateResultAccess(result, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    // If user is super org admin or instructor, they can access any result
    if (isSuperOrgAdminOrInstructor) {
      return true;
    }

    // FIXED: Handle both populated and non-populated userId
    let resultUserId;
    if (result.userId && typeof result.userId === 'object' && result.userId._id) {
      // result.userId is populated with user object
      resultUserId = result.userId._id.toString();
    } else {
      // result.userId is just the ObjectId
      resultUserId = result.userId.toString();
    }

    // If user is not the owner of this result, check additional permissions
    if (resultUserId !== user.userId.toString()) {
      // Check if user is in same organization
      if (result.organizationId && result.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access this result');
      }

      // Only admins can access other users' results within same organization
      if (user.role !== 'admin') {
        throw createError(403, 'Only admins or instructors can access other users results');
      }
    }

    return true;
  }

  validateAnalyticsAccess(user, orgId = null) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    if (!isSuperOrgAdminOrInstructor) {
      // Regular admins can only access their organization's analytics
      if (user.role !== 'admin' && user.role !== 'instructor') {
        throw createError(403, 'Only admins or instructors can access analytics');
      }

      if (orgId && orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access analytics for this organization');
      }
    }

    return true;
  }

  validateQuestionAnalyticsAccess(user, orgId = null) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    if (!isSuperOrgAdminOrInstructor) {
      if (user.role !== 'admin') {
        throw createError(403, 'Only admins or instructors can access question analytics');
      }

      if (orgId && orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access analytics for this organization');
      }
    }

    return true;
  }

  validateFilterInputs(filters) {
    const validQuestionTypes = ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];
    const validDifficulties = ['easy', 'medium', 'hard'];
    const validStatuses = ['completed', 'expired', 'abandoned'];

    if (filters.questionType && !validQuestionTypes.includes(filters.questionType)) {
      throw createError(400, 'Invalid question type');
    }

    if (filters.difficulty && !validDifficulties.includes(filters.difficulty)) {
      throw createError(400, 'Invalid difficulty');
    }

    if (filters.status && !validStatuses.includes(filters.status)) {
      throw createError(400, 'Invalid status. Must be one of: completed, expired, abandoned');
    }

    // Validate date formats if provided
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (isNaN(startDate.getTime())) {
        throw createError(400, 'Invalid start date format');
      }
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (isNaN(endDate.getTime())) {
        throw createError(400, 'Invalid end date format');
      }
    }

    // Validate pagination parameters
    if (filters.limit && (isNaN(filters.limit) || parseInt(filters.limit) < 1 || parseInt(filters.limit) > 100)) {
      throw createError(400, 'Limit must be a number between 1 and 100');
    }

    if (filters.skip && (isNaN(filters.skip) || parseInt(filters.skip) < 0)) {
      throw createError(400, 'Skip must be a non-negative number');
    }

    // Validate score range filters (new for Result model)
    if (filters.minScore !== undefined) {
      const minScore = parseFloat(filters.minScore);
      if (isNaN(minScore) || minScore < 0 || minScore > 100) {
        throw createError(400, 'Minimum score must be a number between 0 and 100');
      }
    }

    if (filters.maxScore !== undefined) {
      const maxScore = parseFloat(filters.maxScore);
      if (isNaN(maxScore) || maxScore < 0 || maxScore > 100) {
        throw createError(400, 'Maximum score must be a number between 0 and 100');
      }
    }

    if (filters.minScore !== undefined && filters.maxScore !== undefined) {
      if (parseFloat(filters.minScore) > parseFloat(filters.maxScore)) {
        throw createError(400, 'Minimum score cannot be greater than maximum score');
      }
    }

    // Validate passed filter (new for Result model)
    if (filters.passed !== undefined && typeof filters.passed !== 'boolean' && filters.passed !== 'true' && filters.passed !== 'false') {
      throw createError(400, 'Passed filter must be a boolean value');
    }

    // Validate language filter
    const validLanguages = ['javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'];
    if (filters.language && !validLanguages.includes(filters.language)) {
      throw createError(400, 'Invalid language. Must be one of: ' + validLanguages.join(', '));
    }

    // Validate category filter (for code questions)
    const validCategories = ['logic', 'ui', 'syntax'];
    if (filters.category && !validCategories.includes(filters.category)) {
      throw createError(400, 'Invalid category. Must be one of: ' + validCategories.join(', '));
    }

    // Validate time spent filters
    if (filters.minTimeSpent !== undefined) {
      const minTime = parseInt(filters.minTimeSpent);
      if (isNaN(minTime) || minTime < 0) {
        throw createError(400, 'Minimum time spent must be a non-negative number (seconds)');
      }
    }

    if (filters.maxTimeSpent !== undefined) {
      const maxTime = parseInt(filters.maxTimeSpent);
      if (isNaN(maxTime) || maxTime < 0) {
        throw createError(400, 'Maximum time spent must be a non-negative number (seconds)');
      }
    }

    return true;
  }

  // NEW: Validate Result-specific query filters
  validateResultQueryFilters(filters) {
    // Build query object for the new Result model
    const query = {};

    // Basic filters
    if (filters.userId) query.userId = filters.userId;
    if (filters.testId) query.testId = filters.testId;
    if (filters.organizationId) query.organizationId = filters.organizationId;
    if (filters.status) query.status = filters.status;

    // Score-based filters
    if (filters.minScore !== undefined || filters.maxScore !== undefined) {
      query['score.percentage'] = {};
      if (filters.minScore !== undefined) {
        query['score.percentage'].$gte = parseFloat(filters.minScore);
      }
      if (filters.maxScore !== undefined) {
        query['score.percentage'].$lte = parseFloat(filters.maxScore);
      }
    }

    // Pass/fail filter
    if (filters.passed !== undefined) {
      const passed = filters.passed === true || filters.passed === 'true';
      query['score.passed'] = passed;
    }

    // Time spent filters
    if (filters.minTimeSpent !== undefined || filters.maxTimeSpent !== undefined) {
      query.timeSpent = {};
      if (filters.minTimeSpent !== undefined) {
        query.timeSpent.$gte = parseInt(filters.minTimeSpent);
      }
      if (filters.maxTimeSpent !== undefined) {
        query.timeSpent.$lte = parseInt(filters.maxTimeSpent);
      }
    }

    // Date range filters
    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) {
        query.completedAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.completedAt.$lte = new Date(filters.endDate);
      }
    }

    // Question-specific filters (for analytics)
    if (filters.questionType || filters.difficulty || filters.language || filters.category) {
      // These would need to be handled with aggregation pipeline for question-level filtering
      return {
        query, needsAggregation: true, questionFilters: {
          type: filters.questionType,
          difficulty: filters.difficulty,
          language: filters.language,
          category: filters.category
        }
      };
    }

    return { query, needsAggregation: false };
  }

  // NEW: Validate access to specific result fields
  validateFieldAccess(user, requestedFields = []) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    // Define field access levels
    const studentFields = ['score', 'status', 'completedAt', 'timeSpent', 'attemptNumber'];
    const instructorFields = [...studentFields, 'questions', 'sessionId', 'userId'];
    const adminFields = [...instructorFields]; // Admins get same access as instructors for results

    let allowedFields;
    if (isSuperOrgAdminOrInstructor) {
      allowedFields = adminFields;
    } else if (user.role === 'admin' || user.role === 'instructor') {
      allowedFields = instructorFields;
    } else {
      allowedFields = studentFields;
    }

    // Check if all requested fields are allowed
    const unauthorizedFields = requestedFields.filter(field => !allowedFields.includes(field));

    if (unauthorizedFields.length > 0) {
      throw createError(403, `Unauthorized access to fields: ${unauthorizedFields.join(', ')}`);
    }

    return allowedFields;
  }
}

module.exports = {
  validateResultAccess: (result, user) => new ResultValidation().validateResultAccess(result, user),
  validateAnalyticsAccess: (user, orgId) => new ResultValidation().validateAnalyticsAccess(user, orgId),
  validateQuestionAnalyticsAccess: (user, orgId) => new ResultValidation().validateQuestionAnalyticsAccess(user, orgId),
  validateFilterInputs: (filters) => new ResultValidation().validateFilterInputs(filters),
  validateResultQueryFilters: (filters) => new ResultValidation().validateResultQueryFilters(filters),
  validateFieldAccess: (user, requestedFields) => new ResultValidation().validateFieldAccess(user, requestedFields)
};