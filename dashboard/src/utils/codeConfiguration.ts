// src/utils/codeConfiguration.ts - Simplified to match backend schema

import type { Language, CodeConfig, QuestionCategory } from '../types';

export interface RuntimeEnvironment {
  id: string;
  name: string;
  description: string;
  language: Language;
  defaultTimeout: number;
  maxTimeout: number;
  supportedFeatures: string[];
}

export interface CodeConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: CodeConfig;
}

export interface FunctionSignature {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description?: string;
    optional?: boolean;
  }[];
  returnType: string;
  example?: string;
}

/**
 * CODE CONFIG MANAGER: Handles code configuration matching backend schema
 */
export class CodeConfigManager {

  /**
   * RUNTIME ENVIRONMENTS: Get available runtime environments by language
   */
  static getRuntimeEnvironments(language: Language): RuntimeEnvironment[] {
    const environments: Record<Language, RuntimeEnvironment[]> = {
      javascript: [
        {
          id: 'node',
          name: 'Node.js',
          description: 'Node.js runtime with ES2022 support',
          language: 'javascript',
          defaultTimeout: 3000,
          maxTimeout: 10000,
          supportedFeatures: ['async', 'modules', 'console', 'math', 'date']
        }
      ],
      
      typescript: [
        {
          id: 'node',
          name: 'TypeScript (Node.js)',
          description: 'TypeScript compiled to Node.js',
          language: 'typescript',
          defaultTimeout: 3500,
          maxTimeout: 10000,
          supportedFeatures: ['types', 'async', 'modules', 'console', 'math', 'date']
        }
      ],
      
      python: [
        {
          id: 'python',
          name: 'Python',
          description: 'Python runtime with standard library',
          language: 'python',
          defaultTimeout: 3000,
          maxTimeout: 10000,
          supportedFeatures: ['stdlib', 'math', 'datetime', 'json', 'collections']
        }
      ],
      
      sql: [
        {
          id: 'sql',
          name: 'SQL',
          description: 'SQL database engine',
          language: 'sql',
          defaultTimeout: 2000,
          maxTimeout: 5000,
          supportedFeatures: ['select', 'join', 'aggregate', 'window', 'cte']
        }
      ],
      
      dart: [
        {
          id: 'dart',
          name: 'Dart',
          description: 'Dart runtime with core libraries',
          language: 'dart',
          defaultTimeout: 3000,
          maxTimeout: 10000,
          supportedFeatures: ['core', 'math', 'collection', 'async']
        }
      ],

      // Code-only languages with runtime environments
      express: [
        {
          id: 'node',
          name: 'Express.js (Node.js)',
          description: 'Express.js framework on Node.js',
          language: 'express',
          defaultTimeout: 5000,
          maxTimeout: 15000,
          supportedFeatures: ['express', 'middleware', 'routing', 'json', 'async']
        }
      ],

      react: [
        {
          id: 'node',
          name: 'React (Node.js)',
          description: 'React components with Node.js runtime',
          language: 'react',
          defaultTimeout: 3000,
          maxTimeout: 10000,
          supportedFeatures: ['react', 'jsx', 'components', 'hooks']
        }
      ],

      reactNative: [
        {
          id: 'node',
          name: 'React Native (Node.js)',
          description: 'React Native components with Node.js runtime',
          language: 'reactNative',
          defaultTimeout: 3000,
          maxTimeout: 10000,
          supportedFeatures: ['react-native', 'jsx', 'components', 'hooks']
        }
      ],

      flutter: [
        {
          id: 'dart',
          name: 'Flutter (Dart)',
          description: 'Flutter framework with Dart runtime',
          language: 'flutter',
          defaultTimeout: 4000,
          maxTimeout: 12000,
          supportedFeatures: ['flutter', 'widgets', 'material', 'async']
        }
      ],

      // Swift - no runtime environments (UI and syntax only, like SwiftUI)
      swift: [],

      // SwiftUI - no runtime environments (UI framework)
      swiftui: [],

      // UI languages - no runtime environments
      html: [],
      css: [],
      json: []
    };

    return environments[language] || [];
  }

