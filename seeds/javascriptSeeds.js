// seeds/javascriptSeeds.js - Comprehensive JavaScript questions with enhanced validation
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

// Comprehensive JavaScript questions data - 60+ questions total
const javascriptQuestions = {
  // 25 Multiple Choice Questions
  multipleChoice: [
    {
      title: 'JavaScript Variable Declaration',
      description: 'Which keyword is used to declare a block-scoped variable in JavaScript?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'variables', 'es6'],
      options: ['var', 'let', 'const', 'function'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Array Method - Push',
      description: 'Which method adds one or more elements to the end of an array?',
      difficulty: 'easy',
      preferredCategory: 'logic',
      tags: ['javascript', 'arrays', 'data-structures'],
      options: ['push()', 'pop()', 'shift()', 'unshift()'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Data Type - Null',
      description: 'What data type is returned by the typeof operator for null?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'data-types', 'operators'],
      options: ['null', 'undefined', 'object', 'boolean'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Function Scope',
      description: 'In JavaScript, where are variables declared with "let" accessible?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'scope', 'variables'],
      options: ['Global scope only', 'Function scope only', 'Block scope only', 'Both function and block scope'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Event Handling',
      description: 'Which method is used to remove an event listener in JavaScript?',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['javascript', 'events', 'event-handling', 'dom-manipulation'],
      options: ['removeEvent()', 'removeEventListener()', 'detachEvent()', 'unbindEvent()'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Array Method - Pop',
      description: 'Which method removes the last element from an array and returns it?',
      difficulty: 'easy',
      preferredCategory: 'logic',
      tags: ['javascript', 'arrays', 'data-structures'],
      options: ['shift()', 'slice()', 'pop()', 'splice()'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Const Declaration',
      description: 'What happens when you try to reassign a const variable?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'variables', 'error-handling'],
      options: ['Returns undefined', 'Throws TypeError', 'Creates new variable', 'Returns null'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript This Keyword',
      description: 'In a regular function (not arrow function), what does "this" refer to when called globally?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'scope', 'this-keyword', 'functions'],
      options: ['undefined', 'null', 'window object', 'function itself'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Promise State',
      description: 'What are the three states of a JavaScript Promise?',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['javascript', 'async-programming', 'promises', 'es6'],
      options: ['pending, resolved, rejected', 'pending, fulfilled, rejected', 'waiting, done, error', 'idle, running, complete'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Array Filter',
      description: 'What does the Array.filter() method return?',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['javascript', 'arrays', 'data-structures'],
      options: ['The first matching element', 'A boolean value', 'A new array with filtered elements', 'The index of matching elements'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Async Await',
      description: 'What keyword must a function have to use await inside it?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'async-programming', 'async-await', 'es2015+'],
      options: ['await', 'promise', 'async', 'defer'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Object Destructuring',
      description: 'What is the correct syntax to destructure the "name" property from an object?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'objects', 'destructuring', 'es6'],
      options: ['{name} = obj', 'const {name} = obj', 'let name = obj.name', 'var name = obj[name]'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Map vs forEach',
      description: 'What is the main difference between Array.map() and Array.forEach()?',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['javascript', 'arrays', 'data-structures'],
      options: ['map is faster', 'forEach returns a new array', 'map returns a new array', 'No difference'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Closure Memory',
      description: 'What can closures in JavaScript lead to if not handled properly?',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['javascript', 'closures', 'scope'],
      options: ['Faster execution', 'Memory leaks', 'Syntax errors', 'Type errors'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Prototype Chain',
      description: 'Where does JavaScript look for a property if it is not found in the current object?',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['javascript', 'objects', 'prototypes', 'inheritance'],
      options: ['Global scope', 'Parent function', 'Prototype chain', 'Window object'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Arrow Functions',
      description: 'Which syntax correctly defines an arrow function?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'functions', 'arrow-functions', 'es6'],
      options: ['function() => {}', '() => {}', '=> () {}', 'arrow() {}'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Template Literals',
      description: 'Which characters are used to define template literals in JavaScript?',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'template-literals', 'strings', 'es6'],
      options: ['Single quotes', 'Double quotes', 'Backticks', 'Forward slashes'],
      correctAnswer: 2
    },
    {
      title: 'JavaScript Spread Operator',
      description: 'What does the spread operator (...) do with arrays?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'spread-operator', 'arrays', 'es6'],
      options: ['Creates a new array', 'Expands array elements', 'Removes duplicates', 'Sorts the array'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript JSON Methods',
      description: 'Which method converts a JavaScript object to a JSON string?',
      difficulty: 'easy',
      preferredCategory: 'logic',
      tags: ['javascript', 'json-handling', 'objects'],
      options: ['JSON.parse()', 'JSON.stringify()', 'JSON.convert()', 'JSON.toString()'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Regular Expressions',
      description: 'Which method tests if a string matches a regular expression pattern?',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['javascript', 'regex', 'strings'],
      options: ['match()', 'test()', 'exec()', 'search()'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Modules',
      description: 'Which keyword is used to export a function from a JavaScript module?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'modules', 'imports-exports', 'es6'],
      options: ['module', 'export', 'return', 'yield'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Callback Functions',
      description: 'What is a callback function in JavaScript?',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['javascript', 'functions', 'callbacks', 'async-programming'],
      options: ['A function that calls itself', 'A function passed as an argument', 'A function that returns a value', 'A function that handles errors'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Event Loop',
      description: 'What handles asynchronous operations in JavaScript?',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['javascript', 'async-programming', 'events'],
      options: ['Call stack', 'Event loop', 'Memory heap', 'Execution context'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Strict Mode',
      description: 'How do you enable strict mode in JavaScript?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'error-handling'],
      options: ['"use strict";', 'strict: true;', 'enable strict;', 'mode: strict;'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Constructor Functions',
      description: 'Which operator is used to create instances of constructor functions?',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'functions', 'objects', 'classes'],
      options: ['create', 'new', 'instance', 'build'],
      correctAnswer: 1
    }
  ],

  // 15 True/False Questions
  trueFalse: [
    {
      title: 'JavaScript Hoisting',
      description: 'JavaScript hoists variable declarations to the top of their scope.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'hoisting', 'variables'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Strict Mode',
      description: 'Strict mode in JavaScript allows you to use undeclared variables.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'error-handling'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Closures',
      description: 'A closure in JavaScript can access variables from its outer function even after the outer function returns.',
      difficulty: 'hard',
      preferredCategory: 'logic',
      tags: ['javascript', 'closures', 'scope'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Arrays are Objects',
      description: 'In JavaScript, arrays are a special type of object.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'arrays', 'objects', 'data-types'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Function Hoisting',
      description: 'Function declarations are hoisted completely, including their implementation.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'functions', 'hoisting'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Let Hoisting',
      description: 'Variables declared with "let" are hoisted but not initialized.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['javascript', 'variables', 'hoisting'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Arrow Function This',
      description: 'Arrow functions have their own "this" binding.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['javascript', 'functions', 'scope', 'arrow-functions'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript String Immutability',
      description: 'Strings in JavaScript are immutable.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'strings', 'data-types'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript NaN Equality',
      description: 'NaN is equal to itself in JavaScript (NaN === NaN).',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'data-types', 'operators'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Async Function Return',
      description: 'Async functions always return a Promise.',
      difficulty: 'medium',
      preferredCategory: 'logic',
      tags: ['javascript', 'async-programming', 'promises'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Object Property Access',
      description: 'You can only access object properties using dot notation in JavaScript.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'objects'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Global Variables',
      description: 'Variables declared without var, let, or const become global variables.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'variables', 'scope'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript For...In Loops',
      description: 'For...in loops iterate over array indices in JavaScript.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'loops', 'arrays'],
      options: ['True', 'False'],
      correctAnswer: 0
    },
    {
      title: 'JavaScript Constructor Functions',
      description: 'Constructor functions in JavaScript must return an object explicitly.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['javascript', 'functions', 'objects'],
      options: ['True', 'False'],
      correctAnswer: 1
    },
    {
      title: 'JavaScript Event Bubbling',
      description: 'Event bubbling is the default behavior for DOM events in JavaScript.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['javascript', 'events', 'event-handling', 'dom-manipulation'],
      options: ['True', 'False'],
      correctAnswer: 0
    }
  ],

  // 20 Code Challenge Questions
  codeChallenge: [
  {
    title: 'Add Two Numbers',
    description: 'Write a function that takes two numbers as parameters and returns their sum.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['javascript', 'functions', 'operators'],
    codeTemplate: `function addNumbers(a, b) {
  // Write your code here
  
}`,
    codeConfig: {
      entryFunction: 'addNumbers',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [1, 2], expected: 3, hidden: false },
      { args: [5, 10], expected: 15, hidden: false },
      { args: [-1, 1], expected: 0, hidden: true },
      { args: [0, 0], expected: 0, hidden: true }
    ]
  },
  {
    title: 'Find Maximum Number',
    description: 'Write a function that finds the maximum number in an array.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'arrays', 'algorithms', 'data-structures'],
    codeTemplate: `function findMax(arr) {
  // Write your code here
  // Hint: You can use Math.max() or iterate through the array
  
}`,
    codeConfig: {
      entryFunction: 'findMax',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 3, 2]], expected: 3, hidden: false },
      { args: [[10, 5, 8, 20, 3]], expected: 20, hidden: false },
      { args: [[-1, -5, -2]], expected: -1, hidden: true },
      { args: [[42]], expected: 42, hidden: true }
    ]
  },
  {
    title: 'Count Vowels',
    description: 'Write a function that counts the number of vowels (a, e, i, o, u) in a string.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'algorithms', 'strings'],
    codeTemplate: `function countVowels(str) {
  // Write your code here
  // Hint: Consider both uppercase and lowercase vowels
  
}`,
    codeConfig: {
      entryFunction: 'countVowels',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['hello'], expected: 2, hidden: false },
      { args: ['javascript'], expected: 3, hidden: false },
      { args: [''], expected: 0, hidden: true },
      { args: ['bcdfg'], expected: 0, hidden: true },
      { args: ['aeiou'], expected: 5, hidden: true }
    ]
  },
  {
    title: 'Fibonacci Sequence',
    description: 'Write a function that returns the nth number in the Fibonacci sequence.',
    difficulty: 'hard',
    preferredCategory: 'logic',
    tags: ['javascript', 'algorithms', 'recursion'],
    codeTemplate: `function fibonacci(n) {
  // Write your code here
  // Remember: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
  
}`,
    codeConfig: {
      entryFunction: 'fibonacci',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [0], expected: 0, hidden: false },
      { args: [1], expected: 1, hidden: false },
      { args: [5], expected: 5, hidden: false },
      { args: [10], expected: 55, hidden: true },
      { args: [15], expected: 610, hidden: true }
    ]
  },
  {
    title: 'Is Palindrome',
    description: 'Write a function that checks if a string is a palindrome (reads the same forwards and backwards).',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'algorithms', 'strings'],
    codeTemplate: `function isPalindrome(str) {
  // Write your code here
  // Hint: Compare the string with its reverse
  
}`,
    codeConfig: {
      entryFunction: 'isPalindrome',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['racecar'], expected: true, hidden: false },
      { args: ['hello'], expected: false, hidden: false },
      { args: ['a'], expected: true, hidden: true },
      { args: [''], expected: true, hidden: true },
      { args: ['Aa'], expected: false, hidden: true }
    ]
  },
  {
    title: 'Sum of Array',
    description: 'Write a function that calculates the sum of all numbers in an array.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['javascript', 'arrays', 'loops'],
    codeTemplate: `function sumArray(arr) {
  // Write your code here
  // You can use a loop or the reduce method
  
}`,
    codeConfig: {
      entryFunction: 'sumArray',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 3]], expected: 6, hidden: false },
      { args: [[10, 20, 30]], expected: 60, hidden: false },
      { args: [[-1, 1, -1]], expected: -1, hidden: true },
      { args: [[]], expected: 0, hidden: true }
    ]
  },
  {
    title: 'Find Even Numbers',
    description: 'Write a function that returns an array of all even numbers from the input array.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['javascript', 'arrays', 'loops'],
    codeTemplate: `function findEvenNumbers(arr) {
  // Write your code here
  // Hint: Use the filter method or a loop with modulo operator
  
}`,
    codeConfig: {
      entryFunction: 'findEvenNumbers',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 3, 4]], expected: [2, 4], hidden: false },
      { args: [[1, 3, 5]], expected: [], hidden: false },
      { args: [[2, 4, 6, 8]], expected: [2, 4, 6, 8], hidden: true },
      { args: [[]], expected: [], hidden: true }
    ]
  },
  {
    title: 'Factorial Calculator',
    description: 'Write a function that calculates the factorial of a number.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'algorithms', 'recursion'],
    codeTemplate: `function factorial(n) {
  // Write your code here
  // Remember: factorial(0) = 1, factorial(n) = n * factorial(n-1)
  
}`,
    codeConfig: {
      entryFunction: 'factorial',
      runtime: 'node',
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
    title: 'Remove Duplicates',
    description: 'Write a function that removes duplicate values from an array.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'arrays', 'data-structures'],
    codeTemplate: `function removeDuplicates(arr) {
  // Write your code here
  // Hint: You can use Set, filter with indexOf, or other methods
  
}`,
    codeConfig: {
      entryFunction: 'removeDuplicates',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 2, 3]], expected: [1, 2, 3], hidden: false },
      { args: [['a', 'b', 'a']], expected: ['a', 'b'], hidden: false },
      { args: [[1, 1, 1]], expected: [1], hidden: true },
      { args: [[]], expected: [], hidden: true }
    ]
  },
  {
    title: 'String Capitalize',
    description: 'Write a function that capitalizes the first letter of each word in a string.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'algorithms', 'strings'],
    codeTemplate: `function capitalizeWords(str) {
  // Write your code here
  // Hint: Split by spaces, capitalize each word, then join back
  
}`,
    codeConfig: {
      entryFunction: 'capitalizeWords',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['hello world'], expected: 'Hello World', hidden: false },
      { args: ['javascript is fun'], expected: 'Javascript Is Fun', hidden: false },
      { args: ['a'], expected: 'A', hidden: true },
      { args: [''], expected: '', hidden: true }
    ]
  },
  {
    title: 'Array Average',
    description: 'Write a function that calculates the average of numbers in an array.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['javascript', 'arrays', 'operators'],
    codeTemplate: `function arrayAverage(arr) {
  // Write your code here
  // Remember: average = sum / count
  
}`,
    codeConfig: {
      entryFunction: 'arrayAverage',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 3, 4]], expected: 2.5, hidden: false },
      { args: [[10, 20, 30]], expected: 20, hidden: false },
      { args: [[5]], expected: 5, hidden: true },
      { args: [[-1, 1]], expected: 0, hidden: true }
    ]
  },
  {
    title: 'Count Characters',
    description: 'Write a function that counts how many times each character appears in a string.',
    difficulty: 'hard',
    preferredCategory: 'logic',
    tags: ['javascript', 'objects', 'algorithms', 'strings'],
    codeTemplate: `function countCharacters(str) {
  // Write your code here
  // Return an object with characters as keys and counts as values
  
}`,
    codeConfig: {
      entryFunction: 'countCharacters',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['hello'], expected: { h: 1, e: 1, l: 2, o: 1 }, hidden: false },
      { args: ['aaa'], expected: { a: 3 }, hidden: false },
      { args: [''], expected: {}, hidden: true },
      { args: ['ab'], expected: { a: 1, b: 1 }, hidden: true }
    ]
  },
  {
    title: 'Reverse String',
    description: 'Write a function that reverses a string.',
    difficulty: 'easy',
    preferredCategory: 'logic',
    tags: ['javascript', 'strings', 'algorithms'],
    codeTemplate: `function reverseString(str) {
  // Write your code here
  // Hint: You can use split, reverse, and join methods
  
}`,
    codeConfig: {
      entryFunction: 'reverseString',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['hello'], expected: 'olleh', hidden: false },
      { args: ['world'], expected: 'dlrow', hidden: false },
      { args: [''], expected: '', hidden: true },
      { args: ['a'], expected: 'a', hidden: true }
    ]
  },
  {
    title: 'Find Longest Word',
    description: 'Write a function that finds the longest word in a sentence.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'strings', 'algorithms'],
    codeTemplate: `function findLongestWord(sentence) {
  // Write your code here
  // Hint: Split the sentence into words and compare their lengths
  
}`,
    codeConfig: {
      entryFunction: 'findLongestWord',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['The quick brown fox'], expected: 'quick', hidden: false },
      { args: ['JavaScript is awesome'], expected: 'JavaScript', hidden: false },
      { args: ['a bb ccc'], expected: 'ccc', hidden: true },
      { args: [''], expected: '', hidden: true }
    ]
  },
  {
    title: 'Prime Number Check',
    description: 'Write a function that checks if a number is prime.',
    difficulty: 'hard',
    preferredCategory: 'logic',
    tags: ['javascript', 'algorithms', 'numbers'],
    codeTemplate: `function isPrime(num) {
  // Write your code here
  // A prime number is only divisible by 1 and itself
  // Consider edge cases: numbers less than 2 are not prime
  
}`,
    codeConfig: {
      entryFunction: 'isPrime',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [7], expected: true, hidden: false },
      { args: [4], expected: false, hidden: false },
      { args: [2], expected: true, hidden: true },
      { args: [1], expected: false, hidden: true },
      { args: [17], expected: true, hidden: true }
    ]
  }
],

  // 10 Code Debugging Questions
  codeDebugging: [
  {
    title: 'Fix Array Sum Function',
    description: 'The following function should sum all numbers in an array, but it has a bug. Fix it.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'arrays', 'loops', 'debugging'],
    buggyCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
    solutionCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
    codeConfig: {
      entryFunction: 'sumArray',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 2, 3]], expected: 6, hidden: false },
      { args: [[10, 20, 30, 40]], expected: 100, hidden: false },
      { args: [[]], expected: 0, hidden: true },
      { args: [[1]], expected: 1, hidden: true }
    ]
  },
  {
    title: 'Fix String Reversal Function',
    description: 'This function should reverse a string but has an error. Fix it.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'algorithms', 'strings', 'debugging'],
    buggyCode: `function reverseString(str) {
  return str.reverse();
}`,
    solutionCode: `function reverseString(str) {
  return str.split('').reverse().join('');
}`,
    codeConfig: {
      entryFunction: 'reverseString',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['hello'], expected: 'olleh', hidden: false },
      { args: ['world'], expected: 'dlrow', hidden: false },
      { args: [''], expected: '', hidden: true },
      { args: ['a'], expected: 'a', hidden: true }
    ]
  },
  {
    title: 'Fix Object Property Access',
    description: 'This function should return the name property of an object, handling undefined objects. Fix it.',
    difficulty: 'hard',
    preferredCategory: 'logic',
    tags: ['javascript', 'objects', 'error-handling', 'debugging'],
    buggyCode: `function getName(obj) {
  return obj.name;
}`,
    solutionCode: `function getName(obj) {
  return obj && obj.name ? obj.name : 'Unknown';
}`,
    codeConfig: {
      entryFunction: 'getName',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [{ name: 'John' }], expected: 'John', hidden: false },
      { args: [{ name: 'Jane' }], expected: 'Jane', hidden: false },
      { args: [{}], expected: 'Unknown', hidden: true },
      { args: [null], expected: 'Unknown', hidden: true },
      { args: [undefined], expected: 'Unknown', hidden: true }
    ]
  },
  {
    title: 'Fix Array Filter Function',
    description: 'This function should filter out numbers greater than 10, but has a bug. Fix it.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'arrays', 'debugging'],
    buggyCode: `function filterNumbers(arr) {
  return arr.filter(num => num > 10);
}`,
    solutionCode: `function filterNumbers(arr) {
  return arr.filter(num => num <= 10);
}`,
    codeConfig: {
      entryFunction: 'filterNumbers',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 15, 8, 20, 5]], expected: [1, 8, 5], hidden: false },
      { args: [[25, 30, 35]], expected: [], hidden: false },
      { args: [[1, 2, 3]], expected: [1, 2, 3], hidden: true },
      { args: [[]], expected: [], hidden: true }
    ]
  },
  {
    title: 'Fix Variable Scope Issue',
    description: 'This function should return an array of functions, each returning its index, but they all return the same value. Fix it.',
    difficulty: 'hard',
    preferredCategory: 'logic',
    tags: ['javascript', 'scope', 'closures', 'debugging'],
    buggyCode: `function createFunctions() {
  var functions = [];
  for (var i = 0; i < 3; i++) {
    functions.push(function() { return i; });
  }
  return functions;
}`,
    solutionCode: `function createFunctions() {
  var functions = [];
  for (let i = 0; i < 3; i++) {
    functions.push(function() { return i; });
  }
  return functions;
}

// Test wrapper function
function testCreateFunctions() {
  const funcs = createFunctions();
  return funcs.map(f => f());
}`,
    codeConfig: {
      entryFunction: 'testCreateFunctions',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [], expected: [0, 1, 2], hidden: false }
    ]
  },
  {
    title: 'Fix Conditional Logic',
    description: 'This function should return "positive" for numbers > 0, "negative" for numbers < 0, and "zero" for 0. Fix the logic.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'conditionals', 'debugging'],
    buggyCode: `function checkNumber(num) {
  if (num > 0) {
    return "positive";
  } else if (num <= 0) {
    return "negative";
  }
}`,
    solutionCode: `function checkNumber(num) {
  if (num > 0) {
    return "positive";
  } else if (num < 0) {
    return "negative";
  } else {
    return "zero";
  }
}`,
    codeConfig: {
      entryFunction: 'checkNumber',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [5], expected: 'positive', hidden: false },
      { args: [-3], expected: 'negative', hidden: false },
      { args: [0], expected: 'zero', hidden: true },
      { args: [10], expected: 'positive', hidden: true }
    ]
  },
  {
    title: 'Fix Function Return Type',
    description: 'This function should return a string, but it returns the wrong type. Fix it.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'functions', 'data-types', 'debugging'],
    buggyCode: `function getGreeting(name) {
  return name.length;
}`,
    solutionCode: `function getGreeting(name) {
  return "Hello, " + name;
}`,
    codeConfig: {
      entryFunction: 'getGreeting',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['Alice'], expected: 'Hello, Alice', hidden: false },
      { args: ['Bob'], expected: 'Hello, Bob', hidden: false },
      { args: ['Charlie'], expected: 'Hello, Charlie', hidden: true },
      { args: [''], expected: 'Hello, ', hidden: true }
    ]
  },
  {
    title: 'Fix Array Index Error',
    description: 'This function should find the first element greater than the target, but has an index error. Fix it.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'arrays', 'loops', 'debugging'],
    buggyCode: `function findGreater(arr, target) {
  for (let i = 1; i <= arr.length; i++) {
    if (arr[i] > target) {
      return arr[i];
    }
  }
  return null;
}`,
    solutionCode: `function findGreater(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > target) {
      return arr[i];
    }
  }
  return null;
}`,
    codeConfig: {
      entryFunction: 'findGreater',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [[1, 3, 5, 7], 4], expected: 5, hidden: false },
      { args: [[2, 4, 6], 6], expected: null, hidden: false },
      { args: [[10, 20, 30], 15], expected: 20, hidden: true },
      { args: [[], 5], expected: null, hidden: true }
    ]
  },
  {
    title: 'Fix Object Method',
    description: 'This object method should return the full name, but has a "this" context error. Fix it.',
    difficulty: 'hard',
    preferredCategory: 'logic',
    tags: ['javascript', 'objects', 'this-keyword', 'debugging'],
    buggyCode: `const person = {
  firstName: 'John',
  lastName: 'Doe',
  getFullName: () => {
    return this.firstName + ' ' + this.lastName;
  }
};

function getPersonName() {
  return person.getFullName();
}`,
    solutionCode: `const person = {
  firstName: 'John',
  lastName: 'Doe',
  getFullName: function() {
    return this.firstName + ' ' + this.lastName;
  }
};

function getPersonName() {
  return person.getFullName();
}`,
    codeConfig: {
      entryFunction: 'getPersonName',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: [], expected: 'John Doe', hidden: false }
    ]
  },
  {
    title: 'Fix JSON Parsing Error',
    description: 'This function should parse JSON safely, but throws errors on invalid JSON. Fix it.',
    difficulty: 'medium',
    preferredCategory: 'logic',
    tags: ['javascript', 'json-handling', 'error-handling', 'debugging'],
    buggyCode: `function parseJSON(str) {
  return JSON.parse(str);
}`,
    solutionCode: `function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}`,
    codeConfig: {
      entryFunction: 'parseJSON',
      runtime: 'node',
      timeoutMs: 3000
    },
    testCases: [
      { args: ['{"name": "John"}'], expected: { name: 'John' }, hidden: false },
      { args: ['invalid json'], expected: null, hidden: false },
      { args: ['{"valid": true}'], expected: { valid: true }, hidden: true },
      { args: [''], expected: null, hidden: true }
    ]
  }
],
  // 15 Fill-in-the-Blank Questions
  fillInTheBlank: [
    {
      title: 'Complete the For Loop',
      description: 'Fill in the missing parts of this for loop that iterates from 0 to 9.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'loops', 'conditionals'],
      codeTemplate: `for (let i = ___blank1___; i < ___blank2___; ___blank3___) {
  console.log(i);
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['0'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['10'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['i++', 'i += 1', '++i'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete the Function Declaration',
      description: 'Complete this function that calculates the area of a rectangle.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'functions'],
      codeTemplate: `___blank1___ calculateArea(width, height) {
  ___blank2___ width * height;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['function'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['return'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Array Map',
      description: 'Complete this code that doubles each number in an array.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'arrays', 'functions'],
      codeTemplate: `const numbers = [1, 2, 3, 4];
const doubled = numbers.___blank1___(num => num ___blank2___ 2);`,
      blanks: [
        { id: 'blank1', correctAnswers: ['map'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['*'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Promise Chain',
      description: 'Complete this Promise chain that handles success and error cases.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['javascript', 'promises', 'async-programming', 'error-handling'],
      codeTemplate: `fetch('/api/data')
  .___blank1___(response => response.json())
  .___blank2___(data => console.log(data))
  .___blank3___(error => console.error(error));`,
      blanks: [
        { id: 'blank1', correctAnswers: ['then'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['then'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['catch'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Object Destructuring',
      description: 'Complete the destructuring assignment to extract name and age.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'objects', 'destructuring', 'es6'],
      codeTemplate: `const person = { name: 'John', age: 30, city: 'NYC' };
const { ___blank1___, ___blank2___ } = person;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['name'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['age'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Arrow Function',
      description: 'Complete this arrow function that finds the square of a number.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'functions', 'arrow-functions', 'es6'],
      codeTemplate: `const square = ___blank1___ => ___blank2___ * ___blank3___;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['x', 'n', 'num'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['x', 'n', 'num'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['x', 'n', 'num'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Try-Catch Block',
      description: 'Complete this error handling block.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'error-handling', 'try-catch'],
      codeTemplate: `___blank1___ {
  riskyOperation();
} ___blank2___ (error) {
  console.log('Error:', error);
} ___blank3___ {
  cleanup();
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['try'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['catch'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['finally'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Class Definition',
      description: 'Complete this class definition with a constructor and method.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'classes', 'es6', 'objects'],
      codeTemplate: `___blank1___ Car {
  ___blank2___(make, model) {
    this.make = make;
    this.model = model;
  }
  
  getInfo() {
    ___blank3___ \`\${this.make} \${this.model}\`;
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['class'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['constructor'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['return'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Variable Declarations',
      description: 'Complete the variable declarations using appropriate keywords.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'variables', 'scope'],
      codeTemplate: `___blank1___ name = 'John';        // Can be reassigned
___blank2___ PI = 3.14159;         // Cannot be reassigned
___blank3___ age = 25;             // Block-scoped, can be reassigned`,
      blanks: [
        { id: 'blank1', correctAnswers: ['let', 'var'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['const'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['let'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Template Literal',
      description: 'Complete this template literal with proper syntax.',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['javascript', 'template-literals', 'strings', 'es6'],
      codeTemplate: `const name = 'Alice';
const age = 30;
const message = ___blank1___Hello, my name is ___blank2___name___blank3___ and I am ___blank4___age___blank5___ years old___blank6___;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['`'], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['${'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['}'], caseSensitive: true, points: 1 },
        { id: 'blank4', correctAnswers: ['${'], caseSensitive: true, points: 1 },
        { id: 'blank5', correctAnswers: ['}'], caseSensitive: true, points: 1 },
        { id: 'blank6', correctAnswers: ['`'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: 'Complete Async Function',
      description: 'Complete this async function that fetches data.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['javascript', 'async-programming', 'async-await', 'functions'],
      codeTemplate: `___blank1___ function fetchUserData() {
  ___blank2___ {
    const response = ___blank3___ fetch('/api/user');
    const data = ___blank4___ response.json();
    return data;
  } ___blank5___ (error) {
    console.error('Error:', error);
    ___blank6___ null;
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['async'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['try'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['await'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['await'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['catch'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['return'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Spread Operator Usage',
      description: 'Complete this code using the spread operator.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'spread-operator', 'arrays', 'es6'],
      codeTemplate: `const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [___blank1___arr1, ___blank2___arr2];

const person = { name: 'John', age: 30 };
const updatedPerson = { ___blank3___person, city: 'New York' };`,
      blanks: [
        { id: 'blank1', correctAnswers: ['...'], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['...'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['...'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: 'Complete Array Methods Chain',
      description: 'Complete this array methods chain to filter and transform data.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['javascript', 'arrays', 'functions', 'data-structures'],
      codeTemplate: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = numbers
  .___blank1___(num => num % 2 === 0)  // Get even numbers
  .___blank2___(num => num * 2)        // Double each number
  .___blank3___((sum, num) => sum + num, 0);  // Sum all numbers`,
      blanks: [
        { id: 'blank1', correctAnswers: ['filter'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['map'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['reduce'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: 'Complete Module Import/Export',
      description: 'Complete the module import and export syntax.',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['javascript', 'modules', 'imports-exports', 'es6'],
      codeTemplate: `// File: math.js
___blank1___ function add(a, b) {
  return a + b;
}

___blank2___ const PI = 3.14159;

// File: main.js
___blank3___ { add, PI } ___blank4___ './math.js';

const result = add(5, 3);`,
      blanks: [
        { id: 'blank1', correctAnswers: ['export'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['export'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['import'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['from'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete Regular Expression',
      description: 'Complete this regular expression to validate email addresses.',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['javascript', 'regex', 'strings'],
      codeTemplate: `const emailRegex = ___blank1___^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$___blank2___;

function isValidEmail(email) {
  return emailRegex.___blank3___(email);
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['/'], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['/'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['test'], caseSensitive: false, points: 1 }
      ]
    }
  ]
};

async function seedJavaScriptQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE JavaScript question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(javascriptQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(javascriptQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = javascriptQuestions.fillInTheBlank.length;
    const totalBlanks = javascriptQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    
    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('javascript');

    // Delete existing JavaScript questions
    await processor.deleteByLanguage('javascript');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(javascriptQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'javascript', status: 'active' },
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

      processor.printProcessingSummary(insertResults, 'JavaScript');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE JavaScript question seeding completed successfully!');
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
      return await Question.find({ language: 'javascript' }).select('_id title type');

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
    console.error('💥 JavaScript seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedJavaScriptQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive JavaScript questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust fill-in-blank validation!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed JavaScript questions:', error);
      process.exit(1);
    });
}

module.exports = { seedJavaScriptQuestions, javascriptQuestions };