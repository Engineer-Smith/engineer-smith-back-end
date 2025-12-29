// /seeds/data/pythonChallengesData.js - Python challenge data
const pythonChallenges = [
  {
    title: "Two Sum (Python)",
    description: "Find two numbers using Python's dict for optimal performance.",
    problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Use Python's built-in data structures.",
    difficulty: "easy",
    supportedLanguages: ["python"],
    topics: ["arrays", "hash-table", "dictionaries"],
    tags: ["beginner", "arrays", "dict"],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 9" }
    ],
    constraints: ["2 <= len(nums) <= 10^4"],
    codeConfig: { python: { runtime: "python3", entryFunction: "twoSum", timeoutMs: 3000 } },
    startingCode: { python: "def twoSum(nums, target):\n    # Your code here\n    pass" },
    testCases: [
      { name: "Example 1", args: [[2, 7, 11, 15], 9], expected: [0, 1], hidden: false },
      { name: "Example 2", args: [[3, 2, 4], 6], expected: [1, 2], hidden: false }
    ],
    solutionCode: { python: "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []" },
    timeComplexity: "O(n)", spaceComplexity: "O(n)",
    companyTags: ["Amazon", "Google"]
  },

  {
    title: "List Comprehension Challenge",
    description: "Transform a list using Python's list comprehension.",
    problemStatement: "Given a list of integers, return a new list containing the squares of all even numbers, using Python's list comprehension.",
    difficulty: "easy",
    supportedLanguages: ["python"],
    topics: ["list-comprehension", "filtering"],
    tags: ["beginner", "pythonic", "comprehension"],
    examples: [
      { input: "nums = [1,2,3,4,5,6]", output: "[4,16,36]", explanation: "Squares of even numbers" }
    ],
    constraints: ["1 <= len(nums) <= 1000"],
    codeConfig: { python: { runtime: "python3", entryFunction: "squareEvens", timeoutMs: 3000 } },
    startingCode: { python: "def squareEvens(nums):\n    # Use list comprehension\n    pass" },
    testCases: [
      { name: "Mixed numbers", args: [[1, 2, 3, 4, 5, 6]], expected: [4, 16, 36], hidden: false },
      { name: "All odd", args: [[1, 3, 5]], expected: [], hidden: true }
    ],
    solutionCode: { python: "def squareEvens(nums):\n    return [x*x for x in nums if x % 2 == 0]" },
    timeComplexity: "O(n)", spaceComplexity: "O(k)",
    companyTags: ["Python-specific"]
  },

  {
    title: "Dictionary Manipulation",
    description: "Work with Python dictionaries and their methods.",
    problemStatement: "Given a list of words, return a dictionary where keys are word lengths and values are lists of words with that length.",
    difficulty: "easy",
    supportedLanguages: ["python"],
    topics: ["dictionaries", "grouping"],
    tags: ["beginner", "dict", "grouping"],
    examples: [
      { input: 'words = ["cat", "dog", "elephant", "rat"]', output: '{3: ["cat", "dog", "rat"], 8: ["elephant"]}', explanation: "Group by length" }
    ],
    constraints: ["1 <= len(words) <= 1000"],
    codeConfig: { python: { runtime: "python3", entryFunction: "groupByLength", timeoutMs: 3000 } },
    startingCode: { python: "def groupByLength(words):\n    # Your code here\n    pass" },
    testCases: [
      { name: "Mixed lengths", args: [["cat", "dog", "elephant", "rat"]], expected: {3: ["cat", "dog", "rat"], 8: ["elephant"]}, hidden: false },
      { name: "Same length", args: [["abc", "def", "ghi"]], expected: {3: ["abc", "def", "ghi"]}, hidden: true }
    ],
    solutionCode: { python: "def groupByLength(words):\n    result = {}\n    for word in words:\n        length = len(word)\n        if length not in result:\n            result[length] = []\n        result[length].append(word)\n    return result" },
    timeComplexity: "O(n)", spaceComplexity: "O(n)",
    companyTags: ["Python-specific"]
  }
];

module.exports = { pythonChallenges };