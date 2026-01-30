// src/utils/dynamicFormValidation.ts - Dynamic form validation based on question type and category

import type { CreateQuestionData, Language, QuestionCategory, QuestionType } from '../types';
import {
    getAllowedQuestionTypes,
    getValidCategories,
    isValidLanguageCategoryCombo,
    isValidQuestionTypeForCategory,
    isValidQuestionTypeForLanguageAndCategory
} from '../types/common';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    requiredFields: string[];
    optionalFields: string[];
}

export interface FieldRequirement {
    field: string;
    required: boolean;
    condition?: (data: Partial<CreateQuestionData>) => boolean;
    message?: string;
}

/**
 * MASTER: Dynamic field requirements based on question type and category
 * This aligns exactly with your backend validation rules
 */
export class DynamicFormValidator {

    /**
     * Get all field requirements for a given question configuration
     */
    static getFieldRequirements(
        type?: QuestionType,
        category?: QuestionCategory,
        _language?: Language
    ): FieldRequirement[] {
        const requirements: FieldRequirement[] = [];

        // UNIVERSAL: Basic fields required for all questions
        requirements.push(
            { field: 'title', required: true, message: 'Question title is required' },
            { field: 'description', required: true, message: 'Question description is required' },
            { field: 'type', required: true, message: 'Question type is required' },
            { field: 'language', required: true, message: 'Programming language is required' },
            { field: 'difficulty', required: true, message: 'Difficulty level is required' }
        );

        // CATEGORY: Required for code-related question types
        if (type && ['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(type)) {
            requirements.push({
                field: 'category',
                required: true,
                message: 'Category is required for code questions'
            });
        }

        // TYPE-SPECIFIC: Requirements based on question type
        if (type) {
            requirements.push(...this.getTypeSpecificRequirements(type, category));
        }

        return requirements;
    }

    /**
     * Get type-specific field requirements
     */
    private static getTypeSpecificRequirements(
        type: QuestionType,
        category?: QuestionCategory
    ): FieldRequirement[] {
        const requirements: FieldRequirement[] = [];

        switch (type) {
            case 'multipleChoice':
                requirements.push(
                    {
                        field: 'options',
                        required: true,
                        condition: (data) => !data.options || data.options.length < 2,
                        message: 'At least 2 answer options are required'
                    },
                    {
                        field: 'correctAnswer',
                        required: true,
                        condition: (data) => typeof data.correctAnswer !== 'number',
                        message: 'Correct answer selection is required'
                    }
                );
                break;

            case 'trueFalse':
                requirements.push({
                    field: 'correctAnswer',
                    required: true,
                    condition: (data) => typeof data.correctAnswer !== 'number' ||
                        data.correctAnswer < 0 ||
                        data.correctAnswer > 1,
                    message: 'True/False answer selection is required'
                });
                break;

            case 'fillInTheBlank':
                requirements.push(
                    {
                        field: 'codeTemplate',
                        required: true,
                        condition: (data) => !data.codeTemplate?.trim(),
                        message: 'Code template is required'
                    },
                    {
                        field: 'blanks',
                        required: true,
                        condition: (data) => !data.blanks || data.blanks.length === 0,
                        message: 'At least one blank configuration is required'
                    }
                );
                break;

            case 'codeChallenge':
                // LOGIC CATEGORY: Special requirements for logic questions
                if (category === 'logic') {
                    requirements.push(
                        {
                            field: 'codeConfig.entryFunction',
                            required: true,
                            condition: (data) => !data.codeConfig?.entryFunction,
                            message: 'Entry function name is required for logic questions'
                        },
                        {
                            field: 'codeConfig.runtime',
                            required: true,
                            condition: (data) => !data.codeConfig?.runtime,
                            message: 'Runtime environment is required for logic questions'
                        },
                        {
                            field: 'testCases',
                            required: true,
                            condition: (data) => !data.testCases || data.testCases.length === 0,
                            message: 'At least one test case is required for logic questions'
                        }
                    );
                }
                break;

            case 'codeDebugging':
                requirements.push(
                    {
                        field: 'buggyCode',
                        required: true,
                        condition: (data) => !data.buggyCode?.trim(),
                        message: 'Buggy code is required'
                    },
                    {
                        field: 'solutionCode',
                        required: true,
                        condition: (data) => !data.solutionCode?.trim(),
                        message: 'Solution code is required'
                    }
                );

                // LOGIC CATEGORY: Test cases required for debugging logic questions
                if (category === 'logic') {
                    requirements.push(
                        {
                            field: 'codeConfig.entryFunction',
                            required: true,
                            condition: (data) => !data.codeConfig?.entryFunction,
                            message: 'Entry function name is required for logic debugging questions'
                        },
                        {
                            field: 'testCases',
                            required: true,
                            condition: (data) => !data.testCases || data.testCases.length === 0,
                            message: 'Test cases are required for logic debugging questions'
                        }
                    );
                }
                break;
        }

        return requirements;
    }

    /**
     * Get business rule error messages
     */
    private static getBusinessRuleError(type: QuestionType, category: QuestionCategory, language?: Language): string {
        // If we have language, use comprehensive validation
        if (language) {
            const allowedTypes = getAllowedQuestionTypes(language, category);
            return `'${type}' is not valid for ${language} ${category} questions. Valid types: ${allowedTypes.join(', ')}`;
        }
        
        // Fallback to category-only validation
        switch (category) {
            case 'ui':
                if (type === 'codeChallenge' || type === 'codeDebugging') {
                    return 'UI questions cannot use Code Challenge or Code Debugging types. Use Fill-in-the-Blank for code-related UI questions.';
                }
                break;
            case 'logic':
                if (type === 'fillInTheBlank') {
                    return 'Logic questions should use Code Challenge or Code Debugging types, not Fill-in-the-Blank.';
                }
                break;
        }
        return `Invalid question type '${type}' for category '${category}'`;
    }

    /**
     * VALIDATE: Complete validation of question data
     */
    static validateQuestionData(data: Partial<CreateQuestionData>): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const requiredFields: string[] = [];
        const optionalFields: string[] = [];

        // Get field requirements based on current data
        const requirements = this.getFieldRequirements(data.type, data.category, data.language);

        // BUSINESS RULES: Check question type-category compatibility
        if (data.type && data.category) {
            // Use comprehensive validation if language is available
            if (data.language) {
                if (!isValidQuestionTypeForLanguageAndCategory(data.type, data.language, data.category)) {
                    errors.push(this.getBusinessRuleError(data.type, data.category, data.language));
                }
            } else {
                // Fallback to category-only validation
                if (!isValidQuestionTypeForCategory(data.type, data.category)) {
                    errors.push(this.getBusinessRuleError(data.type, data.category));
                }
            }
        }

        // LANGUAGE-CATEGORY: Check valid combinations
        if (data.language && data.category) {
            if (!isValidLanguageCategoryCombo(data.language, data.category)) {
                errors.push(`Category '${data.category}' is not available for language '${data.language}'`);
            }
        }

        // FIELD VALIDATION: Check each field requirement
        for (const requirement of requirements) {
            if (requirement.required) {
                requiredFields.push(requirement.field);

                // Check if field meets requirements
                const fieldValue = this.getNestedFieldValue(data, requirement.field);
                const isEmpty = this.isFieldEmpty(fieldValue);

                // Use custom condition if provided, otherwise check if empty
                const isInvalid = requirement.condition
                    ? requirement.condition(data)
                    : isEmpty;

                if (isInvalid) {
                    errors.push(requirement.message || `${requirement.field} is required`);
                }
            } else {
                optionalFields.push(requirement.field);
            }
        }

        // SPECIFIC VALIDATIONS: Advanced validation rules
        this.addSpecificValidations(data, errors, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            requiredFields,
            optionalFields
        };
    }

