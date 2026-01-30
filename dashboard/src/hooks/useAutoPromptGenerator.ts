// =====================================================
// src/hooks/useAutoPromptGenerator.ts - UPDATED - Test Cases Only
// =====================================================

import { useCallback } from 'react';
import type { Difficulty, Language } from '../types';

// Test case generation templates based on language and difficulty
interface TestCaseTemplate {
  name: string;
  args: any[];
  expected: any;
  hidden?: boolean;
  explanation?: string;
}

interface LanguageTestCases {
  [functionName: string]: {
    easy: TestCaseTemplate[];
    medium: TestCaseTemplate[];
    hard: TestCaseTemplate[];
  };
}

// Comprehensive test case templates for each language
const TEST_CASE_TEMPLATES: Record<Language, LanguageTestCases> = {
  javascript: {
    // Generic function patterns
    'processArray': {
      easy: [
        { name: 'Basic array', args: [[1, 2, 3]], expected: [1, 2, 3], explanation: 'Simple array processing' },
        { name: 'Empty array', args: [[]], expected: [], explanation: 'Handle empty input' },
        { name: 'Single element', args: [[42]], expected: [42], explanation: 'Single element case' }
      ],
      medium: [
        { name: 'Mixed types', args: [[1, '2', 3]], expected: [1, '2', 3], explanation: 'Handle mixed data types' },
        { name: 'Negative numbers', args: [[-1, -2, 3]], expected: [-1, -2, 3], explanation: 'Handle negative values' },
        { name: 'Large array', args: [Array.from({length: 100}, (_, i) => i)], expected: Array.from({length: 100}, (_, i) => i), hidden: true, explanation: 'Performance test with large input' }
      ],
      hard: [
        { name: 'Nested arrays', args: [[[1, 2], [3, 4]]], expected: [[1, 2], [3, 4]], explanation: 'Handle nested structures' },
        { name: 'Null values', args: [[1, null, 3]], expected: [1, null, 3], explanation: 'Handle null values gracefully' },
        { name: 'Very large dataset', args: [Array.from({length: 10000}, (_, i) => i)], expected: Array.from({length: 10000}, (_, i) => i), hidden: true, explanation: 'Stress test performance' }
      ]
    },
    'sumEvenNumbers': {
      easy: [
        { name: 'Basic case', args: [[1, 2, 3, 4, 5, 6]], expected: 12, explanation: 'Sum of 2 + 4 + 6 = 12' },
        { name: 'Empty array', args: [[]], expected: 0, explanation: 'Empty array should return 0' },
        { name: 'No even numbers', args: [[1, 3, 5, 7]], expected: 0, explanation: 'Array with only odd numbers' }
      ],
      medium: [
        { name: 'All even numbers', args: [[2, 4, 6, 8]], expected: 20, explanation: 'Sum when all numbers are even' },
        { name: 'Mixed positive/negative', args: [[-2, -1, 0, 1, 2]], expected: 0, explanation: 'Handle negative numbers and zero' },
        { name: 'Large numbers', args: [[100, 101, 102, 103, 104]], expected: 306, hidden: true, explanation: 'Sum of 100 + 102 + 104 = 306' }
      ],
      hard: [
        { name: 'Decimal numbers', args: [[1.5, 2.5, 3.5, 4.5]], expected: 7, explanation: 'Handle decimal numbers (only 2.5 and 4.5 are "even")' },
        { name: 'Very large array', args: [Array.from({length: 1000}, (_, i) => i)], expected: 249500, hidden: true, explanation: 'Performance with large dataset' },
        { name: 'Edge case values', args: [[Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 1]], expected: Number.MAX_SAFE_INTEGER, hidden: true, explanation: 'Handle very large numbers' }
      ]
    },
    'reverseString': {
      easy: [
        { name: 'Basic string', args: ['hello'], expected: 'olleh', explanation: 'Simple string reversal' },
        { name: 'Empty string', args: [''], expected: '', explanation: 'Handle empty string' },
        { name: 'Single character', args: ['a'], expected: 'a', explanation: 'Single character string' }
      ],
      medium: [
        { name: 'String with spaces', args: ['hello world'], expected: 'dlrow olleh', explanation: 'Preserve spaces in reversal' },
        { name: 'Numbers and letters', args: ['abc123'], expected: '321cba', explanation: 'Handle mixed alphanumeric' },
        { name: 'Special characters', args: ['hello!@#'], expected: '#@!olleh', explanation: 'Handle special characters' }
      ],
      hard: [
        { name: 'Unicode characters', args: ['Hello 🌍'], expected: '🌍 olleH', explanation: 'Handle unicode characters correctly' },
        { name: 'Very long string', args: ['a'.repeat(10000)], expected: 'a'.repeat(10000), hidden: true, explanation: 'Performance test with long string' },
        { name: 'Palindrome', args: ['racecar'], expected: 'racecar', explanation: 'Palindrome should equal itself when reversed' }
      ]
    }
  },
  python: {
    'is_palindrome': {
      easy: [
        { name: 'Simple palindrome', args: ['racecar'], expected: true, explanation: 'Basic palindrome test' },
        { name: 'Not a palindrome', args: ['hello'], expected: false, explanation: 'String that is not a palindrome' },
        { name: 'Single character', args: ['a'], expected: true, explanation: 'Single character is always a palindrome' }
      ],
      medium: [
        { name: 'Case insensitive', args: ['RaceCar'], expected: true, explanation: 'Should ignore case differences' },
        { name: 'With spaces', args: ['race a car'], expected: true, explanation: 'Should ignore spaces' },
        { name: 'Empty string', args: [''], expected: true, explanation: 'Empty string is considered a palindrome' }
      ],
      hard: [
        { name: 'Complex phrase', args: ['A man a plan a canal Panama'], expected: true, explanation: 'Complex palindrome with spaces and case' },
        { name: 'With punctuation', args: ["Madam, I'm Adam"], expected: true, explanation: 'Handle punctuation marks' },
        { name: 'Numbers and letters', args: ['Was it a car or a cat I saw?'], expected: true, hidden: true, explanation: 'Mixed content palindrome' }
      ]
    },
    'fibonacci': {
      easy: [
        { name: 'First number', args: [0], expected: 0, explanation: 'First Fibonacci number' },
        { name: 'Second number', args: [1], expected: 1, explanation: 'Second Fibonacci number' },
        { name: 'Fifth number', args: [5], expected: 5, explanation: 'Fifth Fibonacci number' }
      ],
      medium: [
        { name: 'Tenth number', args: [10], expected: 55, explanation: 'Tenth Fibonacci number' },
        { name: 'Fifteenth number', args: [15], expected: 610, explanation: 'Larger Fibonacci calculation' },
        { name: 'Twentieth number', args: [20], expected: 6765, hidden: true, explanation: 'Test calculation efficiency' }
      ],
      hard: [
        { name: 'Large Fibonacci', args: [30], expected: 832040, hidden: true, explanation: 'Large Fibonacci number test' },
        { name: 'Negative input', args: [-1], expected: 'None', explanation: 'Handle invalid negative input' },
        { name: 'Very large number', args: [50], expected: 12586269025, hidden: true, explanation: 'Performance test with large input' }
      ]
    },
    'process_list': {
      easy: [
        { name: 'Basic list', args: [[1, 2, 3, 4, 5]], expected: [1, 2, 3, 4, 5], explanation: 'Simple list processing' },
        { name: 'Empty list', args: [[]], expected: [], explanation: 'Handle empty list' },
        { name: 'Single item', args: [[42]], expected: [42], explanation: 'Single item list' }
      ],
      medium: [
        { name: 'Mixed types', args: [[1, 'hello', 3.14]], expected: [1, 'hello', 3.14], explanation: 'Handle mixed data types' },
        { name: 'With None values', args: [[1, 'None', 3]], expected: [1, 'None', 3], explanation: 'Handle None values' },
        { name: 'Large list', args: ['list(range(100))'], expected: 'list(range(100))', hidden: true, explanation: 'Performance test' }
      ],
      hard: [
        { name: 'Nested lists', args: [[[1, 2], [3, 4], [5, 6]]], expected: [[1, 2], [3, 4], [5, 6]], explanation: 'Handle nested structures' },
        { name: 'Complex data', args: [[{'a': 1}, {'b': 2}]], expected: [{'a': 1}, {'b': 2}], explanation: 'Handle complex objects' },
        { name: 'Very large list', args: ['list(range(10000))'], expected: 'list(range(10000))', hidden: true, explanation: 'Stress test performance' }
      ]
    }
  },
  react: {
    'Counter': {
      easy: [
        { name: 'Initial render', args: [], expected: '0', explanation: 'Component should start with count 0' },
        { name: 'Increment once', args: ['increment'], expected: '1', explanation: 'Count should increase by 1' },
        { name: 'Decrement once', args: ['decrement'], expected: '-1', explanation: 'Count should decrease by 1' }
      ],
      medium: [
        { name: 'Multiple increments', args: ['increment', 'increment', 'increment'], expected: '3', explanation: 'Multiple increment operations' },
        { name: 'Mixed operations', args: ['increment', 'decrement', 'increment'], expected: '1', explanation: 'Mix of increment and decrement' },
        { name: 'Reset functionality', args: ['increment', 'reset'], expected: '0', explanation: 'Reset should return to 0' }
      ],
      hard: [
        { name: 'Edge case operations', args: Array(100).fill('increment'), expected: '100', hidden: true, explanation: 'Handle many operations' },
        { name: 'Rapid operations', args: ['increment,decrement,increment,decrement,increment,decrement'], expected: '0', hidden: true, explanation: 'Handle rapid state changes' },
        { name: 'Boundary testing', args: Array(1000).fill('increment'), expected: '1000', hidden: true, explanation: 'Large number handling' }
      ]
    },
    'TodoList': {
      easy: [
        { name: 'Empty list', args: [], expected: [], explanation: 'Start with empty todo list' },
        { name: 'Add one item', args: [{action: 'add', text: 'Buy groceries'}], expected: ['Buy groceries'], explanation: 'Add single todo item' },
        { name: 'Add two items', args: [{action: 'add', text: 'Task 1'}, {action: 'add', text: 'Task 2'}], expected: ['Task 1', 'Task 2'], explanation: 'Add multiple items' }
      ],
      medium: [
        { name: 'Add and remove', args: [{action: 'add', text: 'Task 1'}, {action: 'remove', index: 0}], expected: [], explanation: 'Add then remove item' },
        { name: 'Toggle completion', args: [{action: 'add', text: 'Task 1'}, {action: 'toggle', index: 0}], expected: [{text: 'Task 1', completed: true}], explanation: 'Toggle item completion' },
        { name: 'Multiple operations', args: [{action: 'add', text: 'Task 1'}, {action: 'add', text: 'Task 2'}, {action: 'remove', index: 0}], expected: ['Task 2'], explanation: 'Complex operations sequence' }
      ],
      hard: [
        { name: 'Bulk operations', args: Array(50).fill({action: 'add', text: 'Task'}).map((item, i) => ({...item, text: `Task ${i + 1}`})), expected: Array(50).fill(0).map((_, i) => `Task ${i + 1}`), hidden: true, explanation: 'Handle many items' },
        { name: 'Edge case removal', args: [{action: 'add', text: 'Task'}, {action: 'remove', index: 10}], expected: ['Task'], explanation: 'Invalid removal index' },
        { name: 'Complex state', args: [{action: 'add', text: 'T1'}, {action: 'toggle', index: 0}, {action: 'add', text: 'T2'}], expected: [{text: 'T1', completed: true}, 'T2'], hidden: true, explanation: 'Mixed completion states' }
      ]
    }
  },
  css: {
    'flexbox': {
      easy: [
        { name: 'Basic flex container', args: ['.container { display: flex; }'], expected: 'valid', explanation: 'Basic flexbox syntax' },
        { name: 'Flex direction', args: ['.container { display: flex; flex-direction: column; }'], expected: 'valid', explanation: 'Column direction layout' },
        { name: 'Center alignment', args: ['.container { display: flex; justify-content: center; }'], expected: 'valid', explanation: 'Center items horizontally' }
      ],
      medium: [
        { name: 'Complex alignment', args: ['.container { display: flex; justify-content: space-between; align-items: center; }'], expected: 'valid', explanation: 'Complex alignment properties' },
        { name: 'Flex wrap', args: ['.container { display: flex; flex-wrap: wrap; }'], expected: 'valid', explanation: 'Allow items to wrap' },
        { name: 'Flex properties', args: ['.item { flex: 1 1 auto; }'], expected: 'valid', explanation: 'Flex grow, shrink, and basis' }
      ],
      hard: [
        { name: 'Grid fallback', args: ['.container { display: flex; display: grid; }'], expected: 'valid', explanation: 'Progressive enhancement pattern' },
        { name: 'Complex responsive', args: ['@media (max-width: 768px) { .container { flex-direction: column; } }'], expected: 'valid', explanation: 'Responsive flexbox behavior' },
        { name: 'Nested flex', args: ['.parent { display: flex; } .child { display: flex; flex: 1; }'], expected: 'valid', hidden: true, explanation: 'Nested flexbox containers' }
      ]
    }
  },
  html: {
    'form': {
      easy: [
        { name: 'Basic input', args: ['<input type="text" name="username">'], expected: 'valid', explanation: 'Basic text input' },
        { name: 'Label association', args: ['<label for="email">Email</label><input id="email" type="email">'], expected: 'valid', explanation: 'Proper label association' },
        { name: 'Form submission', args: ['<form action="/submit" method="post"></form>'], expected: 'valid', explanation: 'Basic form structure' }
      ],
      medium: [
        { name: 'Input validation', args: ['<input type="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$">'], expected: 'valid', explanation: 'Email validation with pattern' },
        { name: 'Fieldset grouping', args: ['<fieldset><legend>Personal Info</legend><input type="text"></fieldset>'], expected: 'valid', explanation: 'Semantic form grouping' },
        { name: 'Accessibility', args: ['<input type="text" aria-describedby="help"><div id="help">Help text</div>'], expected: 'valid', explanation: 'Accessible form controls' }
      ],
      hard: [
        { name: 'Complex validation', args: ['<input type="password" minlength="8" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]">'], expected: 'valid', explanation: 'Complex password validation' },
        { name: 'Custom elements', args: ['<input type="date" min="2024-01-01" max="2024-12-31">'], expected: 'valid', explanation: 'Date input with constraints' },
        { name: 'Progressive enhancement', args: ['<input type="search" list="suggestions"><datalist id="suggestions"></datalist>'], expected: 'valid', hidden: true, explanation: 'Enhanced search input' }
      ]
    }
  },
  sql: {
    'select_query': {
      easy: [
        { name: 'Basic select', args: ['SELECT * FROM users'], expected: 'valid', explanation: 'Simple SELECT statement' },
        { name: 'Where clause', args: ['SELECT name FROM users WHERE age > 18'], expected: 'valid', explanation: 'Basic WHERE filtering' },
        { name: 'Order by', args: ['SELECT name FROM users ORDER BY name ASC'], expected: 'valid', explanation: 'Sort results by name' }
      ],
      medium: [
        { name: 'Join tables', args: ['SELECT u.name, p.title FROM users u JOIN posts p ON u.id = p.user_id'], expected: 'valid', explanation: 'Inner join between tables' },
        { name: 'Group by', args: ['SELECT department, COUNT(*) FROM employees GROUP BY department'], expected: 'valid', explanation: 'Aggregate with grouping' },
        { name: 'Having clause', args: ['SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5'], expected: 'valid', explanation: 'Filter grouped results' }
      ],
      hard: [
        { name: 'Subquery', args: ['SELECT name FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > 100)'], expected: 'valid', explanation: 'Subquery in WHERE clause' },
        { name: 'Window function', args: ['SELECT name, salary, RANK() OVER (ORDER BY salary DESC) as rank FROM employees'], expected: 'valid', explanation: 'Window function for ranking' },
        { name: 'Complex join', args: ['SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id'], expected: 'valid', hidden: true, explanation: 'Left join with aggregation' }
      ]
    }
  },
  dart: {
    'process_data': {
      easy: [
        { name: 'Basic list', args: [[1, 2, 3, 4, 5]], expected: [1, 2, 3, 4, 5], explanation: 'Simple list processing' },
        { name: 'Empty list', args: [[]], expected: [], explanation: 'Handle empty list' },
        { name: 'Single item', args: [[42]], expected: [42], explanation: 'Single item list' }
      ],
      medium: [
        { name: 'Filter operation', args: [[1, 2, 3, 4, 5, 6]], expected: [2, 4, 6], explanation: 'Filter even numbers' },
        { name: 'Map operation', args: [[1, 2, 3]], expected: [2, 4, 6], explanation: 'Double each number' },
        { name: 'Null safety', args: [null], expected: [], explanation: 'Handle null input safely' }
      ],
      hard: [
        { name: 'Complex generics', args: [{'data': [1, 2, 3]}], expected: {'processed': [1, 2, 3]}, explanation: 'Generic type processing' },
        { name: 'Async processing', args: [[1, 2, 3]], expected: 'Future<List<int>>', explanation: 'Asynchronous data processing' },
        { name: 'Stream handling', args: ['stream_data'], expected: 'Stream<int>', hidden: true, explanation: 'Handle data streams' }
      ]
    }
  },
  flutter: {
    'StatelessWidget': {
      easy: [
        { name: 'Basic widget', args: [], expected: 'Text("Hello")', explanation: 'Simple text widget' },
        { name: 'Container widget', args: [], expected: 'Container(child: Text("Test"))', explanation: 'Container with child' },
        { name: 'Column layout', args: [], expected: 'Column(children: [])', explanation: 'Basic column layout' }
      ],
      medium: [
        { name: 'Styled widget', args: [], expected: 'Container(padding: EdgeInsets.all(16), child: Text("Styled"))', explanation: 'Widget with styling' },
        { name: 'Row with spacing', args: [], expected: 'Row(mainAxisAlignment: MainAxisAlignment.spaceBetween)', explanation: 'Row with alignment' },
        { name: 'Flexible layout', args: [], expected: 'Flex(children: [Expanded(child: Text("Flex"))])', explanation: 'Flexible layout system' }
      ],
      hard: [
        { name: 'Custom widget', args: [], expected: 'CustomScrollView(slivers: [])', explanation: 'Advanced custom widget' },
        { name: 'Animation widget', args: [], expected: 'AnimatedContainer(duration: Duration(seconds: 1))', explanation: 'Animated widget implementation' },
        { name: 'Platform specific', args: [], expected: 'Platform.isIOS ? CupertinoButton() : ElevatedButton()', hidden: true, explanation: 'Platform-specific widgets' }
      ]
    }
  },
  express: {
    'route_handler': {
      easy: [
        { name: 'Basic GET', args: ['GET', '/'], expected: 'res.send("Hello")', explanation: 'Simple GET route' },
        { name: 'JSON response', args: ['GET', '/api'], expected: 'res.json({message: "API"})', explanation: 'JSON API response' },
        { name: 'Route parameter', args: ['GET', '/user/:id'], expected: 'req.params.id', explanation: 'Access route parameters' }
      ],
      medium: [
        { name: 'POST with body', args: ['POST', '/users'], expected: 'req.body', explanation: 'Handle POST request body' },
        { name: 'Query parameters', args: ['GET', '/search'], expected: 'req.query', explanation: 'Access query parameters' },
        { name: 'Middleware usage', args: ['app.use(middleware)'], expected: 'middleware function', explanation: 'Apply middleware' }
      ],
      hard: [
        { name: 'Error handling', args: ['next(error)'], expected: 'error middleware', explanation: 'Proper error handling' },
        { name: 'Async route', args: ['async handler'], expected: 'try/catch wrapper', explanation: 'Async route handling' },
        { name: 'Custom middleware', args: ['custom middleware'], expected: '(req, res, next) => {}', hidden: true, explanation: 'Custom middleware creation' }
      ]
    }
  },
  typescript: {
    'generic_function': {
      easy: [
        { name: 'Basic generic', args: ['<T>(value: T): T'], expected: 'return value', explanation: 'Simple generic function' },
        { name: 'Array generic', args: ['<T>(arr: T[]): T[]'], expected: 'return arr', explanation: 'Generic array handling' },
        { name: 'Type inference', args: ['identity(42)'], expected: 'number', explanation: 'Type inference with generics' }
      ],
      medium: [
        { name: 'Constrained generic', args: ['<T extends string>(value: T)'], expected: 'string constraint', explanation: 'Generic with constraints' },
        { name: 'Multiple generics', args: ['<T, U>(a: T, b: U)'], expected: 'tuple return', explanation: 'Multiple type parameters' },
        { name: 'Generic interface', args: ['interface Generic<T> { value: T }'], expected: 'type safe interface', explanation: 'Generic interface definition' }
      ],
      hard: [
        { name: 'Conditional types', args: ['T extends U ? X : Y'], expected: 'conditional type', explanation: 'Advanced conditional types' },
        { name: 'Mapped types', args: ['{ [K in keyof T]: T[K] }'], expected: 'mapped type', explanation: 'Type transformation' },
        { name: 'Utility types', args: ['Partial<T>, Required<T>'], expected: 'utility type usage', hidden: true, explanation: 'Built-in utility types' }
      ]
    }
  },
  reactNative: {
    'mobile_component': {
      easy: [
        { name: 'Basic View', args: [], expected: '<View><Text>Hello</Text></View>', explanation: 'Simple mobile component' },
        { name: 'TouchableOpacity', args: [], expected: '<TouchableOpacity onPress={}>', explanation: 'Touchable component' },
        { name: 'ScrollView', args: [], expected: '<ScrollView>{children}</ScrollView>', explanation: 'Scrollable content' }
      ],
      medium: [
        { name: 'FlatList', args: [], expected: '<FlatList data={} renderItem={} />', explanation: 'List rendering component' },
        { name: 'Styled component', args: [], expected: 'StyleSheet.create({})', explanation: 'Component styling' },
        { name: 'Platform specific', args: [], expected: 'Platform.OS === "ios"', explanation: 'Platform-specific code' }
      ],
      hard: [
        { name: 'Native modules', args: [], expected: 'NativeModules.CustomModule', explanation: 'Native module integration' },
        { name: 'Animation', args: [], expected: 'Animated.Value', explanation: 'Animation implementation' },
        { name: 'Navigation', args: [], expected: 'navigation.navigate()', hidden: true, explanation: 'Screen navigation' }
      ]
    }
  },
  json: {
    'validate_structure': {
      easy: [
        { name: 'Valid JSON', args: ['{"name": "John", "age": 30}'], expected: true, explanation: 'Basic valid JSON object' },
        { name: 'Invalid JSON', args: ['{name: "John"}'], expected: false, explanation: 'Missing quotes on property name' },
        { name: 'Array JSON', args: ['[1, 2, 3]'], expected: true, explanation: 'Valid JSON array' }
      ],
      medium: [
        { name: 'Nested object', args: ['{"user": {"name": "John", "profile": {"age": 30}}}'], expected: true, explanation: 'Nested object validation' },
        { name: 'Mixed types', args: ['{"string": "text", "number": 42, "boolean": true, "null": null}'], expected: true, explanation: 'Multiple data types' },
        { name: 'Escaped characters', args: ['{"message": "He said \"Hello\""}'], expected: true, explanation: 'Properly escaped quotes' }
      ],
      hard: [
        { name: 'Unicode support', args: ['{"emoji": "😀", "unicode": "\\u0041"}'], expected: true, explanation: 'Unicode character handling' },
        { name: 'Large structure', args: ['{"data": [' + Array(100).fill('{"id": 1}').join(',') + ']}'], expected: true, hidden: true, explanation: 'Large JSON structure' },
        { name: 'Edge case values', args: ['{"infinity": "should_be_string", "nan": "should_be_string"}'], expected: true, explanation: 'Handle special numeric values as strings' }
      ]
    }
  },
  swift: {
    'findMaximum': {
      easy: [
        { name: 'Basic array', args: [[1, 2, 3, 4, 5]], expected: 5, explanation: 'Find maximum in sorted array' },
        { name: 'Single element', args: [[42]], expected: 42, explanation: 'Single element array' },
        { name: 'Negative numbers', args: [[-5, -2, -10]], expected: -2, explanation: 'Find maximum among negatives' }
      ],
      medium: [
        { name: 'Mixed values', args: [[3, -1, 7, 2, -5, 8]], expected: 8, explanation: 'Mixed positive and negative' },
        { name: 'Duplicates', args: [[5, 5, 5, 5]], expected: 5, explanation: 'All same values' },
        { name: 'Large range', args: [[-1000, 0, 1000]], expected: 1000, explanation: 'Wide range of values' }
      ],
      hard: [
        { name: 'Large array', args: [Array.from({length: 1000}, (_, i) => i)], expected: 999, hidden: true, explanation: 'Performance test' },
        { name: 'Alternating', args: [[1, -1, 2, -2, 3, -3]], expected: 3, explanation: 'Alternating pattern' },
        { name: 'Boundary values', args: [[Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER]], expected: Number.MAX_SAFE_INTEGER, hidden: true, explanation: 'Boundary values' }
      ]
    },
    'reverseString': {
      easy: [
        { name: 'Basic string', args: ['hello'], expected: 'olleh', explanation: 'Simple string reversal' },
        { name: 'Empty string', args: [''], expected: '', explanation: 'Empty string case' },
        { name: 'Single char', args: ['a'], expected: 'a', explanation: 'Single character' }
      ],
      medium: [
        { name: 'With spaces', args: ['hello world'], expected: 'dlrow olleh', explanation: 'String with spaces' },
        { name: 'Numbers', args: ['12345'], expected: '54321', explanation: 'Numeric characters' },
        { name: 'Palindrome', args: ['racecar'], expected: 'racecar', explanation: 'Palindrome stays same' }
      ],
      hard: [
        { name: 'Unicode', args: ['héllo'], expected: 'olléh', explanation: 'Unicode characters' },
        { name: 'Long string', args: ['a'.repeat(1000)], expected: 'a'.repeat(1000), hidden: true, explanation: 'Long string performance' },
        { name: 'Special chars', args: ['!@#$%'], expected: '%$#@!', explanation: 'Special characters' }
      ]
    }
  },
  swiftui: {
    // SwiftUI doesn't have code execution, using placeholder for consistency
    'placeholder': {
      easy: [],
      medium: [],
      hard: []
    }
  }
};

