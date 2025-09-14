// seeds/jsonSeeds.js - Comprehensive JSON questions with enhanced validation
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

// Comprehensive JSON questions data - 60+ questions total
const jsonQuestions = {
  // 25 Multiple Choice Questions
  multipleChoice: [
    // Basic JSON Syntax (15 questions)
    {
      title: "JSON Object Syntax",
      description: "Which character pair denotes a JSON object?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-structures"],
      options: ["{}", "[]", "()", "<>"],
      correctAnswer: 0
    },
    {
      title: "JSON Array Syntax",
      description: "Which character pair denotes a JSON array?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-structures"],
      options: ["{}", "[]", "()", "<>"],
      correctAnswer: 1
    },
    {
      title: "JSON String Syntax",
      description: "How must JSON strings be enclosed?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "strings"],
      options: ["Single quotes", "Double quotes", "Backticks", "Any of the above"],
      correctAnswer: 1
    },
    {
      title: "JSON Key Requirements",
      description: "What type must JSON object keys be?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "objects"],
      options: ["Number", "String", "Boolean", "Any primitive type"],
      correctAnswer: 1
    },
    {
      title: "JSON Valid Data Types",
      description: "Which is NOT a valid JSON data type?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-types"],
      options: ["string", "number", "undefined", "boolean"],
      correctAnswer: 2
    },
    {
      title: "JSON Number Format",
      description: "Which number format is valid in JSON?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "numbers"],
      options: ["42", "0x42", "42n", "Infinity"],
      correctAnswer: 0
    },
    {
      title: "JSON Null Value",
      description: "How is null represented in JSON?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax"],
      options: ["NULL", "null", "nil", "None"],
      correctAnswer: 1
    },
    {
      title: "JSON Boolean Values",
      description: "Which boolean values are valid in JSON?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "booleans"],
      options: ["True/False", "TRUE/FALSE", "true/false", "1/0"],
      correctAnswer: 2
    },
    {
      title: "JSON Escape Characters",
      description: "Which character is used to escape special characters in JSON strings?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "strings"],
      options: ["/", "\\\\", "%", "&"],
      correctAnswer: 1
    },
    {
      title: "JSON Comments",
      description: "Are comments allowed in JSON?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax"],
      options: ["Yes, with //", "Yes, with /* */", "Yes, with #", "No, comments are not allowed"],
      correctAnswer: 3
    },
    {
      title: "JSON Whitespace",
      description: "How does JSON handle whitespace?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax"],
      options: ["Whitespace is significant", "Whitespace is ignored", "Only leading whitespace matters", "Only trailing whitespace matters"],
      correctAnswer: 1
    },
    {
      title: "JSON Trailing Commas",
      description: "Are trailing commas allowed in JSON?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax"],
      options: ["Always allowed", "Never allowed", "Only in arrays", "Only in objects"],
      correctAnswer: 1
    },
    {
      title: "JSON Unicode Support",
      description: "How are Unicode characters represented in JSON strings?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "strings"],
      options: ["\\\\uXXXX format", "\\\\xXX format", "%XX format", "Direct Unicode only"],
      correctAnswer: 0
    },
    {
      title: "JSON File Extension",
      description: "What is the standard file extension for JSON files?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax"],
      options: [".js", ".json", ".txt", ".data"],
      correctAnswer: 1
    },
    {
      title: "JSON MIME Type",
      description: "What is the correct MIME type for JSON?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "http-https", "rest-api"],
      options: ["text/json", "application/json", "text/javascript", "application/javascript"],
      correctAnswer: 1
    },

    // Advanced JSON Concepts (10 questions)
    {
      title: "JSON Schema Purpose",
      description: "What is JSON Schema used for?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-schema", "json-validation", "data-structures"],
      options: ["Parsing JSON", "Validating JSON structure", "Minifying JSON", "Converting JSON to XML"],
      correctAnswer: 1
    },
    {
      title: "JSON-LD",
      description: "What does JSON-LD stand for?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "data-structures"],
      options: ["JSON Linked Data", "JSON Large Data", "JSON Local Database", "JSON Live Document"],
      correctAnswer: 0
    },
    {
      title: "JSON Patch",
      description: "What is JSON Patch used for?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-api", "data-structures"],
      options: ["Fixing invalid JSON", "Describing changes to JSON documents", "Compressing JSON", "Encrypting JSON"],
      correctAnswer: 1
    },
    {
      title: "JSON Path",
      description: "What is JSONPath used for?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-parsing", "data-structures"],
      options: ["File system paths", "Querying JSON data", "URL routing", "API endpoints"],
      correctAnswer: 1
    },
    {
      title: "JSON Lines Format",
      description: "What characterizes JSON Lines (JSONL) format?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax"],
      options: ["Compressed JSON", "One JSON object per line", "JSON with line numbers", "Multi-line JSON strings"],
      correctAnswer: 1
    },
    {
      title: "JSON Streaming",
      description: "What is a challenge with streaming large JSON files?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-parsing", "performance-web"],
      options: ["File size limits", "Network bandwidth", "Parser memory usage", "All of the above"],
      correctAnswer: 3
    },
    {
      title: "JSON vs XML",
      description: "What is a key advantage of JSON over XML?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "data-structures"],
      options: ["Better validation", "Smaller size", "More features", "Older standard"],
      correctAnswer: 1
    },
    {
      title: "JSON Security",
      description: "What is a common security concern with JSON?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "security", "json-parsing"],
      options: ["Buffer overflow", "Injection attacks", "Memory leaks", "All of the above"],
      correctAnswer: 1
    },
    {
      title: "JSON Canonicalization",
      description: "What is JSON canonicalization?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-serialization", "data-structures"],
      options: ["Converting to XML", "Standardizing format for comparison", "Compressing data", "Adding validation"],
      correctAnswer: 1
    },
    {
      title: "JSON Binary Formats",
      description: "Which is an example of a binary JSON format?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-serialization", "performance-web"],
      options: ["BSON", "JSONB", "MessagePack", "All of the above"],
      correctAnswer: 3
    }
  ],

  // 25 True/False Questions
  trueFalse: [
    // Basic JSON Rules (15 questions)
    {
      title: "JSON String Keys",
      description: "JSON object keys must be strings enclosed in double quotes.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "objects"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Function Support",
      description: "JSON supports functions as values.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-types"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "JSON Mixed Arrays",
      description: "JSON arrays can contain mixed data types.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "arrays"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Single Quotes",
      description: "JSON strings can be enclosed in single quotes.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "strings"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "JSON Undefined Values",
      description: "JSON supports undefined as a value.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-types"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "JSON Nested Structures",
      description: "JSON supports nested objects and arrays.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-structures"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Comment Support",
      description: "Standard JSON allows comments.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "JSON Key Uniqueness",
      description: "JSON object keys must be unique within the same object.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "objects"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Hex Numbers",
      description: "JSON supports hexadecimal number notation.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "numbers"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "JSON Date Objects",
      description: "JSON has native support for Date objects.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-types"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "JSON Case Sensitivity",
      description: "JSON is case-sensitive for all values.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Empty Objects",
      description: "Empty objects {} are valid JSON.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "objects"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Empty Arrays",
      description: "Empty arrays [] are valid JSON.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "arrays"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Root Arrays",
      description: "A JSON document can have an array as its root element.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "arrays"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Multiline Strings",
      description: "JSON strings can span multiple lines without escaping.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "strings"],
      options: ["True", "False"],
      correctAnswer: 1
    },

    // Advanced JSON Concepts (10 questions)
    {
      title: "JSON Schema Validation",
      description: "JSON Schema can validate the structure and data types of JSON documents.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-schema", "json-validation"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Circular References",
      description: "JSON format naturally supports circular references.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-serialization", "data-structures"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "JSON UTF-8 Encoding",
      description: "JSON documents should be encoded in UTF-8.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "encoding"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Performance",
      description: "JSON is generally faster to parse than XML.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["json", "performance-web", "json-parsing"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Patch Operations",
      description: "JSON Patch can add, remove, and replace values in JSON documents.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-api", "data-structures"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Web Tokens",
      description: "JWTs use JSON format for their payload.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["json", "json-web-tokens", "security", "authentication"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON API Standard",
      description: "JSON API is a specification for building APIs with JSON.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-api", "rest-api"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Binary Efficiency",
      description: "Binary JSON formats like BSON are more space-efficient than text JSON.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-serialization", "performance-web"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Streaming Parsers",
      description: "Streaming JSON parsers can process large files without loading everything into memory.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["json", "json-parsing", "performance-web"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "JSON Content Negotiation",
      description: "HTTP Accept headers can specify JSON as the preferred response format.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["json", "http-https", "rest-api"],
      options: ["True", "False"],
      correctAnswer: 0
    }
  ],

  // 15 Fill-in-the-Blank Questions
  fillInTheBlank: [
    {
      title: "Basic JSON Object Structure",
      description: "Complete the basic JSON object structure with proper syntax:",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "objects"],
      codeTemplate: `___blank1___
  "name": "John",
  "age": ___blank2___,
  "active": ___blank3___
___blank4___`,
      blanks: [
        { id: 'blank1', correctAnswers: ['{'], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['30', '25', '35', '20'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['true', 'false'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['}'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: "JSON Array with Mixed Types",
      description: "Complete the JSON array containing different data types:",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "arrays", "data-types"],
      codeTemplate: `___blank1___
  "apple",
  ___blank2___,
  ___blank3___,
  ___blank4___
___blank5___`,
      blanks: [
        { id: 'blank1', correctAnswers: ['['], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['42', '100', '1', '0'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['true', 'false'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['null'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: [']'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: "Nested JSON Structure",
      description: "Complete the nested JSON object with proper nesting:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "objects", "data-structures"],
      codeTemplate: `{
  "user": ___blank1___
    "id": 1,
    "profile": {
      "email": "john@example.com",
      "verified": ___blank2___
    }
  ___blank3___
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['{'], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['true', 'false'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['}'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: "JSON String Escaping",
      description: "Complete the JSON with properly escaped string values:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "strings"],
      codeTemplate: `{
  "message": "She said ___blank1___Hello___blank2___",
  "path": "C:___blank3___Users___blank4___Documents",
  "unicode": "___blank5___u0041___blank6___u0042"
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['\\"'], caseSensitive: true, points: 2 },
        { id: 'blank2', correctAnswers: ['\\"'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['\\\\'], caseSensitive: true, points: 2 },
        { id: 'blank4', correctAnswers: ['\\\\'], caseSensitive: true, points: 1 },
        { id: 'blank5', correctAnswers: ['\\'], caseSensitive: true, points: 1 },
        { id: 'blank6', correctAnswers: ['\\'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: "JSON Array of Objects",
      description: "Complete the JSON array containing object elements:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "arrays", "objects"],
      codeTemplate: `___blank1___
  ___blank2___
    "name": "Apple",
    "price": ___blank3___
  },
  {
    "name": "Orange",
    "price": 0.75
  }
___blank4___`,
      blanks: [
        { id: 'blank1', correctAnswers: ['['], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['{'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['1.50', '1.25', '2.00', '1.0'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: [']'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: "JSON Configuration Structure",
      description: "Complete this JSON configuration object:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "objects", "data-structures"],
      codeTemplate: `{
  "___blank1___": "myapp",
  "version": "___blank2___",
  "server": {
    "host": "localhost",
    "port": ___blank3___,
    "ssl": ___blank4___
  },
  "features": ___blank5___"auth", "logging", "cache"___blank6___
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['name', 'appName'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['1.0.0', '2.0.0', '1.0'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['8080', '3000', '80', '443'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['true', 'false'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['['], caseSensitive: true, points: 1 },
        { id: 'blank6', correctAnswers: [']'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: "Basic JSON Schema",
      description: "Complete this basic JSON Schema definition:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["json", "json-schema", "json-validation"],
      codeTemplate: `{
  "___blank1___": "https://json-schema.org/draft/2020-12/schema",
  "___blank2___": "object",
  "properties": ___blank3___
    "name": {
      "type": "___blank4___"
    },
    "age": {
      "type": "___blank5___"
    }
  ___blank6___
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['$schema'], caseSensitive: true, points: 2 },
        { id: 'blank2', correctAnswers: ['type'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['{'], caseSensitive: true, points: 1 },
        { id: 'blank4', correctAnswers: ['string'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['number', 'integer'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['}'], caseSensitive: true, points: 1 }
      ]
    },
    {
      title: "JSON API Response Format",
      description: "Complete the JSON API specification response structure:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["json", "json-api", "rest-api"],
      codeTemplate: `{
  "___blank1___": {
    "___blank2___": "users",
    "id": "1",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['data'], caseSensitive: true, points: 2 },
        { id: 'blank2', correctAnswers: ['type'], caseSensitive: true, points: 2 }
      ]
    },
    {
      title: "JSON with Null and Optional Values",
      description: "Complete the JSON structure handling null and optional values:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-types"],
      codeTemplate: `{
  "name": "John",
  "middleName": ___blank1___,
  "phone": ___blank2___,
  "active": ___blank3___,
  "lastLogin": ___blank4___
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['null'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['"555-0123"', 'null'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['true', 'false'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['null', '"2023-12-01"'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "JSON Number Formats",
      description: "Complete the JSON with various valid number formats:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "numbers"],
      codeTemplate: `{
  "integer": ___blank1___,
  "decimal": ___blank2___,
  "negative": ___blank3___,
  "zero": ___blank4___,
  "scientific": ___blank5___
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['42', '100', '1'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['3.14', '1.5', '2.0'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['-42', '-1', '-10'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['0'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['1.23e10', '1e5', '2.5e-3'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complex JSON Data Structure",
      description: "Complete this complex nested JSON structure:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["json", "json-syntax", "data-structures", "objects"],
      codeTemplate: `{
  "users": ___blank1___
    {
      "id": 1,
      "name": "Alice",
      "roles": ___blank2___"admin", "user"___blank3___
    },
    {
      "id": 2,
      "name": "Bob",
      "roles": ["user"]
    }
  ___blank4___,
  "meta": {
    "total": ___blank5___,
    "page": 1
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['['], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['['], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: [']'], caseSensitive: true, points: 1 },
        { id: 'blank4', correctAnswers: [']'], caseSensitive: true, points: 1 },
        { id: 'blank5', correctAnswers: ['2'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "JSON Error Response",
      description: "Complete the JSON error response structure:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["json", "json-api", "error-handling"],
      codeTemplate: `{
  "___blank1___": {
    "code": ___blank2___,
    "message": "___blank3___",
    "details": ___blank4___
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['error', 'errors'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['404', '400', '500'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['Not Found', 'Bad Request', 'Validation Error'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['null', '[]', '{}'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "JSON Web Token Structure",
      description: "Complete the JSON Web Token payload structure:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["json", "json-web-tokens", "security", "authentication"],
      codeTemplate: `{
  "___blank1___": "1234567890",
  "___blank2___": "John Doe",
  "___blank3___": 1516239022,
  "___blank4___": 1516242622,
  "___blank5___": "example.com"
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['sub'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['name'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['iat'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['exp'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['iss'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "JSON-LD Linked Data",
      description: "Complete the JSON-LD (Linked Data) structure:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["json", "data-structures"],
      codeTemplate: `{
  "___blank1___": "https://schema.org/",
  "___blank2___": "Person",
  "name": "John Doe",
  "jobTitle": "Software Engineer",
  "url": "___blank3___"
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['@context'], caseSensitive: true, points: 2 },
        { id: 'blank2', correctAnswers: ['@type'], caseSensitive: true, points: 2 },
        { id: 'blank3', correctAnswers: ['https://johndoe.com', 'http://johndoe.com'], caseSensitive: false, points: 1 }
      ]
    }
  ]
};

async function seedJsonQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE JSON question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(jsonQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(jsonQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = jsonQuestions.fillInTheBlank.length;
    const totalBlanks = jsonQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    
    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('json');

    // Delete existing JSON questions
    await processor.deleteByLanguage('json');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(jsonQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'json', status: 'active' },
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

    // Enhanced validation (JSON is syntax-only, no code execution)
    console.log('🔍 Running COMPREHENSIVE validation with enhanced fill-in-blank testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: false // JSON questions are syntax-only
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'JSON');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE JSON question seeding completed successfully!');
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
      return await Question.find({ language: 'json' }).select('_id title type');

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
    console.error('💥 JSON seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedJsonQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive JSON questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust fill-in-blank validation!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed JSON questions:', error);
      process.exit(1);
    });
}

module.exports = { seedJsonQuestions, jsonQuestions };