    /**
     * Add specific validation rules
     */
    private static addSpecificValidations(
        data: Partial<CreateQuestionData>,
        errors: string[],
        warnings: string[]
    ): void {

        // MULTIPLE CHOICE: Validate options and correct answer
        if (data.type === 'multipleChoice' && data.options && data.correctAnswer !== undefined) {
            if (typeof data.correctAnswer === 'number') {
                if (data.correctAnswer < 0 || data.correctAnswer >= data.options.length) {
                    errors.push('Correct answer index is out of range for provided options');
                }
            }

            // Check for duplicate options
            const duplicates = data.options.filter((option, index) =>
                data.options!.indexOf(option) !== index
            );
            if (duplicates.length > 0) {
                warnings.push('Some answer options are duplicated');
            }
        }

        // FILL-IN-THE-BLANK: Validate blanks structure
        if (data.type === 'fillInTheBlank' && data.blanks && data.codeTemplate) {
            for (let i = 0; i < data.blanks.length; i++) {
                const blank = data.blanks[i];

                if (!blank.id) {
                    errors.push(`Blank ${i + 1} is missing an ID`);
                }

                if (!blank.correctAnswers || blank.correctAnswers.length === 0) {
                    errors.push(`Blank ${i + 1} needs at least one correct answer`);
                }

                // Check if blank placeholder exists in template
                const placeholder = `___${blank.id}___`;
                if (!data.codeTemplate.includes(placeholder)) {
                    warnings.push(`Blank ${i + 1} placeholder (${placeholder}) not found in code template`);
                }
            }
        }

        // TEST CASES: Validate test case structure
        if (data.testCases && data.testCases.length > 0) {
            for (let i = 0; i < data.testCases.length; i++) {
                const testCase = data.testCases[i];

                if (!testCase.hasOwnProperty('args')) {
                    errors.push(`Test case ${i + 1} is missing 'args' property`);
                }

                if (!testCase.hasOwnProperty('expected')) {
                    errors.push(`Test case ${i + 1} is missing 'expected' property`);
                }
            }
        }

        // CODE CONFIG: Validate configuration
        if (data.codeConfig) {
            if (data.codeConfig.timeoutMs && data.codeConfig.timeoutMs < 100) {
                warnings.push('Very low timeout may cause valid solutions to fail');
            }

            if (data.codeConfig.timeoutMs && data.codeConfig.timeoutMs > 10000) {
                warnings.push('High timeout may allow inefficient solutions to pass');
            }
        }
    }

