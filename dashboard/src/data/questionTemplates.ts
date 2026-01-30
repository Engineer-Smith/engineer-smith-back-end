// =====================================================
// src/data/questionTemplates.ts - FIXED - Complete working question templates with valid enum values
// =====================================================

import type { Language, QuestionType, QuestionCategory, Difficulty, Tags } from '../types';

export interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  language: Language;
  category?: QuestionCategory;
  type: QuestionType;
  difficulty: Difficulty;
  tags: Tags[];
  
  // Question content
  title: string;
  questionDescription: string;
  
  // Type-specific content
  options?: string[];
  correctAnswer?: number | boolean;
  codeTemplate?: string;
  blanks?: Array<{
    id: string;
    correctAnswers: string[];
    caseSensitive: boolean;
    hint?: string;
    points: number;
  }>;
  buggyCode?: string;
  solutionCode?: string;
  
  // Code configuration for logic questions
  codeConfig?: {
    runtime: 'node' | 'python' | 'sql' | 'dart';
    entryFunction: string;
    timeoutMs: number;
    allowPreview: boolean;
  };
  
  // Test cases for code challenges
  testCases?: Array<{
    name: string;
    args: any[];
    expected: any;
    hidden: boolean;
    explanation?: string;
  }>;
}

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // =====================================================
  // JAVASCRIPT TEMPLATES
  // =====================================================
  {
    id: 'js-mc-array-methods',
    name: 'JavaScript Array Methods',
    description: 'Multiple choice question about JavaScript array manipulation',
    language: 'javascript',
    category: 'syntax',
    type: 'multipleChoice',
    difficulty: 'medium',
    tags: ['javascript', 'arrays'],
    title: 'JavaScript Array Methods - Filter and Map',
    questionDescription: 'Examine the following JavaScript code and determine what will be logged to the console.',
    options: [
      `const numbers = [1, 2, 3, 4, 5, 6];
const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2);
console.log(result);`,
      '[4, 8, 12]',
      '[2, 4, 6, 8, 10, 12]',
      '[1, 4, 9, 16, 25, 36]',
      '[2, 4, 6]'
    ],
    correctAnswer: 1
  },
  
  {
    id: 'js-tf-hoisting',
    name: 'JavaScript Hoisting',
    description: 'True/false question about variable hoisting behavior',
    language: 'javascript',
    category: 'syntax',
    type: 'trueFalse',
    difficulty: 'medium',
    tags: ['javascript', 'hoisting', 'variables'],
    title: 'Variable Hoisting with Let and Const',
    questionDescription: 'True or False: Variables declared with `let` and `const` are hoisted to the top of their scope and can be accessed before their declaration.',
    correctAnswer: false
  },
  
  {
    id: 'js-fill-destructuring',
    name: 'JavaScript Destructuring',
    description: 'Fill in the blank for object destructuring syntax',
    language: 'javascript',
    category: 'syntax',
    type: 'fillInTheBlank',
    difficulty: 'easy',
    tags: ['javascript', 'objects', 'es6'],
    title: 'Object Destructuring Assignment',
    questionDescription: 'Complete the destructuring assignment to extract the name and age properties from the user object.',
    codeTemplate: `const user = { name: 'Alice', age: 30, city: 'New York' };
const { ___, ___ } = user;
console.log(name); // Should log 'Alice'
console.log(age);  // Should log 30`,
    blanks: [
      {
        id: 'blank_1',
        correctAnswers: ['name'],
        caseSensitive: true,
        hint: 'The property name for the first value',
        points: 5
      },
      {
        id: 'blank_2',
        correctAnswers: ['age'],
        caseSensitive: true,
        hint: 'The property name for the second value',
        points: 5
      }
    ]
  },
  
  {
    id: 'js-challenge-sum-even',
    name: 'Sum Even Numbers',
    description: 'Code challenge to sum even numbers in an array',
    language: 'javascript',
    category: 'logic',
    type: 'codeChallenge',
    difficulty: 'easy',
    tags: ['javascript', 'arrays', 'algorithms'],
    title: 'Sum of Even Numbers',
    questionDescription: 'Write a function that takes an array of integers and returns the sum of all even numbers.',
    codeConfig: {
      runtime: 'node',
      entryFunction: 'sumEvenNumbers',
      timeoutMs: 3000,
      allowPreview: true
    },
    testCases: [
      {
        name: 'Basic case',
        args: [[1, 2, 3, 4, 5, 6]],
        expected: 12,
        hidden: false,
        explanation: 'Sum of 2 + 4 + 6 = 12'
      },
      {
        name: 'Empty array',
        args: [[]],
        expected: 0,
        hidden: false,
        explanation: 'Empty array should return 0'
      },
      {
        name: 'No even numbers',
        args: [[1, 3, 5, 7]],
        expected: 0,
        hidden: false,
        explanation: 'Array with only odd numbers should return 0'
      },
      {
        name: 'Large numbers',
        args: [[100, 101, 102, 103, 104]],
        expected: 306,
        hidden: true,
        explanation: 'Sum of 100 + 102 + 104 = 306'
      },
      {
        name: 'Negative numbers',
        args: [[-4, -3, -2, -1, 0, 1, 2]],
        expected: -4,
        hidden: true,
        explanation: 'Sum of -4 + -2 + 0 + 2 = -4'
      }
    ]
  },
  
  {
    id: 'js-debug-loop',
    name: 'JavaScript Loop Bug',
    description: 'Debug a JavaScript loop with an off-by-one error',
    language: 'javascript',
    category: 'logic',
    type: 'codeDebugging',
    difficulty: 'medium',
    tags: ['javascript', 'loops'],
    title: 'Fix the Loop Bug',
    questionDescription: 'The following function should return an array of numbers from 1 to n, but it has a bug. Identify and fix the issue.',
    buggyCode: `function generateNumbers(n) {
  const result = [];
  for (let i = 1; i < n; i++) {
    result.push(i);
  }
  return result;
}

// Should return [1, 2, 3, 4, 5] for generateNumbers(5)`,
    solutionCode: `function generateNumbers(n) {
  const result = [];
  for (let i = 1; i <= n; i++) { // Changed < to <=
    result.push(i);
  }
  return result;
}`
  },

  // =====================================================
  // REACT TEMPLATES
  // =====================================================
  {
    id: 'react-mc-hooks',
    name: 'React Hooks Usage',
    description: 'Multiple choice about React hooks lifecycle',
    language: 'react',
    category: 'syntax',
    type: 'multipleChoice',
    difficulty: 'medium',
    tags: ['react', 'hooks'],
    title: 'React useEffect Dependency Array',
    questionDescription: 'What will happen when this React component renders?',
    options: [
      `function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Effect runs');
    setCount(count + 1);
  }, []);
  
  return <div>{count}</div>;
}`,
      'The effect runs once and count becomes 1',
      'The effect runs infinitely causing an infinite loop',
      'The component will not render due to an error',
      'The effect never runs'
    ],
    correctAnswer: 1
  },
  
  {
    id: 'react-tf-props',
    name: 'React Props Immutability',
    description: 'True/false about React props behavior',
    language: 'react',
    category: 'syntax',
    type: 'trueFalse',
    difficulty: 'easy',
    tags: ['react', 'props'],
    title: 'React Props Modification',
    questionDescription: 'True or False: In React, you can directly modify props inside a component to change the parent component\'s state.',
    correctAnswer: false
  },
  
  {
    id: 'react-fill-component',
    name: 'React Component Structure',
    description: 'Complete a basic React functional component',
    language: 'react',
    category: 'ui',
    type: 'fillInTheBlank',
    difficulty: 'easy',
    tags: ['react', 'components', 'jsx'],
    title: 'Complete the React Component',
    questionDescription: 'Fill in the blanks to create a functional React component that displays a welcome message.',
    codeTemplate: `import React from 'react';

function WelcomeMessage({ name }) {
  return (
    <___>
      <h1>Welcome, {___}!</h1>
      <p>Thanks for joining us.</p>
    </___>
  );
}

export ___ WelcomeMessage;`,
    blanks: [
      {
        id: 'blank_1',
        correctAnswers: ['div', 'section', 'main'],
        caseSensitive: false,
        hint: 'A container HTML element',
        points: 3
      },
      {
        id: 'blank_2',
        correctAnswers: ['name'],
        caseSensitive: true,
        hint: 'The prop being passed to the component',
        points: 4
      },
      {
        id: 'blank_3',
        correctAnswers: ['default'],
        caseSensitive: true,
        hint: 'Type of export for the main component',
        points: 3
      }
    ]
  },
  
  {
    id: 'react-challenge-counter',
    name: 'React Counter Component',
    description: 'Build a counter component with increment/decrement',
    language: 'react',
    category: 'ui',
    type: 'codeChallenge',
    difficulty: 'easy',
    tags: ['react', 'components'],
    title: 'Interactive Counter Component',
    questionDescription: 'Create a React component that displays a counter with increment and decrement buttons. The counter should start at 0.',
    codeTemplate: `import React, { useState } from 'react';

function Counter() {
  // Your implementation here
  
  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
}

export default Counter;`
  },
  
  {
    id: 'react-debug-state',
    name: 'React State Update Bug',
    description: 'Fix a React state update issue',
    language: 'react',
    category: 'logic',
    type: 'codeDebugging',
    difficulty: 'medium',
    tags: ['react', 'state-management'],
    title: 'Fix the State Update Bug',
    questionDescription: 'This component should increment the counter by 2 when the button is clicked, but it only increments by 1. Fix the bug.',
    buggyCode: `import React, { useState } from 'react';

function BuggyCounter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1); // This doesn't work as expected
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Add 2</button>
    </div>
  );
}`,
    solutionCode: `import React, { useState } from 'react';

function BuggyCounter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(prevCount => prevCount + 1);
    setCount(prevCount => prevCount + 1);
    // Or alternatively: setCount(count + 2);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Add 2</button>
    </div>
  );
}`
  },

  // =====================================================
  // PYTHON TEMPLATES
  // =====================================================
  {
    id: 'python-mc-list-comp',
    name: 'Python List Comprehension',
    description: 'Multiple choice about list comprehension syntax',
    language: 'python',
    category: 'syntax',
    type: 'multipleChoice',
    difficulty: 'medium',
    tags: ['python', 'list-comprehensions'],
    title: 'List Comprehension Output',
    questionDescription: 'What will be the output of this Python list comprehension?',
    options: [
      `numbers = [1, 2, 3, 4, 5]
result = [x * 2 for x in numbers if x % 2 == 1]
print(result)`,
      '[2, 6, 10]',
      '[1, 3, 5]',
      '[2, 4, 6, 8, 10]',
      '[4, 8, 12]'
    ],
    correctAnswer: 1
  },
  
  {
    id: 'python-tf-mutable',
    name: 'Python Mutable Default Arguments',
    description: 'True/false about mutable default arguments',
    language: 'python',
    category: 'syntax',
    type: 'trueFalse',
    difficulty: 'hard',
    tags: ['python', 'functions'],
    title: 'Mutable Default Arguments',
    questionDescription: 'True or False: Using a mutable object (like a list) as a default argument in a Python function is generally considered safe and will always behave as expected.',
    correctAnswer: false
  },
  
  {
    id: 'python-challenge-palindrome',
    name: 'Palindrome Checker',
    description: 'Function to check if a string is a palindrome',
    language: 'python',
    category: 'logic',
    type: 'codeChallenge',
    difficulty: 'easy',
    tags: ['python', 'algorithms'],
    title: 'Palindrome Checker Function',
    questionDescription: 'Write a function that checks if a given string is a palindrome (reads the same forwards and backwards), ignoring spaces and case.',
    codeConfig: {
      runtime: 'python',
      entryFunction: 'is_palindrome',
      timeoutMs: 3000,
      allowPreview: true
    },
    testCases: [
      {
        name: 'Simple palindrome',
        args: ['racecar'],
        expected: true,
        hidden: false,
        explanation: 'Basic palindrome test'
      },
      {
        name: 'Not a palindrome',
        args: ['hello'],
        expected: false,
        hidden: false,
        explanation: 'String that is not a palindrome'
      },
      {
        name: 'Case insensitive',
        args: ['RaceCar'],
        expected: true,
        hidden: false,
        explanation: 'Should ignore case differences'
      },
      {
        name: 'With spaces',
        args: ['A man a plan a canal Panama'],
        expected: true,
        hidden: true,
        explanation: 'Should ignore spaces and case'
      },
      {
        name: 'Single character',
        args: ['a'],
        expected: true,
        hidden: true,
        explanation: 'Single character is always a palindrome'
      }
    ]
  },
  
  {
    id: 'python-debug-indentation',
    name: 'Python Indentation Error',
    description: 'Fix indentation issues in Python code',
    language: 'python',
    category: 'syntax',
    type: 'codeDebugging',
    difficulty: 'easy',
    tags: ['python'],
    title: 'Fix the Indentation Error',
    questionDescription: 'The following Python function has indentation errors. Fix them so the function works correctly.',
    buggyCode: `def calculate_grade(score):
    if score >= 90:
return "A"
    elif score >= 80:
        return "B"
elif score >= 70:
    return "C"
    elif score >= 60:
return "D"
    else:
        return "F"`,
    solutionCode: `def calculate_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"`
  },

  // =====================================================
  // CSS TEMPLATES
  // =====================================================
  {
    id: 'css-mc-flexbox',
    name: 'CSS Flexbox Properties',
    description: 'Multiple choice about flexbox alignment',
    language: 'css',
    category: 'ui',
    type: 'multipleChoice',
    difficulty: 'medium',
    tags: ['css', 'flexbox'],
    title: 'Flexbox Alignment Properties',
    questionDescription: 'Which CSS property controls the alignment of flex items along the cross axis?',
    options: [
      '',
      'align-items',
      'justify-content',
      'flex-direction',
      'flex-wrap'
    ],
    correctAnswer: 1
  },
  
  {
    id: 'css-tf-specificity',
    name: 'CSS Specificity Rules',
    description: 'True/false about CSS specificity calculation',
    language: 'css',
    category: 'syntax',
    type: 'trueFalse',
    difficulty: 'medium',
    tags: ['css'],
    title: 'CSS Specificity Weight',
    questionDescription: 'True or False: An ID selector (#myId) has higher specificity than a class selector (.myClass) in CSS.',
    correctAnswer: true
  },
  
  {
    id: 'css-fill-grid',
    name: 'CSS Grid Layout',
    description: 'Complete a CSS Grid layout definition',
    language: 'css',
    category: 'ui',
    type: 'fillInTheBlank',
    difficulty: 'medium',
    tags: ['css', 'grid'],
    title: 'Complete the CSS Grid Layout',
    questionDescription: 'Fill in the blanks to create a CSS Grid with 3 equal columns and a 20px gap between items.',
    codeTemplate: `.grid-container {
  display: ___;
  grid-template-columns: repeat(___, ___);
  gap: ___;
}`,
    blanks: [
      {
        id: 'blank_1',
        correctAnswers: ['grid'],
        caseSensitive: false,
        hint: 'The display value for CSS Grid',
        points: 3
      },
      {
        id: 'blank_2',
        correctAnswers: ['3'],
        caseSensitive: false,
        hint: 'Number of columns',
        points: 3
      },
      {
        id: 'blank_3',
        correctAnswers: ['1fr'],
        caseSensitive: false,
        hint: 'Fractional unit for equal column widths',
        points: 4
      },
      {
        id: 'blank_4',
        correctAnswers: ['20px'],
        caseSensitive: false,
        hint: 'Gap size with unit',
        points: 3
      }
    ]
  },

  // =====================================================
  // HTML TEMPLATES
  // =====================================================
  {
    id: 'html-mc-semantic',
    name: 'HTML Semantic Elements',
    description: 'Multiple choice about semantic HTML',
    language: 'html',
    category: 'syntax',
    type: 'multipleChoice',
    difficulty: 'easy',
    tags: ['html'],
    title: 'Semantic HTML Elements',
    questionDescription: 'Which HTML element is most semantically appropriate for a website\'s main navigation menu?',
    options: [
      '',
      '<nav>',
      '<menu>',
      '<div>',
      '<section>'
    ],
    correctAnswer: 1
  },
  
  {
    id: 'html-tf-attributes',
    name: 'HTML Attribute Requirements',
    description: 'True/false about required HTML attributes',
    language: 'html',
    category: 'syntax',
    type: 'trueFalse',
    difficulty: 'easy',
    tags: ['html'],
    title: 'Image Alt Attribute Requirement',
    questionDescription: 'True or False: The alt attribute is required for all <img> elements in valid HTML.',
    correctAnswer: true
  },
  
  {
    id: 'html-fill-form',
    name: 'HTML Form Structure',
    description: 'Complete an accessible HTML form',
    language: 'html',
    category: 'ui',
    type: 'fillInTheBlank',
    difficulty: 'medium',
    tags: ['html'],
    title: 'Complete the Accessible Form',
    questionDescription: 'Fill in the blanks to create an accessible contact form with proper labels and input types.',
    codeTemplate: `<form>
  <___ for="email">Email Address:</___>
  <input type="___" id="email" name="email" required>
  
  <label for="message">Message:</label>
  <___ id="message" name="message" rows="4" required></___>
  
  <button type="___">Send Message</button>
</form>`,
    blanks: [
      {
        id: 'blank_1',
        correctAnswers: ['label'],
        caseSensitive: false,
        hint: 'Element that provides accessible names for form controls',
        points: 3
      },
      {
        id: 'blank_2',
        correctAnswers: ['/label'],
        caseSensitive: false,
        hint: 'Closing tag for the label element',
        points: 2
      },
      {
        id: 'blank_3',
        correctAnswers: ['email'],
        caseSensitive: false,
        hint: 'Input type for email addresses',
        points: 3
      },
      {
        id: 'blank_4',
        correctAnswers: ['textarea'],
        caseSensitive: false,
        hint: 'Element for multi-line text input',
        points: 3
      },
      {
        id: 'blank_5',
        correctAnswers: ['/textarea'],
        caseSensitive: false,
        hint: 'Closing tag for the textarea element',
        points: 2
      },
      {
        id: 'blank_6',
        correctAnswers: ['submit'],
        caseSensitive: false,
        hint: 'Button type that submits the form',
        points: 2
      }
    ]
  }
];

