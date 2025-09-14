// seeds/dartSeeds.js - Comprehensive Dart questions (65 total questions)
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

// Comprehensive Dart questions data - 65 questions total
const dartQuestions = {
  // 25 Multiple Choice Questions
  multipleChoice: [
    {
      title: 'Dart Variables',
      description: 'Which keyword declares a variable that can be reassigned in Dart?',
      difficulty: 'easy',
      tags: ['dart', 'variables'],
      options: ['final', 'const', 'var', 'static'],
      correctAnswer: 2
    },
    {
      title: 'Dart Functions',
      description: 'Which syntax defines a function in Dart?',
      difficulty: 'easy',
      tags: ['dart', 'functions'],
      options: ['function name() {}', 'def name():', 'void name() {}', 'name() => {}'],
      correctAnswer: 2
    },
    {
      title: 'Dart Classes',
      description: 'Which keyword defines a class in Dart?',
      difficulty: 'easy',
      tags: ['dart', 'classes'],
      options: ['struct', 'class', 'type', 'object'],
      correctAnswer: 1
    },
    {
      title: 'Dart Null Safety',
      description: 'Which operator allows safe property access in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'variables'],
      options: ['.', '?.', '!', '??'],
      correctAnswer: 1
    },
    {
      title: 'Dart Lists',
      description: 'Which method adds an element to a Dart List?',
      difficulty: 'easy',
      tags: ['dart', 'data-structures'],
      options: ['push()', 'add()', 'append()', 'insert()'],
      correctAnswer: 1
    },
    {
      title: 'Dart Futures',
      description: 'Which keyword is used to handle asynchronous operations in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'async-programming'],
      options: ['async', 'await', 'future', 'promise'],
      correctAnswer: 0
    },
    {
      title: 'Dart Constructors',
      description: 'Which syntax defines a named constructor in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'classes'],
      options: ['ClassName()', 'ClassName.named()', 'ClassName::named()', 'new ClassName()'],
      correctAnswer: 1
    },
    {
      title: 'Dart Type System',
      description: 'Which type allows any value in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'variables'],
      options: ['dynamic', 'var', 'Object', 'any'],
      correctAnswer: 0
    },
    {
      title: 'Dart String Interpolation',
      description: 'Which syntax is used for string interpolation in Dart?',
      difficulty: 'easy',
      tags: ['dart', 'strings'],
      options: ['${}', '#{}', '%{}', '{}'],
      correctAnswer: 0
    },
    {
      title: 'Dart Generics',
      description: 'Which syntax defines a generic class in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'classes'],
      options: ['class Name<T>', 'class Name(T)', 'class<T> Name', 'generic Name<T>'],
      correctAnswer: 0
    },
    {
      title: 'Dart Exception Handling',
      description: 'Which keyword catches exceptions in Dart?',
      difficulty: 'easy',
      tags: ['dart', 'error-handling'],
      options: ['try', 'catch', 'except', 'handle'],
      correctAnswer: 1
    },
    {
      title: 'Dart Lists Methods',
      description: 'Which method removes the last element from a Dart List?',
      difficulty: 'easy',
      tags: ['dart', 'data-structures'],
      options: ['pop()', 'removeLast()', 'deleteLast()', 'remove()'],
      correctAnswer: 1
    },
    {
      title: 'Dart Async/Await',
      description: 'Which keyword waits for a Future to complete in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'async-programming'],
      options: ['async', 'await', 'then', 'future'],
      correctAnswer: 1
    },
    {
      title: 'Dart Enums',
      description: 'Which keyword defines an enum in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'data-structures'],
      options: ['enum', 'type', 'const', 'union'],
      correctAnswer: 0
    },
    {
      title: 'Dart Maps',
      description: 'Which method retrieves a value from a Dart Map?',
      difficulty: 'medium',
      tags: ['dart', 'data-structures'],
      options: ['get()', 'value()', '[]', 'fetch()'],
      correctAnswer: 2
    },
    {
      title: 'Dart Inheritance',
      description: 'Which keyword is used for inheritance in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'classes'],
      options: ['inherits', 'extends', 'implements', 'super'],
      correctAnswer: 1
    },
    {
      title: 'Dart Abstract Classes',
      description: 'Which keyword defines an abstract class in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'classes'],
      options: ['abstract', 'interface', 'virtual', 'base'],
      correctAnswer: 0
    },
    {
      title: 'Dart Collections',
      description: 'Which collection maintains insertion order in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'data-structures'],
      options: ['Set', 'List', 'Map', 'All of the above'],
      correctAnswer: 3
    },
    {
      title: 'Dart Stream',
      description: 'Which keyword is used to listen to a Stream in Dart?',
      difficulty: 'hard',
      tags: ['dart', 'async-programming'],
      options: ['listen', 'await for', 'forEach', 'subscribe'],
      correctAnswer: 1
    },
    {
      title: 'Dart Mixins',
      description: 'Which keyword is used to apply a mixin in Dart?',
      difficulty: 'hard',
      tags: ['dart', 'classes'],
      options: ['mixin', 'with', 'uses', 'include'],
      correctAnswer: 1
    },
    {
      title: 'Dart Cascade Operator',
      description: 'Which operator allows multiple operations on the same object?',
      difficulty: 'medium',
      tags: ['dart', 'operators'],
      options: ['..', '->', '=>', '?.'],
      correctAnswer: 0
    },
    {
      title: 'Dart Final vs Const',
      description: 'What is the main difference between final and const in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'variables'],
      options: ['No difference', 'const is compile-time constant', 'final is compile-time constant', 'const is mutable'],
      correctAnswer: 1
    },
    {
      title: 'Dart Factory Constructor',
      description: 'Which keyword is used to create a factory constructor?',
      difficulty: 'hard',
      tags: ['dart', 'classes'],
      options: ['factory', 'static', 'new', 'create'],
      correctAnswer: 0
    },
    {
      title: 'Dart Extension Methods',
      description: 'Which keyword is used to create extension methods?',
      difficulty: 'hard',
      tags: ['dart', 'classes'],
      options: ['extend', 'extension', 'mixin', 'with'],
      correctAnswer: 1
    },
    {
      title: 'Dart Typedef',
      description: 'What is the purpose of typedef in Dart?',
      difficulty: 'medium',
      tags: ['dart', 'functions'],
      options: ['Define new types', 'Create function aliases', 'Import libraries', 'Define classes'],
      correctAnswer: 1
    }
  ],

  // 15 True/False Questions
  trueFalse: [
    {
      title: 'Dart Null Safety',
      description: 'Dart\'s null safety prevents null reference errors at compile time.',
      difficulty: 'medium',
      tags: ['dart', 'variables'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart Type System',
      description: 'Dart is a dynamically typed language.',
      difficulty: 'easy',
      tags: ['dart', 'variables'],
      options: ['true', 'false'],
      correctAnswer: 1 // false - Dart is strongly typed with type inference
    },
    {
      title: 'Dart Functions',
      description: 'Functions in Dart can have optional parameters.',
      difficulty: 'medium',
      tags: ['dart', 'functions'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart Classes',
      description: 'All Dart classes inherit from Object.',
      difficulty: 'medium',
      tags: ['dart', 'classes'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart Async',
      description: 'All Dart Futures complete synchronously.',
      difficulty: 'medium',
      tags: ['dart', 'async-programming'],
      options: ['true', 'false'],
      correctAnswer: 1 // false
    },
    {
      title: 'Dart Lists',
      description: 'Dart Lists are fixed-length by default.',
      difficulty: 'easy',
      tags: ['dart', 'data-structures'],
      options: ['true', 'false'],
      correctAnswer: 1 // false - Lists are growable by default
    },
    {
      title: 'Dart Enums',
      description: 'Dart enums can have methods.',
      difficulty: 'medium',
      tags: ['dart', 'data-structures'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart Exception Handling',
      description: 'Dart uses try/catch for exception handling.',
      difficulty: 'easy',
      tags: ['dart', 'error-handling'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart String Interpolation',
      description: 'Dart supports string interpolation with ${}.',
      difficulty: 'easy',
      tags: ['dart', 'strings'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart Generics',
      description: 'Dart generics can be used with collections only.',
      difficulty: 'medium',
      tags: ['dart', 'classes'],
      options: ['true', 'false'],
      correctAnswer: 1 // false - generics work with classes, functions, etc.
    },
    {
      title: 'Dart Futures',
      description: 'Futures in Dart represent asynchronous operations.',
      difficulty: 'medium',
      tags: ['dart', 'async-programming'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart Variables',
      description: 'Variables declared with const can be modified at runtime.',
      difficulty: 'easy',
      tags: ['dart', 'variables'],
      options: ['true', 'false'],
      correctAnswer: 1 // false
    },
    {
      title: 'Dart Constructors',
      description: 'Dart supports multiple constructors per class.',
      difficulty: 'medium',
      tags: ['dart', 'classes'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart Maps',
      description: 'Dart Maps maintain insertion order.',
      difficulty: 'medium',
      tags: ['dart', 'data-structures'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'Dart Type Inference',
      description: 'Dart can infer types for untyped variables.',
      difficulty: 'medium',
      tags: ['dart', 'variables'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    }
  ],

  // 10 Code Challenge Questions
  // 10 Code Challenge Questions with Code Templates
  // Fixed codeChallenge section for dartSeeds.js
codeChallenge: [
  {
    title: 'Calculate Square',
    description: 'Write a Dart function that calculates the square of a number.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['dart', 'functions', 'algorithms'],
    codeTemplate: `int square(int n) {
  // Write your code here
  
}`,
    codeConfig: {
      entryFunction: 'square',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [5], expected: 25, hidden: false },
      { args: [0], expected: 0, hidden: false },
      { args: [-3], expected: 9, hidden: true },
      { args: [10], expected: 100, hidden: true }
    ]
  },
  {
    title: 'Sum List Elements',
    description: 'Write a Dart function that returns the sum of all elements in a list.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['dart', 'data-structures', 'algorithms'],
    codeTemplate: `int sumList(List<int> numbers) {
  // Write your code here
  // Hint: You can use a for loop or the fold method
  
}`,
    codeConfig: {
      entryFunction: 'sumList',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 3, 4]], expected: 10, hidden: false },
      { args: [[]], expected: 0, hidden: false },
      { args: [[-1, 1, -2, 2]], expected: 0, hidden: true },
      { args: [[5, 5, 5]], expected: 15, hidden: true }
    ]
  },
  {
    title: 'Find Maximum',
    description: 'Write a Dart function that finds the maximum number in a list.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'algorithms', 'data-structures'],
    codeTemplate: `int findMax(List<int> numbers) {
  // Write your code here
  // Hint: Consider what to return for an empty list
  
}`,
    codeConfig: {
      entryFunction: 'findMax',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 3, 2, 5, 4]], expected: 5, hidden: false },
      { args: [[-1, -3, -2]], expected: -1, hidden: false },
      { args: [[10]], expected: 10, hidden: true },
      { args: [[0, 100, 50]], expected: 100, hidden: true }
    ]
  },
  {
    title: 'Count Vowels',
    description: 'Write a Dart function that counts the number of vowels in a string.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'algorithms', 'strings'],
    codeTemplate: `int countVowels(String text) {
  // Write your code here
  // Hint: Consider both uppercase and lowercase vowels (a, e, i, o, u)
  
}`,
    codeConfig: {
      entryFunction: 'countVowels',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['hello'], expected: 2, hidden: false },
      { args: ['aeiou'], expected: 5, hidden: false },
      { args: ['bcdfg'], expected: 0, hidden: true },
      { args: ['Dart Programming'], expected: 4, hidden: true }
    ]
  },
  {
    title: 'Reverse String',
    description: 'Write a Dart function that reverses a string.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'algorithms', 'strings'],
    codeTemplate: `String reverseString(String text) {
  // Write your code here
  // Hint: You can use split('').reversed.join('') or a loop
  
}`,
    codeConfig: {
      entryFunction: 'reverseString',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['hello'], expected: 'olleh', hidden: false },
      { args: ['dart'], expected: 'trad', hidden: false },
      { args: [''], expected: '', hidden: true },
      { args: ['a'], expected: 'a', hidden: true }
    ]
  },
  {
    title: 'Is Palindrome',
    description: 'Write a Dart function that checks if a string is a palindrome.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'algorithms', 'strings'],
    codeTemplate: `bool isPalindrome(String text) {
  // Write your code here
  // Hint: Compare the string with its reverse
  
}`,
    codeConfig: {
      entryFunction: 'isPalindrome',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['racecar'], expected: true, hidden: false },
      { args: ['hello'], expected: false, hidden: false },
      { args: ['a'], expected: true, hidden: true },
      { args: ['madam'], expected: true, hidden: true }
    ]
  },
  {
    title: 'Calculate Factorial',
    description: 'Write a Dart function that calculates the factorial of a number.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'algorithms', 'recursion'],
    codeTemplate: `int factorial(int n) {
  // Write your code here
  // Remember: 0! = 1, and n! = n * (n-1) * ... * 1
  
}`,
    codeConfig: {
      entryFunction: 'factorial',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [5], expected: 120, hidden: false },
      { args: [0], expected: 1, hidden: false },
      { args: [1], expected: 1, hidden: true },
      { args: [4], expected: 24, hidden: true }
    ]
  },
  {
    title: 'Filter Even Numbers',
    description: 'Write a Dart function that filters even numbers from a list.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'data-structures', 'algorithms'],
    codeTemplate: `List<int> filterEvens(List<int> numbers) {
  // Write your code here
  // Hint: Use the where() method or a for loop with modulo operator
  
}`,
    codeConfig: {
      entryFunction: 'filterEvens',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 3, 4, 5, 6]], expected: [2, 4, 6], hidden: false },
      { args: [[1, 3, 5]], expected: [], hidden: false },
      { args: [[2, 4, 6]], expected: [2, 4, 6], hidden: true },
      { args: [[]], expected: [], hidden: true }
    ]
  },
  {
    title: 'Convert to Uppercase',
    description: 'Write a Dart function that converts all strings in a list to uppercase.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['dart', 'strings', 'data-structures'],
    codeTemplate: `List<String> toUppercaseList(List<String> strings) {
  // Write your code here
  // Hint: Use the map() method with toUpperCase()
  
}`,
    codeConfig: {
      entryFunction: 'toUppercaseList',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [['hello', 'world']], expected: ['HELLO', 'WORLD'], hidden: false },
      { args: [['dart']], expected: ['DART'], hidden: false },
      { args: [[]], expected: [], hidden: true },
      { args: [['a', 'b', 'c']], expected: ['A', 'B', 'C'], hidden: true }
    ]
  },
  {
    title: 'Find Common Elements',
    description: 'Write a Dart function that finds common elements between two lists.',
    difficulty: 'hard',
    preferredCategory: 'logic',
    tags: ['dart', 'algorithms', 'data-structures'],
    codeTemplate: `List<dynamic> findCommon(List<dynamic> list1, List<dynamic> list2) {
  // Write your code here
  // Hint: Use the where() method or Set intersection
  
}`,
    codeConfig: {
      entryFunction: 'findCommon',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 3], [2, 3, 4]], expected: [2, 3], hidden: false },
      { args: [['a', 'b'], ['b', 'c']], expected: ['b'], hidden: false },
      { args: [[1, 2], [3, 4]], expected: [], hidden: true },
      { args: [[], [1, 2]], expected: [], hidden: true }
    ]
  }
],