    /**
     * Helper: Get nested field value (e.g., 'codeConfig.entryFunction')
     */
    private static getNestedFieldValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Helper: Check if field value is considered empty
     */
    private static isFieldEmpty(value: any): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        return false;
    }

    /**
     * STEP VALIDATION: Check if specific wizard step is complete
     */
    static validateStep(
        stepNumber: number,
        data: Partial<CreateQuestionData>
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        switch (stepNumber) {
            case 1: // Language & Category Selection
                if (!data.language) errors.push('Please select a programming language');
                if (!data.category) errors.push('Please select a question category');
                if (!data.type) errors.push('Please select a question type');

                if (data.language && data.category) {
                    if (!isValidLanguageCategoryCombo(data.language, data.category)) {
                        errors.push(`Category '${data.category}' is not available for ${data.language}`);
                    }
                }

                // Use comprehensive validation if we have all three pieces
                if (data.type && data.category && data.language) {
                    if (!isValidQuestionTypeForLanguageAndCategory(data.type, data.language, data.category)) {
                        errors.push(this.getBusinessRuleError(data.type, data.category, data.language));
                    }
                }
                break;

            case 2: // Basic Information
                if (!data.title?.trim()) errors.push('Question title is required');
                if (!data.description?.trim()) errors.push('Question description is required');
                if (!data.difficulty) errors.push('Difficulty level is required');
                break;

            case 3: // Question Content
                const contentValidation = this.validateQuestionData(data);
                errors.push(...contentValidation.errors);
                warnings.push(...contentValidation.warnings);
                break;

            case 4: // Review & Save
                const fullValidation = this.validateQuestionData(data);
                errors.push(...fullValidation.errors);
                warnings.push(...fullValidation.warnings);
                break;
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            requiredFields: [],
            optionalFields: []
        };
    }
}

/**
 * HOOK: React hook for dynamic form validation
 */
export const useDynamicValidation = (data: Partial<CreateQuestionData>) => {
    const validation = DynamicFormValidator.validateQuestionData(data);

    return {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        requiredFields: validation.requiredFields,
        optionalFields: validation.optionalFields,

        // Helper functions
        validateStep: (step: number) => DynamicFormValidator.validateStep(step, data),
        getFieldRequirements: () => DynamicFormValidator.getFieldRequirements(data.type, data.category, data.language),
        isFieldRequired: (field: string) => validation.requiredFields.includes(field),
        hasErrors: validation.errors.length > 0,
        hasWarnings: validation.warnings.length > 0,
    };
};

/**
 * UTILITY: Get available question types for current configuration
 */
export const getAvailableQuestionTypes = (
    language?: Language,
    category?: QuestionCategory
): { type: QuestionType; available: boolean; reason?: string }[] => {

    const allTypes: QuestionType[] = ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];

    return allTypes.map(type => {
        // If we have both language and category, use the comprehensive validation
        if (language && category) {
            const isValid = isValidQuestionTypeForLanguageAndCategory(type, language, category);
            
            if (!isValid) {
                // Get the allowed types to show what IS allowed
                const allowedTypes = getAllowedQuestionTypes(language, category);
                return {
                    type,
                    available: false,
                    reason: `${type} is not available for ${language} ${category} questions. Available types: ${allowedTypes.join(', ')}`
                };
            }
        }
        // If we only have category, use the legacy validation
        else if (category) {
            const isValid = isValidQuestionTypeForCategory(type, category);
            if (!isValid) {
                return {
                    type,
                    available: false,
                    reason: `${type} is not suitable for ${category} questions`
                };
            }
        }
        // If we only have language, check if it supports the question type at all
        else if (language) {
            const validCategories = getValidCategories(language);
            
            // Code types need logic support
            if ((type === 'codeChallenge' || type === 'codeDebugging') && !validCategories.includes('logic')) {
                return {
                    type,
                    available: false,
                    reason: `${language} does not support logic questions (required for ${type})`
                };
            }
        }

        return { type, available: true };
    });
};