// seeds/pythonSeeds.js - Comprehensive Python questions with enhanced validation
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

// Comprehensive Python questions data - 75+ questions total
const pythonQuestions = {
  // 25 Multiple Choice Questions
  multipleChoice: [
    {
      title: "Python Data Types",
      description: "Which of these is a mutable data type in Python?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-data-types", "data-structures"],
      options: ["Tuple", "List", "String", "Integer"],
      correctAnswer: 1
    },
    {
      title: "Python Function Definition",
      description: "What keyword defines a function in Python?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-functions", "python-syntax"],
      options: ["func", "define", "def", "function"],
      correctAnswer: 2
    },
    {
      title: "List Comprehensions",
      description: "Which syntax creates a list of squares for numbers 1 to 5?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "list-comprehensions", "python-data-structures"],
      options: ["[x**2 for x in range(1, 5)]", "[x*x for x in range(1, 6)]", "[x^2 for x in range(1, 6)]", "[x**2 for x in range(1, 6)]"],
      correctAnswer: 3
    },
    {
      title: "Python Classes Constructor",
      description: "Which method is the constructor in a Python class?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-classes", "oop", "magic-methods"],
      options: ["__init__", "__new__", "__class__", "__construct__"],
      correctAnswer: 0
    },
    {
      title: "Python Module Import",
      description: "How do you import a module named 'math' in Python?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-modules", "python-imports"],
      options: ["import math", "require math", "include math", "from math import *"],
      correctAnswer: 0
    },
    {
      title: "Python Exception Handling",
      description: "Which statement is used to catch exceptions in Python?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "exception-handling", "error-handling"],
      options: ["try", "except", "catch", "finally"],
      correctAnswer: 1
    },
    {
      title: "Python Generators",
      description: "Which keyword creates a generator in Python?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "generators", "python-functions"],
      options: ["return", "yield", "generate", "next"],
      correctAnswer: 1
    },
    {
      title: "Python Decorators",
      description: "What is the syntax to apply a decorator to a function?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["python", "decorators", "python-functions"],
      options: ["@decorator", "#decorator", "decorator()", "apply(decorator)"],
      correctAnswer: 0
    },
    {
      title: "Python Loops",
      description: "Which loop is used to iterate over a sequence in Python?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-loops", "iterators"],
      options: ["while", "for", "do", "loop"],
      correctAnswer: 1
    },
    {
      title: "Python Conditionals",
      description: "Which keyword is used for conditional statements in Python?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-conditionals", "python-syntax"],
      options: ["if", "switch", "case", "when"],
      correctAnswer: 0
    },
    {
      title: "Python String Formatting",
      description: "Which method formats strings using f-strings in Python 3.6+?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "string-methods", "python-syntax"],
      options: ["format()", "f''", "% operator", "str.format()"],
      correctAnswer: 1
    },
    {
      title: "Python Dictionary Data Structure",
      description: "Which data structure is a key-value pair collection?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-data-structures", "dictionaries"],
      options: ["List", "Tuple", "Dictionary", "Set"],
      correctAnswer: 2
    },
    {
      title: "Python Lambda Functions",
      description: "What is the syntax for a lambda function in Python?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "lambda-functions", "python-functions"],
      options: ["lambda x: x", "function x: x", "def x: x", "x => x"],
      correctAnswer: 0
    },
    {
      title: "Python Variable Scope",
      description: "Which keyword declares a variable as global within a function?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-variables", "scope"],
      options: ["local", "global", "nonlocal", "static"],
      correctAnswer: 1
    },
    {
      title: "Python Sorting Algorithm",
      description: "Which sorting algorithm is built into Python's sorted() function?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "algorithms", "sorting"],
      options: ["Bubble Sort", "Quick Sort", "Timsort", "Merge Sort"],
      correctAnswer: 2
    },
    {
      title: "Python Memory Management",
      description: "What is Python's garbage collection mechanism primarily based on?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "python-data-types"],
      options: ["Mark and sweep", "Reference counting", "Generational collection", "Manual deallocation"],
      correctAnswer: 1
    },
    {
      title: "Python GIL",
      description: "What does the Global Interpreter Lock (GIL) prevent in Python?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "async-programming"],
      options: ["Memory leaks", "Multiple threads executing Python code simultaneously", "Import errors", "Stack overflow"],
      correctAnswer: 1
    },
    {
      title: "Python Metaclasses",
      description: "What is a metaclass in Python?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "python-classes", "oop", "magic-methods"],
      options: ["A class that inherits from multiple classes", "A class that defines how classes are created", "A class with only class methods", "An abstract class"],
      correctAnswer: 1
    },
    {
      title: "Python Context Managers",
      description: "Which methods must a context manager implement?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "context-managers", "magic-methods"],
      options: ["__start__ and __stop__", "__enter__ and __exit__", "__begin__ and __end__", "__open__ and __close__"],
      correctAnswer: 1
    },
    {
      title: "Python Descriptors",
      description: "Which method is called when getting an attribute through a descriptor?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "python-classes", "magic-methods"],
      options: ["__getattr__", "__getattribute__", "__get__", "__getitem__"],
      correctAnswer: 2
    },
    {
      title: "Python Async Programming",
      description: "Which keyword is used to define an asynchronous function?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "async-programming", "python-functions"],
      options: ["async", "await", "asyncio", "coroutine"],
      correctAnswer: 0
    },
    {
      title: "Python Type Hints",
      description: "Which module provides advanced type hints in Python?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-syntax"],
      options: ["types", "typing", "annotations", "hints"],
      correctAnswer: 1
    },
    {
      title: "Python Iterators Protocol",
      description: "Which method must be implemented for an object to be iterable?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "iterators", "python-data-structures", "magic-methods"],
      options: ["__iter__", "__next__", "__getitem__", "__len__"],
      correctAnswer: 0
    },
    {
      title: "Python Property Decorators",
      description: "What does the @property decorator do?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "decorators", "python-classes", "oop"],
      options: ["Creates a class property", "Creates a method that can be accessed like an attribute", "Makes a method static", "Makes a method private"],
      correctAnswer: 1
    },
    {
      title: "Python Closures",
      description: "What is a closure in Python?",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "scope"],
      options: ["A nested function", "A function that accesses variables from its enclosing scope", "A lambda function", "A generator function"],
      correctAnswer: 1
    }
  ],

  // 25 True/False Questions
  trueFalse: [
    {
      title: "Python Type System",
      description: "Python is a dynamically typed language.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-variables", "python-data-types"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "List Mutability",
      description: "Lists in Python are immutable.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "lists", "python-data-structures"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "Exception Handling",
      description: "The try/except block can handle multiple exceptions.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "exception-handling", "error-handling"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Functions Return Value",
      description: "Functions in Python must return a value.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-functions"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "List Comprehensions Performance",
      description: "List comprehensions are more concise than equivalent for loops.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "list-comprehensions", "python-loops"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Class Methods Self Parameter",
      description: "All methods in a Python class must include the self parameter.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-classes", "oop"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "Generator Functions Yield",
      description: "Generator functions use yield to return values one at a time.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "generators", "python-functions"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Modules Import",
      description: "Modules in Python must be imported before use.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-modules", "python-imports"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Decorators Behavior Modification",
      description: "Decorators in Python can modify the behavior of a function.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "decorators", "python-functions"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Function Variable Scope",
      description: "Variables defined inside a function are global by default.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-variables", "scope"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "Set Uniqueness",
      description: "Sets in Python only store unique elements.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "sets", "python-data-structures"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Do-While Loop",
      description: "Python supports a do-while loop construct.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-loops"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "Python Switch Statements",
      description: "Python uses switch statements for conditionals.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-conditionals"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "Python List Iterability",
      description: "All Python lists are iterable.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "lists", "iterators"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Timsort Algorithm",
      description: "Python's list.sort() uses the Timsort algorithm.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "algorithms", "sorting"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Interpretation and Compilation",
      description: "Python is both interpreted and compiled to bytecode.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python GIL Threading Impact",
      description: "The GIL makes Python single-threaded for CPU-bound tasks.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "async-programming"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Duck Typing",
      description: "Python follows the principle of duck typing.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "python-data-types"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Automatic Memory Management",
      description: "Python automatically manages memory allocation and deallocation.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Multiple Inheritance",
      description: "Python supports multiple inheritance from multiple classes.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-classes", "python-inheritance", "oop"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Namespace System",
      description: "Python uses namespaces to avoid naming conflicts.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "python-modules"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python String Immutability",
      description: "Strings in Python are immutable objects.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "strings", "python-data-types"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python List Insertion Performance",
      description: "List insertion at the beginning is O(1) operation.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "lists", "algorithms"],
      options: ["True", "False"],
      correctAnswer: 1
    },
    {
      title: "Python Generators Memory Efficiency",
      description: "Generators are memory-efficient for large datasets.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "generators", "python-functions"],
      options: ["True", "False"],
      correctAnswer: 0
    },
    {
      title: "Python Type Hints Runtime Impact",
      description: "Type hints affect runtime performance in Python.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "python-syntax"],
      options: ["True", "False"],
      correctAnswer: 1
    }
  ],

  // 15 Code Challenge Questions
  // Fixed codeChallenge section for pythonSeeds.js
  codeChallenge: [
    {
      title: "Reverse a String",
      description: "Write a function that reverses a given string.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "strings", "algorithms"],
      codeTemplate: `def reverse_string(text):
    # Write your code here
    # Hint: You can use slicing or other string methods
    
    pass`,
      codeConfig: {
        entryFunction: 'reverse_string',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["hello"], expected: "olleh", hidden: false },
        { args: ["Python"], expected: "nohtyP", hidden: false },
        { args: [""], expected: "", hidden: true },
        { args: ["a"], expected: "a", hidden: true }
      ]
    },
    {
      title: "Sum of List",
      description: "Write a function that returns the sum of all numbers in a list.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "lists", "algorithms"],
      codeTemplate: `def sum_list(numbers):
    # Write your code here
    # Hint: You can use the built-in sum() function or a loop
    
    pass`,
      codeConfig: {
        entryFunction: 'sum_list',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3, 4]], expected: 10, hidden: false },
        { args: [[-1, 1, 0]], expected: 0, hidden: false },
        { args: [[]], expected: 0, hidden: true },
        { args: [[5]], expected: 5, hidden: true }
      ]
    },
    {
      title: "Find Maximum",
      description: "Write a function that finds the maximum number in a list.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "algorithms", "data-structures"],
      codeTemplate: `def find_max(numbers):
    # Write your code here
    # Hint: You can use the built-in max() function or iterate
    
    pass`,
      codeConfig: {
        entryFunction: 'find_max',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 5, 3, 9, 2]], expected: 9, hidden: false },
        { args: [[-1, -5, -2]], expected: -1, hidden: false },
        { args: [[42]], expected: 42, hidden: true },
        { args: [[0, -1, 5]], expected: 5, hidden: true }
      ]
    },
    {
      title: "Count Vowels",
      description: "Write a function that counts the number of vowels in a string.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "strings", "algorithms"],
      codeTemplate: `def count_vowels(text):
    # Write your code here
    # Hint: Consider both uppercase and lowercase vowels (a, e, i, o, u)
    
    pass`,
      codeConfig: {
        entryFunction: 'count_vowels',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["hello"], expected: 2, hidden: false },
        { args: ["Python"], expected: 1, hidden: false },
        { args: [""], expected: 0, hidden: true },
        { args: ["aeiou"], expected: 5, hidden: true }
      ]
    },
    {
      title: "Filter Even Numbers",
      description: "Write a function that filters even numbers from a list.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "lists", "algorithms", "data-structures"],
      codeTemplate: `def filter_evens(numbers):
    # Write your code here
    # Hint: You can use list comprehension or the filter() function
    
    pass`,
      codeConfig: {
        entryFunction: 'filter_evens',
        runtime: 'python',
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
      title: "Factorial Function",
      description: "Write a function that calculates the factorial of a number.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "algorithms", "recursion"],
      codeTemplate: `def factorial(n):
    # Write your code here
    # Remember: factorial(0) = 1, factorial(n) = n * factorial(n-1)
    
    pass`,
      codeConfig: {
        entryFunction: 'factorial',
        runtime: 'python',
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
      title: "Fibonacci Number",
      description: "Write a function that returns the nth Fibonacci number.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "algorithms", "recursion"],
      codeTemplate: `def fibonacci(n):
    # Write your code here
    # Remember: fibonacci(0) = 0, fibonacci(1) = 1
    
    pass`,
      codeConfig: {
        entryFunction: 'fibonacci',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [6], expected: 8, hidden: false },
        { args: [0], expected: 0, hidden: false },
        { args: [1], expected: 1, hidden: true },
        { args: [10], expected: 55, hidden: true }
      ]
    },
    {
      title: "Palindrome Check",
      description: "Write a function that checks if a string is a palindrome.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "strings", "algorithms"],
      codeTemplate: `def is_palindrome(text):
    # Write your code here
    # Hint: Compare the string with its reverse
    
    pass`,
      codeConfig: {
        entryFunction: 'is_palindrome',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["racecar"], expected: true, hidden: false },
        { args: ["hello"], expected: false, hidden: false },
        { args: ["a"], expected: true, hidden: true },
        { args: [""], expected: true, hidden: true }
      ]
    },
    {
      title: "Remove Duplicates",
      description: "Write a function that removes duplicates from a list while preserving order.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "lists", "algorithms", "data-structures"],
      codeTemplate: `def remove_duplicates(items):
    # Write your code here
    # Hint: You can use a set to track seen items or dict.fromkeys()
    
    pass`,
      codeConfig: {
        entryFunction: 'remove_duplicates',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 2, 3, 1]], expected: [1, 2, 3], hidden: false },
        { args: [["a", "b", "a", "c"]], expected: ["a", "b", "c"], hidden: false },
        { args: [[]], expected: [], hidden: true },
        { args: [[1, 1, 1]], expected: [1], hidden: true }
      ]
    },
    {
      title: "Word Count Dictionary",
      description: "Write a function that counts the frequency of each word in a string.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "dictionaries", "string-methods", "algorithms"],
      codeTemplate: `def word_count(text):
    # Write your code here
    # Hint: Split the text into words and use a dictionary to count
    
    pass`,
      codeConfig: {
        entryFunction: 'word_count',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["hello world hello"], expected: { "hello": 2, "world": 1 }, hidden: false },
        { args: ["python"], expected: { "python": 1 }, hidden: false },
        { args: [""], expected: {}, hidden: true },
        { args: ["a a a"], expected: { "a": 3 }, hidden: true }
      ]
    },
    {
      title: "Merge Sorted Lists",
      description: "Write a function to merge two sorted lists into one sorted list.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "algorithms", "lists", "data-structures"],
      codeTemplate: `def merge_sorted(list1, list2):
    # Write your code here
    # Hint: Use two pointers to merge efficiently
    
    pass`,
      codeConfig: {
        entryFunction: 'merge_sorted',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6], hidden: false },
        { args: [[], [1, 2, 3]], expected: [1, 2, 3], hidden: false },
        { args: [[1, 1], [1, 1]], expected: [1, 1, 1, 1], hidden: true },
        { args: [[1, 5], [2, 3, 4]], expected: [1, 2, 3, 4, 5], hidden: true }
      ]
    },
    {
      title: "Binary Search",
      description: "Write a function that implements binary search on a sorted list.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "algorithms", "searching", "data-structures"],
      codeTemplate: `def binary_search(arr, target):
    # Write your code here
    # Return the index of target, or -1 if not found
    
    pass`,
      codeConfig: {
        entryFunction: 'binary_search',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 3, 5, 7, 9], 5], expected: 2, hidden: false },
        { args: [[1, 3, 5, 7, 9], 6], expected: -1, hidden: false },
        { args: [[42], 42], expected: 0, hidden: true },
        { args: [[1, 2, 3], 1], expected: 0, hidden: true }
      ]
    },
    {
      title: "Flatten Nested List",
      description: "Write a function that flattens a nested list structure.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "lists", "algorithms", "recursion"],
      codeTemplate: `def flatten_list(nested_list):
    # Write your code here
    # Hint: Use recursion to handle arbitrary nesting levels
    
    pass`,
      codeConfig: {
        entryFunction: 'flatten_list',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[[1, 2], [3, 4], 5]], expected: [1, 2, 3, 4, 5], hidden: false },
        { args: [[1, [2, [3]]]], expected: [1, 2, 3], hidden: false },
        { args: [[]], expected: [], hidden: true },
        { args: [[1, 2, 3]], expected: [1, 2, 3], hidden: true }
      ]
    },
    {
      title: "Prime Number Generator",
      description: "Write a function that generates all prime numbers up to n using the Sieve of Eratosthenes.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "algorithms", "generators", "math"],
      codeTemplate: `def sieve_of_eratosthenes(n):
    # Write your code here
    # Return a list of prime numbers up to n
    
    pass`,
      codeConfig: {
        entryFunction: 'sieve_of_eratosthenes',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [10], expected: [2, 3, 5, 7], hidden: false },
        { args: [2], expected: [2], hidden: false },
        { args: [1], expected: [], hidden: true },
        { args: [20], expected: [2, 3, 5, 7, 11, 13, 17, 19], hidden: true }
      ]
    },
    {
      title: "Longest Common Subsequence",
      description: "Write a function to find the length of the longest common subsequence between two strings.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "algorithms", "strings", "dynamic-programming"],
      codeTemplate: `def lcs_length(str1, str2):
    # Write your code here
    # Hint: Use dynamic programming
    
    pass`,
      codeConfig: {
        entryFunction: 'lcs_length',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["ABCDGH", "AEDFHR"], expected: 3, hidden: false },
        { args: ["AGGTAB", "GXTXAYB"], expected: 4, hidden: false },
        { args: ["", "ABC"], expected: 0, hidden: true },
        { args: ["ABC", "ABC"], expected: 3, hidden: true }
      ]
    }
  ],

  // Fixed codeDebugging section for pythonSeeds.js
  codeDebugging: [
    {
      title: "Fix List Comprehension",
      description: "This list comprehension has a syntax error. Fix it to square even numbers.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "list-comprehensions", "debugging"],
      buggyCode: `def get_even_squares(numbers):
    return [x**2 for x in numbers if x % 2 = 0]`,
      solutionCode: `def get_even_squares(numbers):
    return [x**2 for x in numbers if x % 2 == 0]`,
      codeConfig: {
        entryFunction: 'get_even_squares',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3, 4]], expected: [4, 16], hidden: false },
        { args: [[2, 4, 6]], expected: [4, 16, 36], hidden: false },
        { args: [[1, 3, 5]], expected: [], hidden: true },
        { args: [[]], expected: [], hidden: true }
      ]
    },
    {
      title: "Fix Exception Handling",
      description: "This code doesn't handle exceptions properly. Fix the try/except block.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "exception-handling", "debugging"],
      buggyCode: `def safe_divide(a, b):
    result = a / b
    return result`,
      solutionCode: `def safe_divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        return "Error: Division by zero"`,
      codeConfig: {
        entryFunction: 'safe_divide',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [10, 2], expected: 5.0, hidden: false },
        { args: [10, 0], expected: "Error: Division by zero", hidden: false },
        { args: [0, 5], expected: 0.0, hidden: true },
        { args: [15, 3], expected: 5.0, hidden: true }
      ]
    },
    {
      title: "Fix Loop Logic",
      description: "This loop has incorrect logic. Fix it to sum numbers correctly.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["python", "python-loops", "debugging"],
      buggyCode: `def sum_numbers(numbers):
    total = 0
    for num in numbers:
        total += 1
    return total`,
      solutionCode: `def sum_numbers(numbers):
    total = 0
    for num in numbers:
        total += num
    return total`,
      codeConfig: {
        entryFunction: 'sum_numbers',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3]], expected: 6, hidden: false },
        { args: [[10, 20]], expected: 30, hidden: false },
        { args: [[]], expected: 0, hidden: true },
        { args: [[-1, 1]], expected: 0, hidden: true }
      ]
    },
    {
      title: "Fix Conditional Logic",
      description: "This function returns incorrect results. Fix the logic.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["python", "python-conditionals", "debugging"],
      buggyCode: `def is_positive(num):
    if num > 0:
        return False
    return True`,
      solutionCode: `def is_positive(num):
    if num > 0:
        return True
    return False`,
      codeConfig: {
        entryFunction: 'is_positive',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [5], expected: true, hidden: false },
        { args: [-3], expected: false, hidden: false },
        { args: [0], expected: false, hidden: true },
        { args: [1], expected: true, hidden: true }
      ]
    },
    {
      title: "Fix Dictionary Access",
      description: "This code causes KeyError. Fix the dictionary access.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "dictionaries", "debugging"],
      buggyCode: `def get_value(data, key):
    return data[key]`,
      solutionCode: `def get_value(data, key):
    return data.get(key, None)`,
      codeConfig: {
        entryFunction: 'get_value',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{ "a": 1, "b": 2 }, "a"], expected: 1, hidden: false },
        { args: [{ "a": 1, "b": 2 }, "c"], expected: null, hidden: false },
        { args: [{}, "key"], expected: null, hidden: true },
        { args: [{ "x": 10 }, "x"], expected: 10, hidden: true }
      ]
    },
    {
      title: "Fix String Method",
      description: "This string processing function doesn't work correctly. Fix it.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "string-methods", "debugging"],
      buggyCode: `def capitalize_words(text):
    return text.capitalize()`,
      solutionCode: `def capitalize_words(text):
    return text.title()`,
      codeConfig: {
        entryFunction: 'capitalize_words',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["hello world"], expected: "Hello World", hidden: false },
        { args: ["python programming"], expected: "Python Programming", hidden: false },
        { args: [""], expected: "", hidden: true },
        { args: ["a b c"], expected: "A B C", hidden: true }
      ]
    },
    {
      title: "Fix Class Method",
      description: "This class method is missing self. Fix the method definition.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "python-classes", "debugging"],
      buggyCode: `class Counter:
    def __init__(self):
        self.count = 0
    
    def increment():
        self.count += 1
    
    def get_count(self):
        return self.count

def test_counter():
    c = Counter()
    c.increment()
    c.increment()
    return c.get_count()`,
      solutionCode: `class Counter:
    def __init__(self):
        self.count = 0
    
    def increment(self):
        self.count += 1
    
    def get_count(self):
        return self.count

def test_counter():
    c = Counter()
    c.increment()
    c.increment()
    return c.get_count()`,
      codeConfig: {
        entryFunction: 'test_counter',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [], expected: 2, hidden: false }
      ]
    },
    {
      title: "Fix List Slicing",
      description: "This function doesn't slice the list correctly. Fix it.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["python", "lists", "debugging"],
      buggyCode: `def get_first_three(items):
    return items[0:2]`,
      solutionCode: `def get_first_three(items):
    return items[0:3]`,
      codeConfig: {
        entryFunction: 'get_first_three',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [[1, 2, 3, 4, 5]], expected: [1, 2, 3], hidden: false },
        { args: [["a", "b"]], expected: ["a", "b"], hidden: false },
        { args: [[]], expected: [], hidden: true },
        { args: [[1]], expected: [1], hidden: true }
      ]
    },
    {
      title: "Fix Generator Function",
      description: "This generator yields incorrect values. Fix it to yield squares.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["python", "generators", "debugging"],
      buggyCode: `def square_generator(n):
    for i in range(n):
        yield i

def test_generator():
    return list(square_generator(4))`,
      solutionCode: `def square_generator(n):
    for i in range(n):
        yield i * i

def test_generator():
    return list(square_generator(4))`,
      codeConfig: {
        entryFunction: 'test_generator',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [], expected: [0, 1, 4, 9], hidden: false }
      ]
    },
    {
      title: "Fix Recursive Function",
      description: "This factorial function is incorrect. Fix the base case.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["python", "python-functions", "debugging", "recursion"],
      buggyCode: `def factorial(n):
    if n == 0:
        return 0
    return n * factorial(n - 1)`,
      solutionCode: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)`,
      codeConfig: {
        entryFunction: 'factorial',
        runtime: 'python',
        timeoutMs: 3000
      },
      testCases: [
        { args: [5], expected: 120, hidden: false },
        { args: [0], expected: 1, hidden: false },
        { args: [1], expected: 1, hidden: true },
        { args: [3], expected: 6, hidden: true }
      ]
    }
  ],

  // 15 Fill-in-the-Blank Questions
  fillInTheBlank: [
    {
      title: "Function Definition",
      description: "Complete the Python function definition:",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-functions", "python-syntax"],
      codeTemplate: `___blank1___ calculate_area(length, width):
    """Calculate the area of a rectangle"""
    ___blank2___ length * width`,
      blanks: [
        { id: 'blank1', correctAnswers: ['def'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['return'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Class Definition",
      description: "Complete the Python class structure:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-classes", "oop"],
      codeTemplate: `___blank1___ Person:
    ___blank2___ __init__(self, name, age):
        ___blank3___.name = name
        self.___blank4___ = age
    
    def get_name(___blank5___): 
        return self.name`,
      blanks: [
        { id: 'blank1', correctAnswers: ['class'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['def'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['self'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['age'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['self'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "List Comprehension",
      description: "Complete the list comprehension to square even numbers:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "list-comprehensions", "python-loops"],
      codeTemplate: `numbers = [1, 2, 3, 4, 5, 6]
