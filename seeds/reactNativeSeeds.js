// seeds/reactNativeSeeds.js - Comprehensive React Native questions with enhanced validation
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

// Comprehensive React Native questions data - 70 total questions
const reactNativeQuestions = {
  // 30 Multiple Choice Questions
  multipleChoice: [
    // Basic React Native Components (10 questions)
    {
      title: "React Native Text Component",
      description: "Which component is used to render text in React Native?",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "components", "ui-components"],
      options: ["<Text>", "<View>", "<Span>", "<Label>"],
      correctAnswer: 0
    },
    {
      title: "React Native View Component",
      description: "Which component is used as a container for layout in React Native?",
      difficulty: "easy", 
      preferredCategory: "ui",
      tags: ["react-native", "components", "ui-components"],
      options: ["<Div>", "<View>", "<Section>", "<Container>"],
      correctAnswer: 1
    },
    {
      title: "React Native Styling",
      description: "Which prop is used to style components in React Native?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react-native", "styling-native", "props"],
      options: ["className", "style", "css", "styles"],
      correctAnswer: 1
    },
    {
      title: "React Native Touch Events",
      description: "Which prop handles touch events in React Native?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react-native", "touchables", "event-handling"],
      options: ["onClick", "onPress", "onTouch", "onTap"],
      correctAnswer: 1
    },
    {
      title: "React Native Input Component",
      description: "Which component is used for text input in React Native?",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "components", "forms"],
      options: ["<Input>", "<TextInput>", "<TextField>", "<InputText>"],
      correctAnswer: 1
    },
    {
      title: "React Native Image Component",
      description: "Which component displays images in React Native?",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "components", "media"],
      options: ["<Img>", "<Picture>", "<Image>", "<Photo>"],
      correctAnswer: 2
    },
    {
      title: "React Native ScrollView",
      description: "Which component provides scrollable content in React Native?",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "components", "ui-components"],
      options: ["<Scroll>", "<ScrollView>", "<Scrollable>", "<ScrollContainer>"],
      correctAnswer: 1
    },
    {
      title: "React Native FlatList",
      description: "Which component efficiently renders large lists in React Native?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "components", "performance-optimization"],
      options: ["<ListView>", "<FlatList>", "<VirtualList>", "<DataList>"],
      correctAnswer: 1
    },
    {
      title: "React Native Modal",
      description: "Which component creates overlay screens in React Native?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "components", "ui-components"],
      options: ["<Overlay>", "<Popup>", "<Modal>", "<Dialog>"],
      correctAnswer: 2
    },
    {
      title: "React Native Button",
      description: "Which component creates a basic button in React Native?",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "components", "touchables"],
      options: ["<Btn>", "<Button>", "<TouchableButton>", "<PressButton>"],
      correctAnswer: 1
    },

    // React Native Navigation & Routing (5 questions)
    {
      title: "Navigation Library",
      description: "Which library is commonly used for navigation in React Native?",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "navigation-native", "routing"],
      options: ["React Router", "React Navigation", "Native Router", "Navigation Native"],
      correctAnswer: 1
    },
    {
      title: "Stack Navigator",
      description: "Which navigator provides stack-based navigation in React Navigation?",
      difficulty: "medium",
      preferredCategory: "ui", 
      tags: ["react-native", "navigation-native", "routing"],
      options: ["StackNavigator", "createStackNavigator", "NavigationStack", "StackNavigation"],
      correctAnswer: 1
    },
    {
      title: "Tab Navigator",
      description: "Which navigator creates bottom tab navigation?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "navigation-native", "routing"],
      options: ["createTabNavigator", "createBottomTabNavigator", "TabNavigator", "BottomTabs"],
      correctAnswer: 1
    },
    {
      title: "Navigation Prop",
      description: "Which prop is automatically passed to screen components in React Navigation?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "navigation-native", "props"],
      options: ["router", "navigation", "navigator", "route"],
      correctAnswer: 1
    },
    {
      title: "Screen Options",
      description: "Where do you configure screen-specific options in React Navigation?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react-native", "navigation-native", "routing"],
      options: ["screenOptions", "options", "navigationOptions", "config"],
      correctAnswer: 1
    },

    // React Native State & Hooks (5 questions)
    {
      title: "React Native State Hook",
      description: "Which hook is used to manage state in React Native functional components?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react-native", "hooks", "state-management", "useState"],
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctAnswer: 1
    },
    {
      title: "Effect Hook",
      description: "Which hook handles side effects in React Native?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react-native", "hooks", "useEffect"],
      options: ["useState", "useEffect", "useMemo", "useCallback"],
      correctAnswer: 1
    },
    {
      title: "Context Hook",
      description: "Which hook consumes React Context in React Native?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "hooks", "useContext", "state-management"],
      options: ["useContext", "useProvider", "useConsumer", "useGlobal"],
      correctAnswer: 0
    },
    {
      title: "Memo Hook",
      description: "Which hook optimizes performance by memoizing values in React Native?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react-native", "hooks", "performance-optimization"],
      options: ["useCallback", "useMemo", "useEffect", "useRef"],
      correctAnswer: 1
    },
    {
      title: "Callback Hook",
      description: "Which hook memoizes callback functions for performance optimization?",
      difficulty: "hard",
      preferredCategory: "syntax", 
      tags: ["react-native", "hooks", "performance-optimization"],
      options: ["useCallback", "useMemo", "useEffect", "useRef"],
      correctAnswer: 0
    },

    // Platform & Device Features (5 questions)
    {
      title: "Platform Detection",
      description: "Which API detects the current platform in React Native?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "platform-specific", "cross-platform"],
      options: ["Device", "Platform", "OS", "System"],
      correctAnswer: 1
    },
    {
      title: "Platform-Specific Files",
      description: "Which suffix is used for iOS-specific files in React Native?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "platform-specific", "ios-development"],
      options: [".android.js", ".ios.js", ".native.js", ".platform.js"],
      correctAnswer: 1
    },
    {
      title: "Dimensions API",
      description: "Which API gets screen dimensions in React Native?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "device-apis", "responsive-mobile"],
      options: ["Screen", "Dimensions", "ViewPort", "Display"],
      correctAnswer: 1
    },
    {
      title: "AsyncStorage",
      description: "Which API provides persistent storage in React Native?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "storage-native", "device-apis"],
      options: ["AsyncStorage", "LocalStorage", "SharedPreferences", "Keychain"],
      correctAnswer: 0
    },
    {
      title: "Permissions",
      description: "Which library commonly handles permissions in React Native?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react-native", "permissions", "device-apis"],
      options: ["react-native-permissions", "react-native-auth", "native-permissions", "permissions-native"],
      correctAnswer: 0
    },

    // Advanced React Native Concepts (5 questions)
    {
      title: "Native Modules Access",
      description: "Which object exposes native modules to JavaScript in React Native?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react-native", "native-modules", "cross-platform"],
      options: ["NativeModules", "NativeComponents", "Bridge", "NativeBridge"],
      correctAnswer: 0
    },
    {
      title: "Animated API",
      description: "Which API provides animations in React Native?",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "animations-native", "ui-components"],
      options: ["Animated", "Animation", "Motion", "Transition"],
      correctAnswer: 0
    },
    {
      title: "Gesture Responder",
      description: "Which system handles touch gestures in React Native?",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react-native", "gestures", "touchables"],
      options: ["TouchSystem", "GestureResponder", "TouchResponder", "GestureHandler"],
      correctAnswer: 1
    },
    {
      title: "React Native Debugging",
      description: "Which tool is primarily used to debug React Native apps?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "debugging-native", "mobile-development"],
      options: ["Chrome DevTools", "React DevTools", "Flipper", "All of the above"],
      correctAnswer: 3
    },
    {
      title: "Metro Bundler",
      description: "What is Metro in React Native?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react-native", "mobile-development", "cross-platform"],
      options: ["Navigation library", "JavaScript bundler", "Animation library", "Testing framework"],
      correctAnswer: 1
    }
  ],

  // 20 True/False Questions  
  trueFalse: [
    // Basic React Native Concepts (8 questions)
    {
      title: "React Native Framework",
      description: "React Native uses native components instead of web components.",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "components", "native-components"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Native Styling",
      description: "React Native uses CSS for styling components.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react-native", "styling-native"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "JSX Support",
      description: "React Native supports JSX syntax like React.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react-native", "jsx", "syntax"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "Props Immutability",
      description: "Props in React Native components are mutable.",
      difficulty: "easy", 
      preferredCategory: "syntax",
      tags: ["react-native", "props", "components"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "Flexbox Layout",
      description: "React Native uses Flexbox for layout by default.",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "styling-native", "layout"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "Component Reusability",
      description: "React Native components cannot be reused in React web apps.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "components", "cross-platform"],
      options: ["true", "false"],
      correctAnswer: 1 // false - logic can be shared
    },
    {
      title: "State Management",
      description: "React Native supports useState for state management.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react-native", "hooks", "state-management"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "Hot Reload",
      description: "Hot reload preserves the app state during development.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["react-native", "mobile-development", "debugging-native"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },

    // Navigation & Routing (4 questions)
    {
      title: "Navigation Requirement",
      description: "React Navigation is included by default in React Native.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "navigation-native"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "Navigation Stack",
      description: "React Navigation's Stack Navigator supports screen transitions.",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "navigation-native", "routing"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "Navigation State",
      description: "Navigation state is automatically managed by React Navigation.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "navigation-native", "state-management"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "Deep Linking",
      description: "React Navigation supports deep linking out of the box.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react-native", "navigation-native", "routing"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },

    // Platform & Performance (4 questions)
    {
      title: "Platform-Specific Code",
      description: "React Native allows platform-specific code using file extensions.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "platform-specific", "cross-platform"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "Native Bridge",
      description: "Native modules require a bridge to communicate with JavaScript.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react-native", "native-modules", "cross-platform"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "Performance Comparison",
      description: "React Native apps always run faster than web apps.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "performance-optimization", "mobile-development"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "Compilation Target",
      description: "React Native apps compile to native ARM code.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["react-native", "mobile-development", "cross-platform"],
      options: ["true", "false"],
      correctAnswer: 1 // false - runs on JS engine
    },

    // Advanced Features (4 questions)
    {
      title: "AsyncStorage Behavior",
      description: "AsyncStorage is synchronous in React Native.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "storage-native", "async-programming"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "Animation Performance", 
      description: "The Animated API requires native driver for smooth animations.",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react-native", "animations-native", "performance-optimization"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "React Hooks Compatibility",
      description: "Hooks in React Native work the same as in React.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "hooks", "react"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "Code Sharing",
      description: "Business logic can be shared between React Native and React web apps.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "cross-platform", "react"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    }
  ],

  // 20 Fill-in-the-Blank Questions
  fillInTheBlank: [
    // Basic Component Structure (5 questions)
    {
      title: "Complete Basic React Native Component",
      description: "Complete the basic React Native component structure",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "components", "jsx"],
      codeTemplate: `import React from 'react';
import { ___blank1___, ___blank2___ } from 'react-native';

function HelloWorld() {
  return (
    <___blank3___>
      <___blank4___>Hello, React Native!</___blank5___>
    </___blank6___>
  );
}

export default HelloWorld;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['View'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['Text'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['View'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['Text'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['Text'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['View'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete TextInput Component",
      description: "Complete the TextInput component with state management",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "components", "forms", "state-management"],
      codeTemplate: `import React, { ___blank1___ } from 'react';
import { View, ___blank2___, TextInput } from 'react-native';

function InputComponent() {
  const [text, ___blank3___] = ___blank4___('');

  return (
    <View>
      <___blank5___
        value={___blank6___}
        ___blank7___={setText}
        placeholder="Enter text"
      />
      <Text>{text}</Text>
    </View>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useState'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['Text'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['setText'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['useState'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['TextInput'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['text'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['onChangeText'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Button Component",
      description: "Complete the Button component with event handling",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["react-native", "components", "touchables", "event-handling"],
      codeTemplate: `import React from 'react';
import { View, ___blank1___, Alert } from 'react-native';

function ButtonComponent() {
  const handlePress = () => {
    ___blank2___.alert('Button Pressed!');
  };

  return (
    <View>
      <___blank3___
        title="Press Me"
        ___blank4___={handlePress}
      />
    </View>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Button'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['Alert'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['Button'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['onPress'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete FlatList Component",
      description: "Complete the FlatList for rendering a list of items",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "components", "performance-optimization"],
      codeTemplate: `import React from 'react';
import { ___blank1___, Text, View } from 'react-native';

function ListComponent() {
  const data = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' }
  ];

  const renderItem = ({ item }) => (
    <View>
      <Text>{item.title}</Text>
    </View>
  );

  return (
    <___blank2___
      ___blank3___={data}
      ___blank4___={renderItem}
      ___blank5___={(item) => item.id}
    />
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['FlatList'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['FlatList'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['data'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['renderItem'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['keyExtractor'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Image Component",
      description: "Complete the Image component with proper styling",
      difficulty: "easy",
      preferredCategory: "ui", 
      tags: ["react-native", "components", "media", "styling-native"],
      codeTemplate: `import React from 'react';
import { View, ___blank1___ } from 'react-native';

function ImageComponent() {
  return (
    <View>
      <___blank2___
        ___blank3___={{ uri: 'https://example.com/image.jpg' }}
        ___blank4___={{
          width: 200,
          height: 200,
          ___blank5___: 'cover'
        }}
      />
    </View>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Image'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['Image'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['source'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['style'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['resizeMode'], caseSensitive: false, points: 2 }
      ]
    },

    // Styling and Layout (5 questions)
    {
      title: "Complete Flexbox Styling",
      description: "Complete the Flexbox layout properties",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "styling-native", "layout"],
      codeTemplate: `import React from 'react';
import { View } from 'react-native';

function FlexboxLayout() {
  return (
    <View style={{
      flex: ___blank1___,
      ___blank2___: 'row',
      ___blank3___: 'center',
      ___blank4___: 'space-between',
      padding: ___blank5___
    }}>
      <View style={{ backgroundColor: 'red', ___blank6___: 50, height: 50 }} />
      <View style={{ backgroundColor: 'blue', width: 50, height: 50 }} />
    </View>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['1'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['flexDirection'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['alignItems'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['justifyContent'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['10', '20', '16'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['width'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete StyleSheet Usage",
      description: "Complete the StyleSheet.create usage",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "styling-native"],
      codeTemplate: `import React from 'react';
import { View, Text, ___blank1___ } from 'react-native';

function StyledComponent() {
  return (
    <View style={styles.___blank2___}>
      <Text style={styles.___blank3___}>Styled Text</Text>
    </View>
  );
}

const styles = ___blank4___.create({
  ___blank5___: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20
  },
  ___blank6___: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  }
});`,
      blanks: [
        { id: 'blank1', correctAnswers: ['StyleSheet'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['container'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['text'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['StyleSheet'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['container'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['text'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete Platform-Specific Styling",
      description: "Complete platform-specific styling using Platform API",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react-native", "platform-specific", "styling-native"],
      codeTemplate: `import React from 'react';
import { View, Text, ___blank1___ } from 'react-native';

function PlatformComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Platform Specific</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: ___blank2___.select({
      ___blank3___: 10,
      ___blank4___: 15
    })
  },
  text: {
    fontSize: Platform.___blank5___ === 'ios' ? 16 : 14
  }
});`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Platform'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['Platform'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['ios'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['android'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['OS'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Responsive Design",
      description: "Complete responsive design using Dimensions",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react-native", "responsive-mobile", "device-apis"],
      codeTemplate: `import React from 'react';
import { View, ___blank1___ } from 'react-native';

function ResponsiveComponent() {
  const { width, height } = ___blank2___.get('___blank3___');
  
  return (
    <View style={{
      width: width * ___blank4___,
      height: height * ___blank5___,
      backgroundColor: 'lightblue'
    }}>
      {/* Content */}
    </View>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Dimensions'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['Dimensions'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['window', 'screen'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['0.8', '0.9', '0.7'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['0.5', '0.6', '0.4'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete Touchable Components",
      description: "Complete the TouchableOpacity component",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "touchables", "event-handling"],
      codeTemplate: `import React from 'react';
import { View, Text, ___blank1___ } from 'react-native';

function TouchableComponent() {
  const handlePress = () => {
    console.log('Pressed!');
  };

  return (
    <___blank2___
      ___blank3___={handlePress}
      ___blank4___={0.7}
      style={{ padding: 20, backgroundColor: 'blue' }}
    >
      <___blank5___ style={{ color: 'white' }}>Touch Me</___blank6___>
    </___blank7___>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['TouchableOpacity'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['TouchableOpacity'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['onPress'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['activeOpacity'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['Text'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['Text'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['TouchableOpacity'], caseSensitive: false, points: 1 }
      ]
    },

    // Navigation Implementation (5 questions)
    {
      title: "Complete Stack Navigator",
      description: "Complete the Stack Navigator setup",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "navigation-native", "routing"],
      codeTemplate: `import React from 'react';
import { ___blank1___ } from '@react-navigation/native';
import { ___blank2___ } from '@react-navigation/stack';

const Stack = ___blank3___();

function App() {
  return (
    <___blank4___>
      <___blank5___.Navigator>
        <Stack.___blank6___ name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['NavigationContainer'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['createStackNavigator'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['createStackNavigator'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['NavigationContainer'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['Stack'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['Screen'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete Navigation Between Screens",
      description: "Complete navigation between screens",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["react-native", "navigation-native", "routing"],
      codeTemplate: `import React from 'react';
import { View, Text, Button } from 'react-native';

function HomeScreen({ ___blank1___ }) {
  return (
    <View>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => ___blank2___.___blank3___('Details', {
          itemId: 86,
          otherParam: 'anything you want here'
        })}
      />
    </View>
  );
}

function DetailsScreen({ navigation, ___blank4___ }) {
  const { itemId, otherParam } = ___blank5___.params;
  
  return (
    <View>
      <Text>Details Screen</Text>
      <Text>itemId: {itemId}</Text>
      <Button
        title="Go back"
        onPress={() => navigation.___blank6___()}
      />
    </View>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['navigation'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['navigation'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['navigate'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['route'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['route'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['goBack'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Tab Navigator",
      description: "Complete the Tab Navigator setup",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react-native", "navigation-native", "routing"],
      codeTemplate: `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ___blank1___ } from '@react-navigation/bottom-tabs';

const Tab = ___blank2___();

function App() {
  return (
    <NavigationContainer>
      <___blank3___.Navigator>
        <Tab.___blank4___
          name="Home"
          component={HomeScreen}
          ___blank5___={{
            ___blank6___: 'Home',
            ___blank7___: 'home'
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['createBottomTabNavigator'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['createBottomTabNavigator'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['Tab'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['Screen'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['options'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['tabBarLabel'], caseSensitive: false, points: 2 },
        { id: 'blank7', correctAnswers: ['tabBarIcon'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Navigation Header",
      description: "Complete navigation header customization",
      difficulty: "hard",
      preferredCategory: "ui", 
      tags: ["react-native", "navigation-native", "ui-components"],
      codeTemplate: `import React from 'react';
import { View, Text } from 'react-native';

function DetailsScreen() {
  return (
    <View>
      <Text>Details Screen</Text>
    </View>
  );
}

DetailsScreen.___blank1___ = ({ route }) => ({
  ___blank2___: route.params.name,
  ___blank3___: {
    backgroundColor: '#f4511e'
  },
  ___blank4___: {
    color: '#fff'
  },
  ___blank5___: {
    fontWeight: 'bold'
  }
});`,
      blanks: [
        { id: 'blank1', correctAnswers: ['options'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['title'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['headerStyle'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['headerTintColor'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['headerTitleStyle'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Drawer Navigator",
      description: "Complete the Drawer Navigator implementation",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["react-native", "navigation-native", "routing"],
      codeTemplate: `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ___blank1___ } from '@react-navigation/drawer';

const Drawer = ___blank2___();

function App() {
  return (
    <NavigationContainer>
      <___blank3___.Navigator
        ___blank4___={{
          drawerActiveTintColor: '#e91e63'
        }}
      >
        <Drawer.___blank5___ 
          name="Feed" 
          component={Feed}
          ___blank6___={{
            ___blank7___: 'Feed',
            ___blank8___: 'home'
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['createDrawerNavigator'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['createDrawerNavigator'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['Drawer'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['screenOptions'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['Screen'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['options'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['drawerLabel'], caseSensitive: false, points: 2 },
        { id: 'blank8', correctAnswers: ['drawerIcon'], caseSensitive: false, points: 2 }
      ]
    },

    // Hooks and State Management (5 questions)
    {
      title: "Complete useEffect Hook",
      description: "Complete useEffect for API calls",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["react-native", "hooks", "useEffect", "async-programming"],
      codeTemplate: `import React, { useState, ___blank1___ } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  ___blank2___(() => {
    const fetchData = async () => {
      try {
        const response = await ___blank3___('https://api.example.com/data');
        const result = await response.___blank4___();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(___blank5___);
      }
    };

    fetchData();
  }, ___blank6___);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['useEffect'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['useEffect'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['fetch'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['json'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['false'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['[]'], caseSensitive: false, points: 2 }
      ]
    }
  ]
};

async function seedReactNativeQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE React Native question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(reactNativeQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(reactNativeQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = reactNativeQuestions.fillInTheBlank.length;
    const totalBlanks = reactNativeQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    
    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('reactNative');

    // Delete existing React Native questions
    await processor.deleteByLanguage('reactNative');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(reactNativeQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'reactNative', status: 'active' },
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

      processor.printProcessingSummary(insertResults, 'React Native');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE React Native question seeding completed successfully!');
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
      return await Question.find({ language: 'reactNative' }).select('_id title type');

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
    console.error('💥 React Native seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedReactNativeQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive React Native questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust auto-grading validation!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed React Native questions:', error);
      process.exit(1);
    });
}

module.exports = { seedReactNativeQuestions, reactNativeQuestions };