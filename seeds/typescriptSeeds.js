const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const typescriptQuestions = {
  multipleChoice: [
    {
      title: "TypeScript Types",
      description: "Which keyword declares a variable with a specific type in TypeScript?",
      options: ["", "var", "let", "type", ":"],
      correctAnswer: 4,
      difficulty: "easy",
      tags: ["typescript", "variables"]
    },
    {
      title: "TypeScript Interfaces",
      description: "Which keyword defines a contract for an object’s shape in TypeScript?",
      options: ["", "class", "interface", "type", "struct"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "TypeScript Functions",
      description: "How do you specify a function’s return type in TypeScript?",
      options: ["", "=> type", ": type", "-> type", "return type"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["typescript", "functions"]
    },
    {
      title: "TypeScript Generics",
      description: "Which syntax defines a generic function in TypeScript?",
      options: ["", "function<T>", "<T>function", "function name<T>", "generic<T>"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["typescript", "functions"]
    },
    {
      title: "TypeScript Modules",
      description: "Which keyword exports a module in TypeScript?",
      options: ["", "import", "export", "module", "require"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["typescript", "modules"]
    },
    {
      title: "TypeScript Null Safety",
      description: "Which operator accesses properties safely in TypeScript?",
      options: ["", ".", "?.", "!", "??"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["typescript", "variables"]
    },
    {
      title: "TypeScript Classes",
      description: "Which keyword defines a class in TypeScript?",
      options: ["", "struct", "class", "type", "interface"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["typescript", "classes"]
    },
    {
      title: "TypeScript Type Inference",
      description: "When does TypeScript infer types automatically?",
      options: ["", "Only with var", "During variable initialization", "Only in functions", "Never"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["typescript", "variables"]
    },
    {
      title: "TypeScript Union Types",
      description: "Which symbol defines a union type in TypeScript?",
      options: ["", "&", "|", ":", ","],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "TypeScript Error Handling",
      description: "Which construct handles exceptions in TypeScript?",
      options: ["", "try/catch", "try/except", "throw/catch", "error/rescue"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["typescript", "error-handling"]
    },
    {
      title: "TypeScript Enums",
      description: "Which keyword defines an enum in TypeScript?",
      options: ["", "enum", "type", "const", "union"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "TypeScript Access Modifiers",
      description: "Which modifier restricts a property to a class in TypeScript?",
      options: ["", "public", "private", "protected", "static"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["typescript", "classes"]
    },
    {
      title: "TypeScript Type Aliases",
      description: "Which keyword creates a type alias in TypeScript?",
      options: ["", "interface", "type", "alias", "typedef"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "TypeScript Generics Constraint",
      description: "Which keyword constrains a generic type in TypeScript?",
      options: ["", "extends", "implements", "with", "restrict"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["typescript", "functions"]
    },
    {
      title: "TypeScript Type Assertions",
      description: "Which operator performs type assertion in TypeScript?",
      options: ["", "as", "is", ":", "!"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["typescript", "variables"]
    }
  ],
  trueFalse: [
    {
      title: "TypeScript Typing",
      description: "TypeScript is a superset of JavaScript.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["typescript"]
    },
    {
      title: "TypeScript Null Safety",
      description: "TypeScript’s strictNullChecks prevents null assignments by default.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["typescript", "variables"]
    },
    {
      title: "TypeScript Interfaces",
      description: "Interfaces in TypeScript can extend other interfaces.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "TypeScript Functions",
      description: "TypeScript requires explicit return types for all functions.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["typescript", "functions"]
    },
    {
      title: "TypeScript Generics",
      description: "Generics in TypeScript allow reusable type-safe code.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["typescript", "functions"]
    },
    {
      title: "TypeScript Modules",
      description: "TypeScript modules are compatible with ES modules.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["typescript", "modules"]
    },
    {
      title: "TypeScript Classes",
      description: "TypeScript classes support private fields with # syntax.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["typescript", "classes"]
    },
    {
      title: "TypeScript Enums",
      description: "Enums in TypeScript are only numeric.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "TypeScript Type Inference",
      description: "TypeScript infers types for unannotated variables.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["typescript", "variables"]
    },
    {
      title: "TypeScript Error Handling",
      description: "TypeScript changes JavaScript’s runtime error handling.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["typescript", "error-handling"]
    },
    {
      title: "TypeScript Union Types",
      description: "Union types allow a variable to hold multiple types.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "TypeScript Type Aliases",
      description: "Type aliases can define primitive types only.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "TypeScript Access Modifiers",
      description: "Protected members are accessible in subclasses.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["typescript", "classes"]
    },
    {
      title: "TypeScript Generics",
      description: "Generics in TypeScript can be constrained to specific types.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["typescript", "functions"]
    },
    {
      title: "TypeScript Type Assertions",
      description: "Type assertions change the runtime type of a variable.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["typescript", "variables"]
    }
  ],
  codeChallenge: [
    {
      title: "Define a Typed Function",
      description: "Write a TypeScript function that adds two numbers with explicit types.",
      options: ["function add(a: number, b: number): number {\n  // Your code here\n}"],
      testCases: [
        { input: "add(2, 3)", output: "5", hidden: false },
        { input: "add(0, 0)", output: "0", hidden: false },
        { input: "Type safety", output: "Enforces number types", hidden: true }
      ],
      difficulty: "easy",
      tags: ["typescript", "functions"]
    },
    {
      title: "Create an Interface",
      description: "Define an interface for a User with name and age properties.",
      options: ["// Your code here"],
      testCases: [
        { input: "Interface definition", output: "Defines User interface", hidden: false },
        { input: "Properties", output: "Includes name and age", hidden: false },
        { input: "Type safety", output: "Enforces string and number types", hidden: true }
      ],
      difficulty: "easy",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "Implement a Generic Function",
      description: "Write a generic function that reverses an array.",
      options: ["function reverse<T>(arr: T[]): T[] {\n  // Your code here\n}"],
      testCases: [
        { input: "reverse([1, 2, 3])", output: "[3, 2, 1]", hidden: false },
        { input: "reverse(['a', 'b'])", output: "['b', 'a']", hidden: false },
        { input: "Type safety", output: "Maintains array type", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "functions"]
    },
    {
      title: "Create a Class",
      description: "Write a TypeScript class for a Car with make and model.",
      options: ["class Car {\n  // Your code here\n}"],
      testCases: [
        { input: "Class properties", output: "Has make and model", hidden: false },
        { input: "Constructor", output: "Initializes properties", hidden: false },
        { input: "Type safety", output: "Uses string types", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "classes"]
    },
    {
      title: "Handle Exceptions",
      description: "Write a function that handles division by zero with try/catch.",
      options: ["function safeDivide(a: number, b: number): number {\n  // Your code here\n}"],
      testCases: [
        { input: "safeDivide(10, 2)", output: "5", hidden: false },
        { input: "safeDivide(10, 0)", output: "Throws error", hidden: false },
        { input: "Error handling", output: "Uses try/catch", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "error-handling"]
    },
    {
      title: "Create a Module",
      description: "Write a module that exports a sum function.",
      options: ["// Your code here"],
      testCases: [
        { input: "Module export", output: "Exports sum function", hidden: false },
        { input: "Function logic", output: "Sums two numbers", hidden: false },
        { input: "Type safety", output: "Uses number types", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "modules"]
    },
    {
      title: "Filter Array",
      description: "Write a function to filter even numbers from an array.",
      options: ["function filterEvens(numbers: number[]): number[] {\n  // Your code here\n}"],
      testCases: [
        { input: "filterEvens([1, 2, 3, 4])", output: "[2, 4]", hidden: false },
        { input: "filterEvens([1, 3])", output: "[]", hidden: false },
        { input: "Type safety", output: "Maintains number type", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "Create a Generic Interface",
      description: "Define a generic interface for a Pair with key and value.",
      options: ["// Your code here"],
      testCases: [
        { input: "Generic interface", output: "Defines Pair<T, U>", hidden: false },
        { input: "Properties", output: "Includes key and value", hidden: false },
        { input: "Type safety", output: "Enforces generic types", hidden: true }
      ],
      difficulty: "hard",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "Implement Inheritance",
      description: "Create a base Animal class and a Dog subclass.",
      options: ["class Animal {\n  // Your code here\n}\n\nclass Dog extends Animal {\n  // Your code here\n}"],
      testCases: [
        { input: "Inheritance", output: "Dog extends Animal", hidden: false },
        { input: "Properties", output: "Inherits animal properties", hidden: false },
        { input: "Type safety", output: "Enforces types", hidden: true }
      ],
      difficulty: "hard",
      tags: ["typescript", "classes"]
    },
    {
      title: "Create a Union Type Function",
      description: "Write a function that handles string or number input.",
      options: ["function processInput(input: string | number): string {\n  // Your code here\n}"],
      testCases: [
        { input: "processInput(123)", output: "'123'", hidden: false },
        { input: "processInput('abc')", output: "'abc'", hidden: false },
        { input: "Type safety", output: "Handles union type", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix Type Annotation",
      description: "This function lacks type annotations. Add proper types.",
      options: ["function add(a, b) {\n  return a + b;\n}"],
      testCases: [
        { input: "add(2, 3)", output: "5", hidden: false },
        { input: "add(0, 0)", output: "0", hidden: false },
        { input: "Type safety", output: "Uses number types", hidden: true }
      ],
      difficulty: "easy",
      tags: ["typescript", "functions"]
    },
    {
      title: "Fix Interface Usage",
      description: "This interface usage is incorrect. Fix the object structure.",
      options: ["interface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = { name: 'John' };"],
      testCases: [
        { input: "user.name", output: "'John'", hidden: false },
        { input: "user.age", output: "number or undefined", hidden: false },
        { input: "Type safety", output: "Matches User interface", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "Fix Generic Function",
      description: "This generic function has incorrect typing. Fix the generic type.",
      options: ["function getFirst(arr) {\n  return arr[0];\n}"],
      testCases: [
        { input: "getFirst([1, 2, 3])", output: "1", hidden: false },
        { input: "getFirst(['a', 'b'])", output: "'a'", hidden: false },
        { input: "Type safety", output: "Maintains array type", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "functions"]
    },
    {
      title: "Fix Class Property",
      description: "This class property is untyped. Add proper type annotations.",
      options: ["class Person {\n  name;\n  constructor(name) {\n    this.name = name;\n  }\n}"],
      testCases: [
        { input: "new Person('John').name", output: "'John'", hidden: false },
        { input: "Type annotation", output: "Uses string type", hidden: false },
        { input: "Type safety", output: "Compiles without errors", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "classes"]
    },
    {
      title: "Fix Exception Handling",
      description: "This function lacks error handling. Add try/catch.",
      options: ["function parseJson(json: string): any {\n  return JSON.parse(json);\n}"],
      testCases: [
        { input: "parseJson('{\"key\": \"value\"}')", output: "{ key: 'value' }", hidden: false },
        { input: "parseJson('invalid')", output: "Throws error", hidden: false },
        { input: "Error handling", output: "Uses try/catch", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "error-handling"]
    },
    {
      title: "Fix Module Import",
      description: "This import is incorrect. Fix the module import.",
      options: ["import { sum } from 'math-utils';\nconst result = sum(2, 3);"],
      testCases: [
        { input: "sum(2, 3)", output: "5", hidden: false },
        { input: "Import syntax", output: "Uses correct import", hidden: false },
        { input: "Type safety", output: "Compiles without errors", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "modules"]
    },
    {
      title: "Fix Array Type",
      description: "This array lacks type safety. Fix the type annotation.",
      options: ["const numbers = [1, 2, 3];\nconst value = numbers[0];"],
      testCases: [
        { input: "numbers[0]", output: "1", hidden: false },
        { input: "Type annotation", output: "Uses number[]", hidden: false },
        { input: "Type safety", output: "Compiles without errors", hidden: true }
      ],
      difficulty: "easy",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "Fix Union Type",
      description: "This union type usage is incorrect. Fix the function logic.",
      options: ["function process(input: string | number) {\n  return input.length;\n}"],
      testCases: [
        { input: "process('abc')", output: "3", hidden: false },
        { input: "process(123)", output: "undefined or error", hidden: false },
        { input: "Type safety", output: "Handles union type", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "Fix Enum Usage",
      description: "This enum is used incorrectly. Fix the enum access.",
      options: ["enum Color { Red, Blue }\nconst color = Color[0];"],
      testCases: [
        { input: "color", output: "Color.Red or Color.Blue", hidden: false },
        { input: "Enum access", output: "Uses correct enum syntax", hidden: false },
        { input: "Type safety", output: "Compiles without errors", hidden: true }
      ],
      difficulty: "medium",
      tags: ["typescript", "data-structures"]
    },
    {
      title: "Fix Inheritance",
      description: "This class inheritance is incorrect. Fix the subclass.",
      options: ["class Animal {\n  name: string;\n}\n\nclass Dog {\n  // Your code here\n}"],
      testCases: [
        { input: "new Dog().name", output: "string or undefined", hidden: false },
        { input: "Inheritance", output: "Dog extends Animal", hidden: false },
        { input: "Type safety", output: "Compiles without errors", hidden: true }
      ],
      difficulty: "hard",
      tags: ["typescript", "classes"]
    }
  ]
};

async function seedTypescriptQuestions() {
  try {
    console.log('Seeding TypeScript questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'typescript' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      typescriptQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'typescript',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} TypeScript questions`);
    console.log(`   - Multiple Choice: ${typescriptQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${typescriptQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${typescriptQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${typescriptQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding TypeScript questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedTypescriptQuestions()
    .then(() => {
      console.log('TypeScript questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed TypeScript questions:', error);
      process.exit(1);
    });
}

module.exports = { seedTypescriptQuestions, typescriptQuestions };