even_squares = [x**2 ___blank1___ x ___blank2___ numbers ___blank3___ x % 2 == 0]`,
      blanks: [
        { id: 'blank1', correctAnswers: ['for'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['in'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['if'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Exception Handling",
      description: "Complete the exception handling structure:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "exception-handling", "error-handling"],
      codeTemplate: `___blank1___:
    result = 10 / 0
___blank2___ ZeroDivisionError ___blank3___ e:
    print(f"Error: {e}")
___blank4___:
    print("This always runs")`,
      blanks: [
        { id: 'blank1', correctAnswers: ['try'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['except'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['as'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['finally'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Dictionary Operations",
      description: "Complete the dictionary operations:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "dictionaries", "python-data-structures"],
      codeTemplate: `data = {'name': 'John', 'age': 30}

# Get value with default
name = data.___blank1___('name', 'Unknown')

# Add new key-value pair
data___blank2___'city'___blank3___ = 'New York'

# Check if key exists
if 'email' ___blank4___ data:
    print('Email found')`,
      blanks: [
        { id: 'blank1', correctAnswers: ['get'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['['], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: [']'], caseSensitive: true, points: 1 },
        { id: 'blank4', correctAnswers: ['in'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Lambda Function",
      description: "Complete the lambda function definition:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "lambda-functions", "python-functions"],
      codeTemplate: `# Sort list by absolute value
