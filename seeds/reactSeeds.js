const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const reactQuestions = {
  multipleChoice: [
    {
      title: "React Component",
      description: "Which method is used to create a functional component in React?",
      options: ["", "class", "function", "const", "render"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react", "components"]
    },
    {
      title: "React Hooks",
      description: "Which hook is used to manage state in a functional component?",
      options: ["", "useEffect", "useState", "useContext", "useReducer"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react", "hooks"]
    },
    {
      title: "React Props",
      description: "How are props passed to a component in React?",
      options: ["", "As attributes in JSX", "Through state", "Via useEffect", "Using context"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["react", "props"]
    },
    {
      title: "React Lifecycle",
      description: "Which lifecycle method runs after a component is mounted?",
      options: ["", "constructor", "render", "componentDidMount", "componentWillMount"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["react", "components"]
    },
    {
      title: "React JSX",
      description: "What is JSX in React?",
      options: ["", "A CSS preprocessor", "A JavaScript extension", "A template engine", "A state manager"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react", "jsx"]
    },
    {
      title: "React Event Handling",
      description: "Which event handler is used for button clicks in React?",
      options: ["", "onPress", "onClick", "onTap", "onChange"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react", "events"]
    },
    {
      title: "React State",
      description: "Which method updates state in a class component?",
      options: ["", "setState", "updateState", "changeState", "modifyState"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["react", "state-management"]
    },
    {
      title: "React Router",
      description: "Which component is used to define a route in React Router?",
      options: ["", "<Link>", "<Route>", "<Router>", "<Navigate>"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react", "navigation"]
    },
    {
      title: "React Context",
      description: "What is the purpose of the Context API in React?",
      options: ["", "Manage state locally", "Share data across components", "Handle routing", "Create animations"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react", "state-management"]
    },
    {
      title: "React useEffect",
      description: "When does the useEffect hook run by default?",
      options: ["", "Before render", "After every render", "Only on mount", "On unmount"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react", "hooks"]
    },
    {
      title: "React Fragments",
      description: "What is the purpose of React Fragments?",
      options: ["", "Add styling", "Group elements without a wrapper", "Manage state", "Handle events"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react", "jsx"]
    },
    {
      title: "React Keys",
      description: "Why are keys used in React lists?",
      options: ["", "To style elements", "To identify elements uniquely", "To handle events", "To manage state"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react", "components"]
    },
    {
      title: "React useCallback",
      description: "What is the purpose of the useCallback hook?",
      options: ["", "Manage state", "Memoize functions", "Handle side effects", "Access context"],
      correctAnswer: 2,
      difficulty: "hard",
      tags: ["react", "hooks"]
    },
    {
      title: "React Redux",
      description: "Which function connects a component to the Redux store?",
      options: ["", "useSelector", "connect", "useDispatch", "mapStateToProps"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react", "state-management"]
    },
    {
      title: "React Conditional Rendering",
      description: "Which operator is commonly used for conditional rendering in JSX?",
      options: ["", "&&", "||", "?", "if"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["react", "jsx"]
    }
  ],
  trueFalse: [
    {
      title: "React Functional Components",
      description: "Functional components can use hooks in React.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["react", "components", "hooks"]
    },
    {
      title: "React Props",
      description: "Props in React are mutable.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["react", "props"]
    },
    {
      title: "React State",
      description: "State can be directly modified without setState.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["react", "state-management"]
    },
    {
      title: "React useEffect",
      description: "useEffect runs after every render by default.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react", "hooks"]
    },
    {
      title: "React JSX",
      description: "JSX is compiled to HTML at runtime.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react", "jsx"]
    },
    {
      title: "React Keys",
      description: "Keys in React lists must be unique among siblings.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react", "components"]
    },
    {
      title: "React Context",
      description: "Context API replaces all need for Redux.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react", "state-management"]
    },
    {
      title: "React Fragments",
      description: "Fragments prevent unnecessary DOM elements.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react", "jsx"]
    },
    {
      title: "React useMemo",
      description: "useMemo memoizes values to optimize performance.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["react", "hooks"]
    },
    {
      title: "React Router",
      description: "React Router is included in React by default.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react", "navigation"]
    },
    {
      title: "React Event Handling",
      description: "React uses synthetic events for event handling.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react", "events"]
    },
    {
      title: "React useRef",
      description: "useRef can persist values across renders without causing re-renders.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["react", "hooks"]
    },
    {
      title: "React Component Lifecycle",
      description: "componentWillMount is commonly used in modern React.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react", "components"]
    },
    {
      title: "React Conditional Rendering",
      description: "Ternary operators can be used in JSX for conditional rendering.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react", "jsx"]
    },
    {
      title: "React Redux",
      description: "useSelector hook requires a class component.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react", "state-management"]
    }
  ],
  codeChallenge: [
    {
      title: "Create a Counter Component",
      description: "Create a React functional component with a counter that increments on button click.",
      options: ["import React from 'react';\n\nfunction Counter() {\n  // Your code here\n}"],
      testCases: [
        { input: "State management", output: "Uses useState for counter", hidden: false },
        { input: "Button click", output: "Increments on click", hidden: false },
        { input: "Display count", output: "Shows counter value", hidden: true }
      ],
      difficulty: "easy",
      tags: ["react", "components", "hooks"]
    },
    {
      title: "Create a Todo List",
      description: "Create a React component to add and display todo items.",
      options: ["import React from 'react';\n\nfunction TodoList() {\n  // Your code here\n}"],
      testCases: [
        { input: "Add todo", output: "Handles adding new items", hidden: false },
        { input: "List rendering", output: "Renders list of todos", hidden: false },
        { input: "State management", output: "Uses useState for todos", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "components", "state-management"]
    },
    {
      title: "Create a Fetch Component",
      description: "Create a React component that fetches and displays data from an API.",
      options: ["import React from 'react';\n\nfunction DataFetcher() {\n  // Your code here\n}"],
      testCases: [
        { input: "Data fetching", output: "Uses fetch or axios", hidden: false },
        { input: "State management", output: "Stores data in state", hidden: false },
        { input: "Error handling", output: "Handles fetch errors", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react", "hooks"]
    },
    {
      title: "Create a Form Component",
      description: "Create a controlled form component with name and email inputs.",
      options: ["import React from 'react';\n\nfunction Form() {\n  // Your code here\n}"],
      testCases: [
        { input: "Controlled inputs", output: "Manages inputs with state", hidden: false },
        { input: "Form submission", output: "Handles submit event", hidden: false },
        { input: "Input validation", output: "Validates input fields", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "components"]
    },
    {
      title: "Create a Navigation Component",
      description: "Create a component with React Router links and routes.",
      options: ["import React from 'react';\nimport { BrowserRouter, Route, Link } from 'react-router-dom';\n\nfunction App() {\n  // Your code here\n}"],
      testCases: [
        { input: "Router setup", output: "Uses BrowserRouter", hidden: false },
        { input: "Route definitions", output: "Defines at least two routes", hidden: false },
        { input: "Navigation links", output: "Has Link components", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "navigation"]
    },
    {
      title: "Create a Context Provider",
      description: "Create a React component that uses Context to share theme data.",
      options: ["import React from 'react';\n\nconst ThemeContext = React.createContext(null);\n\nfunction ThemeProvider() {\n  // Your code here\n}"],
      testCases: [
        { input: "Context setup", output: "Uses ThemeContext.Provider", hidden: false },
        { input: "Theme data", output: "Shares theme value", hidden: false },
        { input: "Consumer usage", output: "Consumes context in child", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react", "state-management"]
    },
    {
      title: "Create a List Component",
      description: "Create a component that renders a list with keys.",
      options: ["import React from 'react';\n\nfunction ItemList() {\n  // Your code here\n}"],
      testCases: [
        { input: "List rendering", output: "Renders items with map", hidden: false },
        { input: "Unique keys", output: "Each item has a key", hidden: false },
        { input: "Dynamic data", output: "Handles array of items", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "components"]
    },
    {
      title: "Create a Memoized Component",
      description: "Create a component that uses useMemo to optimize rendering.",
      options: ["import React, { useMemo } from 'react';\n\nfunction MemoizedComponent() {\n  // Your code here\n}"],
      testCases: [
        { input: "Memoization", output: "Uses useMemo for computation", hidden: false },
        { input: "Rendering", output: "Renders computed value", hidden: false },
        { input: "Optimization", output: "Avoids unnecessary re-computation", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react", "hooks"]
    },
    {
      title: "Create a Ref Component",
      description: "Create a component that uses useRef to focus an input.",
      options: ["import React, { useRef } from 'react';\n\nfunction InputFocus() {\n  // Your code here\n}"],
      testCases: [
        { input: "Ref usage", output: "Uses useRef for input", hidden: false },
        { input: "Focus handling", output: "Focuses input on event", hidden: false },
        { input: "Correct ref", output: "Ref persists across renders", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "hooks"]
    },
    {
      title: "Create a Redux Component",
      description: "Create a component that connects to a Redux store.",
      options: ["import React from 'react';\nimport { connect } from 'react-redux';\n\nfunction Counter() {\n  // Your code here\n}"],
      testCases: [
        { input: "Store connection", output: "Uses connect or hooks", hidden: false },
        { input: "State access", output: "Accesses store state", hidden: false },
        { input: "Dispatch action", output: "Dispatches action on event", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react", "state-management"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix State Update",
      description: "This counter component doesn't update state correctly. Fix it.",
      options: ["import React, { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  const increment = () => count++;\n  return <button onClick={increment}>{count}</button>;\n}"],
      testCases: [
        { input: "State update", output: "Uses setCount", hidden: false },
        { input: "Button click", output: "Increments count", hidden: false },
        { input: "Correct render", output: "Displays updated count", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "hooks", "state-management"]
    },
    {
      title: "Fix useEffect Dependency",
      description: "This useEffect causes infinite renders. Fix the dependency array.",
      options: ["import React, { useState, useEffect } from 'react';\n\nfunction DataFetcher() {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetchData().then(setData);\n  });\n  return <div>{data}</div>;\n}"],
      testCases: [
        { input: "Dependency array", output: "Adds empty array", hidden: false },
        { input: "Effect execution", output: "Runs only on mount", hidden: false },
        { input: "No infinite loop", output: "Prevents re-renders", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "hooks"]
    },
    {
      title: "Fix Prop Passing",
      description: "This component doesn't receive props correctly. Fix the props handling.",
      options: ["import React from 'react';\n\nfunction Display() {\n  return <div>{props.text}</div>;\n}"],
      testCases: [
        { input: "Props destructuring", output: "Correctly receives props", hidden: false },
        { input: "Rendering", output: "Renders props.text", hidden: false },
        { input: "No errors", output: "Avoids undefined props", hidden: true }
      ],
      difficulty: "easy",
      tags: ["react", "props"]
    },
    {
      title: "Fix List Rendering",
      description: "This list renders without keys. Fix the rendering to include keys.",
      options: ["import React from 'react';\n\nfunction ItemList({ items }) {\n  return <ul>{items.map(item => <li>{item}</li>)}</ul>;\n}"],
      testCases: [
        { input: "Key addition", output: "Adds key prop to li", hidden: false },
        { input: "List rendering", output: "Renders all items", hidden: false },
        { input: "Unique keys", output: "Keys are unique", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "components"]
    },
    {
      title: "Fix Event Handler",
      description: "This button handler doesn't work. Fix the onClick event.",
      options: ["import React from 'react';\n\nfunction Button() {\n  return <button onClick='alert'>Click</button>;\n}"],
      testCases: [
        { input: "Event handler", output: "Uses function for onClick", hidden: false },
        { input: "Correct trigger", output: "Triggers alert on click", hidden: false },
        { input: "No errors", output: "Renders button correctly", hidden: true }
      ],
      difficulty: "easy",
      tags: ["react", "events"]
    },
    {
      title: "Fix Conditional Rendering",
      description: "This conditional rendering is incorrect. Fix the logic.",
      options: ["import React from 'react';\n\nfunction Display({ show }) {\n  if (show) return <div>Visible</div>;\n}"],
      testCases: [
        { input: "Conditional logic", output: "Handles true/false cases", hidden: false },
        { input: "Rendering", output: "Renders when show is true", hidden: false },
        { input: "No errors", output: "Handles false case correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "jsx"]
    },
    {
      title: "Fix Context Usage",
      description: "This context consumer doesn't work. Fix the Context usage.",
      options: ["import React from 'react';\nconst ThemeContext = React.createContext(null);\n\nfunction ThemeDisplay() {\n  return <div>{ThemeContext.theme}</div>;\n}"],
      testCases: [
        { input: "Context consumer", output: "Uses useContext or Consumer", hidden: false },
        { input: "Value access", output: "Accesses theme value", hidden: false },
        { input: "No errors", output: "Renders context value", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react", "state-management"]
    },
    {
      title: "Fix Router Setup",
      description: "This routing setup is incorrect. Fix the React Router configuration.",
      options: ["import React from 'react';\nimport { Route } from 'react-router-dom';\n\nfunction App() {\n  return <Route path='/home' component={Home} />;\n}"],
      testCases: [
        { input: "Router wrapper", output: "Uses BrowserRouter", hidden: false },
        { input: "Route setup", output: "Correct Route component", hidden: false },
        { input: "No errors", output: "Renders routes correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react", "navigation"]
    },
    {
      title: "Fix Memoization",
      description: "This component re-renders unnecessarily. Fix it with useMemo.",
      options: ["import React from 'react';\n\nfunction ExpensiveComponent({ numbers }) {\n  const sum = numbers.reduce((a, b) => a + b, 0);\n  return <div>{sum}</div>;\n}"],
      testCases: [
        { input: "Memoization", output: "Uses useMemo for sum", hidden: false },
        { input: "Rendering", output: "Renders sum correctly", hidden: false },
        { input: "Optimization", output: "Prevents unnecessary re-computation", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react", "hooks"]
    },
    {
      title: "Fix Redux Connection",
      description: "This component doesn't connect to Redux. Fix the store connection.",
      options: ["import React from 'react';\n\nfunction Counter({ count }) {\n  return <div>{count}</div>;\n}"],
      testCases: [
        { input: "Store connection", output: "Uses connect or hooks", hidden: false },
        { input: "State access", output: "Accesses store state", hidden: false },
        { input: "Correct render", output: "Displays count from store", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react", "state-management"]
    }
  ]
};

async function seedReactQuestions() {
  try {
    console.log('Seeding React questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'react' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      reactQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'react',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} React questions`);
    console.log(`   - Multiple Choice: ${reactQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${reactQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${reactQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${reactQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding React questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedReactQuestions()
    .then(() => {
      console.log('React questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed React questions:', error);
      process.exit(1);
    });
}

module.exports = { seedReactQuestions, reactQuestions };