  /**
   * DEFAULT CONFIG: Create default code config for language (backend compatible)
   */
  static createDefaultConfig(language: Language, _category: QuestionCategory): CodeConfig {
    const runtimes = this.getRuntimeEnvironments(language);
    const defaultRuntime = runtimes.length > 0 ? runtimes[0] : undefined;

    return {
      entryFunction: this.getDefaultEntryFunction(language),
      runtime: (defaultRuntime?.id as CodeConfig['runtime']) || this.getLanguageDefaultRuntime(language),
      timeoutMs: defaultRuntime?.defaultTimeout || 3000,
      allowPreview: true
    };
  }

  /**
   * Get default runtime for language when no specific runtime environments are defined
   * Note: Swift and SwiftUI have no runtime (non-executable languages)
   */
  private static getLanguageDefaultRuntime(language: Language): 'node' | 'python' | 'sql' | 'dart' {
    const defaults: Partial<Record<Language, 'node' | 'python' | 'sql' | 'dart'>> = {
      javascript: 'node',
      typescript: 'node',
      react: 'node',
      reactNative: 'node',
      express: 'node',
      python: 'python',
      sql: 'sql',
      dart: 'dart',
      flutter: 'dart',
      html: 'node',
      css: 'node',
      json: 'node'
      // swift and swiftui have no runtime
    };

    return defaults[language] || 'node';
  }

  /**
   * VALIDATE: Code configuration validation (backend compatible)
   */
  static validateCodeConfig(
    config: CodeConfig, 
    language: Language, 
    category: QuestionCategory
  ): CodeConfigValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Logic questions require entry function and runtime
    if (category === 'logic') {
      if (!config.entryFunction?.trim()) {
        errors.push('Entry function name is required for logic questions');
      } else {
        // Validate function name format
        if (!this.isValidFunctionName(config.entryFunction, language)) {
          errors.push(`Invalid function name format for ${language}`);
        }
      }

      if (!config.runtime) {
        errors.push('Runtime environment is required for logic questions');
      } else {
        // Check if runtime is valid for backend (swift removed - no longer executable)
        const validBackendRuntimes = ['node', 'python', 'sql', 'dart'];
        if (!validBackendRuntimes.includes(config.runtime)) {
          errors.push(`Invalid runtime '${config.runtime}'. Must be one of: ${validBackendRuntimes.join(', ')}`);
        }
      }
    }

    // Timeout validation
    if (config.timeoutMs !== undefined) {
      if (config.timeoutMs < 100) {
        errors.push('Timeout must be at least 100ms');
      } else if (config.timeoutMs > 30000) {
        errors.push('Timeout cannot exceed 30 seconds');
      } else if (config.timeoutMs < 1000) {
        warnings.push('Very low timeout may cause valid solutions to fail');
      } else if (config.timeoutMs > 10000) {
        warnings.push('High timeout may allow inefficient solutions to pass');
      }
    }