numbers = [-5, 2, -1, 3, -4]
sorted_numbers = sorted(numbers, key=___blank1___ x: ___blank2___(___blank3___))

# Filter even numbers
evens = list(filter(___blank4___ x: x % 2 == 0, numbers))`,
      blanks: [
        { id: 'blank1', correctAnswers: ['lambda'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['abs'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['x'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['lambda'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "File Operations",
      description: "Complete the file handling operations:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "file-handling", "context-managers"],
      codeTemplate: `# Read file content
___blank1___ open('data.txt', '___blank2___') ___blank3___ file:
    content = file.___blank4___() 

# Write to file
with ___blank5___('output.txt', 'w') as f:
    f.___blank6___('Hello World')`,
      blanks: [
        { id: 'blank1', correctAnswers: ['with'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['r'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['as'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['read'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['open'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['write'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Generator Function",
      description: "Complete the generator function:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "generators", "python-functions"],
      codeTemplate: `___blank1___ fibonacci_generator(n):
    a, b = 0, 1
    ___blank2___ i in range(n):
        ___blank3___ a
        a, b = b, a + b`,
      blanks: [
        { id: 'blank1', correctAnswers: ['def'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['for'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['yield'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Decorator Implementation",
      description: "Complete the decorator implementation:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["python", "decorators", "python-functions"],
      codeTemplate: `def timer_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.___blank1___() 
        result = ___blank2___(*args, **kwargs)
        end = time.time()
        print(f"Execution time: {end - start}")
        ___blank3___ result
    return ___blank4___

