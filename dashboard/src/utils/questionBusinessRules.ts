// src/utils/questionBusinessRules.ts - Business rules enforcement

import type { QuestionCategory, QuestionType } from '../types';

// ✅ Backend business rules - EXACT copy of backend validation
export const QUESTION_TYPE_CATEGORY_RULES: Record<QuestionCategory, {
    allowedTypes: QuestionType[];
    restrictedTypes: QuestionType[];
    restrictionReason: string;
}> = {
    // UI questions: Can ONLY use fillInTheBlank for code questions
    ui: {
        allowedTypes: ['multipleChoice', 'trueFalse', 'fillInTheBlank'] as QuestionType[],
        restrictedTypes: ['codeChallenge', 'codeDebugging'] as QuestionType[],
        restrictionReason: 'UI questions must use fillInTheBlank type, not codeChallenge or codeDebugging'
    },

    // Logic questions: Can use ALL question types (NO RESTRICTIONS)
    logic: {
        allowedTypes: ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging', 'fillInTheBlank'] as QuestionType[],
        restrictedTypes: [] as QuestionType[],
        restrictionReason: ''
    },

    // Syntax questions: Can use ALL question types (NO RESTRICTIONS)
    syntax: {
        allowedTypes: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'] as QuestionType[],
        restrictedTypes: [] as QuestionType[],
        restrictionReason: ''
    },

    // Debugging questions: Can use ALL question types (NO RESTRICTIONS)
    debugging: {
        allowedTypes: ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging', 'fillInTheBlank'] as QuestionType[],
        restrictedTypes: [] as QuestionType[],
        restrictionReason: ''
    },

    // Concept questions: Can use ALL question types (NO RESTRICTIONS)
    concept: {
        allowedTypes: ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging', 'fillInTheBlank'] as QuestionType[],
        restrictedTypes: [] as QuestionType[],
        restrictionReason: ''
    },

    // Best-practice questions: Can use ALL question types (NO RESTRICTIONS)
    'best-practice': {
        allowedTypes: ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging', 'fillInTheBlank'] as QuestionType[],
        restrictedTypes: [] as QuestionType[],
        restrictionReason: ''
    }
};

export interface BusinessRuleViolation {
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
    suggestion?: string;
}

/**
 * ✅ Check if question type is allowed for category
 */
export const isQuestionTypeAllowedForCategory = (
    type: QuestionType,
    category: QuestionCategory
): boolean => {
    const rules = QUESTION_TYPE_CATEGORY_RULES[category];
    if (!rules) return true;

    // Check if type is explicitly restricted
    if (rules.restrictedTypes.includes(type)) return false;

    // Check if type is in allowed types
    return rules.allowedTypes.includes(type);
};

/**
 * ✅ Get allowed question types for a category
 */
export const getAllowedQuestionTypesForCategory = (category: QuestionCategory): QuestionType[] => {
    const rules = QUESTION_TYPE_CATEGORY_RULES[category];
    if (!rules) return ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];

    return rules.allowedTypes;
};

/**
 * ✅ Get restricted question types for a category
 */
export const getRestrictedQuestionTypesForCategory = (category: QuestionCategory): {
    types: QuestionType[];
    reason: string;
} => {
    const rules = QUESTION_TYPE_CATEGORY_RULES[category];
    if (!rules) return { types: [], reason: '' };

    return {
        types: rules.restrictedTypes,
        reason: rules.restrictionReason
    };
};

/**
 * ✅ Validate question type-category combination
 */
export const validateQuestionTypeCategory = (
    type: QuestionType,
    category: QuestionCategory
): BusinessRuleViolation[] => {
    const violations: BusinessRuleViolation[] = [];

    if (!isQuestionTypeAllowedForCategory(type, category)) {
        const rules = QUESTION_TYPE_CATEGORY_RULES[category];
        const severity = category === 'ui' && ['codeChallenge', 'codeDebugging'].includes(type)
            ? 'error' // Backend will reject this
            : 'warning'; // Backend allows but warns

        violations.push({
            field: 'type',
            code: `TYPE_CATEGORY_MISMATCH_${category.toUpperCase()}`,
            message: rules?.restrictionReason || `Invalid question type '${type}' for category '${category}'`,
            severity,
            suggestion: severity === 'error'
                ? `Use fillInTheBlank for ${category} questions`
                : `Consider using ${getAllowedQuestionTypesForCategory(category).filter(t => t !== type).join(' or ')} instead`
        });
    }

    return violations;
};

/**
 * ✅ Get question type recommendations for category
 */
export const getQuestionTypeRecommendations = (category: QuestionCategory): {
    recommended: QuestionType[];
    discouraged: QuestionType[];
    message: string;
} => {
    switch (category) {
        case 'ui':
            return {
                recommended: ['fillInTheBlank'],
                discouraged: ['codeChallenge', 'codeDebugging'],
                message: 'UI questions work best with Fill-in-the-Blank for code completion tasks, or Multiple Choice/True-False for concepts.'
            };

        case 'logic':
            return {
                recommended: ['codeChallenge', 'codeDebugging'],
                discouraged: ['fillInTheBlank'],
                message: 'Logic questions are best tested with Code Challenges (write functions) or Code Debugging (fix problems).'
            };

        case 'syntax':
            return {
                recommended: ['fillInTheBlank', 'multipleChoice'],
                discouraged: [],
                message: 'Syntax questions work well with Fill-in-the-Blank for code completion or Multiple Choice for syntax rules.'
            };

        default:
            return {
                recommended: ['multipleChoice', 'trueFalse'],
                discouraged: [],
                message: 'Multiple Choice and True/False questions work for most concepts.'
            };
    }
};

