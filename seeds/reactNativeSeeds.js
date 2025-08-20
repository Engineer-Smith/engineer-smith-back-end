const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const reactNativeQuestions = {
  multipleChoice: [
    {
      title: "React Native Components",
      description: "Which component is used to render text in React Native?",
      options: ["", "<Text>", "<View>", "<Span>", "<Label>"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["react-native", "components"]
    },
    {
      title: "React Native Styling",
      description: "Which prop is used to style components in React Native?",
      options: ["", "className", "style", "css", "styles"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react-native", "components"]
    },
    {
      title: "Navigation Library",
      description: "Which library is commonly used for navigation in React Native?",
      options: ["", "React Router", "React Navigation", "Native Router", "Navigation Native"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react-native", "navigation"]
    },
    {
      title: "React Native State",
      description: "Which hook is used to manage state in React Native functional components?",
      options: ["", "useEffect", "useState", "useContext", "useReducer"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react-native", "hooks", "state-management"]
    },
    {
      title: "Platform-Specific Code",
      description: "Which suffix is used for iOS-specific files in React Native?",
      options: ["", ".android.js", ".ios.js", ".native.js", ".platform.js"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "React Native Props",
      description: "How are props passed to a React Native component?",
      options: ["", "As attributes in JSX", "Through state", "Via useEffect", "Using context"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["react-native", "props"]
    },
    {
      title: "Native Modules",
      description: "Which method exposes a native module to JavaScript in React Native?",
      options: ["", "NativeModules", "registerModule", "NativeComponent", "bridge"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["react-native", "native-components"]
    },
    {
      title: "React Native Navigation",
      description: "Which component defines a screen in React Navigation?",
      options: ["", "<Screen>", "<Route>", "<Navigator>", "<Link>"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["react-native", "navigation"]
    },
    {
      title: "React Native Layout",
      description: "Which component is used as a container for layout in React Native?",
      options: ["", "<Div>", "<View>", "<Section>", "<Container>"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react-native", "components"]
    },
    {
      title: "React Native Events",
      description: "Which prop handles touch events in React Native?",
      options: ["", "onClick", "onPress", "onTouch", "onTap"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["react-native", "components"]
    },
    {
      title: "Flexbox in React Native",
      description: "Which style property aligns items along the main axis in React Native?",
      options: ["", "alignItems", "justifyContent", "flexDirection", "flexWrap"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "React Native Async Storage",
      description: "Which library is used for persistent storage in React Native?",
      options: ["", "AsyncStorage", "LocalStorage", "SharedPreferences", "Keychain"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["react-native"]
    },
    {
      title: "React Native Debugging",
      description: "Which tool is used to debug React Native apps?",
      options: ["", "Chrome DevTools", "React DevTools", "Node Inspector", "VS Code"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["react-native"]
    },
    {
      title: "React Native Hooks",
      description: "Which hook optimizes performance by memoizing values in React Native?",
      options: ["", "useCallback", "useMemo", "useEffect", "useRef"],
      correctAnswer: 2,
      difficulty: "hard",
      tags: ["react-native", "hooks"]
    },
    {
      title: "React Native Animation",
      description: "Which API is used for animations in React Native?",
      options: ["", "Animated", "Transition", "Motion", "Animation"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["react-native"]
    }
  ],
  trueFalse: [
    {
      title: "React Native Framework",
      description: "React Native uses native components instead of web components.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["react-native", "components", "native-components"]
    },
    {
      title: "React Native Styling",
      description: "React Native uses CSS for styling components.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["react-native", "components"]
    },
    {
      title: "Navigation Requirement",
      description: "React Navigation is included by default in React Native.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react-native", "navigation"]
    },
    {
      title: "State Management",
      description: "React Native supports useState for state management.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["react-native", "hooks", "state-management"]
    },
    {
      title: "Platform-Specific Code",
      description: "React Native allows platform-specific code using file extensions.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "Props Mutability",
      description: "Props in React Native components are mutable.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["react-native", "props"]
    },
    {
      title: "Native Modules",
      description: "Native modules require a bridge to communicate with JavaScript.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["react-native", "native-components"]
    },
    {
      title: "Flexbox Default",
      description: "React Native uses Flexbox for layout by default.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["react-native", "components"]
    },
    {
      title: "React Native Debugging",
      description: "React Native apps can be debugged using Chrome DevTools.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react-native"]
    },
    {
      title: "React Native Hooks",
      description: "Hooks in React Native work the same as in React.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react-native", "hooks"]
    },
    {
      title: "Navigation Stack",
      description: "React Navigation’s Stack Navigator supports screen transitions.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["react-native", "navigation"]
    },
    {
      title: "React Native Performance",
      description: "React Native apps always run faster than web apps.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react-native"]
    },
    {
      title: "Async Storage",
      description: "AsyncStorage is synchronous in React Native.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react-native"]
    },
    {
      title: "React Native Animation",
      description: "The Animated API requires native driver for smooth animations.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["react-native"]
    },
    {
      title: "Component Reusability",
      description: "React Native components cannot be reused in React web apps.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["react-native", "components"]
    }
  ],
  codeChallenge: [
    {
      title: "Create a Text Input Component",
      description: "Create a React Native component with a text input and display its value.",
      options: ["import React from 'react';\nimport { Text, TextInput, View } from 'react-native';\n\nfunction TextInputComponent() {\n  // Your code here\n}"],
      testCases: [
        { input: "Text input", output: "Uses TextInput component", hidden: false },
        { input: "State management", output: "Tracks input value in state", hidden: false },
        { input: "Display value", output: "Shows input value in Text", hidden: true }
      ],
      difficulty: "easy",
      tags: ["react-native", "components", "state-management"]
    },
    {
      title: "Build a Navigation Stack",
      description: "Create a stack navigator with two screens using React Navigation.",
      options: ["import React from 'react';\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createStackNavigator } from '@react-navigation/stack';\n\nconst Stack = createStackNavigator();\n\nfunction App() {\n  // Your code here\n}"],
      testCases: [
        { input: "Navigator setup", output: "Uses NavigationContainer and Stack.Navigator", hidden: false },
        { input: "Two screens", output: "Defines two screens", hidden: false },
        { input: "Navigation", output: "Navigates between screens", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "navigation"]
    },
    {
      title: "Create a Button Component",
      description: "Build a button component that triggers an alert on press.",
      options: ["import React from 'react';\nimport { Button, Alert } from 'react-native';\n\nfunction AlertButton() {\n  // Your code here\n}"],
      testCases: [
        { input: "Button component", output: "Uses Button component", hidden: false },
        { input: "Alert trigger", output: "Shows alert on press", hidden: false },
        { input: "Correct event", output: "Handles onPress correctly", hidden: true }
      ],
      difficulty: "easy",
      tags: ["react-native", "components"]
    },
    {
      title: "Create a List with FlatList",
      description: "Build a component that renders a list of items using FlatList.",
      options: ["import React from 'react';\nimport { FlatList, Text, View } from 'react-native';\n\nfunction ItemList() {\n  // Your code here\n}"],
      testCases: [
        { input: "FlatList usage", output: "Uses FlatList component", hidden: false },
        { input: "Item rendering", output: "Renders list items", hidden: false },
        { input: "Key extractor", output: "Includes keyExtractor", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "Implement Async Storage",
      description: "Create a component that saves and retrieves data using AsyncStorage.",
      options: ["import React from 'react';\nimport { AsyncStorage } from 'react-native';\n\nfunction StorageComponent() {\n  // Your code here\n}"],
      testCases: [
        { input: "Storage save", output: "Saves data with AsyncStorage", hidden: false },
        { input: "Storage retrieve", output: "Retrieves saved data", hidden: false },
        { input: "Error handling", output: "Handles storage errors", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "state-management"]
    },
    {
      title: "Create an Animated Component",
      description: "Build a component with a fading animation using Animated API.",
      options: ["import React from 'react';\nimport { Animated, View } from 'react-native';\n\nfunction FadeComponent() {\n  // Your code here\n}"],
      testCases: [
        { input: "Animation setup", output: "Uses Animated.Value", hidden: false },
        { input: "Fade effect", output: "Animates opacity", hidden: false },
        { input: "Smooth animation", output: "Uses Animated.timing", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react-native"]
    },
    {
      title: "Create a Modal Component",
      description: "Build a modal that toggles visibility with a button.",
      options: ["import React from 'react';\nimport { Modal, Button, View } from 'react-native';\n\nfunction ModalComponent() {\n  // Your code here\n}"],
      testCases: [
        { input: "Modal toggle", output: "Toggles modal with state", hidden: false },
        { input: "Button interaction", output: "Button controls modal", hidden: false },
        { input: "Modal content", output: "Renders content in modal", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "Create a Platform-Specific Component",
      description: "Build a component with platform-specific styling for iOS and Android.",
      options: ["import React from 'react';\nimport { Platform, View, Text } from 'react-native';\n\nfunction PlatformComponent() {\n  // Your code here\n}"],
      testCases: [
        { input: "Platform check", output: "Uses Platform.OS", hidden: false },
        { input: "Different styles", output: "Applies platform-specific styles", hidden: false },
        { input: "Correct rendering", output: "Renders platform-appropriate UI", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "Create a Counter with Hooks",
      description: "Build a counter component using useState and useEffect.",
      options: ["import React from 'react';\nimport { Text, Button, View } from 'react-native';\n\nfunction Counter() {\n  // Your code here\n}"],
      testCases: [
        { input: "State management", output: "Uses useState for counter", hidden: false },
        { input: "Effect usage", output: "Uses useEffect for side effects", hidden: false },
        { input: "Button interaction", output: "Increments/decrements count", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "hooks", "state-management"]
    },
    {
      title: "Create a Fetch Component",
      description: "Build a component that fetches data and displays it.",
      options: ["import React from 'react';\nimport { Text, View } from 'react-native';\n\nfunction DataFetcher() {\n  // Your code here\n}"],
      testCases: [
        { input: "Data fetching", output: "Uses fetch API", hidden: false },
        { input: "State management", output: "Stores data in state", hidden: false },
        { input: "Error handling", output: "Handles fetch errors", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react-native", "hooks", "state-management"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix Text Input State",
      description: "This text input doesn't update state. Fix the onChangeText handler.",
      options: ["import React, { useState } from 'react';\nimport { TextInput, View } from 'react-native';\n\nfunction TextInputComponent() {\n  const [text] = useState('');\n  return <TextInput value={text} />;\n}"],
      testCases: [
        { input: "State update", output: "Adds setText to useState", hidden: false },
        { input: "Input handler", output: "Uses onChangeText", hidden: false },
        { input: "Controlled input", output: "Updates text value", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "components", "state-management"]
    },
    {
      title: "Fix Navigation Issue",
      description: "This navigation setup doesn't work. Fix the navigator configuration.",
      options: ["import React from 'react';\nimport { NavigationContainer, createStackNavigator } from '@react-navigation/native';\nconst Stack = createStackNavigator();\nfunction App() {\n  return <Stack.Screen name='Home' component={Home} />;\n}"],
      testCases: [
        { input: "Navigator wrapper", output: "Wraps with NavigationContainer", hidden: false },
        { input: "Stack setup", output: "Uses Stack.Navigator", hidden: false },
        { input: "Correct navigation", output: "Renders screen correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "navigation"]
    },
    {
      title: "Fix FlatList Rendering",
      description: "This FlatList doesn't render items. Fix the rendering logic.",
      options: ["import React from 'react';\nimport { FlatList, Text } from 'react-native';\n\nfunction ItemList() {\n  const items = ['a', 'b', 'c'];\n  return <FlatList data={items} />;\n}"],
      testCases: [
        { input: "Render item", output: "Adds renderItem prop", hidden: false },
        { input: "Key extractor", output: "Includes keyExtractor", hidden: false },
        { input: "Correct rendering", output: "Renders all items", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "Fix Async Storage",
      description: "This AsyncStorage call fails. Fix the save and retrieve logic.",
      options: ["import React from 'react';\nimport { AsyncStorage } from 'react-native';\n\nfunction StorageComponent() {\n  AsyncStorage.setItem('key', 'value');\n  return null;\n}"],
      testCases: [
        { input: "Async handling", output: "Uses async/await", hidden: false },
        { input: "Error handling", output: "Handles storage errors", hidden: false },
        { input: "Correct storage", output: "Saves and retrieves data", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react-native", "state-management"]
    },
    {
      title: "Fix Animation Issue",
      description: "This animation doesn't run. Fix the Animated API usage.",
      options: ["import React from 'react';\nimport { Animated, View } from 'react-native';\n\nfunction FadeComponent() {\n  const fadeAnim = new Animated.Value(0);\n  return <Animated.View style={{ opacity: fadeAnim }} />;\n}"],
      testCases: [
        { input: "Animation start", output: "Uses Animated.timing", hidden: false },
        { input: "Value update", output: "Updates Animated.Value", hidden: false },
        { input: "Smooth animation", output: "Animates opacity correctly", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react-native"]
    },
    {
      title: "Fix Button Handler",
      description: "This button doesn't trigger. Fix the onPress handler.",
      options: ["import React from 'react';\nimport { Button } from 'react-native';\n\nfunction AlertButton() {\n  return <Button title='Click' onPress='alert' />;\n}"],
      testCases: [
        { input: "Event handler", output: "Uses function for onPress", hidden: false },
        { input: "Correct trigger", output: "Triggers alert on press", hidden: false },
        { input: "Button rendering", output: "Renders button correctly", hidden: true }
      ],
      difficulty: "easy",
      tags: ["react-native", "components"]
    },
    {
      title: "Fix Platform Styling",
      description: "This component has incorrect platform styling. Fix the Platform logic.",
      options: ["import React from 'react';\nimport { Platform, View } from 'react-native';\n\nfunction PlatformComponent() {\n  const style = { backgroundColor: 'blue' };\n  return <View style={style} />;\n}"],
      testCases: [
        { input: "Platform check", output: "Uses Platform.OS", hidden: false },
        { input: "Different styles", output: "Applies platform-specific styles", hidden: false },
        { input: "Correct rendering", output: "Renders correct style", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "Fix Modal Visibility",
      description: "This modal is always visible. Fix the visibility toggle.",
      options: ["import React from 'react';\nimport { Modal, Button } from 'react-native';\n\nfunction ModalComponent() {\n  return <Modal visible={true}><Button title='Close' /></Modal>;\n}"],
      testCases: [
        { input: "Visibility state", output: "Uses state for visible prop", hidden: false },
        { input: "Toggle button", output: "Toggles modal visibility", hidden: false },
        { input: "Correct rendering", output: "Shows/hides modal", hidden: true }
      ],
      difficulty: "medium",
      tags: ["react-native", "components"]
    },
    {
      title: "Fix Fetch Error",
      description: "This fetch call lacks error handling. Fix it to handle errors.",
      options: ["import React, { useState, useEffect } from 'react';\nimport { Text } from 'react-native';\n\nfunction DataFetcher() {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch('url').then(res => res.json()).then(setData);\n  }, []);\n  return <Text>{data}</Text>;\n}"],
      testCases: [
        { input: "Error handling", output: "Adds try/catch or catch block", hidden: false },
        { input: "State update", output: "Handles fetch data", hidden: false },
        { input: "Error display", output: "Shows error message", hidden: true }
      ],
      difficulty: "hard",
      tags: ["react-native", "hooks", "state-management"]
    },
    {
      title: "Fix Component Props",
      description: "This component doesn't receive props correctly. Fix the props handling.",
      options: ["import React from 'react';\nimport { Text } from 'react-native';\n\nfunction MyComponent() {\n  return <Text>{props.text}</Text>;\n}"],
      testCases: [
        { input: "Props destructuring", output: "Correctly receives props", hidden: false },
        { input: "Text rendering", output: "Renders props.text", hidden: false },
        { input: "No errors", output: "Avoids undefined props", hidden: true }
      ],
      difficulty: "easy",
      tags: ["react-native", "props"]
    }
  ]
};

async function seedReactNativeQuestions() {
  try {
    console.log('Seeding React Native questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'reactNative' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      reactNativeQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'reactNative',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} React Native questions`);
    console.log(`   - Multiple Choice: ${reactNativeQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${reactNativeQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${reactNativeQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${reactNativeQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding React Native questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedReactNativeQuestions()
    .then(() => {
      console.log('React Native questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed React Native questions:', error);
      process.exit(1);
    });
}

module.exports = { seedReactNativeQuestions, reactNativeQuestions };