___blank5___
def slow_function():
    import time
    time.sleep(0.1)`,
      blanks: [
        { id: 'blank1', correctAnswers: ['time'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['func'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['return'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['wrapper'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['@timer_decorator'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Import Statements",
      description: "Complete the various import patterns:",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "python-modules", "python-imports"],
      codeTemplate: `# Import entire module
___blank1___ math

# Import specific functions
___blank2___ math ___blank3___ sqrt, pi

# Import with alias
import numpy ___blank4___ np

# Import all (not recommended)
from datetime ___blank5___ *`,
      blanks: [
        { id: 'blank1', correctAnswers: ['import'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['from'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['import'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['as'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['import'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "List Methods",
      description: "Complete the list method calls:",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["python", "lists", "python-data-structures"],
      codeTemplate: `my_list = [3, 1, 4, 1, 5]

# Add element to end
my_list.___blank1___(9)

# Remove and return last element
last = my_list.___blank2___()

# Sort the list in place
my_list.___blank3___()

# Find index of element
index = my_list.___blank4___(4)`,
      blanks: [
        { id: 'blank1', correctAnswers: ['append'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['pop'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['sort'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['index'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "String Methods",
      description: "Complete the string method operations:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "string-methods", "strings"],
      codeTemplate: `text = "  Hello, World!  "