// Fallback test cases for unknown functions
const GENERIC_TEST_CASES = {
  easy: [
    { name: 'Basic case', args: ['input'], expected: 'output', explanation: 'Basic function test' },
    { name: 'Empty input', args: [''], expected: '', explanation: 'Handle empty input' },
    { name: 'Simple value', args: [42], expected: 42, explanation: 'Simple value processing' }
  ],
  medium: [
    { name: 'Complex input', args: [['data', 123]], expected: ['data', 123], explanation: 'Handle complex input' },
    { name: 'Edge case', args: [null], expected: null, explanation: 'Handle null input' },
    { name: 'Multiple parameters', args: ['param1', 'param2'], expected: 'result', explanation: 'Multiple parameter handling' }
  ],
  hard: [
    { name: 'Performance test', args: [Array(1000).fill('test')], expected: Array(1000).fill('test'), hidden: true, explanation: 'Performance with large input' },
    { name: 'Error handling', args: [undefined], expected: 'error', explanation: 'Handle undefined input' },
    { name: 'Complex scenario', args: [{'complex': {'nested': 'data'}}], expected: 'processed', hidden: true, explanation: 'Complex nested data processing' }
  ]
};

export const useAutoPromptGenerator = () => {
  const generateTestCases = useCallback(async (
    language: Language,
    functionSignature: string,
    difficulty: Difficulty = 'medium'
  ): Promise<Array<{ input: any; output: any; explanation?: string }>> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Clean function name for lookup
    const functionName = functionSignature.split('(')[0].trim();
    
    // Get language-specific test cases
    const languageTemplates = TEST_CASE_TEMPLATES[language];
    let testCases = null;
    
    if (languageTemplates) {
      // Try exact function name match
      testCases = languageTemplates[functionName];
      
      // If no exact match, try partial matches for common patterns
      if (!testCases) {
        const patterns = Object.keys(languageTemplates);
        const pattern = patterns.find(p => 
          functionName.toLowerCase().includes(p.toLowerCase()) ||
          p.toLowerCase().includes(functionName.toLowerCase())
        );
        if (pattern) {
          testCases = languageTemplates[pattern];
        }
      }
    }

    // Fall back to generic test cases if no specific templates found
    const selectedCases = testCases?.[difficulty] || GENERIC_TEST_CASES[difficulty];
    
    // Convert to expected format
    return selectedCases.map(testCase => ({
      input: testCase.args,
      output: testCase.expected,
      explanation: testCase.explanation
    }));
  }, []);

  return {
    generateTestCases
  };
};