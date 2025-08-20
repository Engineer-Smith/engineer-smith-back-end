const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const dartQuestions = {
  multipleChoice: [
    {
      title: "Dart Variables",
      description: "Which keyword declares a variable that can be reassigned in Dart?",
      options: ["", "final", "const", "var", "static"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["dart", "variables"]
    },
    {
      title: "Dart Functions",
      description: "Which syntax defines a function in Dart?",
      options: ["", "function name() {}", "def name():", "void name() {}", "name() => {}"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["dart", "functions"]
    },
    {
      title: "Dart Classes",
      description: "Which keyword defines a class in Dart?",
      options: ["", "struct", "class", "type", "object"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["dart", "classes"]
    },
    {
      title: "Dart Null Safety",
      description: "Which operator allows safe property access in Dart?",
      options: ["", ".", "?.", "!", "??"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["dart", "variables"]
    },
    {
      title: "Dart Lists",
      description: "Which method adds an element to a Dart List?",
      options: ["", "push()", "add()", "append()", "insert()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Dart Futures",
      description: "Which keyword is used to handle asynchronous operations in Dart?",
      options: ["", "async", "await", "future", "promise"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["dart", "async-programming"]
    },
    {
      title: "Dart Constructors",
      description: "Which syntax defines a named constructor in Dart?",
      options: ["", "ClassName()", "ClassName.named()", "ClassName::named()", "new ClassName()"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["dart", "classes"]
    },
    {
      title: "Dart Type System",
      description: "Which type allows any value in Dart?",
      options: ["", "dynamic", "var", "Object", "any"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["dart", "variables"]
    },
    {
      title: "Dart String Interpolation",
      description: "Which syntax is used for string interpolation in Dart?",
      options: ["", "${}", "#{}", "%{}", "{}"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Dart Generics",
      description: "Which syntax defines a generic class in Dart?",
      options: ["", "class Name<T>", "class Name(T)", "class<T> Name", "generic Name<T>"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["dart", "classes"]
    },
    {
      title: "Dart Exception Handling",
      description: "Which keyword catches exceptions in Dart?",
      options: ["", "try", "catch", "except", "handle"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["dart", "error-handling"]
    },
    {
      title: "Dart Lists",
      description: "Which method removes the last element from a Dart List?",
      options: ["", "pop()", "removeLast()", "deleteLast()", "remove()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Dart Async/Await",
      description: "Which keyword waits for a Future to complete in Dart?",
      options: ["", "async", "await", "then", "future"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["dart", "async-programming"]
    },
    {
      title: "Dart Enums",
      description: "Which keyword defines an enum in Dart?",
      options: ["", "enum", "type", "const", "union"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Dart Maps",
      description: "Which method retrieves a value from a Dart Map?",
      options: ["", "get()", "value()", "[]", "fetch()"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    }
  ],
  trueFalse: [
    {
      title: "Dart Null Safety",
      description: "Dart’s null safety prevents null reference errors at compile time.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["dart", "variables"]
    },
    {
      title: "Dart Type System",
      description: "Dart is a dynamically typed language.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["dart", "variables"]
    },
    {
      title: "Dart Functions",
      description: "Functions in Dart can have optional parameters.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["dart", "functions"]
    },
    {
      title: "Dart Classes",
      description: "All Dart classes inherit from Object.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["dart", "classes"]
    },
    {
      title: "Dart Async",
      description: "All Dart Futures complete synchronously.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["dart", "async-programming"]
    },
    {
      title: "Dart Lists",
      description: "Dart Lists are fixed-length by default.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Dart Enums",
      description: "Dart enums can have methods.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Dart Exception Handling",
      description: "Dart uses try/catch for exception handling.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["dart", "error-handling"]
    },
    {
      title: "Dart String Interpolation",
      description: "Dart supports string interpolation with ${}.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Dart Generics",
      description: "Dart generics can be used with collections only.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["dart", "classes"]
    },
    {
      title: "Dart Futures",
      description: "Futures in Dart represent asynchronous operations.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["dart", "async-programming"]
    },
    {
      title: "Dart Variables",
      description: "Variables declared with const can be modified at runtime.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["dart", "variables"]
    },
    {
      title: "Dart Constructors",
      description: "Dart supports multiple constructors per class.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["dart", "classes"]
    },
    {
      title: "Dart Maps",
      description: "Dart Maps maintain insertion order.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Dart Type Inference",
      description: "Dart can infer types for untyped variables.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["dart", "variables"]
    }
  ],
  codeChallenge: [
    {
      title: "Create a Function",
      description: "Write a Dart function to calculate the square of a number.",
      options: ["int square(int n) {\n  // Your code here\n}"],
      testCases: [
        { input: "square(5)", output: "25", hidden: false },
        { input: "square(0)", output: "0", hidden: false },
        { input: "square(-3)", output: "9", hidden: true }
      ],
      difficulty: "easy",
      tags: ["dart", "functions"]
    },
    {
      title: "Create a Class",
      description: "Create a Dart class for a Rectangle with area calculation.",
      options: ["class Rectangle {\n  // Your code here\n}"],
      testCases: [
        { input: "Rectangle properties", output: "Has width and height", hidden: false },
        { input: "Area method", output: "Calculates width * height", hidden: false },
        { input: "Correct area", output: "Returns correct area", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "classes"]
    },
    {
      title: "Reverse a List",
      description: "Write a Dart function to reverse a List.",
      options: ["List<T> reverseList<T>(List<T> list) {\n  // Your code here\n}"],
      testCases: [
        { input: "reverseList([1, 2, 3])", output: "[3, 2, 1]", hidden: false },
        { input: "reverseList(['a', 'b'])", output: "['b', 'a']", hidden: false },
        { input: "reverseList([])", output: "[]", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Handle Async Operation",
      description: "Write an async Dart function to fetch data with a delay.",
      options: ["Future<String> fetchData() async {\n  // Your code here\n}"],
      testCases: [
        { input: "Async function", output: "Uses async/await", hidden: false },
        { input: "Delay simulation", output: "Simulates delay", hidden: false },
        { input: "Correct result", output: "Returns data", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "async-programming"]
    },
    {
      title: "Exception Handling",
      description: "Write a Dart function that handles division by zero.",
      options: ["double safeDivide(double a, double b) {\n  // Your code here\n}"],
      testCases: [
        { input: "safeDivide(10, 2)", output: "5.0", hidden: false },
        { input: "safeDivide(10, 0)", output: "Throws exception", hidden: false },
        { input: "Error handling", output: "Uses try/catch", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "error-handling"]
    },
    {
      title: "Create a Map",
      description: "Write a Dart function to create a Map from two lists.",
      options: ["Map<K, V> createMap<K, V>(List<K> keys, List<V> values) {\n  // Your code here\n}"],
      testCases: [
        { input: "createMap([1, 2], ['a', 'b'])", output: "{1: 'a', 2: 'b'}", hidden: false },
        { input: "createMap([], [])", output: "{}", hidden: false },
        { input: "Correct pairing", output: "Pairs keys and values", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Filter List",
      description: "Write a Dart function to filter even numbers from a List.",
      options: ["List<int> filterEvens(List<int> numbers) {\n  // Your code here\n}"],
      testCases: [
        { input: "filterEvens([1, 2, 3, 4])", output: "[2, 4]", hidden: false },
        { input: "filterEvens([1, 3])", output: "[]", hidden: false },
        { input: "filterEvens([2, 4])", output: "[2, 4]", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Create an Enum",
      description: "Write a Dart enum for days of the week.",
      options: ["// Your code here"],
      testCases: [
        { input: "Enum definition", output: "Defines enum Days", hidden: false },
        { input: "Values", output: "Includes all 7 days", hidden: false },
        { input: "Correct usage", output: "Usable in switch or comparison", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Create a Generic Class",
      description: "Write a Dart generic class for a Pair.",
      options: ["class Pair<T, U> {\n  // Your code here\n}"],
      testCases: [
        { input: "Generic class", output: "Defines Pair<T, U>", hidden: false },
        { input: "Properties", output: "Has first and second", hidden: false },
        { input: "Type safety", output: "Maintains generic types", hidden: true }
      ],
      difficulty: "hard",
      tags: ["dart", "classes"]
    },
    {
      title: "String Concatenation",
      description: "Write a Dart function to concatenate a List of strings.",
      options: ["String concatenate(List<String> strings) {\n  // Your code here\n}"],
      testCases: [
        { input: "concatenate(['a', 'b', 'c'])", output: "'abc'", hidden: false },
        { input: "concatenate([])", output: "''", hidden: false },
        { input: "Correct joining", output: "Joins strings without separator", hidden: true }
      ],
      difficulty: "easy",
      tags: ["dart", "data-structures"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix Variable Declaration",
      description: "This variable declaration causes a type error. Fix it.",
      options: ["var x = '1';\nx += 2;"],
      testCases: [
        { input: "Type correction", output: "Converts string to int", hidden: false },
        { input: "Correct result", output: "Returns 3", hidden: false },
        { input: "Type safety", output: "Avoids type errors", hidden: true }
      ],
      difficulty: "easy",
      tags: ["dart", "variables"]
    },
    {
      title: "Fix Function Return",
      description: "This function returns incorrect type. Fix the return type.",
      options: ["int add(a, b) {\n  return '$a + $b';\n}"],
      testCases: [
        { input: "Return type", output: "Returns int", hidden: false },
        { input: "Correct addition", output: "Returns a + b", hidden: false },
        { input: "Type safety", output: "Avoids string return", hidden: true }
      ],
      difficulty: "easy",
      tags: ["dart", "functions"]
    },
    {
      title: "Fix Class Property",
      description: "This class has untyped properties. Add proper types.",
      options: ["class Person {\n  var name;\n  Person(this.name);\n}"],
      testCases: [
        { input: "Property type", output: "Adds String type to name", hidden: false },
        { input: "Constructor", output: "Maintains initialization", hidden: false },
        { input: "Type safety", output: "Compiles without errors", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "classes"]
    },
    {
      title: "Fix Async Function",
      description: "This async function doesn’t await. Fix the async logic.",
      options: ["Future<int> getData() async {\n  return Future.value(42);\n}"],
      testCases: [
        { input: "Await usage", output: "Uses await for Future", hidden: false },
        { input: "Correct result", output: "Returns 42", hidden: false },
        { input: "Async handling", output: "Handles async correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "async-programming"]
    },
    {
      title: "Fix Exception Handling",
      description: "This function lacks error handling. Add try/catch.",
      options: ["double divide(double a, double b) {\n  return a / b;\n}"],
      testCases: [
        { input: "Error handling", output: "Adds try/catch", hidden: false },
        { input: "Zero division", output: "Handles division by zero", hidden: false },
        { input: "Correct result", output: "Returns valid division", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "error-handling"]
    },
    {
      title: "Fix List Operation",
      description: "This List operation causes an error. Fix the code.",
      options: ["List<int> numbers = [1, 2, 3];\nnumbers[3] = 4;"],
      testCases: [
        { input: "List access", output: "Uses add() or checks bounds", hidden: false },
        { input: "Correct result", output: "Adds 4 to list", hidden: false },
        { input: "No errors", output: "Avoids index errors", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Fix Map Access",
      description: "This Map access causes errors. Fix the key lookup.",
      options: ["Map<String, int> data = {'a': 1};\nint value = data['b'];"],
      testCases: [
        { input: "Safe access", output: "Uses []? or containsKey()", hidden: false },
        { input: "Error prevention", output: "Avoids null errors", hidden: false },
        { input: "Correct value", output: "Handles existing keys", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Fix Enum Usage",
      description: "This enum usage is incorrect. Fix the access.",
      options: ["enum Color { red, blue }\nColor color = Color[0];"],
      testCases: [
        { input: "Enum access", output: "Uses Color.red or similar", hidden: false },
        { input: "Correct value", output: "Accesses valid enum", hidden: false },
        { input: "No errors", output: "Compiles without errors", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "data-structures"]
    },
    {
      title: "Fix Generic Function",
      description: "This generic function has incorrect typing. Fix it.",
      options: ["T first(List list) {\n  return list[0];\n}"],
      testCases: [
        { input: "Generic type", output: "Uses List<T>", hidden: false },
        { input: "Correct return", output: "Returns first element", hidden: false },
        { input: "Type safety", output: "Maintains type", hidden: true }
      ],
      difficulty: "hard",
      tags: ["dart", "functions"]
    },
    {
      title: "Fix Constructor",
      description: "This constructor is incorrect. Fix the initialization.",
      options: ["class Point {\n  int x, y;\n  Point(x, y);\n}"],
      testCases: [
        { input: "Constructor fix", output: "Uses this.x, this.y", hidden: false },
        { input: "Property init", output: "Initializes x and y", hidden: false },
        { input: "No errors", output: "Compiles correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["dart", "classes"]
    }
  ]
};

async function seedDartQuestions() {
  try {
    console.log('Seeding Dart questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'dart' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      dartQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'dart',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} Dart questions`);
    console.log(`   - Multiple Choice: ${dartQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${dartQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${dartQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${dartQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding Dart questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedDartQuestions()
    .then(() => {
      console.log('Dart questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed Dart questions:', error);
      process.exit(1);
    });
}

module.exports = { seedDartQuestions, dartQuestions };