// Fixed codeDebugging section for dartSeeds.js  
codeDebugging: [
  {
    title: 'Fix Variable Type Error',
    description: 'This variable declaration causes a type error. Fix the logic.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['dart', 'variables', 'debugging'],
    buggyCode: `int addNumbers(String a, String b) {
  return a + b;
}`,
    solutionCode: `int addNumbers(String a, String b) {
  return int.parse(a) + int.parse(b);
}`,
    codeConfig: {
      entryFunction: 'addNumbers',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['5', '3'], expected: 8, hidden: false },
      { args: ['10', '20'], expected: 30, hidden: false },
      { args: ['0', '0'], expected: 0, hidden: true },
      { args: ['1', '9'], expected: 10, hidden: true }
    ]
  },
  {
    title: 'Fix List Access Error',
    description: 'This function has an index out of bounds error. Fix it.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'data-structures', 'debugging'],
    buggyCode: `int getLastElement(List<int> list) {
  return list[list.length];
}`,
    solutionCode: `int getLastElement(List<int> list) {
  if (list.isEmpty) return 0;
  return list[list.length - 1];
}`,
    codeConfig: {
      entryFunction: 'getLastElement',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 3]], expected: 3, hidden: false },
      { args: [[5]], expected: 5, hidden: false },
      { args: [[]], expected: 0, hidden: true },
      { args: [[10, 20, 30, 40]], expected: 40, hidden: true }
    ]
  },
  {
    title: 'Fix Null Safety Error',
    description: 'This function doesn\'t handle null values. Fix the null safety.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'null-safety', 'debugging'],
    buggyCode: `int getStringLength(String? text) {
  return text.length;
}`,
    solutionCode: `int getStringLength(String? text) {
  return text?.length ?? 0;
}`,
    codeConfig: {
      entryFunction: 'getStringLength',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['hello'], expected: 5, hidden: false },
      { args: [null], expected: 0, hidden: false },
      { args: [''], expected: 0, hidden: true },
      { args: ['dart'], expected: 4, hidden: true }
    ]
  },
  {
    title: 'Fix Division by Zero',
    description: 'This function doesn\'t handle division by zero. Add proper error handling.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'error-handling', 'debugging'],
    buggyCode: `double divide(double a, double b) {
  return a / b;
}`,
    solutionCode: `double divide(double a, double b) {
  if (b == 0) return 0;
  return a / b;
}`,
    codeConfig: {
      entryFunction: 'divide',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [10.0, 2.0], expected: 5.0, hidden: false },
      { args: [10.0, 0.0], expected: 0.0, hidden: false },
      { args: [0.0, 5.0], expected: 0.0, hidden: true },
      { args: [15.0, 3.0], expected: 5.0, hidden: true }
    ]
  },
  {
    title: 'Fix Map Key Error',
    description: 'This function doesn\'t check if the key exists in the map. Fix it.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'data-structures', 'debugging'],
    buggyCode: `String getValue(Map<String, String> map, String key) {
  return map[key];
}`,
    solutionCode: `String getValue(Map<String, String> map, String key) {
  return map[key] ?? 'not found';
}`,
    codeConfig: {
      entryFunction: 'getValue',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [{'a': 'apple'}, 'a'], expected: 'apple', hidden: false },
      { args: [{'a': 'apple'}, 'b'], expected: 'not found', hidden: false },
      { args: [{}, 'key'], expected: 'not found', hidden: true },
      { args: [{'x': 'value'}, 'x'], expected: 'value', hidden: true }
    ]
  },
  {
    title: 'Fix Loop Logic Error',
    description: 'This function has an infinite loop. Fix the loop condition.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['dart', 'loops', 'debugging'],
    buggyCode: `int countDown(int n) {
  int count = 0;
  while (n > 0) {
    count++;
  }
  return count;
}`,
    solutionCode: `int countDown(int n) {
  int count = 0;
  while (n > 0) {
    count++;
    n--;
  }
  return count;
}`,
    codeConfig: {
      entryFunction: 'countDown',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [5], expected: 5, hidden: false },
      { args: [3], expected: 3, hidden: false },
      { args: [0], expected: 0, hidden: true },
      { args: [1], expected: 1, hidden: true }
    ]
  },
  {
    title: 'Fix Return Type Error',
    description: 'This function returns the wrong type. Fix the return statement.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['dart', 'functions', 'debugging'],
    buggyCode: `bool isEven(int number) {
  return number % 2;
}`,
    solutionCode: `bool isEven(int number) {
  return number % 2 == 0;
}`,
    codeConfig: {
      entryFunction: 'isEven',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [4], expected: true, hidden: false },
      { args: [3], expected: false, hidden: false },
      { args: [0], expected: true, hidden: true },
      { args: [7], expected: false, hidden: true }
    ]
  },
  {
    title: 'Fix Async Function Error',
    description: 'This async function doesn\'t properly await the result. Fix it.',
    difficulty: 'hard',
    preferredCategory: 'logic',
    tags: ['dart', 'async-programming', 'debugging'],
    buggyCode: `Future<int> processData() async {
  Future<int> data = Future.value(42);
  return data + 10;
}`,
    solutionCode: `Future<int> processData() async {
  Future<int> data = Future.value(42);
  int result = await data;
  return result + 10;
}`,
    codeConfig: {
      entryFunction: 'processData',
      runtime: 'dart',
      timeoutMs: 3000
    },
    testCases: [
      { args: [], expected: 52, hidden: false }
    ]
  }
],

  // 7 Fill-in-the-Blank Questions
  fillInTheBlank: [
    {
      title: 'Complete Function Declaration',
      description: 'Complete this Dart function declaration',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['dart', 'functions'],
      codeTemplate: `___blank1___ add(___blank2___ a, ___blank3___ b) {
  ___blank4___ a + b;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['int'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['int'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['int'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['return'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Class Definition',
      description: 'Complete this Dart class definition with constructor',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['dart', 'classes'],
      codeTemplate: `___blank1___ Person {
  ___blank2___ name;
  ___blank3___ age;
  
  Person(___blank4___.name, ___blank5___.age);
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['class'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['String'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['int'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['this'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['this'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Async Function',
      description: 'Complete this async function in Dart',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['dart', 'async-programming'],
      codeTemplate: `___blank1___<String> fetchData() ___blank2___ {
  ___blank3___ Future.delayed(Duration(seconds: 1));
  ___blank4___ 'Data loaded';
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Future'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['async'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['await'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['return'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Generic Class',
      description: 'Complete this generic class definition in Dart',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['dart', 'classes'],
      codeTemplate: `___blank1___ Container___blank2___ {
  ___blank3___ value;
  
  Container(___blank4___.value);
  
  ___blank5___ getValue() {
    ___blank6___ value;
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['class'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['<T>'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['T'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['this'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['T'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['return'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Exception Handling',
      description: 'Complete this exception handling block in Dart',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['dart', 'error-handling'],
      codeTemplate: `___blank1___ {
  int result = 10 ~/ 0;
  print(result);
} ___blank2___ (e) {
  print('Error: \$e');
} ___blank3___ {
  print('Cleanup');
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['try'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['catch'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['finally'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete List Operations',
      description: 'Complete this Dart list manipulation code',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['dart', 'data-structures'],
      codeTemplate: `___blank1___<int> numbers = [1, 2, 3];
numbers.___blank2___(4);
numbers.___blank3___(0, 0);
int last = numbers.___blank4___();
bool hasTwo = numbers.___blank5___(2);`,
      blanks: [
        { id: 'blank1', correctAnswers: ['List'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['add'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['insert'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['removeLast'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['contains'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Map Operations',
      description: 'Complete this Dart map manipulation code',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['dart', 'data-structures'],
      codeTemplate: `___blank1___<String, int> ages = {'Alice': 25, 'Bob': 30};
ages___blank2___'Charlie'] = 35;
int? aliceAge = ages___blank3___'Alice'];
bool hasKey = ages.___blank4___('Bob');
ages.___blank5___('Alice');`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Map'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['['], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['['], caseSensitive: true, points: 1 },
        { id: 'blank4', correctAnswers: ['containsKey'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['remove'], caseSensitive: false, points: 1 }
      ]
    }
  ]
};

async function seedDartQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE Dart question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(dartQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(dartQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = dartQuestions.fillInTheBlank.length;
    const totalBlanks = dartQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    
    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('dart');

    // Delete existing Dart questions
    await processor.deleteByLanguage('dart');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(dartQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'dart', status: 'active' },
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
    console.log('🔍 Running COMPREHENSIVE validation with enhanced grading testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Includes both code execution AND fill-in-blank grading validation
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'Dart');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE Dart question seeding completed successfully!');
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
      return await Question.find({ language: 'dart' }).select('_id title type');

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
    console.error('💥 Dart seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedDartQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive Dart questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust validation testing!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed Dart questions:', error);
      process.exit(1);
    });
}

module.exports = { seedDartQuestions, dartQuestions };