    // SQL doesn't need entry function (backend rule)
    if (language === 'sql' && config.entryFunction) {
      warnings.push('SQL questions do not require an entry function');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config
    };
  }

  /**
   * Get default entry function name for language
   */
  private static getDefaultEntryFunction(language: Language): string {
    const defaults: Record<Language, string> = {
      javascript: 'solution',
      typescript: 'solution',
      python: 'solution',
      sql: '', // SQL doesn't need entry function
      dart: 'solution',
      express: 'createApp',
      react: 'component',
      reactNative: 'component',
      flutter: 'buildWidget',
      html: '',
      css: '',
      json: '',
      swift: '', // No code execution
      swiftui: ''
    };

    return defaults[language] || 'solution';
  }

  /**
   * Validate function name format for language
   */
  private static isValidFunctionName(name: string, language: Language): boolean {
    const patterns: Record<Language, RegExp> = {
      javascript: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
      typescript: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
      python: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      sql: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      dart: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      express: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
      react: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
      reactNative: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
      flutter: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      html: /.*/,
      css: /.*/,
      json: /.*/,
      swift: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      swiftui: /.*/
    };

    const pattern = patterns[language];
    return pattern ? pattern.test(name) : true;
  }

  /**
   * FUNCTION SIGNATURES: Get common function signatures for language
   */
  static getFunctionSignatures(language: Language): FunctionSignature[] {
    const signatures: Record<Language, FunctionSignature[]> = {
      javascript: [
        {
          name: 'solution',
          description: 'Main solution function',
          parameters: [{ name: 'input', type: 'any', description: 'Input parameter' }],
          returnType: 'any',
          example: 'function solution(input) { return input; }'
        },
        {
          name: 'calculate',
          description: 'Mathematical calculation function',
          parameters: [{ name: 'n', type: 'number', description: 'Number to process' }],
          returnType: 'number',
          example: 'function calculate(n) { return n * 2; }'
        }
      ],
      
      python: [
        {
          name: 'solution',
          description: 'Main solution function',
          parameters: [{ name: 'input', type: 'Any', description: 'Input parameter' }],
          returnType: 'Any',
          example: 'def solution(input):\n    return input'
        },
        {
          name: 'process_list',
          description: 'List processing function',
          parameters: [{ name: 'lst', type: 'List', description: 'List to process' }],
          returnType: 'Any',
          example: 'def process_list(lst):\n    return lst'
        }
      ],

      sql: [
        {
          name: 'query',
          description: 'Main SQL query',
          parameters: [],
          returnType: 'ResultSet',
          example: 'SELECT * FROM table;'
        }
      ],

      typescript: [],
      dart: [],
      express: [],
      react: [],
      reactNative: [],
      flutter: [],
      html: [],
      css: [],
      json: [],
      swift: [], // No code execution - UI and syntax only
      swiftui: []
    };

    return signatures[language] || [];
  }

  /**
   * PERFORMANCE: Get performance recommendations
   */
  static getPerformanceRecommendations(language: Language): string[] {
    const recommendations: Record<Language, string[]> = {
      javascript: [
        'Use const/let instead of var for better performance',
        'Avoid creating objects in loops',
        'Use array methods like map(), filter(), reduce() for better readability',
        'Consider using Set or Map for lookups instead of arrays'
      ],
      
      python: [
        'Use list comprehensions instead of loops when possible',
        'Use set() for membership testing instead of lists',
        'Avoid string concatenation in loops, use join() instead',
        'Use built-in functions like sum(), max(), min() when possible'
      ],

      sql: [
        'Use indexes on columns used in WHERE clauses',
        'Avoid SELECT * in production queries',
        'Use LIMIT to restrict result sets',
        'Consider using EXISTS instead of IN for subqueries'
      ],

      typescript: [],
      dart: [],
      express: [],
      react: [],
      reactNative: [],
      flutter: [],
      html: [],
      css: [],
      json: [],
      swift: [], // No code execution - UI and syntax only
      swiftui: []
    };

    return recommendations[language] || [];
  }

  /**
   * SECURITY: Get security recommendations
   */
  static getSecurityRecommendations(language: Language): string[] {
    const recommendations: Record<Language, string[]> = {
      javascript: [
        'Never use eval() with user input',
        'Validate and sanitize all inputs',
        'Use strict mode ("use strict")',
        'Avoid global variables'
      ],

      python: [
        'Never use eval() or exec() with user input',
        'Use parameterized queries for database operations',
        'Validate input types and ranges',
        'Be careful with pickle and other serialization methods'
      ],

      sql: [
        'Always use parameterized queries',
        'Never concatenate user input into SQL strings',
        'Use least privilege principle for database users',
        'Validate data types and ranges'
      ],

      typescript: [],
      dart: [],
      express: [],
      react: [],
      reactNative: [],
      flutter: [],
      html: [],
      css: [],
      json: [],
      swift: [], // No code execution - UI and syntax only
      swiftui: []
    };

    return recommendations[language] || [];
  }
}

/**
 * UTILITIES: Helper functions
 */
export const formatRuntimeForDisplay = (runtime: RuntimeEnvironment): string => {
  return `${runtime.name} (${runtime.description})`;
};

export const getRecommendedTimeout = (language: Language): number => {
  const timeouts: Record<Language, number> = {
    javascript: 3000,
    typescript: 3500,
    python: 3000,
    sql: 2000,
    dart: 3000,
    express: 5000,
    react: 3000,
    reactNative: 4000,
    flutter: 4000,
    html: 1000,
    css: 1000,
    json: 1000,
    swift: 3000,
    swiftui: 1000
  };

  return timeouts[language] || 3000;
};