/**
 * ✅ Check if code-related fields are required
 */
export const getRequiredFieldsForTypeCategory = (
    type: QuestionType,
    category?: QuestionCategory
): {
    required: string[];
    optional: string[];
    forbidden: string[];
} => {
    const baseRequired = ['title', 'description', 'language', 'difficulty'];
    const baseOptional = ['tags'];

    switch (type) {
        case 'multipleChoice':
            return {
                required: [...baseRequired, 'options', 'correctAnswer'],
                optional: [...baseOptional],
                forbidden: ['codeTemplate', 'blanks', 'testCases', 'codeConfig', 'buggyCode', 'solutionCode']
            };

        case 'trueFalse':
            return {
                required: [...baseRequired, 'correctAnswer'],
                optional: [...baseOptional],
                forbidden: ['codeTemplate', 'blanks', 'testCases', 'codeConfig', 'buggyCode', 'solutionCode']
                // Note: 'options' is NOT in forbidden because True/False questions DO have options: ["true", "false"]
            };

        case 'fillInTheBlank':
            return {
                required: [...baseRequired, 'category', 'codeTemplate', 'blanks'],
                optional: [...baseOptional],
                forbidden: ['options', 'testCases', 'buggyCode', 'solutionCode']
            };

        case 'codeChallenge':
            const logicRequired = category === 'logic'
                ? ['codeConfig.entryFunction', 'testCases']
                : [];
            return {
                required: [...baseRequired, 'category', ...logicRequired],
                optional: [...baseOptional, 'codeConfig.runtime', 'codeConfig.timeoutMs'],
                forbidden: ['options', 'codeTemplate', 'blanks', 'buggyCode', 'solutionCode']
            };

        case 'codeDebugging':
            return {
                required: [...baseRequired, 'category', 'buggyCode', 'solutionCode'],
                optional: [...baseOptional, 'codeConfig.runtime', 'codeConfig.timeoutMs'],
                forbidden: ['options', 'codeTemplate', 'blanks', 'testCases']
            };

        default:
            return {
                required: baseRequired,
                optional: baseOptional,
                forbidden: []
            };
    }
};

/**
 * ✅ Get category-specific guidance
 */
export const getCategoryGuidance = (category: QuestionCategory): {
    description: string;
    examples: string[];
    bestPractices: string[];
} => {
    switch (category) {
        case 'ui':
            return {
                description: 'UI questions test knowledge of user interface components, styling, and visual layout.',
                examples: [
                    'Complete CSS flexbox properties',
                    'Fill in React component JSX',
                    'HTML form structure completion',
                    'CSS Grid layout properties'
                ],
                bestPractices: [
                    'Use Fill-in-the-Blank for code completion',
                    'Focus on visual elements and styling',
                    'Test component structure knowledge',
                    'Include responsive design concepts'
                ]
            };

        case 'logic':
            return {
                description: 'Logic questions test programming problem-solving and algorithmic thinking.',
                examples: [
                    'Implement array sorting algorithm',
                    'Debug recursive function',
                    'Write function to solve math problem',
                    'Fix async/await error handling'
                ],
                bestPractices: [
                    'Use Code Challenges for implementing functions',
                    'Use Code Debugging for fixing logic errors',
                    'Include comprehensive test cases',
                    'Focus on algorithmic thinking'
                ]
            };

        case 'syntax':
            return {
                description: 'Syntax questions test knowledge of language-specific syntax and structure.',
                examples: [
                    'Complete variable declarations',
                    'Fill in function parameter syntax',
                    'Complete import/export statements',
                    'Fix syntax errors in code blocks'
                ],
                bestPractices: [
                    'Use Fill-in-the-Blank for syntax completion',
                    'Focus on language-specific features',
                    'Test proper syntax usage',
                    'Include common syntax patterns'
                ]
            };

        case 'debugging':
            return {
                description: 'Debugging questions test ability to identify and fix errors in code.',
                examples: [
                    'Fix runtime errors in functions',
                    'Debug logic errors in algorithms',
                    'Identify and correct syntax issues',
                    'Fix async/await error handling'
                ],
                bestPractices: [
                    'Use Code Debugging for error correction',
                    'Include clear error scenarios',
                    'Test debugging skills progressively',
                    'Include both syntax and logic errors'
                ]
            };

        case 'concept':
            return {
                description: 'Concept questions test understanding of programming concepts and theory.',
                examples: [
                    'Explain the difference between var, let, and const',
                    'Describe how closures work',
                    'Identify correct design patterns',
                    'Explain event loop behavior'
                ],
                bestPractices: [
                    'Use Multiple Choice for concept verification',
                    'Focus on understanding over memorization',
                    'Test core language concepts',
                    'Include practical applications'
                ]
            };

        case 'best-practice':
            return {
                description: 'Best practice questions test knowledge of coding standards and conventions.',
                examples: [
                    'Identify proper error handling patterns',
                    'Choose optimal code organization',
                    'Select appropriate naming conventions',
                    'Recognize security best practices'
                ],
                bestPractices: [
                    'Use Multiple Choice for pattern selection',
                    'Focus on industry standards',
                    'Test code quality awareness',
                    'Include security considerations'
                ]
            };

        default:
            return {
                description: 'General programming questions.',
                examples: ['Various programming tasks'],
                bestPractices: ['Follow standard coding practices']
            };
    }
};