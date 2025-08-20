const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const javascriptQuestions = {
  multipleChoice: [
    {
      title: "JavaScript Variable Hoisting",
      description: "What will be the output of the following code?\n\nconsole.log(x);\nvar x = 5;",
      options: ["", "undefined", "5", "ReferenceError", "null"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["javascript", "hoisting", "variables"]
    },
    {
      title: "Array Method Return Value",
      description: "What does Array.push() return?",
      options: ["", "The modified array", "The new length of the array", "The pushed element", "undefined"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Closure Behavior",
      description: "What will this code output?\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}",
      options: ["", "0 1 2", "3 3 3", "undefined undefined undefined", "Error"],
      correctAnswer: 2,
      difficulty: "hard",
      tags: ["javascript", "closures", "async-programming"]
    },
    {
      title: "typeof Operator",
      description: "What is the result of typeof null in JavaScript?",
      options: ["", "null", "object", "undefined", "string"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["javascript"]
    },
    {
      title: "Arrow Function this Binding",
      description: "How do arrow functions handle 'this' binding?",
      options: ["", "They create their own 'this'", "They inherit 'this' from enclosing scope", "They always bind to global object", "'this' is undefined"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["javascript", "functions", "scope"]
    },
    {
      title: "Promise State",
      description: "What are the three states of a JavaScript Promise?",
      options: ["", "pending, resolved, rejected", "pending, fulfilled, rejected", "waiting, done, error", "start, success, fail"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["javascript", "promises", "async-programming"]
    },
    {
      title: "Array Destructuring",
      description: "What will [a, b] = [1, 2, 3] assign to variable 'b'?",
      options: ["", "1", "2", "3", "undefined"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["javascript", "es6"]
    },
    {
      title: "Function Declaration vs Expression",
      description: "What's the main difference between function declarations and expressions?",
      options: ["", "No difference", "Declarations are hoisted, expressions are not", "Expressions are faster", "Declarations can't have names"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["javascript", "functions", "hoisting"]
    },
    {
      title: "Event Loop",
      description: "In what order will these log?\n\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nconsole.log(3);",
      options: ["", "1, 2, 3", "1, 3, 2", "2, 1, 3", "3, 1, 2"],
      correctAnswer: 2,
      difficulty: "hard",
      tags: ["javascript", "async-programming"]
    },
    {
      title: "Object Property Access",
      description: "Which is NOT a valid way to access object properties?",
      options: ["", "obj.property", "obj['property']", "obj[property]", "obj->property"],
      correctAnswer: 4,
      difficulty: "easy",
      tags: ["javascript", "objects"]
    },
    {
      title: "Template Literals",
      description: "Template literals in JavaScript use which character?",
      options: ["", "Single quotes '", "Double quotes \"", "Backticks `", "Forward slash /"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["javascript", "es6"]
    },
    {
      title: "Array Methods",
      description: "Which array method modifies the original array?",
      options: ["", "map()", "filter()", "forEach()", "splice()"],
      correctAnswer: 4,
      difficulty: "medium",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Variable Scope",
      description: "What type of scope do 'let' and 'const' have?",
      options: ["", "Function scope", "Global scope", "Block scope", "Module scope"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["javascript", "scope", "es6"]
    },
    {
      title: "Prototype Chain",
      description: "Every JavaScript object has access to which method through the prototype chain?",
      options: ["", "valueOf()", "toString()", "hasOwnProperty()", "All of the above"],
      correctAnswer: 4,
      difficulty: "medium",
      tags: ["javascript", "objects"]
    },
    {
      title: "Strict Mode",
      description: "How do you enable strict mode in JavaScript?",
      options: ["", "'use strict';", "strict: true;", "mode = strict;", "enable strict;"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["javascript"]
    }
  ],
  trueFalse: [
    {
      title: "JavaScript is Compiled",
      description: "JavaScript is a compiled language.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["javascript"]
    },
    {
      title: "NaN Equality",
      description: "NaN === NaN returns true in JavaScript.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["javascript"]
    },
    {
      title: "Array Length Property",
      description: "The length property of an array can be manually set.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Function Parameters",
      description: "JavaScript functions can be called with more arguments than defined parameters.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["javascript", "functions"]
    },
    {
      title: "Object Property Order",
      description: "Object properties in JavaScript maintain insertion order for string keys.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["javascript", "objects"]
    },
    {
      title: "Const Array Mutation",
      description: "Arrays declared with 'const' cannot be modified.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Automatic Semicolon Insertion",
      description: "JavaScript automatically inserts semicolons where they are omitted.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["javascript"]
    },
    {
      title: "Delete Operator",
      description: "The 'delete' operator can remove variables declared with 'var'.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "hard",
      tags: ["javascript"]
    },
    {
      title: "Constructor Functions",
      description: "Constructor functions should be called with the 'new' keyword.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["javascript", "functions"]
    },
    {
      title: "Callback Functions",
      description: "Callback functions are always executed synchronously.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["javascript", "functions", "async-programming"]
    },
    {
      title: "JSON Methods",
      description: "JSON.parse() can handle JavaScript Date objects.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Variable Hoisting Scope",
      description: "'var' declarations are hoisted to the top of their function scope.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["javascript", "hoisting", "scope"]
    },
    {
      title: "String Immutability",
      description: "Strings in JavaScript are immutable.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Global Object",
      description: "In browsers, the global object is 'window'.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["javascript", "scope"]
    },
    {
      title: "Error Handling",
      description: "A 'finally' block always executes, even if there's a return statement in 'try'.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["javascript", "error-handling"]
    }
  ],
  codeChallenge: [
    {
      title: "Sum Array Elements",
      description: "Write a function that takes an array of numbers and returns their sum.",
      options: ["function sumArray(arr) {\n  // Your code here\n}"],
      testCases: [
        { input: "sumArray([1, 2, 3, 4])", output: "10", hidden: false },
        { input: "sumArray([10, -5, 3])", output: "8", hidden: false },
        { input: "sumArray([])", output: "0", hidden: true }
      ],
      difficulty: "easy",
      tags: ["javascript", "data-structures", "functions"]
    },
    {
      title: "Find Maximum Value",
      description: "Write a function that finds the maximum value in an array of numbers.",
      options: ["function findMax(arr) {\n  // Your code here\n}"],
      testCases: [
        { input: "findMax([1, 5, 3, 9, 2])", output: "9", hidden: false },
        { input: "findMax([10])", output: "10", hidden: false },
        { input: "findMax([-1, -5, -2])", output: "-1", hidden: true }
      ],
      difficulty: "easy",
      tags: ["javascript", "data-structures", "functions"]
    },
    {
      title: "Reverse String",
      description: "Write a function that reverses a string.",
      options: ["function reverseString(str) {\n  // Your code here\n}"],
      testCases: [
        { input: "reverseString('hello')", output: "'olleh'", hidden: false },
        { input: "reverseString('JavaScript')", output: "'tpircSavaJ'", hidden: false },
        { input: "reverseString('a')", output: "'a'", hidden: true }
      ],
      difficulty: "easy",
      tags: ["javascript", "data-structures", "functions"]
    },
    {
      title: "Count Vowels",
      description: "Write a function that counts the number of vowels in a string.",
      options: ["function countVowels(str) {\n  // Your code here\n}"],
      testCases: [
        { input: "countVowels('hello')", output: "2", hidden: false },
        { input: "countVowels('JavaScript')", output: "3", hidden: false },
        { input: "countVowels('xyz')", output: "0", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "data-structures", "functions"]
    },
    {
      title: "Factorial Function",
      description: "Write a function that calculates the factorial of a number.",
      options: ["function factorial(n) {\n  // Your code here\n}"],
      testCases: [
        { input: "factorial(5)", output: "120", hidden: false },
        { input: "factorial(0)", output: "1", hidden: false },
        { input: "factorial(3)", output: "6", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "functions"]
    },
    {
      title: "Remove Duplicates",
      description: "Write a function that removes duplicate values from an array.",
      options: ["function removeDuplicates(arr) {\n  // Your code here\n}"],
      testCases: [
        { input: "removeDuplicates([1, 2, 2, 3, 4, 4, 5])", output: "[1, 2, 3, 4, 5]", hidden: false },
        { input: "removeDuplicates(['a', 'b', 'a', 'c'])", output: "['a', 'b', 'c']", hidden: false },
        { input: "removeDuplicates([1])", output: "[1]", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "data-structures", "functions"]
    },
    {
      title: "FizzBuzz",
      description: "Write a function that returns an array of numbers from 1 to n, replacing multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'.",
      options: ["function fizzBuzz(n) {\n  // Your code here\n}"],
      testCases: [
        { input: "fizzBuzz(15)", output: "[1,2,'Fizz',4,'Buzz','Fizz',7,8,'Fizz','Buzz',11,'Fizz',13,14,'FizzBuzz']", hidden: false },
        { input: "fizzBuzz(5)", output: "[1,2,'Fizz',4,'Buzz']", hidden: false },
        { input: "fizzBuzz(3)", output: "[1,2,'Fizz']", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "functions"]
    },
    {
      title: "Object Property Counter",
      description: "Write a function that counts the number of properties in an object.",
      options: ["function countProperties(obj) {\n  // Your code here\n}"],
      testCases: [
        { input: "countProperties({a: 1, b: 2, c: 3})", output: "3", hidden: false },
        { input: "countProperties({})", output: "0", hidden: false },
        { input: "countProperties({name: 'John', age: 30})", output: "2", hidden: true }
      ],
      difficulty: "easy",
      tags: ["javascript", "objects"]
    },
    {
      title: "Array Chunk",
      description: "Write a function that splits an array into chunks of specified size.",
      options: ["function chunk(arr, size) {\n  // Your code here\n}"],
      testCases: [
        { input: "chunk([1, 2, 3, 4, 5], 2)", output: "[[1, 2], [3, 4], [5]]", hidden: false },
        { input: "chunk([1, 2, 3, 4, 5, 6], 3)", output: "[[1, 2, 3], [4, 5, 6]]", hidden: false },
        { input: "chunk([1, 2], 5)", output: "[[1, 2]]", hidden: true }
      ],
      difficulty: "hard",
      tags: ["javascript", "data-structures", "functions"]
    },
    {
      title: "Deep Clone Object",
      description: "Write a function that creates a deep clone of an object.",
      options: ["function deepClone(obj) {\n  // Your code here\n}"],
      testCases: [
        { input: "deepClone({a: 1, b: {c: 2}})", output: "{a: 1, b: {c: 2}}", hidden: false },
        { input: "deepClone({x: [1, 2, 3]})", output: "{x: [1, 2, 3]}", hidden: false },
        { input: "deepClone(null)", output: "null", hidden: true }
      ],
      difficulty: "hard",
      tags: ["javascript", "objects", "functions"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix Array Loop Bug",
      description: "This function should return an array of numbers from 1 to n, but it has a bug.",
      options: ["function generateNumbers(n) {\n  const result = [];\n  for (let i = 0; i <= n; i++) {\n    result.push(i);\n  }\n  return result;\n}"],
      testCases: [
        { input: "generateNumbers(5)", output: "[1, 2, 3, 4, 5]", hidden: false },
        { input: "generateNumbers(3)", output: "[1, 2, 3]", hidden: false },
        { input: "generateNumbers(1)", output: "[1]", hidden: true }
      ],
      difficulty: "easy",
      tags: ["javascript", "loops"]
    },
    {
      title: "Fix String Comparison",
      description: "This function should check if two strings are equal (case-insensitive), but it's not working.",
      options: ["function areEqual(str1, str2) {\n  return str1 === str2;\n}"],
      testCases: [
        { input: "areEqual('Hello', 'hello')", output: "true", hidden: false },
        { input: "areEqual('TEST', 'test')", output: "true", hidden: false },
        { input: "areEqual('abc', 'xyz')", output: "false", hidden: true }
      ],
      difficulty: "easy",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Fix Sum Function",
      description: "This function should sum all numbers in an array, but it's returning wrong results.",
      options: ["function sumArray(arr) {\n  let sum = '0';\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}"],
      testCases: [
        { input: "sumArray([1, 2, 3])", output: "6", hidden: false },
        { input: "sumArray([10, 20])", output: "30", hidden: false },
        { input: "sumArray([5])", output: "5", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Fix Object Property Access",
      description: "This function should return the value of a nested property, but it throws errors.",
      options: ["function getNestedValue(obj, keys) {\n  let current = obj;\n  for (let key of keys) {\n    current = current[key];\n  }\n  return current;\n}"],
      testCases: [
        { input: "getNestedValue({a: {b: {c: 42}}}, ['a', 'b', 'c'])", output: "42", hidden: false },
        { input: "getNestedValue({x: {y: 10}}, ['x', 'y'])", output: "10", hidden: false },
        { input: "getNestedValue({}, ['missing'])", output: "undefined", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "objects"]
    },
    {
      title: "Fix Async Function",
      description: "This async function should wait for the promise to resolve, but it's not working correctly.",
      options: ["async function fetchData() {\n  const promise = new Promise(resolve => {\n    setTimeout(() => resolve('data'), 100);\n  });\n  const result = promise;\n  return result;\n}"],
      testCases: [
        { input: "await fetchData()", output: "'data'", hidden: false },
        { input: "fetchData() instanceof Promise", output: "false", hidden: false },
        { input: "typeof (await fetchData())", output: "'string'", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "async-programming"]
    },
    {
      title: "Fix Closure Issue",
      description: "This function should create functions that remember their index, but they all return the same value.",
      options: ["function createFunctions() {\n  const functions = [];\n  for (var i = 0; i < 3; i++) {\n    functions.push(function() {\n      return i;\n    });\n  }\n  return functions;\n}"],
      testCases: [
        { input: "createFunctions()[0]()", output: "0", hidden: false },
        { input: "createFunctions()[1]()", output: "1", hidden: false },
        { input: "createFunctions()[2]()", output: "2", hidden: true }
      ],
      difficulty: "hard",
      tags: ["javascript", "closures"]
    },
    {
      title: "Fix Array Filter",
      description: "This function should filter even numbers from an array, but it's not working.",
      options: ["function filterEven(arr) {\n  return arr.filter(num => num % 2 === 1);\n}"],
      testCases: [
        { input: "filterEven([1, 2, 3, 4, 5, 6])", output: "[2, 4, 6]", hidden: false },
        { input: "filterEven([1, 3, 5])", output: "[]", hidden: false },
        { input: "filterEven([2, 4, 8])", output: "[2, 4, 8]", hidden: true }
      ],
      difficulty: "easy",
      tags: ["javascript", "data-structures"]
    },
    {
      title: "Fix Object Merge",
      description: "This function should merge two objects, but it's modifying the original objects.",
      options: ["function mergeObjects(obj1, obj2) {\n  Object.assign(obj1, obj2);\n  return obj1;\n}"],
      testCases: [
        { input: "mergeObjects({a: 1}, {b: 2})", output: "{a: 1, b: 2}", hidden: false },
        { input: "Original obj1 unchanged", output: "true", hidden: false },
        { input: "mergeObjects({x: 1}, {x: 2})", output: "{x: 2}", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "objects"]
    },
    {
      title: "Fix Recursive Function",
      description: "This recursive function should calculate Fibonacci numbers, but it has a bug.",
      options: ["function fibonacci(n) {\n  if (n <= 1) {\n    return 1;\n  }\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}"],
      testCases: [
        { input: "fibonacci(0)", output: "0", hidden: false },
        { input: "fibonacci(1)", output: "1", hidden: false },
        { input: "fibonacci(5)", output: "5", hidden: true }
      ],
      difficulty: "medium",
      tags: ["javascript", "functions"]
    },
    {
      title: "Fix Event Handler",
      description: "This code should add click handlers to buttons, but all buttons show the same number.",
      options: ["function addClickHandlers() {\n  const buttons = document.querySelectorAll('button');\n  for (var i = 0; i < buttons.length; i++) {\n    buttons[i].onclick = function() {\n      console.log('Button ' + i + ' clicked');\n    };\n  }\n}"],
      testCases: [
        { input: "Button 0 click", output: "'Button 0 clicked'", hidden: false },
        { input: "Button 1 click", output: "'Button 1 clicked'", hidden: false },
        { input: "Button 2 click", output: "'Button 2 clicked'", hidden: true }
      ],
      difficulty: "hard",
      tags: ["javascript", "closures", "dom"]
    }
  ]
};

async function seedJavaScriptQuestions() {
  try {
    console.log('Seeding JavaScript questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'javascript' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      javascriptQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'javascript',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} JavaScript questions`);
    console.log(`   - Multiple Choice: ${javascriptQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${javascriptQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${javascriptQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${javascriptQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding JavaScript questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedJavaScriptQuestions()
    .then(() => {
      console.log('JavaScript questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed JavaScript questions:', error);
      process.exit(1);
    });
}

module.exports = { seedJavaScriptQuestions, javascriptQuestions };