# Remove whitespace
clean_text = text.___blank1___()

# Convert to lowercase
lower_text = text.___blank2___()

# Split into words
words = text.___blank3___()

# Replace substring
new_text = text.___blank4___("World", "Python")`,
      blanks: [
        { id: 'blank1', correctAnswers: ['strip'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['lower'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['split'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['replace'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Set Operations",
      description: "Complete the set operations:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "sets", "python-data-structures"],
      codeTemplate: `set1 = {1, 2, 3, 4}
set2 = {3, 4, 5, 6}

# Union of sets
union = set1 ___blank1___ set2

# Intersection of sets
intersection = set1 ___blank2___ set2

# Difference of sets
difference = set1 ___blank3___ set2

# Add element to set
set1.___blank4___(7)`,
      blanks: [
        { id: 'blank1', correctAnswers: ['|', 'union'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['&', 'intersection'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['-', 'difference'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['add'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Loop Control Statements",
      description: "Complete the loop control statements:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["python", "python-loops", "python-conditionals"],
      codeTemplate: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

for num in numbers:
    if num % 2 == 0:
        ___blank1___  # Skip even numbers
    if num > 7:
        ___blank2___  # Stop when number > 7
    print(num)
___blank3___:
    print("Loop completed normally")`,
      blanks: [
        { id: 'blank1', correctAnswers: ['continue'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['break'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['else'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Context Manager Protocol",
      description: "Complete the context manager implementation:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["python", "context-managers", "magic-methods"],
      codeTemplate: `class MyContext:
    def ___blank1___(self):
        print("Entering context")
        return self
    
    def ___blank2___(self, exc_type, exc_val, exc_tb):
        print("Exiting context")
        return False

# Usage
___blank3___ MyContext() ___blank4___ ctx:
    print("Inside context")`,
      blanks: [
        { id: 'blank1', correctAnswers: ['__enter__'], caseSensitive: true, points: 2 },
        { id: 'blank2', correctAnswers: ['__exit__'], caseSensitive: true, points: 2 },
        { id: 'blank3', correctAnswers: ['with'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['as'], caseSensitive: false, points: 1 }
      ]
    }
  ]
};

async function seedPythonQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE Python question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(pythonQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(pythonQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = pythonQuestions.fillInTheBlank.length;
    const totalBlanks = pythonQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);

    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('python');

    // Delete existing Python questions
    await processor.deleteByLanguage('python');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(pythonQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'python', status: 'active' },
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
    console.log('🔍 Running COMPREHENSIVE validation with enhanced code execution testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Includes comprehensive Python code execution validation
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'Python');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE Python question seeding completed successfully!');
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
      return await Question.find({ language: 'python' }).select('_id title type');

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
    console.error('💥 Python seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedPythonQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive Python questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust code execution and fill-in-blank validation!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed Python questions:', error);
      process.exit(1);
    });
}

module.exports = { seedPythonQuestions, pythonQuestions };