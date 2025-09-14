// utils/questionTemplate.js
const Question = require('../models/Question');
const { VALID_TAGS, validateTags, getAllValidTags } = require('../constants/tags'); // Import centralized tags

const VALID_COMBINATIONS = {
    'html': ['ui', 'syntax'],
    'css': ['ui', 'syntax'],
    'react': ['ui', 'syntax'],
    'flutter': ['ui', 'syntax'],
    'reactNative': ['ui', 'syntax'],
    'javascript': ['logic', 'syntax'],
    'typescript': ['logic', 'syntax'],
    'python': ['logic', 'syntax'],
    'sql': ['logic', 'syntax'],
    'dart': ['logic', 'syntax'],
    'express': ['logic', 'syntax'],
    'json': ['syntax']
};

const RUNTIME_MAP = {
    'javascript': 'node',
    'typescript': 'node',
    'express': 'node',
    'python': 'python',
    'sql': 'sql',
    'dart': 'dart'
};

class QuestionTemplateGenerator {
    /**
     * Creates a properly structured question object with all required fields
     * @param {Object} baseData - The base question data
     * @param {String} organizationId - MongoDB ObjectId of the organization
     * @param {String} createdBy - MongoDB ObjectId of the user creating the question
     * @returns {Object} - Fully structured question object ready for insertion
     */
    static createQuestionTemplate(baseData, organizationId, createdBy) {
        const template = {
            // Core required fields
            title: baseData.title,
            description: baseData.description,
            type: baseData.type,
            language: baseData.language,

            // Organization and permissions
            organizationId,
            isGlobal: true,
            status: baseData.status || 'active', // Default to active for seeded questions (draft/active/archived)
            createdBy,

            // New required fields
            difficulty: baseData.difficulty || 'medium',
            tags: baseData.tags || [],

            // Usage statistics
            usageStats: {
                timesUsed: 0,
                totalAttempts: 0,
                correctAttempts: 0,
                successRate: 0,
                averageTime: 0
            },

            // Timestamps (will be set by mongoose)
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Set category for code questions
        if (['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(baseData.type)) {
            template.category = this.determineCategory(baseData.language, baseData.preferredCategory);
        }

        // Type-specific fields
        switch (baseData.type) {
            case 'multipleChoice':
            case 'trueFalse':
                template.options = baseData.options || [];
                template.correctAnswer = baseData.correctAnswer;
                break;

            case 'fillInTheBlank':
                template.codeTemplate = baseData.codeTemplate || '';
                template.blanks = baseData.blanks || [];
                break;

            case 'codeChallenge':
                if (template.category === 'logic') {
                    template.testCases = baseData.testCases || [];
                    // ✅ FIXED: Add codeTemplate for logic questions too
                    template.codeTemplate = baseData.codeTemplate || '';
                    template.codeConfig = baseData.codeConfig || this.createCodeConfig(baseData.language, baseData.entryFunction);
                } else {
                    // UI/Syntax questions don't need test cases
                    template.codeTemplate = baseData.codeTemplate || '';
                    template.expectedOutput = baseData.expectedOutput || '';
                }
                break;

            case 'codeDebugging':
                template.buggyCode = baseData.buggyCode || '';
                template.solutionCode = baseData.solutionCode || '';
                if (template.category === 'logic') {
                    template.testCases = baseData.testCases || [];
                    // ✅ FIXED: Use provided codeConfig or create new one
                    template.codeConfig = baseData.codeConfig || this.createCodeConfig(baseData.language, baseData.entryFunction);
                }
                break;
        }

        return template;
    }

    /**
     * Determines the appropriate category based on language and preference
     */
    static determineCategory(language, preferredCategory = null) {
        const validCategories = VALID_COMBINATIONS[language] || [];

        if (preferredCategory && validCategories.includes(preferredCategory)) {
            return preferredCategory;
        }

        // Default category selection logic
        if (validCategories.includes('logic')) return 'logic';
        if (validCategories.includes('syntax')) return 'syntax';
        if (validCategories.includes('ui')) return 'ui';

        throw new Error(`No valid category found for language: ${language}`);
    }

    /**
     * Creates proper codeConfig structure for logic questions
     */
    static createCodeConfig(language, entryFunction) {
        const runtime = RUNTIME_MAP[language];
        if (!runtime) {
            throw new Error(`No runtime mapping found for language: ${language}`);
        }

        return {
            runtime,
            entryFunction: entryFunction || 'solution',
            timeoutMs: 3000,
            memoryLimitMb: 128
        };
    }

    /**
     * Validates test case format and converts old format to new
     */
    static validateAndConvertTestCases(testCases) {
        if (!Array.isArray(testCases)) {
            throw new Error('testCases must be an array');
        }

        return testCases.map((testCase, index) => {
            // Handle old format conversion
            if (testCase.input !== undefined && testCase.output !== undefined) {
                console.warn(`Converting old test case format at index ${index}`);
                return {
                    args: Array.isArray(testCase.input) ? testCase.input : [testCase.input],
                    expected: testCase.output,
                    hidden: testCase.hidden || false
                };
            }

            // Validate new format
            if (!testCase.hasOwnProperty('args') || !testCase.hasOwnProperty('expected')) {
                throw new Error(`Test case at index ${index} must have 'args' and 'expected' properties`);
            }

            return {
                args: Array.isArray(testCase.args) ? testCase.args : [testCase.args],
                expected: testCase.expected,
                hidden: testCase.hidden || false
            };
        });
    }

    /**
     * Validates tags against allowed enum values
     * @param {Array<string>} tags - Array of tags to validate
     * @returns {Array<string>} The validated tags array
     * @throws {Error} If any tags are invalid
     */
    static validateTags(tags) {
        const invalidTags = validateTags(tags); // ✅ Now uses centralized validation
        if (invalidTags.length > 0) {
            throw new Error(`Invalid tags: ${invalidTags.join(', ')}`);
        }
        return tags;
    }

    /**
     * Get all valid tags for reference
     * @returns {Array<string>} Array of all valid tags
     */
    static getValidTags() {
        return getAllValidTags(); // ✅ Now uses centralized getter
    }

    /**
     * Get valid combinations for reference
     */
    static getValidCombinations() {
        return VALID_COMBINATIONS;
    }

    /**
     * Get runtime mappings for reference
     */
    static getRuntimeMappings() {
        return RUNTIME_MAP;
    }
}

module.exports = QuestionTemplateGenerator