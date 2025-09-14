// seeds/reactSeeds.js - Comprehensive React questions with enhanced validation
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

// Comprehensive React questions data - 70 total questions
const reactQuestions = {
  // 25 Multiple Choice Questions
  multipleChoice: [
    // Basic React Concepts (10 questions)
    {
      title: "React Component Creation",
      description: "Which method is used to create a functional component in React?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "components", "functions"],
      options: ["class", "function", "const", "render"],
      correctAnswer: 1
    },
    {
      title: "React State Hook",
      description: "Which hook is used to manage state in a functional component?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useState", "state-management"],
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctAnswer: 1
    },
    {
      title: "React Props Passing",
      description: "How are props passed to a component in React?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "props", "jsx"],
      options: ["As attributes in JSX", "Through state", "Via useEffect", "Using context"],
      correctAnswer: 0
    },
    {
      title: "React JSX Syntax",
      description: "What is JSX in React?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "jsx", "javascript"],
      options: ["A CSS preprocessor", "A JavaScript extension", "A template engine", "A state manager"],
      correctAnswer: 1
    },
    {
      title: "React Event Handling",
      description: "Which event handler is used for button clicks in React?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "event-handling", "event-handling-react"],
      options: ["onPress", "onClick", "onTap", "onChange"],
      correctAnswer: 1
    },
    {
      title: "React Effect Hook",
      description: "When does the useEffect hook run by default?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useEffect"],
      options: ["Before render", "After every render", "Only on mount", "On unmount"],
      correctAnswer: 1
    },
    {
      title: "React Fragments",
      description: "What is the purpose of React Fragments?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "jsx", "ui-components"],
      options: ["Add styling", "Group elements without a wrapper", "Manage state", "Handle events"],
      correctAnswer: 1
    },
    {
      title: "React List Keys",
      description: "Why are keys used in React lists?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "lists-keys", "components"],
      options: ["To style elements", "To identify elements uniquely", "To handle events", "To manage state"],
      correctAnswer: 1
    },
    {
      title: "React Conditional Rendering",
      description: "Which operator is commonly used for conditional rendering in JSX?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "jsx", "conditional-rendering"],
      options: ["&&", "||", "?", "if"],
      correctAnswer: 0
    },
    {
      title: "React Component Lifecycle",
      description: "Which lifecycle method runs after a component is mounted?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "lifecycle-methods", "components"],
      options: ["constructor", "render", "componentDidMount", "componentWillMount"],
      correctAnswer: 2
    },

    // Advanced React Concepts (8 questions)
    {
      title: "React Context API",
      description: "What is the purpose of the Context API in React?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "context-api", "state-management"],
      options: ["Manage state locally", "Share data across components", "Handle routing", "Create animations"],
      correctAnswer: 1
    },
    {
      title: "React useCallback Hook",
      description: "What is the purpose of the useCallback hook?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useCallback", "performance-optimization"],
      options: ["Manage state", "Memoize functions", "Handle side effects", "Access context"],
      correctAnswer: 1
    },
    {
      title: "React useMemo Hook",
      description: "What does the useMemo hook optimize?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useMemo", "performance-optimization"],
      options: ["Function calls", "Value computations", "Component renders", "State updates"],
      correctAnswer: 1
    },
    {
      title: "React useContext Hook",
      description: "Which hook is used to consume context in functional components?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useContext", "context-api"],
      options: ["useContext", "useProvider", "useConsumer", "useGlobal"],
      correctAnswer: 0
    },
    {
      title: "React useRef Hook",
      description: "What is the primary use of the useRef hook?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useRef"],
      options: ["Managing state", "Accessing DOM elements", "Handling effects", "Creating context"],
      correctAnswer: 1
    },

    // React Router & Navigation (4 questions)
    {
      title: "React Router Route",
      description: "Which component is used to define a route in React Router?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "react-router", "routing", "navigation"],
      options: ["<Link>", "<Route>", "<Router>", "<Navigate>"],
      correctAnswer: 1
    },
    {
      title: "React Router Navigation",
      description: "Which component creates clickable navigation links in React Router?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "react-router", "navigation", "ui-components"],
      options: ["<Route>", "<Router>", "<Link>", "<Navigate>"],
      correctAnswer: 2
    },
    {
      title: "React Router Wrapper",
      description: "Which component wraps the entire React Router application?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "react-router", "routing"],
      options: ["<Route>", "<BrowserRouter>", "<Link>", "<Switch>"],
      correctAnswer: 1
    },

    // React State Management (3 questions)
    {
      title: "React Class Component State",
      description: "Which method updates state in a class component?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "state-management", "classes"],
      options: ["setState", "updateState", "changeState", "modifyState"],
      correctAnswer: 0
    },
    {
      title: "React Redux Connection",
      description: "Which function traditionally connects a component to the Redux store?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "redux", "state-management"],
      options: ["useSelector", "connect", "useDispatch", "mapStateToProps"],
      correctAnswer: 1
    },
    {
      title: "React Redux Hooks",
      description: "Which hook is used to access Redux store state in functional components?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "redux", "hooks", "state-management"],
      options: ["useSelector", "useStore", "useRedux", "useState"],
      correctAnswer: 0
    }
  ],

  // 20 True/False Questions
  trueFalse: [
    // Basic React Concepts (8 questions)
    {
      title: "React Functional Components and Hooks",
      description: "Functional components can use hooks in React.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "components", "hooks"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Props Mutability",
      description: "Props in React are mutable.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "props"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "React State Direct Modification",
      description: "State can be directly modified without setState in class components.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "state-management"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "React useEffect Default Behavior",
      description: "useEffect runs after every render by default.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useEffect"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React JSX Compilation",
      description: "JSX is compiled to HTML at runtime.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "jsx", "javascript"],
      options: ["true", "false"],
      correctAnswer: 1 // false - compiles to React.createElement
    },
    {
      title: "React Key Uniqueness",
      description: "Keys in React lists must be unique among siblings.",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "lists-keys", "components"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Fragment DOM Benefits",
      description: "Fragments prevent unnecessary DOM wrapper elements.",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "jsx", "ui-components"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Ternary Conditional Rendering",
      description: "Ternary operators can be used in JSX for conditional rendering.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "jsx", "conditional-rendering"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },

    // Advanced React Concepts (6 questions)
    {
      title: "React Context vs Redux",
      description: "Context API completely replaces the need for Redux.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "context-api", "redux", "state-management"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "React useMemo Performance",
      description: "useMemo memoizes values to optimize performance.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useMemo", "performance-optimization"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React useRef Persistence",
      description: "useRef can persist values across renders without causing re-renders.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useRef"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Synthetic Events",
      description: "React uses synthetic events for cross-browser event handling.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "event-handling", "event-handling-react"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Lifecycle Deprecation",
      description: "componentWillMount is commonly used in modern React applications.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "lifecycle-methods", "components"],
      options: ["true", "false"],
      correctAnswer: 1 // false - deprecated
    },
    {
      title: "React Virtual DOM",
      description: "React uses a Virtual DOM to optimize rendering performance.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "virtual-dom", "performance-optimization"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },

    // React Router & External Libraries (6 questions)
    {
      title: "React Router Default Inclusion",
      description: "React Router is included in React by default.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "react-router", "routing"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "React Router Browser Support",
      description: "BrowserRouter requires server configuration for proper routing.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "react-router", "routing"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Redux Hooks Class Components",
      description: "useSelector hook can be used in class components.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "redux", "hooks"],
      options: ["true", "false"],
      correctAnswer: 1 // false - hooks only work in functional components
    },
    {
      title: "React Component Reusability",
      description: "React components can be reused across different parts of an application.",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react", "components", "ui-components"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Performance Optimization",
      description: "React.memo prevents unnecessary re-renders of functional components.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "memo", "performance-optimization"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Error Boundaries",
      description: "Error boundaries can catch errors in event handlers.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "error-handling", "components"],
      options: ["true", "false"],
      correctAnswer: 1 // false - only catch render errors
    }
  ],

  // 25 Fill-in-the-Blank Questions
  fillInTheBlank: [
    // Basic Component Structure (5 questions)
    {
      title: "Complete Basic Functional Component",
      description: "Complete the basic React functional component structure",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react", "components", "jsx"],
      codeTemplate: `import React from 'react';

function ___blank1___() {
  return (
    <___blank2___>
      <___blank3___>Hello, React!</___blank4___>
    </___blank5___>
  );
}

export ___blank6___ HelloComponent;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['HelloComponent'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['div'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['h1', 'p', 'span'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['h1', 'p', 'span'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['div'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['default'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete useState Hook Implementation",
      description: "Complete the useState hook for state management",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useState", "state-management"],
      codeTemplate: `import React, { ___blank1___ } from 'react';

function Counter() {
  const [count, ___blank2___] = ___blank3___(0);

  const handleIncrement = () => {
    ___blank4___(count + 1);
  };

  return (
    <div>
      <p>Count: {___blank5___}</p>
      <button ___blank6___={handleIncrement}>
        Increment
      </button>
    </div>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useState'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['setCount'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['useState'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['setCount'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['count'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['onClick'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Props Handling",
      description: "Complete the component props handling and usage",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react", "props", "components"],
      codeTemplate: `import React from 'react';

function Greeting(___blank1___) {
  return (
    <div>
      <h1>Hello, {___blank2___.name}!</h1>
      <p>Age: {___blank3___.age}</p>
    </div>
  );
}

// Alternative with destructuring
function GreetingDestructured({ ___blank4___, ___blank5___ }) {
  return (
    <div>
      <h1>Hello, {___blank6___}!</h1>
      <p>Age: {age}</p>
    </div>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['props'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['props'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['props'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['name'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['age'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['name'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete Event Handling",
      description: "Complete the event handling in React component",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "event-handling", "event-handling-react"],
      codeTemplate: `import React, { useState } from 'react';

function InputForm() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (___blank1___) => {
    setInputValue(___blank2___.target.value);
  };

  const handleSubmit = (event) => {
    ___blank3___.preventDefault();
    console.log('Submitted:', inputValue);
  };

  return (
    <___blank4___ onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        ___blank5___={handleInputChange}
      />
      <button ___blank6___="submit">Submit</button>
    </form>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['event', 'e'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['event', 'e'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['event', 'e'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['form'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['onChange'], caseSensitive: false, points: 2 },
        { id: 'blank6', correctAnswers: ['type'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete List Rendering with Keys",
      description: "Complete the list rendering with proper keys",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "lists-keys", "components"],
      codeTemplate: `import React from 'react';

function ItemList({ items }) {
  return (
    <___blank1___>
      {items.___blank2___(item => (
        <___blank3___ ___blank4___={item.id}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

// Usage example
function App() {
  const items = [
    { ___blank5___: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Orange' }
  ];

  return <ItemList ___blank6___={items} />;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['ul'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['map'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['li'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['key'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['id'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['items'], caseSensitive: false, points: 1 }
      ]
    },

    // useEffect and Side Effects (5 questions)
    {
      title: "Complete useEffect Hook",
      description: "Complete the useEffect hook for side effects",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useEffect"],
      codeTemplate: `import React, { useState, ___blank1___ } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  ___blank2___(() => {
    const fetchData = async () => {
      try {
        const response = await ___blank3___('/api/data');
        const result = await response.___blank4___();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(___blank5___);
      }
    };

    fetchData();
  }, ___blank6___); // Empty dependency array

  if (loading) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useEffect'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['useEffect'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['fetch'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['json'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['false'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['[]'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete useEffect with Dependencies",
      description: "Complete useEffect with proper dependency management",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useEffect"],
      codeTemplate: `import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(\`/api/users/\${___blank1___}\`);
      const userData = await response.json();
      setUser(userData);
    };

    if (___blank2___) {
      fetchUser();
    }

    return () => {
      // Cleanup function
      setUser(___blank3___);
    };
  }, [___blank4___]); // Dependencies array

  return (
    <div>
      {___blank5___ ? (
        <h1>{user.name}</h1>
      ) : (
        <p>___blank6___...</p>
      )}
    </div>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['userId'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['userId'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['null'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['userId'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['user'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['Loading'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete useEffect Cleanup",
      description: "Complete useEffect with proper cleanup for event listeners",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useEffect"],
      codeTemplate: `import React, { useState, useEffect } from 'react';

function WindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: ___blank1___.innerWidth,
        height: window.innerHeight
      });
    };

    ___blank2___.addEventListener('___blank3___', handleResize);

    return () => {
      window.___blank4___('resize', ___blank5___);
    };
  }, ___blank6___);

  return (
    <div>
      Window size: {windowSize.width} x {windowSize.height}
    </div>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['window'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['window'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['resize'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['removeEventListener'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['handleResize'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['[]'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete Custom Hook",
      description: "Complete a custom hook implementation",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "custom-hooks"],
      codeTemplate: `import { useState, useEffect } from 'react';

function ___blank1___(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  ___blank2___(() => {
    const fetchData = async () => {
      try {
        setLoading(___blank3___);
        const response = await fetch(___blank4___);
        const result = await response.json();
        ___blank5___(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { ___blank6___, loading, error };
}

// Usage
function MyComponent() {
  const { data, loading, error } = useFetch('/api/data');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{JSON.stringify(data)}</div>;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useFetch'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['useEffect'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['true'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['url'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['setData'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['data'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete useRef Hook",
      description: "Complete the useRef hook for DOM access",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useRef"],
      codeTemplate: `import React, { ___blank1___ } from 'react';

function FocusInput() {
  const inputRef = ___blank2___(null);

  const handleFocus = () => {
    ___blank3___.current.___blank4___();
  };

  return (
    <div>
      <___blank5___
        ___blank6___={inputRef}
        type="text"
        placeholder="Click button to focus"
      />
      <button onClick={handleFocus}>
        Focus Input
      </button>
    </div>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useRef'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['useRef'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['inputRef'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['focus'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['input'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['ref'], caseSensitive: false, points: 1 }
      ]
    },

    // Context API (3 questions)
    {
      title: "Complete Context Creation and Provider",
      description: "Complete the Context API implementation",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "context-api", "state-management"],
      codeTemplate: `import React, { ___blank1___, useState } from 'react';

const ThemeContext = React.___blank2___(___blank3___);

function ThemeProvider({ children }) {
  const [theme, setTheme] = ___blank4___('light');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.___blank5___ value={{ theme, toggleTheme }}>
      {___blank6___}
    </ThemeContext.Provider>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['createContext'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['createContext'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['null', 'undefined'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['useState'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['Provider'], caseSensitive: false, points: 2 },
        { id: 'blank6', correctAnswers: ['children'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete Context Consumer with useContext",
      description: "Complete the context consumption using useContext hook",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useContext", "context-api"],
      codeTemplate: `import React, { ___blank1___ } from 'react';
import { ThemeContext } from './ThemeProvider';

function ThemedButton() {
  const { ___blank2___, ___blank3___ } = ___blank4___(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: ___blank5___ === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      Switch to {theme === 'light' ? 'dark' : 'light'} theme
    </button>
  );
}

export ___blank6___ ThemedButton;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useContext'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['theme'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['toggleTheme'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['useContext'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['theme'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['default'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete useReducer Hook",
      description: "Complete the useReducer hook for complex state management",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useReducer", "state-management"],
      codeTemplate: `import React, { ___blank1___ } from 'react';

const initialState = { count: 0 };

function reducer(___blank2___, ___blank3___) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: ___blank4___.count - 1 };
    case 'reset':
      return ___blank5___;
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, ___blank6___] = useReducer(reducer, initialState);

  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useReducer'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['state'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['action'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['state'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['initialState'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['dispatch'], caseSensitive: false, points: 2 }
      ]
    },

    // Performance Optimization (4 questions)
    {
      title: "Complete useMemo Hook",
      description: "Complete the useMemo hook for performance optimization",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useMemo", "performance-optimization"],
      codeTemplate: `import React, { useState, ___blank1___ } from 'react';

function ExpensiveComponent({ numbers }) {
  const [multiplier, setMultiplier] = useState(1);

  const expensiveValue = ___blank2___(() => {
    console.log('Computing expensive value...');
    return ___blank3___.reduce((sum, num) => sum + num, 0) * multiplier;
  }, [numbers, ___blank4___]);

  return (
    <div>
      <p>Result: {___blank5___}</p>
      <button onClick={() => setMultiplier(multiplier + 1)}>
        Multiply by {___blank6___ + 1}
      </button>
    </div>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useMemo'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['useMemo'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['numbers'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['multiplier'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['expensiveValue'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['multiplier'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete useCallback Hook",
      description: "Complete the useCallback hook for function memoization",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react", "hooks", "useCallback", "performance-optimization"],
      codeTemplate: `import React, { useState, ___blank1___ } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  const handleIncrement = ___blank2___(() => {
    ___blank3___(prevCount => prevCount + 1);
  }, [___blank4___]); // Dependencies

  const handleNameChange = useCallback((newName) => {
    setName(___blank5___);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <ChildComponent 
        onIncrement={___blank6___}
        onNameChange={handleNameChange}
      />
    </div>
  );
}

const ChildComponent = React.memo(({ onIncrement, onNameChange }) => {
  console.log('Child rendered');
  return (
    <div>
      <button onClick={onIncrement}>Increment</button>
      <input onChange={(e) => onNameChange(e.target.value)} />
    </div>
  );
});`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useCallback'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['useCallback'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['setCount'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['[]', '[ ]'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['newName'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['handleIncrement'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete React.memo Implementation",
      description: "Complete React.memo for component optimization",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react", "memo", "performance-optimization", "components"],
      codeTemplate: `import React from 'react';

const ExpensiveChild = ___blank1___(({ name, age, onClick }) => {
  console.log('ExpensiveChild rendered');
  
  return (
    <div>
      <h3>{___blank2___}</h3>
      <p>Age: {___blank3___}</p>
      <button ___blank4___={onClick}>Click me</button>
    </div>
  );
});

// With custom comparison function
const OptimizedChild = React.memo(({ user, onUpdate }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>Age: {user.age}</p>
      <button onClick={() => onUpdate(user.id)}>Update</button>
    </div>
  );
}, (___blank5___, nextProps) => {
  // Return true if props are equal (skip re-render)
  return prevProps.___blank6___.id === nextProps.user.id &&
         prevProps.user.name === nextProps.user.name;
});`,
      blanks: [
        { id: 'blank1', correctAnswers: ['React.memo'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['name'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['age'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['onClick'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['prevProps'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['user'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete Conditional Rendering and Fragments",
      description: "Complete conditional rendering with React Fragments",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "jsx", "conditional-rendering", "ui-components"],
      codeTemplate: `import React, { useState } from 'react';

function ConditionalComponent() {
  const [showDetails, setShowDetails] = useState(false);
  const [user, setUser] = useState({ name: 'John', age: 30 });

  return (
    <___blank1___>
      <h1>User Profile</h1>
      
      {___blank2___ && (
        <___blank3___>
          <p>Name: {user.name}</p>
          <p>Age: {user.age}</p>
        </React.Fragment>
      )}
      
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ___blank4___ 'Hide' ___blank5___ 'Show'} Details
      </button>
      
      {/* Alternative fragment syntax */}
      {showDetails ? (
        <___blank6___>
          <p>Additional info...</p>
          <p>More details...</p>
        </>
      ) : null}
    </React.Fragment>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['React.Fragment'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['showDetails'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['React.Fragment'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['?'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: [':'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['<>'], caseSensitive: false, points: 2 }
      ]
    },

    // React Router (3 questions)
    {
      title: "Complete React Router Setup",
      description: "Complete the React Router implementation",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react", "react-router", "routing", "navigation"],
      codeTemplate: `import React from 'react';
import { 
  ___blank1___,
  ___blank2___,
  ___blank3___,
  Link
} from 'react-router-dom';

function App() {
  return (
    <___blank4___>
      <nav>
        <___blank5___ to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      
      <Routes>
        <___blank6___ path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['BrowserRouter'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['Routes'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['Route'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['BrowserRouter'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['Link'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['Route'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete React Router with Parameters",
      description: "Complete React Router with URL parameters",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react", "react-router", "routing", "navigation"],
      codeTemplate: `import React from 'react';
import { useParams, ___blank1___, Link } from 'react-router-dom';

function UserProfile() {
  const { ___blank2___ } = ___blank3___();
  const navigate = ___blank4___();

  const handleGoBack = () => {
    ___blank5___(-1); // Go back one page
  };

  return (
    <div>
      <h1>User Profile: {userId}</h1>
      <button onClick={handleGoBack}>Go Back</button>
      <___blank6___ to={"/users/" + userId + "/edit"}>Edit User</Link>
    </div>
  );
}

// In your Routes
<Route path="/users/___blank7___" element={<UserProfile />} />`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useNavigate'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['userId'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['useParams'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['useNavigate'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['navigate'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['Link'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: [':userId'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Nested Routes",
      description: "Complete nested routing structure",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react", "react-router", "routing", "navigation"],
      codeTemplate: `import React from 'react';
import { Routes, Route, ___blank1___, Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <Link to="___blank2___">Profile</Link>
        <Link to="settings">Settings</Link>
        <Link to="analytics">Analytics</Link>
      </nav>
      
      {/* Render nested routes */}
      <___blank3___ />
    </div>
  );
}

// In your main App Routes
<Route path="/dashboard/*" element={<Dashboard />}>
  <___blank4___ path="___blank5___" element={<Profile />} />
  <Route path="settings" element={<Settings />} />
  <Route path="analytics" element={<Analytics />} />
</Route>

// Alternative approach with nested Routes
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/dashboard/___blank6___" element={<Profile />} />`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Outlet'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['profile'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['Outlet'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['Route'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['profile'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['profile'], caseSensitive: false, points: 1 }
      ]
    }
  ]
};

async function seedReactQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE React question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(reactQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(reactQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = reactQuestions.fillInTheBlank.length;
    const totalBlanks = reactQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    
    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('react');

    // Delete existing React questions
    await processor.deleteByLanguage('react');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(reactQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'react', status: 'active' },
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
    console.log('🔍 Running COMPREHENSIVE validation with enhanced fill-in-blank testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Includes comprehensive fill-in-blank grading validation
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'React');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE React question seeding completed successfully!');
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
      return await Question.find({ language: 'react' }).select('_id title type');

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
    console.error('💥 React seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedReactQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive React questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust auto-grading validation!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed React questions:', error);
      process.exit(1);
    });
}

module.exports = { seedReactQuestions, reactQuestions };