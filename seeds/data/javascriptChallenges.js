// /seeds/data/javascriptChallengesData.js - JavaScript challenge data
const javascriptChallenges = [
  // EASY CHALLENGES (1-25)
  {
    title: "Two Sum",
    description: "Find two numbers in an array that add up to a target sum.",
    problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
    difficulty: "easy",
    supportedLanguages: ["javascript"],
    topics: ["arrays", "hash-table"],
    tags: ["beginner", "arrays", "hash-map"],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 9" }
    ],
    constraints: ["2 <= nums.length <= 10^4"],
    codeConfig: { javascript: { runtime: "node", entryFunction: "twoSum", timeoutMs: 3000 } },
    startingCode: { javascript: `function twoSum(nums, target) {\n    // Your code here\n}` },
    testCases: [
      { name: "Example 1", args: [[2, 7, 11, 15], 9], expected: [0, 1], hidden: false },
      { name: "Example 2", args: [[3, 2, 4], 6], expected: [1, 2], hidden: false },
      { name: "Two same", args: [[3, 3], 6], expected: [0, 1], hidden: true }
    ],
    solutionCode: { javascript: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}` },
    timeComplexity: "O(n)", spaceComplexity: "O(n)",
    companyTags: ["Amazon", "Google", "Facebook"]
  },

  {
    title: "Reverse String",
    description: "Reverse a string in-place.",
    problemStatement: `Write a function that reverses a string. The input string is given as an array of characters s.`,
    difficulty: "easy",
    supportedLanguages: ["javascript"],
    topics: ["strings", "two-pointers"],
    tags: ["beginner", "strings"],
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: "Reverse in-place" }
    ],
    constraints: ["1 <= s.length <= 10^5"],
    codeConfig: { javascript: { runtime: "node", entryFunction: "reverseString", timeoutMs: 3000 } },
    startingCode: { javascript: `function reverseString(s) {\n    // Your code here\n}` },
    testCases: [
      { name: "Example", args: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"], hidden: false },
      { name: "Single", args: [["a"]], expected: ["a"], hidden: true }
    ],
    solutionCode: { javascript: `function reverseString(s) {\n    let left = 0, right = s.length - 1;\n    while (left < right) {\n        [s[left], s[right]] = [s[right], s[left]];\n        left++; right--;\n    }\n}` },
    timeComplexity: "O(n)", spaceComplexity: "O(1)",
    companyTags: ["Microsoft"]
  },

  {
    title: "Valid Parentheses",
    description: "Check if parentheses are valid.",
    problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.`,
    difficulty: "easy",
    supportedLanguages: ["javascript"],
    topics: ["stack", "string"],
    tags: ["beginner", "stack"],
    examples: [
      { input: 's = "()"', output: "true", explanation: "Valid parentheses" }
    ],
    constraints: ["1 <= s.length <= 10^4"],
    codeConfig: { javascript: { runtime: "node", entryFunction: "isValid", timeoutMs: 3000 } },
    startingCode: { javascript: `function isValid(s) {\n    // Your code here\n}` },
    testCases: [
      { name: "Simple", args: ["()"], expected: true, hidden: false },
      { name: "Mixed", args: ["()[]{}"], expected: true, hidden: false },
      { name: "Invalid", args: ["(]"], expected: false, hidden: true }
    ],
    solutionCode: { javascript: `function isValid(s) {\n    const stack = [];\n    const pairs = {')': '(', '}': '{', ']': '['};\n    for (let char of s) {\n        if (char in pairs) {\n            if (stack.pop() !== pairs[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}` },
    timeComplexity: "O(n)", spaceComplexity: "O(n)",
    companyTags: ["Amazon"]
  },

  {
    title: "Roman to Integer",
    description: "Convert Roman numerals to integer.",
    problemStatement: `Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Convert a Roman numeral to an integer.`,
    difficulty: "easy",
    supportedLanguages: ["javascript"],
    topics: ["hash-table", "math"],
    tags: ["beginner", "conversion"],
    examples: [
      { input: 's = "III"', output: "3", explanation: "III = 3" },
      { input: 's = "LVIII"', output: "58", explanation: "L = 50, V= 5, III = 3" }
    ],
    constraints: ["1 <= s.length <= 15"],
    codeConfig: { javascript: { runtime: "node", entryFunction: "romanToInt", timeoutMs: 3000 } },
    startingCode: { javascript: `function romanToInt(s) {\n    // Your code here\n}` },
    testCases: [
      { name: "Example 1", args: ["III"], expected: 3, hidden: false },
      { name: "Example 2", args: ["LVIII"], expected: 58, hidden: false },
      { name: "Example 3", args: ["MCMXC"], expected: 1990, hidden: true }
    ],
    solutionCode: { javascript: `function romanToInt(s) {\n    const romanMap = {I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000};\n    let result = 0;\n    \n    for (let i = 0; i < s.length; i++) {\n        const current = romanMap[s[i]];\n        const next = romanMap[s[i + 1]];\n        \n        if (next && current < next) {\n            result -= current;\n        } else {\n            result += current;\n        }\n    }\n    \n    return result;\n}` },
    timeComplexity: "O(n)", spaceComplexity: "O(1)",
    companyTags: ["Amazon"]
  },

  {
    title: "Palindrome Number",
    description: "Check if an integer is a palindrome.",
    problemStatement: "Given an integer x, return true if x is a palindrome integer.",
    difficulty: "easy",
    supportedLanguages: ["javascript"],
    topics: ["math"],
    tags: ["beginner", "math"],
    examples: [
      { input: "x = 121", output: "true", explanation: "121 reads the same backward as forward" }
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    codeConfig: { javascript: { runtime: "node", entryFunction: "isPalindrome", timeoutMs: 3000 } },
    startingCode: { javascript: `function isPalindrome(x) {\n    // Your code here\n}` },
    testCases: [
      { name: "Positive palindrome", args: [121], expected: true, hidden: false },
      { name: "Negative", args: [-121], expected: false, hidden: false }
    ],
    solutionCode: { javascript: `function isPalindrome(x) {\n    if (x < 0) return false;\n    const str = x.toString();\n    return str === str.split('').reverse().join('');\n}` },
    timeComplexity: "O(log n)", spaceComplexity: "O(log n)",
    companyTags: ["LeetCode"]
  }
];

module.exports = { javascriptChallenges };