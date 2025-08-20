const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const flutterQuestions = {
  multipleChoice: [
    {
      title: "Flutter Widgets",
      description: "Which widget is the basic building block in Flutter?",
      options: ["", "Container", "Widget", "Scaffold", "MaterialApp"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter State Management",
      description: "Which widget manages state in Flutter?",
      options: ["", "StatelessWidget", "StatefulWidget", "Container", "Row"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Layout",
      description: "Which widget arranges children horizontally?",
      options: ["", "Column", "Row", "Stack", "ListView"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Navigation",
      description: "Which method navigates to a new screen in Flutter?",
      options: ["", "push()", "navigate()", "go()", "route()"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Flutter Material Design",
      description: "Which widget provides a material design structure?",
      options: ["", "Container", "Scaffold", "Column", "Flex"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Async",
      description: "Which Dart feature is used for async operations in Flutter?",
      options: ["", "Future", "Promise", "Async", "Task"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "async-programming"]
    },
    {
      title: "Flutter Text",
      description: "Which widget displays text in Flutter?",
      options: ["", "Text", "Label", "Span", "Paragraph"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Gestures",
      description: "Which widget detects tap gestures in Flutter?",
      options: ["", "GestureDetector", "TapHandler", "ClickListener", "OnTap"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Themes",
      description: "Which widget applies a theme to a Flutter app?",
      options: ["", "Theme", "MaterialApp", "Style", "ThemeData"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Lists",
      description: "Which widget creates a scrollable list in Flutter?",
      options: ["", "ListView", "GridView", "Column", "Row"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter State",
      description: "Which method rebuilds a StatefulWidget?",
      options: ["", "build()", "setState()", "render()", "update()"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Routing",
      description: "Which class defines a route in Flutter’s Navigator 2.0?",
      options: ["", "Route", "Page", "Navigator", "MaterialPage"],
      correctAnswer: 4,
      difficulty: "hard",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Flutter Images",
      description: "Which widget displays an image in Flutter?",
      options: ["", "Image", "Picture", "Img", "Asset"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Forms",
      description: "Which widget manages form state in Flutter?",
      options: ["", "Form", "TextField", "FormField", "Input"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Animation",
      description: "Which class controls animations in Flutter?",
      options: ["", "Animation", "AnimationController", "Tween", "Curve"],
      correctAnswer: 2,
      difficulty: "hard",
      tags: ["flutter", "widgets"]
    }
  ],
  trueFalse: [
    {
      title: "Flutter Widgets",
      description: "StatelessWidget cannot maintain state.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter State",
      description: "setState() triggers a rebuild of the entire app.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Navigation",
      description: "Navigator.push() adds a new route to the stack.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Flutter Layout",
      description: "Column and Row widgets can nest other layout widgets.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Async",
      description: "FutureBuilder rebuilds when a Future completes.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["flutter", "async-programming"]
    },
    {
      title: "Flutter Themes",
      description: "MaterialApp automatically applies a default theme.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Gestures",
      description: "GestureDetector only supports tap events.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Lists",
      description: "ListView requires a fixed height container.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Forms",
      description: "Form widgets validate input automatically.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Animation",
      description: "Animations in Flutter require an AnimationController.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter State Management",
      description: "Provider is included in Flutter’s core library.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Images",
      description: "AssetImage loads images from the app’s assets.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Routing",
      description: "Navigator 2.0 supports declarative routing.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "hard",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Flutter Layout",
      description: "Expanded widget can only be used in a Flex widget.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Performance",
      description: "const widgets improve performance by preventing rebuilds.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    }
  ],
  codeChallenge: [
    {
      title: "Create a Counter Widget",
      description: "Create a Flutter StatefulWidget that increments a counter on button press.",
      options: ["import 'package:flutter/material.dart';\n\nclass CounterWidget extends StatefulWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "StatefulWidget", output: "Uses StatefulWidget", hidden: false },
        { input: "Button press", output: "Increments counter", hidden: false },
        { input: "State update", output: "Uses setState()", hidden: true }
      ],
      difficulty: "easy",
      tags: ["flutter", "widgets", "state-management"]
    },
    {
      title: "Create a ListView",
      description: "Create a Flutter widget that displays a scrollable list of items.",
      options: ["import 'package:flutter/material.dart';\n\nclass ItemList extends StatelessWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "ListView", output: "Uses ListView.builder", hidden: false },
        { input: "Item rendering", output: "Renders list items", hidden: false },
        { input: "Scrollable", output: "List is scrollable", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Create a Navigation Route",
      description: "Create a Flutter app with two screens and navigation.",
      options: ["import 'package:flutter/material.dart';\n\nclass MyApp extends StatelessWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "Navigator", output: "Uses Navigator.push()", hidden: false },
        { input: "Multiple screens", output: "Defines two screens", hidden: false },
        { input: "Route handling", output: "Navigates correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Create a Form Widget",
      description: "Create a Flutter form with a text field and validation.",
      options: ["import 'package:flutter/material.dart';\n\nclass MyForm extends StatefulWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "Form widget", output: "Uses Form and TextFormField", hidden: false },
        { input: "Validation", output: "Validates input", hidden: false },
        { input: "State management", output: "Handles form state", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Create an Async Widget",
      description: "Create a Flutter widget that fetches data asynchronously.",
      options: ["import 'package:flutter/material.dart';\n\nclass DataWidget extends StatelessWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "Async handling", output: "Uses FutureBuilder", hidden: false },
        { input: "Data display", output: "Shows fetched data", hidden: false },
        { input: "Error handling", output: "Handles async errors", hidden: true }
      ],
      difficulty: "hard",
      tags: ["flutter", "async-programming"]
    },
    {
      title: "Create a Theme Widget",
      description: "Create a Flutter widget that applies a custom theme.",
      options: ["import 'package:flutter/material.dart';\n\nclass MyApp extends StatelessWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "Theme setup", output: "Uses ThemeData", hidden: false },
        { input: "MaterialApp", output: "Wraps with MaterialApp", hidden: false },
        { input: "Custom styles", output: "Applies custom theme", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Create a Gesture Widget",
      description: "Create a Flutter widget that responds to tap gestures.",
      options: ["import 'package:flutter/material.dart';\n\nclass TapWidget extends StatelessWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "GestureDetector", output: "Uses GestureDetector", hidden: false },
        { input: "Tap handling", output: "Handles tap events", hidden: false },
        { input: "Correct response", output: "Triggers action on tap", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Create an Animation",
      description: "Create a Flutter widget with a fade animation.",
      options: ["import 'package:flutter/material.dart';\n\nclass FadeWidget extends StatefulWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "AnimationController", output: "Uses AnimationController", hidden: false },
        { input: "Fade effect", output: "Animates opacity", hidden: false },
        { input: "Smooth animation", output: "Runs smoothly", hidden: true }
      ],
      difficulty: "hard",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Create a GridView",
      description: "Create a Flutter widget that displays items in a grid.",
      options: ["import 'package:flutter/material.dart';\n\nclass GridWidget extends StatelessWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "GridView", output: "Uses GridView.builder", hidden: false },
        { input: "Grid layout", output: "Displays items in grid", hidden: false },
        { input: "Correct rendering", output: "Renders grid correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Create a Provider Widget",
      description: "Create a Flutter widget that uses Provider for state management.",
      options: ["import 'package:flutter/material.dart';\nimport 'package:provider/provider.dart';\n\nclass MyApp extends StatelessWidget {\n  // Your code here\n}"],
      testCases: [
        { input: "Provider setup", output: "Uses Provider.of", hidden: false },
        { input: "State management", output: "Manages state with Provider", hidden: false },
        { input: "Correct updates", output: "Updates UI on state change", hidden: true }
      ],
      difficulty: "hard",
      tags: ["flutter", "state-management"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix Counter Widget",
      description: "This counter widget doesn’t update. Fix the state management.",
      options: ["import 'package:flutter/material.dart';\n\nclass CounterWidget extends StatefulWidget {\n  @override\n  _CounterWidgetState createState() => _CounterWidgetState();\n}\n\nclass _CounterWidgetState extends State<CounterWidget> {\n  int count = 0;\n  @override\n  Widget build(BuildContext context) {\n    return ElevatedButton(\n      onPressed: () => count++,\n      child: Text('$count'),\n    );\n  }\n}"],
      testCases: [
        { input: "State update", output: "Uses setState()", hidden: false },
        { input: "Button press", output: "Increments counter", hidden: false },
        { input: "Correct display", output: "Updates UI", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Fix Navigation",
      description: "This navigation code doesn’t work. Fix the Navigator call.",
      options: ["import 'package:flutter/material.dart';\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      home: ElevatedButton(\n        onPressed: () => Navigator.push(context),\n        child: Text('Go'),\n      ),\n    );\n  }\n}"],
      testCases: [
        { input: "Navigator fix", output: "Uses Navigator.push with route", hidden: false },
        { input: "Route definition", output: "Defines new screen", hidden: false },
        { input: "Correct navigation", output: "Navigates to new screen", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Fix ListView",
      description: "This ListView doesn’t render items. Fix the builder.",
      options: ["import 'package:flutter/material.dart';\n\nclass ItemList extends StatelessWidget {\n  final List<String> items = ['a', 'b', 'c'];\n  @override\n  Widget build(BuildContext context) {\n    return ListView(\n      children: items,\n    );\n  }\n}"],
      testCases: [
        { input: "ListView.builder", output: "Uses ListView.builder", hidden: false },
        { input: "Item rendering", output: "Renders all items", hidden: false },
        { input: "Correct display", output: "Shows list correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Fix Async Widget",
      description: "This FutureBuilder doesn’t display data. Fix the async handling.",
      options: ["import 'package:flutter/material.dart';\n\nclass DataWidget extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return FutureBuilder(\n      future: Future.value('data'),\n      builder: (context, snapshot) => Text('No data'),\n    );\n  }\n}"],
      testCases: [
        { input: "Snapshot check", output: "Checks snapshot.hasData", hidden: false },
        { input: "Data display", output: "Shows future data", hidden: false },
        { input: "Error handling", output: "Handles errors correctly", hidden: true }
      ],
      difficulty: "hard",
      tags: ["flutter", "async-programming"]
    },
    {
      title: "Fix Form Validation",
      description: "This form doesn’t validate input. Fix the validation logic.",
      options: ["import 'package:flutter/material.dart';\n\nclass MyForm extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return Form(\n      child: TextFormField(),\n    );\n  }\n}"],
      testCases: [
        { input: "Form key", output: "Uses GlobalKey<FormState>", hidden: false },
        { input: "Validation", output: "Adds validator to TextFormField", hidden: false },
        { input: "Correct validation", output: "Validates input", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Fix Theme Application",
      description: "This theme doesn’t apply correctly. Fix the ThemeData usage.",
      options: ["import 'package:flutter/material.dart';\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      theme: ThemeData(),\n      home: Text('Test'),\n    );\n  }\n}"],
      testCases: [
        { input: "ThemeData", output: "Customizes ThemeData", hidden: false },
        { input: "MaterialApp", output: "Applies theme correctly", hidden: false },
        { input: "Correct styling", output: "Styles UI elements", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Fix Gesture Detection",
      description: "This GestureDetector doesn’t work. Fix the tap handling.",
      options: ["import 'package:flutter/material.dart';\n\nclass TapWidget extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return GestureDetector(\n      child: Text('Tap me'),\n    );\n  }\n}"],
      testCases: [
        { input: "onTap", output: "Adds onTap handler", hidden: false },
        { input: "Gesture handling", output: "Triggers action on tap", hidden: false },
        { input: "Correct widget", output: "Maintains GestureDetector", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Fix Animation",
      description: "This animation doesn’t run. Fix the AnimationController.",
      options: ["import 'package:flutter/material.dart';\n\nclass FadeWidget extends StatefulWidget {\n  @override\n  _FadeWidgetState createState() => _FadeWidgetState();\n}\n\nclass _FadeWidgetState extends State<FadeWidget> {\n  @override\n  Widget build(BuildContext context) {\n    return FadeTransition(\n      opacity: AnimationController(vsync: this, duration: Duration(seconds: 1)),\n      child: Text('Fade'),\n    );\n  }\n}"],
      testCases: [
        { input: "AnimationController", output: "Initializes AnimationController", hidden: false },
        { input: "Fade effect", output: "Animates opacity", hidden: false },
        { input: "Smooth animation", output: "Runs correctly", hidden: true }
      ],
      difficulty: "hard",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Fix GridView",
      description: "This GridView doesn’t render correctly. Fix the builder.",
      options: ["import 'package:flutter/material.dart';\n\nclass GridWidget extends StatelessWidget {\n  final List<String> items = ['a', 'b', 'c'];\n  @override\n  Widget build(BuildContext context) {\n    return GridView(\n      children: items,\n    );\n  }\n}"],
      testCases: [
        { input: "GridView.builder", output: "Uses GridView.builder", hidden: false },
        { input: "Grid layout", output: "Renders items in grid", hidden: false },
        { input: "Correct rendering", output: "Displays grid correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Fix Provider Usage",
      description: "This Provider usage doesn’t update. Fix the state management.",
      options: ["import 'package:flutter/material.dart';\nimport 'package:provider/provider.dart';\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return Provider(\n      create: (_) => 0,\n      child: Text('0'),\n    );\n  }\n}"],
      testCases: [
        { input: "Provider setup", output: "Uses ChangeNotifierProvider", hidden: false },
        { input: "State update", output: "Updates UI on state change", hidden: false },
        { input: "Correct state", output: "Manages state correctly", hidden: true }
      ],
      difficulty: "hard",
      tags: ["flutter", "state-management"]
    }
  ]
};

async function seedFlutterQuestions() {
  try {
    console.log('Seeding Flutter questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'flutter' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      flutterQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'flutter',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} Flutter questions`);
    console.log(`   - Multiple Choice: ${flutterQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${flutterQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${flutterQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${flutterQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding Flutter questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedFlutterQuestions()
    .then(() => {
      console.log('Flutter questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed Flutter questions:', error);
      process.exit(1);
    });
}

module.exports = { seedFlutterQuestions, flutterQuestions };