// Helper functions to get templates
export const getTemplatesByLanguage = (language: Language): QuestionTemplate[] => {
  return QUESTION_TEMPLATES.filter(template => template.language === language);
};

export const getTemplatesByLanguageAndType = (
  language: Language, 
  type: QuestionType
): QuestionTemplate[] => {
  return QUESTION_TEMPLATES.filter(
    template => template.language === language && template.type === type
  );
};

export const getTemplatesByLanguageTypeAndCategory = (
  language: Language, 
  type: QuestionType, 
  category?: QuestionCategory
): QuestionTemplate[] => {
  return QUESTION_TEMPLATES.filter(template => 
    template.language === language && 
    template.type === type && 
    (!category || template.category === category)
  );
};

export const getTemplateById = (id: string): QuestionTemplate | undefined => {
  return QUESTION_TEMPLATES.find(template => template.id === id);
};

// Get available question types for a language
export const getAvailableTypesForLanguage = (language: Language): QuestionType[] => {
  const types = new Set<QuestionType>();
  QUESTION_TEMPLATES
    .filter(template => template.language === language)
    .forEach(template => types.add(template.type));
  return Array.from(types);
};

// Get template suggestions based on current wizard state
export const getRelevantTemplates = (
  language: Language,
  type?: QuestionType,
  category?: QuestionCategory
): QuestionTemplate[] => {
  if (!type) {
    return getTemplatesByLanguage(language);
  }
  
  if (!category) {
    return getTemplatesByLanguageAndType(language, type);
  }
  
  return getTemplatesByLanguageTypeAndCategory(language, type, category);
};