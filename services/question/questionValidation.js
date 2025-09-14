// /services/question/questionValidation.js - Updated with centralized tags
const Question = require('../../models/Question');
const Organization = require('../../models/Organization');
const User = require('../../models/User');
const createError = require('http-errors');
const { validateTags, getAllValidTags } = require('../../constants/tags'); // Import centralized tags

const validQuestionTypes = ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];
const validLanguages = [
  'javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json',
];
const validDifficulties = ['easy', 'medium', 'hard'];
const validCategories = ['logic', 'ui', 'syntax'];

class QuestionValidation {
  async validateQuestionData(questionData, mode = 'create') {
    if (mode === 'create') {
      await this._validateBasicFields(questionData);
    } else {
      await this._validateUpdatedFields(questionData);
    }

    await this._validateTypeSpecificFields(questionData);
    await this._validateTags(questionData.tags);
  }

  async validateQuestionPermissions(user, isGlobal) {
    if (!user.userId) {
      throw createError(400, 'User _id is required');
    }

    const userDoc = await User.findById(user.userId);
    if (!userDoc) {
      throw createError(400, 'Invalid createdBy user');
    }

    // Get user's organization to check if it's a super org
    const userOrganization = await Organization.findById(user.organizationId);
    if (!userOrganization) {
      throw createError(404, 'User organization not found');
    }

    const isSuperOrgAdmin = user.isSuperOrgAdmin || (userOrganization.isSuperOrg && user.role === 'admin');
    const isSuperOrgUser = userOrganization.isSuperOrg;

    let finalOrganizationId = user.organizationId;
    let finalIsGlobal = false;

    if (isSuperOrgAdmin || isSuperOrgUser) {
      // ✅ UPDATED: Default to global for super org users, but allow override
      if (isGlobal !== undefined) {
        // Explicit value provided - use it
        finalIsGlobal = isGlobal;
      } else {
        // No explicit value - default to global for super org users
        finalIsGlobal = true;
      }

      // Set organization ID based on global setting
      finalOrganizationId = finalIsGlobal ? null : user.organizationId;

    } else if (user.role === 'admin' || user.role === 'instructor') {
      // Regular org users can only create org-specific questions
      if (isGlobal) {
        throw createError(403, 'Only super organization admins can create global questions');
      }
      finalOrganizationId = user.organizationId;
      finalIsGlobal = false;
    } else {
      throw createError(403, 'Insufficient permissions to create questions');
    }

    // Validate organization exists (only if not global)
    if (!finalIsGlobal && !finalOrganizationId) {
      throw createError(400, 'User must belong to an organization to create questions');
    }

    if (!finalIsGlobal && finalOrganizationId) {
      const org = await Organization.findById(finalOrganizationId);
      if (!org) {
        throw createError(400, 'Invalid organization');
      }
    }

    return { organizationId: finalOrganizationId, isGlobal: finalIsGlobal };
  }

  // Private validation methods
  async _validateBasicFields(questionData) {
    const { title, description, type, language, difficulty, status } = questionData;

    if (!title || !description || !type || !language || !difficulty) {
      throw createError(400, 'Title, description, type, language, and difficulty are required');
    }

    if (!validQuestionTypes.includes(type)) {
      throw createError(400, `Invalid question type. Must be one of: ${validQuestionTypes.join(', ')}`);
    }

    if (!validLanguages.includes(language)) {
      throw createError(400, `Invalid language. Must be one of: ${validLanguages.join(', ')}`);
    }

    if (!validDifficulties.includes(difficulty)) {
      throw createError(400, `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
    }

    if (status && !['draft', 'active', 'archived'].includes(status)) {
      throw createError(400, 'Invalid status. Must be draft, active, or archived');
    }

    // Category validation for code-related questions
    if (['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(type)) {
      if (!questionData.category) {
        throw createError(400, 'Category is required for code-related questions');
      }
      if (!validCategories.includes(questionData.category)) {
        throw createError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }

      // **FIXED: UI questions must use fillInTheBlank**
      if (questionData.category === 'ui' && type !== 'fillInTheBlank') {
        throw createError(400, 'UI questions must use fillInTheBlank type, not codeChallenge or codeDebugging');
      }


      // Validate language-category combination
      const validCombinations = Question.getValidCombinations();
      if (!validCombinations[language]?.includes(questionData.category)) {
        throw createError(400, `Invalid category '${questionData.category}' for language '${language}'. Valid categories: ${validCombinations[language]?.join(', ') || 'none'}`);
      }
    }
  }

  async _validateUpdatedFields(questionData) {
    const { type, language, category, difficulty, status } = questionData;

    if (type && !validQuestionTypes.includes(type)) {
      throw createError(400, `Invalid type. Must be one of: ${validQuestionTypes.join(', ')}`);
    }
    if (language && !validLanguages.includes(language)) {
      throw createError(400, `Invalid language. Must be one of: ${validLanguages.join(', ')}`);
    }
    if (category && !validCategories.includes(category)) {
      throw createError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    if (difficulty && !validDifficulties.includes(difficulty)) {
      throw createError(400, `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
    }
    if (status && !['draft', 'active', 'archived'].includes(status)) {
      throw createError(400, 'Invalid status');
    }

    // **FIXED: Validate UI/Logic question type combinations for updates too**
    const finalType = type || questionData.type;
    const finalCategory = category || questionData.category;

    if (finalCategory === 'ui' && finalType !== 'fillInTheBlank') {
      throw createError(400, 'UI questions must use fillInTheBlank type');
    }


    // Validate language-category combination for updates
    const finalLanguage = language || questionData.language;
    if (finalCategory) {
      const validCombinations = Question.getValidCombinations();
      if (!validCombinations[finalLanguage]?.includes(finalCategory)) {
        throw createError(400, `Invalid category '${finalCategory}' for language '${finalLanguage}'`);
      }
    }
  }

  async _validateTypeSpecificFields(questionData) {
    const { type, options, correctAnswer, testCases, codeConfig, codeTemplate, blanks, buggyCode, solutionCode, category, language } = questionData;

    if (type === 'multipleChoice') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        throw createError(400, 'At least two answer options are required for multipleChoice questions');
      }
      if (correctAnswer === undefined || typeof correctAnswer !== 'number' || correctAnswer < 0 || correctAnswer >= options.length) {
        throw createError(400, 'Valid correct answer index is required for multipleChoice questions');
      }
    }

