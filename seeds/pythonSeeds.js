const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const pythonQuestions = {
  multipleChoice: [
    {
      title: "Python Data Types",
      description: "Which of these is a mutable data type in Python?",
      options: ["", "Tuple", "List", "String", "Integer"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["python", "data-structures"]
    },
    {
      title: "Python Functions",
      description: "What keyword defines a function in Python?",
      options: ["", "func", "define", "def", "function"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["python", "functions"]
    },
    {
      title: "List Comprehensions",
      description: "Which syntax creates a list of squares for numbers 1 to 5?",
      options: ["", "[x**2 for x in range(1, 5)]", "[x*x for x in range(1, 6)]", "[x^2 for x in range(1, 6)]", "[x**2 for x in range(1, 6)]"],
      correctAnswer: 4,
      difficulty: "medium",
      tags: ["python", "data-structures"]
    },
    {
      title: "Python Classes",
      description: "Which method is the constructor in a Python class?",
      options: ["", "__init__", "__new__", "__class__", "__construct__"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["python", "classes"]
    },
    {
      title: "Python Modules",
      description: "How do you import a module named 'math' in Python?",
      options: ["", "import math", "require math", "include math", "from math import *"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["python", "modules"]
    },
    {
      title: "Python Error Handling",
      description: "Which statement is used to catch exceptions in Python?",
      options: ["", "try", "except", "catch", "finally"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["python", "error-handling"]
    },
    {
      title: "Python Generators",
      description: "Which keyword creates a generator in Python?",
      options: ["", "return", "yield", "generate", "next"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["python", "functions"]
    },
    {
      title: "Python Decorators",
      description: "What is the syntax to apply a decorator to a function?",
      options: ["", "@decorator", "#decorator", "decorator()", "apply(decorator)"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["python", "functions"]
    },
    {
      title: "Python Loops",
      description: "Which loop is used to iterate over a sequence in Python?",
      options: ["", "while", "for", "do", "loop"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["python", "loops"]
    },
    {
      title: "Python Conditionals",
      description: "Which keyword is used for conditional statements in Python?",
      options: ["", "if", "switch", "case", "when"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["python", "conditionals"]
    },
    {
      title: "Python String Formatting",
      description: "Which method formats strings using f-strings in Python 3.6+?",
      options: ["", "format()", "f''", "% operator", "str.format()"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["python"]
    },
    {
      title: "Python Data Structures",
      description: "Which data structure is a key-value pair collection?",
      options: ["", "List", "Tuple", "Dictionary", "Set"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["python", "data-structures"]
    },
    {
      title: "Python Lambda Functions",
      description: "What is the syntax for a lambda function in Python?",
      options: ["", "lambda x: x", "function x: x", "def x: x", "x => x"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["python", "functions"]
    },
    {
      title: "Python Variable Scope",
      description: "Which keyword declares a variable as global within a function?",
      options: ["", "local", "global", "nonlocal", "static"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["python", "variables"]
    },
    {
      title: "Python Algorithms",
      description: "Which sorting algorithm is built into Python’s sorted() function?",
      options: ["", "Bubble Sort", "Quick Sort", "Timsort", "Merge Sort"],
      correctAnswer: 3,
      difficulty: "hard",
      tags: ["python", "functions"]
    }
  ],
  trueFalse: [
    {
      title: "Python Type System",
      description: "Python is a dynamically typed language.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["python", "variables"]
    },
    {
      title: "List Mutability",
      description: "Lists in Python are immutable.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["python", "data-structures"]
    },
    {
      title: "Exception Handling",
      description: "The try/except block can handle multiple exceptions.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["python", "error-handling"]
    },
    {
      title: "Python Functions",
      description: "Functions in Python must return a value.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["python", "functions"]
    },
    {
      title: "List Comprehensions",
      description: "List comprehensions are more concise than equivalent for loops.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["python", "data-structures"]
    },
    {
      title: "Python Classes",
      description: "All methods in a Python class must include the self parameter.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["python", "classes"]
    },
    {
      title: "Generator Functions",
      description: "Generator functions use yield to return values one at a time.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["python", "functions"]
    },
    {
      title: "Python Modules",
      description: "Modules in Python must be imported before use.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["python", "modules"]
    },
    {
      title: "Decorators",
      description: "Decorators in Python can modify the behavior of a function.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["python", "functions"]
    },
    {
      title: "Python Scope",
      description: "Variables defined inside a function are global by default.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["python", "variables"]
    },
    {
      title: "Set Uniqueness",
      description: "Sets in Python only store unique elements.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["python", "data-structures"]
    },
    {
      title: "Python Loops",
      description: "Python supports a do-while loop construct.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["python", "loops"]
    },
    {
      title: "Python Conditionals",
      description: "Python uses switch statements for conditionals.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["python", "conditionals"]
    },
    {
      title: "Python Iterators",
      description: "All Python lists are iterable.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["python", "data-structures"]
    },
    {
      title: "Python Algorithms",
      description: "Python’s list.sort() uses the Timsort algorithm.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["python", "functions"]
    }
  ],
  codeChallenge: [
    {
      title: "Reverse a String",
      description: "Write a function that reverses a given string.",
      options: ["def reverse_string(s):\n    # Your code here"],
      testCases: [
        { input: "hello", output: "olleh", hidden: false },
        { input: "Python", output: "nohtyP", hidden: false },
        { input: "Empty string", output: "", hidden: true }
      ],
      difficulty: "easy",
      tags: ["python", "functions"]
    },
    {
      title: "Create a Bank Account Class",
      description: "Create a class for a bank account with deposit and withdraw methods.",
      options: ["class BankAccount:\n    # Your code here"],
      testCases: [
        { input: "Deposit 100", output: "Balance increases by 100", hidden: false },
        { input: "Withdraw 50", output: "Balance decreases by 50", hidden: false },
        { input: "Negative balance", output: "Prevents overdraft", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "classes"]
    },
    {
      title: "Fibonacci Generator",
      description: "Create a generator function that yields Fibonacci numbers up to n.",
      options: ["def fibonacci(n):\n    # Your code here"],
      testCases: [
        { input: "n=10", output: "[0, 1, 1, 2, 3, 5, 8]", hidden: false },
        { input: "n=0", output: "[]", hidden: false },
        { input: "n=5", output: "[0, 1, 1, 2, 3]", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "functions"]
    },
    {
      title: "List Comprehension Filter",
      description: "Write a list comprehension to filter even numbers from a list.",
      options: ["def get_evens(numbers):\n    # Your code here"],
      testCases: [
        { input: "[1, 2, 3, 4]", output: "[2, 4]", hidden: false },
        { input: "[1, 3, 5]", output: "[]", hidden: false },
        { input: "[2, 4, 6]", output: "[2, 4, 6]", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "data-structures"]
    },
    {
      title: "Create a Decorator",
      description: "Write a decorator that logs the execution time of a function.",
      options: ["import time\n\ndef timer_decorator(func):\n    # Your code here"],
      testCases: [
        { input: "Function call", output: "Logs execution time", hidden: false },
        { input: "Function result", output: "Returns original result", hidden: false },
        { input: "Correct timing", output: "Measures time accurately", hidden: true }
      ],
      difficulty: "hard",
      tags: ["python", "functions"]
    },
    {
      title: "Count Word Frequency",
      description: "Write a function that counts word frequency in a string.",
      options: ["def word_frequency(text):\n    # Your code here"],
      testCases: [
        { input: "hello world hello", output: "{'hello': 2, 'world': 1}", hidden: false },
        { input: "", output: "{}", hidden: false },
        { input: "a a a", output: "{'a': 3}", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "data-structures"]
    },
    {
      title: "Exception Handling",
      description: "Write a function that handles division by zero with try/except.",
      options: ["def safe_divide(a, b):\n    # Your code here"],
      testCases: [
        { input: "10, 2", output: "5.0", hidden: false },
        { input: "10, 0", output: "Error message", hidden: false },
        { input: "0, 5", output: "0.0", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "error-handling"]
    },
    {
      title: "Create a Module",
      description: "Create a module with a function to calculate the square of a number.",
      options: ["# math_utils.py\ndef square(num):\n    # Your code here"],
      testCases: [
        { input: "5", output: "25", hidden: false },
        { input: "-3", output: "9", hidden: false },
        { input: "0", output: "0", hidden: true }
      ],
      difficulty: "easy",
      tags: ["python", "modules"]
    },
    {
      title: "Merge Sorted Lists",
      description: "Write a function to merge two sorted lists into one sorted list.",
      options: ["def merge_sorted(list1, list2):\n    # Your code here"],
      testCases: [
        { input: "[1, 3], [2, 4]", output: "[1, 2, 3, 4]", hidden: false },
        { input: "[], [1, 2]", output: "[1, 2]", hidden: false },
        { input: "[1], [1]", output: "[1, 1]", hidden: true }
      ],
      difficulty: "hard",
      tags: ["python", "data-structures"]
    },
    {
      title: "Filter Dictionary",
      description: "Write a function to filter a dictionary by value threshold.",
      options: ["def filter_dict(d, threshold):\n    # Your code here"],
      testCases: [
        { input: "{'a': 1, 'b': 5}, 3", output: "{'b': 5}", hidden: false },
        { input: "{'x': 2, 'y': 2}, 3", output: "{}", hidden: false },
        { input: "{'p': 10}, 5", output: "{'p': 10}", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "data-structures"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix List Comprehension",
      description: "This list comprehension has a syntax error. Fix it to square even numbers.",
      options: ["numbers = [1, 2, 3, 4]\nsquares = [x**2 for x in numbers if x % 2 = 0]"],
      testCases: [
        { input: "Syntax correction", output: "Fixes = to ==", hidden: false },
        { input: "Even numbers", output: "Squares only even numbers", hidden: false },
        { input: "Correct output", output: "[4, 16]", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "data-structures"]
    },
    {
      title: "Fix Exception Handling",
      description: "This code doesn’t handle exceptions properly. Fix the try/except block.",
      options: ["def divide(a, b):\n    return a / b"],
      testCases: [
        { input: "Exception handling", output: "Adds try/except", hidden: false },
        { input: "Zero division", output: "Handles division by zero", hidden: false },
        { input: "Valid inputs", output: "Returns correct result", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "error-handling"]
    },
    {
      title: "Fix Generator Function",
      description: "This generator yields incorrect values. Fix it to yield even numbers.",
      options: ["def evens(n):\n    for i in range(n):\n        yield i"],
      testCases: [
        { input: "Even numbers", output: "Yields only even numbers", hidden: false },
        { input: "Generator syntax", output: "Uses yield correctly", hidden: false },
        { input: "Correct range", output: "Yields up to n", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "functions"]
    },
    {
      title: "Fix Class Method",
      description: "This class method is missing self. Fix the method definition.",
      options: ["class Counter:\n    count = 0\n    def increment():\n        count += 1"],
      testCases: [
        { input: "Self parameter", output: "Adds self to method", hidden: false },
        { input: "Instance variable", output: "Updates self.count", hidden: false },
        { input: "Correct increment", output: "Increments count", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "classes"]
    },
    {
      title: "Fix Module Import",
      description: "This import is incorrect. Fix the module import and usage.",
      options: ["import Math\nresult = Math.sqrt(16)"],
      testCases: [
        { input: "Correct import", output: "Imports math module", hidden: false },
        { input: "Function usage", output: "Uses math.sqrt()", hidden: false },
        { input: "Correct result", output: "Returns 4.0", hidden: true }
      ],
      difficulty: "easy",
      tags: ["python", "modules"]
    },
    {
      title: "Fix Decorator Syntax",
      description: "This decorator is applied incorrectly. Fix the syntax.",
      options: ["def decorator(func):\n    return func\n\ndef hello():\n    return 'Hello'\nhello = decorator"],
      testCases: [
        { input: "Decorator syntax", output: "Uses @decorator", hidden: false },
        { input: "Function preservation", output: "Maintains hello function", hidden: false },
        { input: "Correct application", output: "Applies decorator correctly", hidden: true }
      ],
      difficulty: "hard",
      tags: ["python", "functions"]
    },
    {
      title: "Fix Loop Logic",
      description: "This loop has incorrect logic. Fix it to sum numbers.",
      options: ["numbers = [1, 2, 3]\ntotal = 0\nfor num in numbers:\n    total += 1"],
      testCases: [
        { input: "Loop correction", output: "Sums numbers, not iterations", hidden: false },
        { input: "Correct total", output: "Returns 6 for [1, 2, 3]", hidden: false },
        { input: "Loop structure", output: "Maintains for loop", hidden: true }
      ],
      difficulty: "easy",
      tags: ["python", "loops"]
    },
    {
      title: "Fix Conditional Logic",
      description: "This conditional returns incorrect results. Fix the logic.",
      options: ["def is_positive(num):\n    if num > 0:\n        return False\n    return True"],
      testCases: [
        { input: "Conditional fix", output: "Returns True for positive numbers", hidden: false },
        { input: "Correct logic", output: "Handles negative and zero", hidden: false },
        { input: "Correct output", output: "Returns correct boolean", hidden: true }
      ],
      difficulty: "easy",
      tags: ["python", "conditionals"]
    },
    {
      title: "Fix Dictionary Access",
      description: "This dictionary access causes errors. Fix the key lookup.",
      options: ["data = {'a': 1, 'b': 2}\nvalue = data['c']"],
      testCases: [
        { input: "Safe access", output: "Uses get() or checks key", hidden: false },
        { input: "Error prevention", output: "Avoids KeyError", hidden: false },
        { input: "Correct value", output: "Handles existing keys", hidden: true }
      ],
      difficulty: "medium",
      tags: ["python", "data-structures"]
    },
    {
      title: "Fix Algorithm",
      description: "This factorial function is incorrect. Fix the recursive implementation.",
      options: ["def factorial(n):\n    if n == 0:\n        return 0\n    return n * factorial(n - 1)"],
      testCases: [
        { input: "factorial(0)", output: "1", hidden: false },
        { input: "factorial(1)", output: "1", hidden: false },
        { input: "factorial(5)", output: "120", hidden: true }
      ],
      difficulty: "hard",
      tags: ["python", "functions"]
    }
  ]
};

async function seedPythonQuestions() {
  try {
    console.log('Seeding Python questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'python' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      pythonQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'python',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} Python questions`);
    console.log(`   - Multiple Choice: ${pythonQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${pythonQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${pythonQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${pythonQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding Python questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedPythonQuestions()
    .then(() => {
      console.log('Python questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed Python questions:', error);
      process.exit(1);
    });
}

module.exports = { seedPythonQuestions, pythonQuestions };