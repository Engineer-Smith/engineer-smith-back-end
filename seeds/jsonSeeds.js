const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const jsonQuestions = {
  multipleChoice: [
    {
      title: "JSON Syntax",
      description: "Which character pair denotes a JSON object?",
      options: ["", "{}", "[]", "()", "<>"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "JSON Data Types",
      description: "Which of these is a valid JSON data type?",
      options: ["", "Function", "Object", "Date", "Undefined"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["data-structures"]
    },
    {
      title: "JSON Arrays",
      description: "Which character pair denotes a JSON array?",
      options: ["", "{}", "[]", "()", "{}"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["data-structures"]
    },
    {
      title: "JSON Parsing",
      description: "Which JavaScript method parses a JSON string?",
      options: ["", "JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.decode()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "JSON Serialization",
      description: "Which JavaScript method converts an object to a JSON string?",
      options: ["", "JSON.parse()", "JSON.stringify()", "JSON.encode()", "JSON.toString()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "JSON Values",
      description: "Which value is NOT allowed in JSON?",
      options: ["", "null", "undefined", "true", "0"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["data-structures"]
    },
    {
      title: "JSON Object Keys",
      description: "What type must JSON object keys be?",
      options: ["", "Number", "String", "Boolean", "Object"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "JSON Nested Objects",
      description: "What is the maximum depth of nested objects in JSON?",
      options: ["", "No limit", "10", "100", "1000"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "JSON Validation",
      description: "Which tool is commonly used to validate JSON?",
      options: ["", "JSONLint", "ESLint", "JSHint", "TypeScript"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "JSON Arrays",
      description: "Which is a valid JSON array?",
      options: ["", "[1, 'text', true]", "[1, function() {}, null]", "[undefined, true]", "[1, {2: 3}]"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["data-structures"]
    },
    {
      title: "JSON String Escaping",
      description: "Which character escapes special characters in JSON strings?",
      options: ["", "/", "\\", "*", "&"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "JSON Parsing Errors",
      description: "What happens when JSON.parse() encounters invalid JSON?",
      options: ["", "Returns null", "Throws SyntaxError", "Returns undefined", "Logs warning"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["error-handling"]
    },
    {
      title: "JSON Object Access",
      description: "How do you access a nested JSON object property in JavaScript?",
      options: ["", "obj->prop", "obj.prop.subprop", "obj[prop][subprop]", "Both obj.prop.subprop and obj[prop][subprop]"],
      correctAnswer: 4,
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "JSON Schema",
      description: "What is JSON Schema used for?",
      options: ["", "Parsing JSON", "Validating JSON structure", "Stringifying objects", "Formatting JSON"],
      correctAnswer: 2,
      difficulty: "hard",
      tags: ["objects"]
    },
    {
      title: "JSON Performance",
      description: "Which operation is generally faster in JavaScript?",
      options: ["", "JSON.parse()", "JSON.stringify()", "Both are equal", "Depends on data size"],
      correctAnswer: 4,
      difficulty: "hard",
      tags: ["objects"]
    }
  ],
  trueFalse: [
    {
      title: "JSON Syntax",
      description: "JSON objects must have string keys.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "JSON Data Types",
      description: "JSON supports functions as values.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["data-structures"]
    },
    {
      title: "JSON Arrays",
      description: "JSON arrays can contain mixed data types.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["data-structures"]
    },
    {
      title: "JSON Parsing",
      description: "JSON.parse() can throw an error on invalid input.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["error-handling"]
    },
    {
      title: "JSON Serialization",
      description: "JSON.stringify() converts undefined to null.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "JSON Whitespace",
      description: "Whitespace is significant in JSON data.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "JSON Nested Objects",
      description: "JSON supports nested objects and arrays.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["objects", "data-structures"]
    },
    {
      title: "JSON Comments",
      description: "JSON allows comments like JavaScript.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "JSON Validation",
      description: "Invalid JSON can be validated using try/catch with JSON.parse().",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["error-handling"]
    },
    {
      title: "JSON Numbers",
      description: "JSON supports both integers and floating-point numbers.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["data-structures"]
    },
    {
      title: "JSON Escaping",
      description: "Special characters in JSON strings must be escaped.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "JSON Schema",
      description: "JSON Schema can enforce specific data types.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["objects"]
    },
    {
      title: "JSON Object Keys",
      description: "JSON object keys must be unique.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "JSON Parsing",
      description: "JSON.parse() modifies the original JSON string.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "JSON Serialization",
      description: "JSON.stringify() can handle circular references by default.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "hard",
      tags: ["error-handling"]
    }
  ],
  codeChallenge: [
    {
      title: "Parse JSON String",
      description: "Write a function to parse a JSON string and return an object.",
      options: ["function parseJson(jsonString) {\n  // Your code here\n}"],
      testCases: [
        { input: "{\"name\": \"John\"}", output: "{name: 'John'}", hidden: false },
        { input: "{}", output: "{}", hidden: false },
        { input: "Error handling", output: "Handles invalid JSON", hidden: true }
      ],
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "Create JSON Object",
      description: "Write a function to create a JSON string from an object.",
      options: ["function createJson(name, age) {\n  // Your code here\n}"],
      testCases: [
        { input: "John, 30", output: "{\"name\":\"John\",\"age\":30}", hidden: false },
        { input: "Empty object", output: "{}", hidden: false },
        { input: "Correct format", output: "Valid JSON string", hidden: true }
      ],
      difficulty: "easy",
      tags: ["objects"]
    },
    {
      title: "Validate JSON",
      description: "Write a function to validate a JSON string.",
      options: ["function isValidJson(jsonString) {\n  // Your code here\n}"],
      testCases: [
        { input: "{\"valid\": true}", output: "true", hidden: false },
        { input: "{invalid}", output: "false", hidden: false },
        { input: "Error handling", output: "Uses try/catch", hidden: true }
      ],
      difficulty: "medium",
      tags: ["error-handling"]
    },
    {
      title: "Access Nested JSON",
      description: "Write a function to access a nested property in a JSON object.",
      options: ["function getNestedValue(jsonObj, key1, key2) {\n  // Your code here\n}"],
      testCases: [
        { input: "{user: {name: 'John'}}", output: "John", hidden: false },
        { input: "Missing key", output: "undefined", hidden: false },
        { input: "Safe access", output: "Handles missing properties", hidden: true }
      ],
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "Filter JSON Array",
      description: "Write a function to filter objects in a JSON array by a property value.",
      options: ["function filterJsonArray(jsonArray, key, value) {\n  // Your code here\n}"],
      testCases: [
        { input: "[{age: 30}, {age: 20}], age, 30", output: "[{age: 30}]", hidden: false },
        { input: "[], age, 30", output: "[]", hidden: false },
        { input: "Correct filtering", output: "Filters by key/value", hidden: true }
      ],
      difficulty: "medium",
      tags: ["data-structures"]
    },
    {
      title: "Merge JSON Objects",
      description: "Write a function to merge two JSON objects.",
      options: ["function mergeJson(obj1, obj2) {\n  // Your code here\n}"],
      testCases: [
        { input: "{a: 1}, {b: 2}", output: "{a: 1, b: 2}", hidden: false },
        { input: "{}, {}", output: "{}", hidden: false },
        { input: "Conflict handling", output: "Handles overlapping keys", hidden: true }
      ],
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "Transform JSON",
      description: "Write a function to transform a JSON array by doubling numbers.",
      options: ["function doubleNumbers(jsonArray) {\n  // Your code here\n}"],
      testCases: [
        { input: "[1, 2, 3]", output: "[2, 4, 6]", hidden: false },
        { input: "[]", output: "[]", hidden: false },
        { input: "Type checking", output: "Handles only numbers", hidden: true }
      ],
      difficulty: "medium",
      tags: ["data-structures"]
    },
    {
      title: "Create Nested JSON",
      description: "Write a function to create a nested JSON object.",
      options: ["function createNestedJson(name, address) {\n  // Your code here\n}"],
      testCases: [
        { input: "John, {city: 'NY'}", output: "{user: {name: 'John', address: {city: 'NY'}}}", hidden: false },
        { input: "Empty input", output: "{user: {}}", hidden: false },
        { input: "Correct nesting", output: "Valid nested structure", hidden: true }
      ],
      difficulty: "hard",
      tags: ["objects"]
    },
    {
      title: "Flatten JSON Object",
      description: "Write a function to flatten a nested JSON object.",
      options: ["function flattenJson(jsonObj) {\n  // Your code here\n}"],
      testCases: [
        { input: "{a: {b: 1}}", output: "{a.b: 1}", hidden: false },
        { input: "{}", output: "{}", hidden: false },
        { input: "Correct flattening", output: "Handles nested objects", hidden: true }
      ],
      difficulty: "hard",
      tags: ["objects"]
    },
    {
      title: "Parse and Summarize",
      description: "Write a function to sum numbers in a JSON array.",
      options: ["function sumJsonArray(jsonArray) {\n  // Your code here\n}"],
      testCases: [
        { input: "[1, 2, 3]", output: "6", hidden: false },
        { input: "[]", output: "0", hidden: false },
        { input: "Type checking", output: "Handles only numbers", hidden: true }
      ],
      difficulty: "medium",
      tags: ["data-structures"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix JSON Parsing",
      description: "This JSON parsing fails on invalid input. Fix the error handling.",
      options: ["function parseJson(jsonString) {\n  return JSON.parse(jsonString);\n}"],
      testCases: [
        { input: "Error handling", output: "Adds try/catch", hidden: false },
        { input: "Valid JSON", output: "Parses correctly", hidden: false },
        { input: "Invalid JSON", output: "Returns fallback value", hidden: true }
      ],
      difficulty: "medium",
      tags: ["error-handling"]
    },
    {
      title: "Fix JSON Serialization",
      description: "This serialization fails on undefined. Fix the JSON.stringify call.",
      options: ["function createJson(obj) {\n  return JSON.stringify(obj);\n}"],
      testCases: [
        { input: "Undefined handling", output: "Handles undefined values", hidden: false },
        { input: "Valid object", output: "Stringifies correctly", hidden: false },
        { input: "Correct format", output: "Returns valid JSON", hidden: true }
      ],
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "Fix Nested Access",
      description: "This JSON access causes errors. Fix the property access.",
      options: ["function getName(jsonObj) {\n  return jsonObj.user.name;\n}"],
      testCases: [
        { input: "Safe access", output: "Uses optional chaining or checks", hidden: false },
        { input: "Valid access", output: "Returns name if exists", hidden: false },
        { input: "No errors", output: "Avoids undefined errors", hidden: true }
      ],
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "Fix JSON Array Filter",
      description: "This filter doesn’t work. Fix the array filtering logic.",
      options: ["function filterJson(jsonArray) {\n  return jsonArray.filter(item => item);\n}"],
      testCases: [
        { input: "Filter logic", output: "Filters by specific property", hidden: false },
        { input: "Array handling", output: "Maintains array structure", hidden: false },
        { input: "Correct results", output: "Returns filtered array", hidden: true }
      ],
      difficulty: "medium",
      tags: ["data-structures"]
    },
    {
      title: "Fix JSON Merge",
      description: "This merge function overwrites keys incorrectly. Fix the merge logic.",
      options: ["function mergeJson(obj1, obj2) {\n  return { ...obj1 };\n}"],
      testCases: [
        { input: "Merge logic", output: "Merges both objects", hidden: false },
        { input: "Key preservation", output: "Preserves all keys", hidden: false },
        { input: "Correct merge", output: "Handles overlapping keys", hidden: true }
      ],
      difficulty: "hard",
      tags: ["objects"]
    },
    {
      title: "Fix JSON Validation",
      description: "This validation always returns true. Fix the validation logic.",
      options: ["function isValidJson(jsonString) {\n  return true;\n}"],
      testCases: [
        { input: "Validation logic", output: "Uses JSON.parse with try/catch", hidden: false },
        { input: "Invalid JSON", output: "Returns false for invalid", hidden: false },
        { input: "Valid JSON", output: "Returns true for valid", hidden: true }
      ],
      difficulty: "medium",
      tags: ["error-handling"]
    },
    {
      title: "Fix JSON Array Transform",
      description: "This transform doesn’t handle numbers. Fix the mapping logic.",
      options: ["function doubleNumbers(jsonArray) {\n  return jsonArray.map(item => item);\n}"],
      testCases: [
        { input: "Number transform", output: "Doubles number values", hidden: false },
        { input: "Array handling", output: "Maintains array structure", hidden: false },
        { input: "Type checking", output: "Handles only numbers", hidden: true }
      ],
      difficulty: "medium",
      tags: ["data-structures"]
    },
    {
      title: "Fix Nested JSON Creation",
      description: "This function creates invalid JSON. Fix the nesting logic.",
      options: ["function createNestedJson(name) {\n  return { user: name };\n}"],
      testCases: [
        { input: "Nested structure", output: "Creates valid nested JSON", hidden: false },
        { input: "Property handling", output: "Nests name correctly", hidden: false },
        { input: "Valid JSON", output: "Returns valid JSON object", hidden: true }
      ],
      difficulty: "hard",
      tags: ["objects"]
    },
    {
      title: "Fix JSON String Escaping",
      description: "This JSON string has unescaped characters. Fix the string creation.",
      options: ["function createJsonString(text) {\n  return `{\"text\": \"${text}\"}`;\n}"],
      testCases: [
        { input: "Escaping", output: "Handles special characters", hidden: false },
        { input: "Valid JSON", output: "Returns valid JSON string", hidden: false },
        { input: "Correct format", output: "Escapes quotes correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["objects"]
    },
    {
      title: "Fix JSON Summarization",
      description: "This sum function doesn’t work. Fix the array summation.",
      options: ["function sumJsonArray(jsonArray) {\n  return jsonArray.reduce((sum, item) => sum, 0);\n}"],
      testCases: [
        { input: "Sum logic", output: "Sums number values", hidden: false },
        { input: "Array handling", output: "Maintains array structure", hidden: false },
        { input: "Type checking", output: "Handles only numbers", hidden: true }
      ],
      difficulty: "medium",
      tags: ["data-structures"]
    }
  ]
};

async function seedJsonQuestions() {
  try {
    console.log('Seeding JSON questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'json' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      jsonQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'json',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} JSON questions`);
    console.log(`   - Multiple Choice: ${jsonQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${jsonQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${jsonQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${jsonQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding JSON questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedJsonQuestions()
    .then(() => {
      console.log('JSON questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed JSON questions:', error);
      process.exit(1);
    });
}

module.exports = { seedJsonQuestions, jsonQuestions };