    if (type === 'trueFalse') {
      if (!options || !Array.isArray(options) || options.length !== 2) {
        throw createError(400, 'True/False questions require exactly 2 options');
      }
      if (correctAnswer === undefined || typeof correctAnswer !== 'number' || correctAnswer < 0 || correctAnswer >= options.length) {
        throw createError(400, 'Valid correct answer index (0 or 1) is required for trueFalse questions');
      }
    }

    if (type === 'fillInTheBlank') {
      if (!codeTemplate) {
        throw createError(400, 'codeTemplate is required for fillInTheBlank questions');
      }
      if (!blanks || !Array.isArray(blanks) || blanks.length === 0) {
        throw createError(400, 'At least one blank is required for fillInTheBlank questions');
      }

      for (const blank of blanks) {
        if (!blank.id || !blank.correctAnswers || !Array.isArray(blank.correctAnswers) || blank.correctAnswers.length === 0) {
          throw createError(400, 'Each blank must have an id and at least one correct answer');
        }
      }
    }

    if (type === 'codeChallenge') {
      // **FIXED: codeChallenge can only be logic category**
      if (category !== 'logic') {
        throw createError(400, 'codeChallenge questions can only have logic category. Use fillInTheBlank for UI questions.');
      }

      if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
        throw createError(400, 'At least one test case is required for logic code challenges');
      }

      // **FIXED: SQL doesn't need entryFunction, other languages do**
      if (language === 'sql') {
        if (!codeConfig?.runtime) {
          throw createError(400, 'runtime is required for SQL code challenges');
        }
        // SQL questions don't need entryFunction - they execute queries directly
      } else {
        if (!codeConfig?.entryFunction) {
          throw createError(400, 'entryFunction is required for logic code challenges');
        }
        if (!codeConfig?.runtime) {
          throw createError(400, 'runtime is required for logic code challenges');
        }
      }

      for (const testCase of testCases) {
        if (!testCase.hasOwnProperty('args') || !testCase.hasOwnProperty('expected')) {
          throw createError(400, 'Test cases must have args and expected properties');
        }
      }
    }

    if (type === 'codeDebugging') {
      // **FIXED: codeDebugging can only be logic category**  
      if (category !== 'logic') {
        throw createError(400, 'codeDebugging questions can only have logic category. Use fillInTheBlank for UI questions.');
      }

      if (!buggyCode || !solutionCode) {
        throw createError(400, 'Both buggyCode and solutionCode are required for debugging questions');
      }

      if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
        throw createError(400, 'At least one test case is required for logic debugging questions');
      }
      
      // **FIXED: Added language destructuring to access language variable**
      if (language === 'sql') {
        if (!codeConfig?.runtime) {
          throw createError(400, 'runtime is required for SQL debugging questions');
        }
      } else {
        if (!codeConfig?.entryFunction) {
          throw createError(400, 'entryFunction is required for logic debugging questions');
        }
      }
    }
  }

  async _validateTags(tags) {
    const validatedTags = tags && Array.isArray(tags) ? tags : [];
    const invalidTags = validateTags(validatedTags); // ✅ Now uses centralized validation

    if (invalidTags.length > 0) {
      const validTagsList = getAllValidTags(); // ✅ Get all valid tags from centralized source
      throw createError(400, `Invalid tags: ${invalidTags.join(', ')}. Must be one of the ${validTagsList.length} valid tags.`);
    }

    return validatedTags;
  }
}

module.exports = {
  validateQuestionData: (data, mode) => new QuestionValidation().validateQuestionData(data, mode),
  validateQuestionPermissions: (user, isGlobal) => new QuestionValidation().validateQuestionPermissions(user, isGlobal)
};