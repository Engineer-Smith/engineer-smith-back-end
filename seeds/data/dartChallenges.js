// /seeds/data/dartChallengesData.js - Dart challenge data
const dartChallenges = [
  {
    title: "Two Sum with Null Safety",
    description: "Find two numbers using Dart's null-safe Map operations.",
    problemStatement: "Given a List<int> nums and an int target, return indices of two numbers that add up to target. Use Dart's null safety features.",
    difficulty: "easy",
    supportedLanguages: ["dart"],
    topics: ["arrays", "maps", "null-safety"],
    tags: ["beginner", "lists", "maps", "null-safety"],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 9" }
    ],
    constraints: ["2 <= nums.length <= 10^4"],
    codeConfig: { dart: { runtime: "dart", entryFunction: "twoSum", timeoutMs: 3000 } },
    startingCode: { dart: "List<int>? twoSum(List<int> nums, int target) {\n  // Your code here\n  return null;\n}" },
    testCases: [
      { name: "Example 1", args: [[2, 7, 11, 15], 9], expected: [0, 1], hidden: false },
      { name: "Example 2", args: [[3, 2, 4], 6], expected: [1, 2], hidden: false }
    ],
    solutionCode: { dart: "List<int>? twoSum(List<int> nums, int target) {\n  final Map<int, int> seen = {};\n  \n  for (int i = 0; i < nums.length; i++) {\n    final int complement = target - nums[i];\n    if (seen.containsKey(complement)) {\n      return [seen[complement]!, i];\n    }\n    seen[nums[i]] = i;\n  }\n  \n  return null;\n}" },
    timeComplexity: "O(n)", spaceComplexity: "O(n)",
    companyTags: ["Google", "Flutter"]
  },

  {
    title: "Dart Extension Methods",
    description: "Create extension methods for common string operations.",
    problemStatement: "Create extension methods on String class to check if a string is palindrome and get word count.",
    difficulty: "easy",
    supportedLanguages: ["dart"],
    topics: ["extensions", "strings"],
    tags: ["beginner", "extensions", "strings"],
    examples: [
      { input: '"hello world".wordCount()', output: "2", explanation: "Extension method counts words" }
    ],
    constraints: ["Use extension methods"],
    codeConfig: { dart: { runtime: "dart", entryFunction: "testStringExtensions", timeoutMs: 3000 } },
    startingCode: { dart: 'extension StringExtensions on String {\n  bool get isPalindrome {\n    // Your code here\n    return false;\n  }\n  \n  int get wordCount {\n    // Your code here\n    return 0;\n  }\n}\n\nMap<String, dynamic> testStringExtensions() {\n  const text = "hello world";\n  const palindrome = "racecar";\n  \n  return {\n    \'wordCount\': text.wordCount,\n    \'isPalindrome\': palindrome.isPalindrome,\n  };\n}' },
    testCases: [
      { name: "String extensions", args: [], expected: {"wordCount": 2, "isPalindrome": true}, hidden: false }
    ],
    solutionCode: { dart: 'extension StringExtensions on String {\n  bool get isPalindrome {\n    final cleaned = toLowerCase().replaceAll(RegExp(r\'[^a-z0-9]\'), \'\');\n    return cleaned == cleaned.split(\'\').reversed.join(\'\');\n  }\n  \n  int get wordCount {\n    return trim().isEmpty ? 0 : trim().split(RegExp(r\'\\\\s+\')).length;\n  }\n}\n\nMap<String, dynamic> testStringExtensions() {\n  const text = "hello world";\n  const palindrome = "racecar";\n  \n  return {\n    \'wordCount\': text.wordCount,\n    \'isPalindrome\': palindrome.isPalindrome,\n  };\n}' },
    timeComplexity: "O(n)", spaceComplexity: "O(n)",
    companyTags: ["Dart Extensions"]
  },

  {
    title: "Future and Async Patterns",
    description: "Work with Dart's Future and async/await patterns.",
    problemStatement: "Create functions that demonstrate proper async/await usage and Future chaining in Dart.",
    difficulty: "medium",
    supportedLanguages: ["dart"],
    topics: ["async", "futures", "streams"],
    tags: ["intermediate", "async", "futures"],
    examples: [
      { input: "async operations", output: "properly handled", explanation: "Async patterns" }
    ],
    constraints: ["Use async/await"],
    codeConfig: { dart: { runtime: "dart", entryFunction: "asyncDemo", timeoutMs: 3000 } },
    startingCode: { dart: 'Future<String> fetchData(String type) async {\n  // Simulate API call\n  // Your code here\n  return "data";\n}\n\nFuture<Map<String, dynamic>> asyncDemo() async {\n  // Your code here\n  return {};\n}' },
    testCases: [
      { name: "Async operations", args: [], expected: {"data": "users_data", "delay": true}, hidden: false }
    ],
    solutionCode: { dart: 'Future<String> fetchData(String type) async {\n  // Simulate API call with delay\n  await Future.delayed(Duration(milliseconds: 100));\n  return "${type}_data";\n}\n\nFuture<Map<String, dynamic>> asyncDemo() async {\n  final data = await fetchData("users");\n  return {\n    "data": data,\n    "delay": true\n  };\n}' },
    timeComplexity: "O(1)", spaceComplexity: "O(1)",
    companyTags: ["Async Programming"]
  }
];

module.exports = { dartChallenges };