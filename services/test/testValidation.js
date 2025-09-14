// /services/test/testValidation.js - Test validation logic
const Organization = require('../../models/Organization');
const createError = require('http-errors');

const validTestTypes = ['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'];
const validStatuses = ['draft', 'active', 'archived'];

class TestValidation {
  async validateTestData(testData, mode = 'create') {
    if (mode === 'create') {
      await this._validateRequiredFields(testData);
    }
    
    await this._validateOptionalFields(testData);
    await this._validateTestStructure(testData);
  }

  async validateTestPermissions(user, orgId = null) {
    // Validate user has permission to create tests
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor) {
      throw createError(403, 'Only admins/instructors can create tests');
    }

    // Validate organization access if orgId is specified
    if (orgId && !user.isSuperOrgAdmin && user.organizationId.toString() !== orgId) {
      throw createError(403, 'Unauthorized to create tests for this organization');
    }

    // Determine organization settings
    return await this._determineOrganizationSettings(user, orgId);
  }

  // Private validation methods
  async _validateRequiredFields(testData) {
    const { title, description, settings } = testData;

    if (!title || !description || !settings || !settings.timeLimit || !settings.attemptsAllowed) {
      throw createError(400, 'Title, description, and settings (timeLimit, attemptsAllowed) are required');
    }

    // Validate structure based on useSections setting
    if (settings.useSections && (!testData.sections || !Array.isArray(testData.sections) || testData.sections.length === 0)) {
      throw createError(400, 'Sections are required when useSections is true');
    }
    
    if (!settings.useSections && (!testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0)) {
      throw createError(400, 'Questions are required when useSections is false');
    }
  }

  async _validateOptionalFields(testData) {
    const { testType, languages, tags, status } = testData;

    if (testType && !validTestTypes.includes(testType)) {
      throw createError(400, `Invalid test type. Must be one of: ${validTestTypes.join(', ')}`);
    }

    if (languages && !Array.isArray(languages)) {
      throw createError(400, 'Languages must be an array');
    }

    if (tags && !Array.isArray(tags)) {
      throw createError(400, 'Tags must be an array');
    }

    if (status && !validStatuses.includes(status)) {
      throw createError(400, 'Invalid status. Must be draft, active, or archived');
    }
  }

  async _validateTestStructure(testData) {
    const { settings, sections, questions } = testData;

    if (!settings) return;

    // Validate time limits
    if (settings.timeLimit && (typeof settings.timeLimit !== 'number' || settings.timeLimit <= 0)) {
      throw createError(400, 'Time limit must be a positive number');
    }

    if (settings.attemptsAllowed && (typeof settings.attemptsAllowed !== 'number' || settings.attemptsAllowed <= 0)) {
      throw createError(400, 'Attempts allowed must be a positive number');
    }

    // Validate sections structure if using sections
    if (settings.useSections && sections) {
      await this._validateSections(sections);
    }

    // Validate questions structure if not using sections
    if (!settings.useSections && questions) {
      await this._validateQuestions(questions);
    }
  }

  async _validateSections(sections) {
    for (const section of sections) {
      if (!section.name || typeof section.name !== 'string' || section.name.trim().length === 0) {
        throw createError(400, 'Each section must have a non-empty name');
      }

      if (!section.timeLimit || typeof section.timeLimit !== 'number' || section.timeLimit <= 0) {
        throw createError(400, 'Each section must have a positive time limit');
      }

      if (!section.questions || !Array.isArray(section.questions) || section.questions.length === 0) {
        throw createError(400, 'Each section must have at least one question');
      }

      await this._validateQuestions(section.questions);
    }
  }

  async _validateQuestions(questions) {
    for (const question of questions) {
      if (!question.questionId || typeof question.questionId !== 'string') {
        throw createError(400, 'Each question must have a valid questionId');
      }

      if (!question.points || typeof question.points !== 'number' || question.points <= 0) {
        throw createError(400, 'Each question must have positive points');
      }
    }
  }

  async _determineOrganizationSettings(user, orgId) {
    // Get user's organization
    const userOrganization = await Organization.findById(user.organizationId);
    if (!userOrganization) {
      throw createError(404, 'User organization not found');
    }

    let organizationId = null;
    let isGlobal = false;

    // Default behavior based on user's organization
    if (userOrganization.isSuperOrg) {
      isGlobal = true;
      organizationId = null;
    } else {
      isGlobal = false;
      organizationId = user.organizationId;
    }

    // Override behavior if orgId is specified and user is superOrgAdmin
    if (orgId && user.isSuperOrgAdmin) {
      const targetOrg = await Organization.findById(orgId);
      if (!targetOrg) {
        throw createError(404, 'Target organization not found');
      }

      if (targetOrg.isSuperOrg) {
        isGlobal = true;
        organizationId = null;
      } else {
        isGlobal = false;
        organizationId = targetOrg._id;
      }
    }

    return { organizationId, isGlobal };
  }
}

module.exports = {
  validateTestData: (data, mode) => new TestValidation().validateTestData(data, mode),
  validateTestPermissions: (user, orgId) => new TestValidation().validateTestPermissions(user, orgId)
};