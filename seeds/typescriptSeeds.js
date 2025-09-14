// seeds/typescriptSeeds.js - Comprehensive TypeScript questions with enhanced validation
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');

// Import enhanced utilities
const QuestionTemplateGenerator = require('../utils/questionTemplate');
const QuestionSeedValidator = require('../utils/seedValidator');
const BatchProcessor = require('../utils/batchProcessor');

// Comprehensive TypeScript questions data - 65 questions total
const typescriptQuestions = {
  // 25 Multiple Choice Questions (15 existing + 10 new)
  multipleChoice: [
    // Existing questions (updated)
    {
      title: 'TypeScript Type Declaration',
      description: 'Which symbol is used to declare a variable with a specific type in TypeScript?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-annotations', 'variables'],
      options: ['var', 'let', 'const', ':', 'type'],
      correctAnswer: 3
    },
    {
      title: 'TypeScript Interface Definition',
      description: 'Which keyword defines a contract for an object’s shape in TypeScript?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'interfaces', 'types'],
      options: ['class', 'interface', 'type', 'struct', 'enum'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Function Return Type',
      description: 'How do you specify a function’s return type in TypeScript?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-annotations', 'functions'],
      options: ['=> type', ': type', '-> type', 'return type', 'type =>'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Generic Function Syntax',
      description: 'Which syntax defines a generic function in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'generic-types', 'functions'],
      options: ['function<T>', '<T>function', 'function name<T>', 'generic<T>', 'T function'],
      correctAnswer: 2
    },
    {
      title: 'TypeScript Module Export',
      description: 'Which keyword exports a module in TypeScript?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'modules-ts', 'imports-exports'],
      options: ['import', 'export', 'module', 'require', 'declare'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Optional Chaining',
      description: 'Which operator accesses properties safely in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-annotations', 'error-handling'],
      options: ['.', '?.', '!', '??', '||'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Class Definition',
      description: 'Which keyword defines a class in TypeScript?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'classes'],
      options: ['struct', 'class', 'type', 'interface', 'enum'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Type Inference',
      description: 'When does TypeScript infer types automatically?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-inference', 'variables'],
      options: ['Only with var', 'During variable initialization', 'Only in functions', 'Never', 'Always'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Union Types',
      description: 'Which symbol defines a union type in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'union-types', 'types'],
      options: ['&', '|', ':', ',', '||'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Exception Handling',
      description: 'Which construct handles exceptions in TypeScript?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'error-handling', 'try-catch'],
      options: ['try/catch', 'try/except', 'throw/catch', 'error/rescue', 'try/finally'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Enum Definition',
      description: 'Which keyword defines an enum in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'types', 'interfaces'],
      options: ['enum', 'type', 'const', 'union', 'interface'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Access Modifiers',
      description: 'Which modifier restricts a property to a class in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'classes'],
      options: ['public', 'private', 'protected', 'static', 'readonly'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Type Aliases',
      description: 'Which keyword creates a type alias in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'types', 'type-annotations'],
      options: ['interface', 'type', 'alias', 'typedef', 'declare'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Generic Constraint',
      description: 'Which keyword constrains a generic type in TypeScript?',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'generic-types', 'functions'],
      options: ['extends', 'implements', 'with', 'restrict', 'constrain'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Type Assertions',
      description: 'Which operator performs type assertion in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-assertions', 'variables'],
      options: ['as', 'is', ':', '!', '??'],
      correctAnswer: 0
    },
    // New questions
    {
      title: 'TypeScript Intersection Types',
      description: 'Which symbol defines an intersection type in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'intersection-types', 'types'],
      options: ['|', '&', ':', ',', '&&'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Type Guards',
      description: 'Which keyword is commonly used in TypeScript type guards?',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-guards', 'type-annotations'],
      options: ['is', 'as', 'typeof', 'instanceof', 'in'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Utility Types',
      description: 'Which utility type makes all properties optional in TypeScript?',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'utility-types', 'types'],
      options: ['Partial', 'Required', 'Readonly', 'Pick', 'Omit'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Declaration Files',
      description: 'What is the typical file extension for TypeScript declaration files?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'declaration-files', 'modules-ts'],
      options: ['.ts', '.tsx', '.d.ts', '.js', '.json'],
      correctAnswer: 2
    },
    {
      title: 'TypeScript Decorators',
      description: 'What is required to use decorators in TypeScript?',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'decorators-ts', 'classes'],
      options: ['experimentalDecorators in tsconfig', 'strict mode', 'ES6 modules', 'node_modules', 'type annotations'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Namespaces',
      description: 'Which keyword defines a namespace in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'namespaces', 'modules-ts'],
      options: ['module', 'namespace', 'package', 'scope', 'declare'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Literal Types',
      description: 'Which of the following is a valid literal type in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'literal-types', 'types'],
      options: ['string', 'number', '"active"', 'boolean', 'object'],
      correctAnswer: 2
    },
    {
      title: 'TypeScript Conditional Types',
      description: 'Which keyword is used in TypeScript conditional types?',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'conditional-types', 'types'],
      options: ['extends', 'implements', 'if', 'when', 'restrict'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Non-Nullable Types',
      description: 'Which operator removes null and undefined from a type in TypeScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-annotations', 'error-handling'],
      options: ['!', '?.', '??', ':', 'as'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript tsconfig',
      description: 'Which tsconfig option enables strict type checking?',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'tsconfig', 'type-annotations'],
      options: ['strict', 'noImplicitAny', 'strictNullChecks', 'strictMode', 'typeCheck'],
      correctAnswer: 0
    }
  ],

  // 15 True/False Questions (existing, updated)
  trueFalse: [
    {
      title: 'TypeScript Superset',
      description: 'TypeScript is a superset of JavaScript.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'javascript'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Strict Null Checks',
      description: 'TypeScript’s strictNullChecks prevents null assignments by default.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-annotations', 'error-handling'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Interface Extension',
      description: 'Interfaces in TypeScript can extend other interfaces.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'interfaces', 'types'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Function Return Types',
      description: 'TypeScript requires explicit return types for all functions.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-annotations', 'functions'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Generics Reusability',
      description: 'Generics in TypeScript allow reusable type-safe code.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'generic-types', 'functions'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Module Compatibility',
      description: 'TypeScript modules are compatible with ES modules.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'modules-ts', 'imports-exports'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Private Fields',
      description: 'TypeScript classes support private fields with # syntax.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'classes'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Enum Types',
      description: 'Enums in TypeScript are only numeric.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'types'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Type Inference',
      description: 'TypeScript infers types for unannotated variables.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-inference', 'variables'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Runtime Error Handling',
      description: 'TypeScript changes JavaScript’s runtime error handling.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'error-handling', 'try-catch'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Union Types',
      description: 'Union types allow a variable to hold multiple types.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'union-types', 'types'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Type Aliases Scope',
      description: 'Type aliases can define primitive types only.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'types', 'type-annotations'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'TypeScript Protected Members',
      description: 'Protected members are accessible in subclasses.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'classes'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Generic Constraints',
      description: 'Generics in TypeScript can be constrained to specific types.',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['typescript', 'generic-types', 'functions'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'TypeScript Type Assertions Runtime',
      description: 'Type assertions change the runtime type of a variable.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-assertions', 'variables'],
      options: ['True', 'False'],
      correctAnswer: 1
    }
  ],

  // 15 Code Challenge Questions (10 existing + 5 new)
  // Fixed codeChallenge section for typescriptSeeds.js
  codeChallenge: [
    {
      title: 'Define a Typed Function',
      description: 'Write a TypeScript function that adds two numbers with explicit types.',
      difficulty: 'easy',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-annotations', 'functions', 'algorithms'],
      codeTemplate: `function add(a: number, b: number): number {
  // Write your code here
  // Return the sum of a and b
  
}`,
      codeConfig: {
        entryFunction: 'add',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [2, 3], expected: 5, hidden: false },
        { args: [0, 0], expected: 0, hidden: false },
        { args: [-1, 1], expected: 0, hidden: true },
        { args: [10, -5], expected: 5, hidden: true }
      ]
    },
    {
      title: 'Create a User Interface',
      description: 'Define an interface for a User with name and age properties, then create a function that returns a user object.',
      difficulty: 'easy',
      preferredCategory: 'logic',
      tags: ['typescript', 'interfaces', 'types', 'objects'],
      codeTemplate: `interface User {
  // Define the interface properties here
}

function createUser(name: string, age: number): User {
  // Write your code here
  // Return a User object with the given name and age
  
}`,
      codeConfig: {
        entryFunction: 'createUser',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['John', 30], expected: { name: 'John', age: 30 }, hidden: false },
        { args: ['Jane', 25], expected: { name: 'Jane', age: 25 }, hidden: false },
        { args: ['Bob', 40], expected: { name: 'Bob', age: 40 }, hidden: true },
        { args: ['Alice', 22], expected: { name: 'Alice', age: 22 }, hidden: true }
      ]
    },
    {
      title: 'Implement a Generic Array Reverse',
      description: 'Write a generic function that reverses an array of any type.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'generic-types', 'functions', 'algorithms'],
      codeTemplate: `function reverseArray<T>(arr: T[]): T[] {
  // Write your code here
  // Return a new array with elements in reverse order
  
}`,
      codeConfig: {
        entryFunction: 'reverseArray',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3]], expected: [3, 2, 1], hidden: false },
        { args: [['a', 'b', 'c']], expected: ['c', 'b', 'a'], hidden: false },
        { args: [[]], expected: [], hidden: true },
        { args: [[true, false]], expected: [false, true], hidden: true }
      ]
    },
    {
      title: 'Create a Car Class',
      description: 'Write a TypeScript class for a Car with make and model properties.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'classes', 'type-annotations', 'objects'],
      codeTemplate: `class Car {
  // Define class properties here
  
  constructor(make: string, model: string) {
    // Write your constructor logic here
    
  }
  
  getInfo(): string {
    // Write your method here
    // Return a string like "Toyota Camry"
    
  }
}

// Test function
function createCar(make: string, model: string): Car {
  return new Car(make, model);
}`,
      codeConfig: {
        entryFunction: 'createCar',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['Toyota', 'Camry'], expected: { make: 'Toyota', model: 'Camry' }, hidden: false },
        { args: ['Honda', 'Civic'], expected: { make: 'Honda', model: 'Civic' }, hidden: false },
        { args: ['Ford', 'Focus'], expected: { make: 'Ford', model: 'Focus' }, hidden: true },
        { args: ['BMW', 'X5'], expected: { make: 'BMW', model: 'X5' }, hidden: true }
      ]
    },
    {
      title: 'Handle Division by Zero',
      description: 'Write a function that handles division by zero with try/catch and proper TypeScript typing.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'error-handling', 'try-catch', 'functions'],
      codeTemplate: `function safeDivide(a: number, b: number): number | null {
  // Write your code here
  // Return the division result or null if division by zero
  
}`,
      codeConfig: {
        entryFunction: 'safeDivide',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [10, 2], expected: 5, hidden: false },
        { args: [10, 0], expected: null, hidden: false },
        { args: [0, 5], expected: 0, hidden: true },
        { args: [15, 3], expected: 5, hidden: true }
      ]
    },
    {
      title: 'Filter Even Numbers',
      description: 'Write a function to filter even numbers from an array with proper TypeScript typing.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-annotations', 'arrays', 'algorithms'],
      codeTemplate: `function filterEvens(numbers: number[]): number[] {
  // Write your code here
  // Return an array containing only even numbers
  
}`,
      codeConfig: {
        entryFunction: 'filterEvens',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3, 4, 5, 6]], expected: [2, 4, 6], hidden: false },
        { args: [[1, 3, 5]], expected: [], hidden: false },
        { args: [[2, 4, 6]], expected: [2, 4, 6], hidden: true },
        { args: [[-2, -1, 0, 1, 2]], expected: [-2, 0, 2], hidden: true }
      ]
    },
    {
      title: 'Create a Generic Pair Interface',
      description: 'Define a generic interface for a Pair and implement a function that creates pairs.',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['typescript', 'generic-types', 'interfaces', 'objects'],
      codeTemplate: `interface Pair<K, V> {
  // Define the interface properties here
}

function createPair<K, V>(key: K, value: V): Pair<K, V> {
  // Write your code here
  // Return a Pair object with the given key and value
  
}`,
      codeConfig: {
        entryFunction: 'createPair',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['name', 'John'], expected: { key: 'name', value: 'John' }, hidden: false },
        { args: [1, 'first'], expected: { key: 1, value: 'first' }, hidden: false },
        { args: [true, 42], expected: { key: true, value: 42 }, hidden: true },
        { args: ['id', 123], expected: { key: 'id', value: 123 }, hidden: true }
      ]
    },
    {
      title: 'Process Union Type Input',
      description: 'Write a function that handles string or number input and returns a formatted string.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'union-types', 'type-guards', 'functions'],
      codeTemplate: `function processInput(input: string | number): string {
  // Write your code here
  // If input is a string, return it as-is
  // If input is a number, convert it to string
  
}`,
      codeConfig: {
        entryFunction: 'processInput',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [123], expected: '123', hidden: false },
        { args: ['hello'], expected: 'hello', hidden: false },
        { args: [0], expected: '0', hidden: true },
        { args: ['world'], expected: 'world', hidden: true }
      ]
    },
    {
      title: 'Map Object Properties',
      description: 'Write a function that maps object keys to uppercase using TypeScript.',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-annotations', 'objects', 'algorithms'],
      codeTemplate: `function mapKeysToUpper(obj: Record<string, any>): Record<string, any> {
  // Write your code here
  // Return a new object with all keys converted to uppercase
  
}`,
      codeConfig: {
        entryFunction: 'mapKeysToUpper',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{ name: 'John', age: 30 }], expected: { NAME: 'John', AGE: 30 }, hidden: false },
        { args: [{}], expected: {}, hidden: false },
        { args: [{ key: 'value', test: 123 }], expected: { KEY: 'value', TEST: 123 }, hidden: true },
        { args: [{ a: 1, b: 2, c: 3 }], expected: { A: 1, B: 2, C: 3 }, hidden: true }
      ]
    },
    {
      title: 'Implement Type Guard',
      description: 'Write a type guard function to check if a value is a string.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-guards', 'type-annotations', 'functions'],
      codeTemplate: `function isString(value: unknown): value is string {
  // Write your code here
  // Return true if value is a string, false otherwise
  
}`,
      codeConfig: {
        entryFunction: 'isString',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['hello'], expected: true, hidden: false },
        { args: [123], expected: false, hidden: false },
        { args: [null], expected: false, hidden: true },
        { args: [undefined], expected: false, hidden: true }
      ]
    },
    {
      title: 'Parse JSON with Type Safety',
      description: 'Write a function to parse JSON with proper error handling and TypeScript typing.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-annotations', 'error-handling', 'functions'],
      codeTemplate: `function parseJson<T>(jsonString: string): T | null {
  // Write your code here
  // Parse the JSON string and return the result
  // Return null if parsing fails
  
}`,
      codeConfig: {
        entryFunction: 'parseJson',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['{"name": "John", "age": 30}'], expected: { name: 'John', age: 30 }, hidden: false },
        { args: ['invalid json'], expected: null, hidden: false },
        { args: ['{"key": "value"}'], expected: { key: 'value' }, hidden: true },
        { args: ['[1, 2, 3]'], expected: [1, 2, 3], hidden: true }
      ]
    },
    {
      title: 'Implement Enum Usage',
      description: 'Define an enum for colors and implement a function that returns the enum value.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'types', 'enums', 'functions'],
      codeTemplate: `enum Color {
  Red = 0,
  Green = 1,
  Blue = 2
}

function getColorValue(colorName: keyof typeof Color): number {
  // Write your code here
  // Return the numeric value of the color enum
  
}`,
      codeConfig: {
        entryFunction: 'getColorValue',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['Red'], expected: 0, hidden: false },
        { args: ['Green'], expected: 1, hidden: false },
        { args: ['Blue'], expected: 2, hidden: true }
      ]
    },
    {
      title: 'Calculate Array Sum with Generics',
      description: 'Write a generic function that calculates the sum of numeric values in an array.',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['typescript', 'generic-types', 'arrays', 'algorithms'],
      codeTemplate: `function sumArray(numbers: number[]): number {
  // Write your code here
  // Return the sum of all numbers in the array
  
}`,
      codeConfig: {
        entryFunction: 'sumArray',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3, 4]], expected: 10, hidden: false },
        { args: [[-1, 1, -2, 2]], expected: 0, hidden: false },
        { args: [[]], expected: 0, hidden: true },
        { args: [[5, 10, 15]], expected: 30, hidden: true }
      ]
    },
    {
      title: 'Create Optional Properties Function',
      description: 'Write a function that works with optional properties using TypeScript.',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-annotations', 'optional-properties', 'functions'],
      codeTemplate: `interface UserProfile {
  name: string;
  age?: number;
  email?: string;
}

function createProfile(name: string, age?: number, email?: string): UserProfile {
  // Write your code here
  // Return a UserProfile object with the given properties
  
}`,
      codeConfig: {
        entryFunction: 'createProfile',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['John', 30, 'john@email.com'], expected: { name: 'John', age: 30, email: 'john@email.com' }, hidden: false },
        { args: ['Jane'], expected: { name: 'Jane' }, hidden: false },
        { args: ['Bob', 25], expected: { name: 'Bob', age: 25 }, hidden: true },
        { args: ['Alice', undefined, 'alice@email.com'], expected: { name: 'Alice', email: 'alice@email.com' }, hidden: true }
      ]
    }
  ],

  // Fixed codeDebugging section for typescriptSeeds.js
  codeDebugging: [
    {
      title: 'Fix Type Annotation',
      description: 'This function lacks type annotations. Fix it to enforce number types.',
      difficulty: 'easy',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-annotations', 'functions', 'debugging'],
      buggyCode: `function add(a, b) {
  return a + b;
}`,
      solutionCode: `function add(a: number, b: number): number {
  return a + b;
}`,
      codeConfig: {
        entryFunction: 'add',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [2, 3], expected: 5, hidden: false },
        { args: [0, 0], expected: 0, hidden: false },
        { args: [-1, 1], expected: 0, hidden: true },
        { args: [10, 5], expected: 15, hidden: true }
      ]
    },
    {
      title: 'Fix Interface Usage',
      description: 'This interface usage is incorrect. Fix the object to match the User interface.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'interfaces', 'types', 'debugging'],
      buggyCode: `interface User {
  name: string;
  age: number;
}

function createUser(name: string): User {
  return { name: name };
}`,
      solutionCode: `interface User {
  name: string;
  age: number;
}

function createUser(name: string, age: number = 0): User {
  return { name: name, age: age };
}`,
      codeConfig: {
        entryFunction: 'createUser',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['John', 30], expected: { name: 'John', age: 30 }, hidden: false },
        { args: ['Jane'], expected: { name: 'Jane', age: 0 }, hidden: false },
        { args: ['Bob', 25], expected: { name: 'Bob', age: 25 }, hidden: true },
        { args: ['Alice'], expected: { name: 'Alice', age: 0 }, hidden: true }
      ]
    },
    {
      title: 'Fix Generic Function',
      description: 'This generic function has incorrect typing. Fix the generic type annotations.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'generic-types', 'functions', 'debugging'],
      buggyCode: `function getFirst(arr) {
  return arr[0];
}`,
      solutionCode: `function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}`,
      codeConfig: {
        entryFunction: 'getFirst',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3]], expected: 1, hidden: false },
        { args: [['a', 'b', 'c']], expected: 'a', hidden: false },
        { args: [[]], expected: undefined, hidden: true },
        { args: [[true, false]], expected: true, hidden: true }
      ]
    },
    {
      title: 'Fix Class Property',
      description: 'This class property is untyped. Add proper type annotations.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'classes', 'type-annotations', 'debugging'],
      buggyCode: `class Person {
  name;
  constructor(name) {
    this.name = name;
  }
  
  getName() {
    return this.name;
  }
}

function createPerson(name: string): Person {
  return new Person(name);
}`,
      solutionCode: `class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  
  getName(): string {
    return this.name;
  }
}

function createPerson(name: string): Person {
  return new Person(name);
}`,
      codeConfig: {
        entryFunction: 'createPerson',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['John'], expected: { name: 'John' }, hidden: false },
        { args: ['Jane'], expected: { name: 'Jane' }, hidden: false },
        { args: ['Bob'], expected: { name: 'Bob' }, hidden: true },
        { args: ['Alice'], expected: { name: 'Alice' }, hidden: true }
      ]
    },
    {
      title: 'Fix Exception Handling',
      description: 'This function lacks error handling. Add try/catch for JSON parsing.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'error-handling', 'try-catch', 'debugging'],
      buggyCode: `function parseJson(json: string): any {
  return JSON.parse(json);
}`,
      solutionCode: `function parseJson(json: string): any {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}`,
      codeConfig: {
        entryFunction: 'parseJson',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['{"key": "value"}'], expected: { key: 'value' }, hidden: false },
        { args: ['invalid json'], expected: null, hidden: false },
        { args: ['{"age": 30}'], expected: { age: 30 }, hidden: true },
        { args: ['[1,2,3]'], expected: [1, 2, 3], hidden: true }
      ]
    },
    {
      title: 'Fix Array Type',
      description: 'This array lacks type safety. Fix the type annotation.',
      difficulty: 'easy',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-annotations', 'arrays', 'debugging'],
      buggyCode: `function getFirstNumber(numbers) {
  return numbers[0];
}`,
      solutionCode: `function getFirstNumber(numbers: number[]): number | undefined {
  return numbers[0];
}`,
      codeConfig: {
        entryFunction: 'getFirstNumber',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3]], expected: 1, hidden: false },
        { args: [[5, 10]], expected: 5, hidden: false },
        { args: [[]], expected: undefined, hidden: true },
        { args: [[42]], expected: 42, hidden: true }
      ]
    },
    {
      title: 'Fix Union Type',
      description: 'This union type usage is incorrect. Fix the function logic to handle both string and number types.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'union-types', 'type-guards', 'debugging'],
      buggyCode: `function process(input: string | number): string {
  return input.length;
}`,
      solutionCode: `function process(input: string | number): string {
  if (typeof input === 'string') {
    return input;
  }
  return input.toString();
}`,
      codeConfig: {
        entryFunction: 'process',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['hello'], expected: 'hello', hidden: false },
        { args: [123], expected: '123', hidden: false },
        { args: ['world'], expected: 'world', hidden: true },
        { args: [456], expected: '456', hidden: true }
      ]
    },
    {
      title: 'Fix Enum Usage',
      description: 'This enum is used incorrectly. Fix the enum access.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'types', 'enums', 'debugging'],
      buggyCode: `enum Color { Red, Blue, Green }

function getColor(): number {
  return Color[0];
}`,
      solutionCode: `enum Color { Red, Blue, Green }

function getColor(): number {
  return Color.Red;
}`,
      codeConfig: {
        entryFunction: 'getColor',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [], expected: 0, hidden: false }
      ]
    },
    {
      title: 'Fix Optional Properties',
      description: 'This function doesn\'t handle optional properties correctly. Fix the interface and function.',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['typescript', 'optional-properties', 'interfaces', 'debugging'],
      buggyCode: `interface User {
  name: string;
  age: number;
}

function createUser(name: string, age?: number): User {
  return { name };
}`,
      solutionCode: `interface User {
  name: string;
  age?: number;
}

function createUser(name: string, age?: number): User {
  const user: User = { name };
  if (age !== undefined) {
    user.age = age;
  }
  return user;
}`,
      codeConfig: {
        entryFunction: 'createUser',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ['John', 30], expected: { name: 'John', age: 30 }, hidden: false },
        { args: ['Jane'], expected: { name: 'Jane' }, hidden: false },
        { args: ['Bob', 25], expected: { name: 'Bob', age: 25 }, hidden: true },
        { args: ['Alice'], expected: { name: 'Alice' }, hidden: true }
      ]
    },
    {
      title: 'Fix Return Type Annotation',
      description: 'This function has an incorrect return type. Fix the return type annotation.',
      difficulty: 'easy',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-annotations', 'functions', 'debugging'],
      buggyCode: `function isEven(num: number): string {
  return num % 2 === 0;
}`,
      solutionCode: `function isEven(num: number): boolean {
  return num % 2 === 0;
}`,
      codeConfig: {
        entryFunction: 'isEven',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [4], expected: true, hidden: false },
        { args: [3], expected: false, hidden: false },
        { args: [0], expected: true, hidden: true },
        { args: [7], expected: false, hidden: true }
      ]
    }
  ],

  // 15 Fill-in-the-Blank Questions (new)
  fillInTheBlank: [
    {
      title: 'Complete Type Annotation',
      description: 'Complete the type annotation for a function that returns a number.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'type-annotations', 'functions'],
      codeTemplate: `function add(a: number, b: number) ___blank1___ {
  return a + b;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: [': number'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: 'Complete Interface Definition',
      description: 'Complete the interface definition for a User with name and age.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['typescript', 'interfaces', 'types'],
      codeTemplate: `___blank1___ User {
  name: string;
  age: number;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['interface'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Generic Function',
      description: 'Complete the generic function to return the first element of an array.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'generic-types', 'functions'],
      codeTemplate: `function getFirst___blank1___(arr: T[]): T | undefined {
  return arr[0];
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['<T>'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: 'Complete Type Alias',
      description: 'Complete the type alias for a string or number.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'types', 'union-types'],
      codeTemplate: `___blank1___ StringOrNumber = string ___blank2___ number;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['type'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['|'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: 'Complete Class Definition',
      description: 'Complete the class definition with a constructor.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'classes', 'type-annotations'],
      codeTemplate: `class Car {
  make: string;
  model: string;
  
  ___blank1___(make: string, model: string) {
    this.make = make;
    this.model = model;
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['constructor'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Try-Catch Block',
      description: 'Complete the try-catch block for error handling.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'error-handling', 'try-catch'],
      codeTemplate: `___blank1___ {
  JSON.parse('invalid');
} ___blank2___ (error) {
  return null;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['try'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['catch'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Module Export',
      description: 'Complete the export statement for a function.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'modules-ts', 'imports-exports'],
      codeTemplate: `___blank1___ function sum(a: number, b: number): number {
  return a + b;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['export'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Union Type Function',
      description: 'Complete the function to handle a union type.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['typescript', 'union-types', 'type-guards'],
      codeTemplate: `function process(input: string | number): string {
  if (___blank1___ input === 'string') {
    return input;
  }
  return input.toString();
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['typeof'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Enum Definition',
      description: 'Complete the enum definition for colors.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'types'],
      codeTemplate: `___blank1___ Color {
  Red,
  Blue,
  Green
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['enum'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Type Guard',
      description: 'Complete the type guard to check if a value is a string.',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['typescript', 'type-guards', 'type-annotations'],
      codeTemplate: `function isString(value: any): value ___blank1___ string {
  return typeof value === 'string';
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['is'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: 'Complete Access Modifier',
      description: 'Complete the class with a private property.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'classes', 'type-annotations'],
      codeTemplate: `class Person {
  ___blank1___ name: string;
  constructor(name: string) {
    this.name = name;
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['private'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Generic Constraint',
      description: 'Complete the generic function with a type constraint.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'generic-types', 'functions'],
      codeTemplate: `function printLength<T ___blank1___ { length: number }>(item: T): number {
  return item.length;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['extends'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Utility Type',
      description: 'Complete the utility type to make properties optional.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'utility-types', 'types'],
      codeTemplate: `interface User {
  name: string;
  age: number;
}

type OptionalUser = ___blank1___<User>;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Partial'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Namespace',
      description: 'Complete the namespace definition.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['typescript', 'namespaces', 'modules-ts'],
      codeTemplate: `___blank1___ Utils {
  export function add(a: number, b: number): number {
    return a + b;
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['namespace'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Declaration File',
      description: 'Complete the declaration file syntax.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['typescript', 'declaration-files', 'modules-ts'],
      codeTemplate: `___blank1___ module 'my-module' {
  export function example(): void;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['declare'], caseSensitive: false, points: 1 }
      ]
    }
  ]
};

async function seedTypescriptQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE TypeScript question seeding with enhanced validation...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Get super organization and user
    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    console.log(`🏢 Using organization: ${superOrg.name}`);
    console.log(`👤 Using user: ${superUser.name || 'Admin User'}\n`);

    // Count questions by type with enhanced stats
    const questionCounts = Object.entries(typescriptQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(typescriptQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = typescriptQuestions.fillInTheBlank.length;
    const totalBlanks = typescriptQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);

    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('typescript');

    // Delete existing TypeScript questions
    await processor.deleteByLanguage('typescript');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(typescriptQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'typescript', status: 'active' },
            superOrg._id,
            superUser._id
          );
          allQuestions.push(templated);
        } catch (error) {
          console.error(`  ❌ Template generation failed for "${questionData.title}": ${error.message}`);
        }
      }
    }

    console.log(`📊 Generated ${allQuestions.length} templated questions\n`);

    // Enhanced validation with comprehensive testing
    console.log('🔍 Running COMPREHENSIVE validation with enhanced fill-in-blank testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Includes comprehensive fill-in-blank grading validation
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'TypeScript');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE TypeScript question seeding completed successfully!');
      console.log(`📈 Final count: ${insertResults.success} questions inserted`);
      console.log(`⏱️  Total time: ${duration} seconds`);
      console.log(`🚀 Performance: ${(insertResults.success / parseFloat(duration)).toFixed(1)} questions/second`);

      // Enhanced validation breakdown
      if (validationResults.summary) {
        console.log(`\n📊 Validation Results:`);
        console.log(`   ✅ Valid: ${validationResults.summary.valid}/${validationResults.summary.total} (${((validationResults.summary.valid / validationResults.summary.total) * 100).toFixed(1)}%)`);
        console.log(`   ❌ Invalid: ${validationResults.summary.invalid}/${validationResults.summary.total}`);
        console.log(`   ⚠️  With Warnings: ${validationResults.summary.warnings}`);
      }

      // Show detailed question type breakdown
      const insertedByType = {};
      allQuestions.forEach(q => {
        insertedByType[q.type] = (insertedByType[q.type] || 0) + 1;
      });

      console.log(`\n🎯 Question Type Breakdown:`);
      Object.entries(insertedByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} questions`);
      });

      // Show invalid questions if any
      if (validationResults.invalidQuestions.length > 0) {
        console.log(`\n❌ ${validationResults.invalidQuestions.length} questions failed validation:`);
        validationResults.invalidQuestions.forEach(({ question, result }) => {
          console.log(`   - ${question.title}: ${result.errors.join(', ')}`);
        });
      }

      // Return the inserted questions for the master script
      return await Question.find({ language: 'typescript' }).select('_id title type');

    } else {
      console.log('❌ No valid questions to insert');

      // Restore backup if available
      if (backup) {
        console.log('🔄 Restoring from backup...');
        await processor.restoreFromBackup(backup);
      }

      return [];
    }

  } catch (error) {
    console.error('💥 TypeScript seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedTypescriptQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive TypeScript questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust fill-in-blank validation!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed TypeScript questions:', error);
      process.exit(1);
    });
}

module.exports = { seedTypescriptQuestions, typescriptQuestions };