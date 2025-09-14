// seeds/flutterSeeds.js - Comprehensive Flutter questions with enhanced validation (65 total questions)
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

// Comprehensive Flutter questions data - 65 questions total
const flutterQuestions = {
  // 25 Multiple Choice Questions (no category needed)
  multipleChoice: [
    {
      title: "Flutter Widgets",
      description: "Which widget is the basic building block in Flutter?",
      options: ["Container", "Widget", "Scaffold", "MaterialApp"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter State Management",
      description: "Which widget manages state in Flutter?",
      options: ["StatelessWidget", "StatefulWidget", "Container", "Row"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Layout",
      description: "Which widget arranges children horizontally?",
      options: ["Column", "Row", "Stack", "ListView"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Navigation",
      description: "Which method navigates to a new screen in Flutter?",
      options: ["push()", "navigate()", "go()", "route()"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Flutter Material Design",
      description: "Which widget provides a material design structure?",
      options: ["Container", "Scaffold", "Column", "Flex"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Async",
      description: "Which Dart feature is used for async operations in Flutter?",
      options: ["Future", "Promise", "Async", "Task"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["flutter", "async-programming"]
    },
    {
      title: "Flutter Text",
      description: "Which widget displays text in Flutter?",
      options: ["Text", "Label", "Span", "Paragraph"],
      correctAnswer: 0,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Gestures",
      description: "Which widget detects tap gestures in Flutter?",
      options: ["GestureDetector", "TapHandler", "ClickListener", "OnTap"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Themes",
      description: "Which widget applies a theme to a Flutter app?",
      options: ["Theme", "MaterialApp", "Style", "ThemeData"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Lists",
      description: "Which widget creates a scrollable list in Flutter?",
      options: ["ListView", "GridView", "Column", "Row"],
      correctAnswer: 0,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter State",
      description: "Which method rebuilds a StatefulWidget?",
      options: ["build()", "setState()", "render()", "update()"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Routing",
      description: "Which class defines a route in Flutter's Navigator 2.0?",
      options: ["Route", "Page", "Navigator", "MaterialPage"],
      correctAnswer: 3,
      difficulty: "hard",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Flutter Images",
      description: "Which widget displays an image in Flutter?",
      options: ["Image", "Picture", "Img", "Asset"],
      correctAnswer: 0,
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Forms",
      description: "Which widget manages form state in Flutter?",
      options: ["Form", "TextField", "FormField", "Input"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Animation",
      description: "Which class controls animations in Flutter?",
      options: ["Animation", "AnimationController", "Tween", "Curve"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["flutter", "animations"]
    },
    {
      title: "Flutter Keys",
      description: "What is the purpose of keys in Flutter widgets?",
      options: ["Styling widgets", "Identifying widgets uniquely", "Handling events", "Managing state"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter BuildContext",
      description: "What is BuildContext in Flutter?",
      options: ["A widget class", "A reference to widget location", "A state manager", "An animation controller"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Inherited Widget",
      description: "What is the purpose of InheritedWidget in Flutter?",
      options: ["Creating animations", "Passing data down the tree", "Handling gestures", "Managing routes"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Slivers",
      description: "What are Slivers in Flutter?",
      options: ["Animation components", "Scrollable area portions", "State managers", "Navigation tools"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter CustomPainter",
      description: "What is CustomPainter used for in Flutter?",
      options: ["Managing state", "Custom drawing/painting", "Handling navigation", "Creating animations"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter MediaQuery",
      description: "What does MediaQuery provide in Flutter?",
      options: ["Animation data", "Device screen information", "Navigation state", "Theme data"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Flex vs Flexible",
      description: "What's the difference between Flex and Flexible widgets?",
      options: ["No difference", "Flex is container, Flexible controls child sizing", "Flex handles state", "Flexible is deprecated"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter GlobalKey",
      description: "What is a GlobalKey used for in Flutter?",
      options: ["Theming", "Accessing widget state/methods", "Navigation", "Animation control"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter StreamBuilder",
      description: "What does StreamBuilder widget do?",
      options: ["Builds widgets from Stream data", "Creates animations", "Manages navigation", "Handles gestures"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["flutter", "async-programming"]
    },
    {
      title: "Flutter Semantics",
      description: "What is the Semantics widget used for?",
      options: ["Performance optimization", "Accessibility support", "Animation control", "State management"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["flutter", "accessibility"]
    }
  ],

  // 20 True/False Questions (no category needed)
  trueFalse: [
    {
      title: "Flutter Widgets",
      description: "StatelessWidget cannot maintain state.",
      options: ["true", "false"],
      correctAnswer: 0, // 0 for true
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter State",
      description: "setState() triggers a rebuild of the entire app.",
      options: ["true", "false"],
      correctAnswer: 1, // false - only rebuilds the widget
      difficulty: "medium",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Navigation",
      description: "Navigator.push() adds a new route to the stack.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Flutter Layout",
      description: "Column and Row widgets can nest other layout widgets.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Async",
      description: "FutureBuilder rebuilds when a Future completes.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["flutter", "async-programming"]
    },
    {
      title: "Flutter Themes",
      description: "MaterialApp automatically applies a default theme.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Gestures",
      description: "GestureDetector only supports tap events.",
      options: ["true", "false"],
      correctAnswer: 1, // false - supports many gestures
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Lists",
      description: "ListView requires a fixed height container.",
      options: ["true", "false"],
      correctAnswer: 1, // false - can be flexible
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Forms",
      description: "Form widgets validate input automatically.",
      options: ["true", "false"],
      correctAnswer: 1, // false - requires manual validation
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Animation",
      description: "Animations in Flutter require an AnimationController.",
      options: ["true", "false"],
      correctAnswer: 0, // true for most animations
      difficulty: "hard",
      tags: ["flutter", "animations"]
    },
    {
      title: "Flutter State Management",
      description: "Provider is included in Flutter's core library.",
      options: ["true", "false"],
      correctAnswer: 1, // false - it's a separate package
      difficulty: "medium",
      tags: ["flutter", "state-management"]
    },
    {
      title: "Flutter Images",
      description: "AssetImage loads images from the app's assets.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Routing",
      description: "Navigator 2.0 supports declarative routing.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "hard",
      tags: ["flutter", "navigation"]
    },
    {
      title: "Flutter Layout",
      description: "Expanded widget can only be used in a Flex widget.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Performance",
      description: "const widgets improve performance by preventing rebuilds.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["flutter", "performance"]
    },
    {
      title: "Flutter Hot Reload",
      description: "Hot reload preserves the app state during development.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["flutter", "mobile-development"]
    },
    {
      title: "Flutter Compilation",
      description: "Flutter apps compile to native ARM code.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["flutter", "mobile-development"]
    },
    {
      title: "Flutter Web Support",
      description: "Flutter can only build mobile applications.",
      options: ["true", "false"],
      correctAnswer: 1, // false - supports web, desktop too
      difficulty: "easy",
      tags: ["flutter", "mobile-development"]
    },
    {
      title: "Flutter Widget Tree",
      description: "Flutter maintains three separate trees: Widget, Element, and RenderObject.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "hard",
      tags: ["flutter", "widgets"]
    },
    {
      title: "Flutter Testing",
      description: "Widget tests in Flutter can simulate user interactions.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["flutter", "testing"]
    }
  ],

  // 20 Fill in the Blank Questions - 10 UI + 10 Syntax
  fillInTheBlank: [
    // 10 UI Category Questions
    {
      title: "Basic Widget Structure",
      description: "Complete the basic Flutter widget structure for UI layout:",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `class MyWidget extends ___blank1___ {
  @override
  Widget build(BuildContext context) {
    return ___blank2___(
      child: Text('Hello Flutter'),
    );
  }
}`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["StatelessWidget"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["Container", "Scaffold", "Center"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Layout Widget Composition",
      description: "Complete the layout structure with proper widget nesting:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `Scaffold(
  appBar: ___blank1___(
    title: Text('My App'),
  ),
  body: ___blank2___(
    children: [
      Text('Item 1'),
      Text('Item 2'),
    ],
  ),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["AppBar"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["Column", "ListView"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Responsive Layout Design",
      description: "Complete the responsive layout using MediaQuery:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `Widget build(BuildContext context) {
  final screenWidth = ___blank1___.of(context).size.width;
  
  return Container(
    width: screenWidth > 600 ? 400 : ___blank2___,
    child: Text('Responsive Widget'),
  );
}`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["MediaQuery"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["screenWidth", "double.infinity"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Interactive Widget Design",
      description: "Complete the interactive button with gesture handling:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `___blank1___(
  onPressed: () {
    print('Button pressed!');
  },
  child: ___blank2___('Click Me'),
  style: ElevatedButton.styleFrom(
    primary: ___blank3___.blue,
  ),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["ElevatedButton"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["Text"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["Colors"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Navigation UI Flow",
      description: "Complete the navigation UI implementation:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["flutter", "navigation"],
      codeTemplate: `ElevatedButton(
  onPressed: () {
    ___blank1___.of(context).___blank2___(
      MaterialPageRoute(
        builder: (context) => SecondScreen(),
      ),
    );
  },
  child: Text('Go to Next Screen'),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["Navigator"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["push"],
          caseSensitive: true,
          points: 1
        }
      ]
    },
    {
      title: "Theme-Based UI Design",
      description: "Complete the theme configuration for consistent UI:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `MaterialApp(
  theme: ___blank1___(
    primarySwatch: Colors.blue,
    visualDensity: ___blank2___.adaptivePlatformDensity,
  ),
  home: MyHomePage(),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["ThemeData"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["VisualDensity"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "List UI Implementation",
      description: "Complete the scrollable list UI component:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `___blank1___.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ___blank2___(
      title: Text(items[index].title),
      subtitle: Text(items[index].subtitle),
      onTap: () => ___blank3___(items[index]),
    );
  },
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["ListView"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["ListTile"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["onItemTapped", "handleTap", "selectItem"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Card-Based UI Layout",
      description: "Complete the card layout for content presentation:",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `___blank1___(
  elevation: 4.0,
  child: ___blank2___(
    padding: EdgeInsets.all(16.0),
    child: Column(
      children: [
        Text('Card Title'),
        Text('Card Content'),
      ],
    ),
  ),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["Card"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["Padding"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Flexible Layout System",
      description: "Complete the flexible layout for responsive design:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `Row(
  children: [
    ___blank1___(
      flex: 1,
      child: Container(color: Colors.red),
    ),
    ___blank2___(
      flex: 2,
      child: Container(color: Colors.blue),
    ),
  ],
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["Expanded", "Flexible"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["Expanded", "Flexible"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Form UI Components",
      description: "Complete the form UI with input validation:",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["flutter", "widgets"],
      codeTemplate: `___blank1___(
  key: _formKey,
  child: Column(
    children: [
      ___blank2___(
        decoration: InputDecoration(
          labelText: 'Enter your name',
        ),
        validator: (value) {
          if (value?.isEmpty ?? true) {
            return 'Please enter your name';
          }
          return null;
        },
      ),
      ___blank3___(
        onPressed: () {
          if (_formKey.currentState!.validate()) {
            // Process form
          }
        },
        child: Text('Submit'),
      ),
    ],
  ),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["Form"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["TextFormField"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["ElevatedButton"],
          caseSensitive: false,
          points: 1
        }
      ]
    },

    // 10 Syntax Category Questions
    {
      title: "StatefulWidget Syntax",
      description: "Complete the StatefulWidget syntax structure:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["flutter", "state-management"],
      codeTemplate: `class CounterWidget extends ___blank1___ {
  @override
  ___blank2___ createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<___blank3___> {
  int count = 0;
  
  @override
  Widget build(BuildContext context) {
    return Text('$count');
  }
}`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["StatefulWidget"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["State<CounterWidget>", "_CounterWidgetState"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["CounterWidget"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "FutureBuilder Syntax",
      description: "Complete the FutureBuilder syntax for async operations:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["flutter", "async-programming"],
      codeTemplate: `___blank1___<String>(
  future: fetchData(),
  builder: (context, snapshot) {
    if (snapshot.___blank2___) {
      return Text(snapshot.data!);
    } else {
      return CircularProgressIndicator();
    }
  },
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["FutureBuilder"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["hasData"],
          caseSensitive: true,
          points: 1
        }
      ]
    },
    {
      title: "Animation Controller Syntax",
      description: "Complete the AnimationController syntax setup:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["flutter", "animations"],
      codeTemplate: `class _AnimatedWidgetState extends State<AnimatedWidget>
    with ___blank1___<AnimatedWidget> {
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 1),
      ___blank2___: this,
    );
  }
}`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["SingleTickerProviderStateMixin"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["vsync"],
          caseSensitive: true,
          points: 1
        }
      ]
    },
    {
      title: "GridView Syntax",
      description: "Complete the GridView.builder syntax:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["flutter", "widgets"],
      codeTemplate: `GridView.___blank1___(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    ___blank2___: 2,
    crossAxisSpacing: 10,
    mainAxisSpacing: 10,
  ),
  itemCount: items.length,
  itemBuilder: (context, index) {
    return Container(
      child: Text(items[index]),
    );
  },
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["builder"],
          caseSensitive: true,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["crossAxisCount"],
          caseSensitive: true,
          points: 1
        }
      ]
    },
    {
      title: "GestureDetector Syntax",
      description: "Complete the GestureDetector syntax implementation:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["flutter", "widgets"],
      codeTemplate: `___blank1___(
  ___blank2___: () {
    print('Tapped!');
  },
  onDoubleTap: () {
    print('Double tapped!');
  },
  child: Container(
    width: 100,
    height: 100,
    color: Colors.blue,
  ),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["GestureDetector"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["onTap"],
          caseSensitive: true,
          points: 1
        }
      ]
    },
    {
      title: "Stack Positioning Syntax",
      description: "Complete the Stack widget syntax with positioned children:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["flutter", "widgets"],
      codeTemplate: `___blank1___(
  children: [
    Container(
      width: 200,
      height: 200,
      color: Colors.red,
    ),
    ___blank2___(
      top: 50,
      left: 50,
      child: Text('Positioned Text'),
    ),
  ],
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["Stack"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["Positioned"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "CustomPainter Syntax",
      description: "Complete the CustomPainter syntax implementation:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["flutter", "widgets"],
      codeTemplate: `class MyPainter extends ___blank1___ {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = ___blank2___();
    paint.color = Colors.blue;
    canvas.drawCircle(Offset(50, 50), 25, paint);
  }
  
  @override
  bool ___blank3___(___blank4___) => false;
}`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["CustomPainter"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["Paint"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["shouldRepaint"],
          caseSensitive: true,
          points: 1
        },
        {
          id: "blank4",
          correctAnswers: ["oldDelegate", "covariant CustomPainter oldDelegate"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "StreamBuilder Syntax",
      description: "Complete the StreamBuilder syntax implementation:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["flutter", "async-programming"],
      codeTemplate: `___blank1___<int>(
  stream: counterStream,
  initialData: 0,
  builder: (context, snapshot) {
    if (snapshot.___blank2___) {
      return Text('Error: \${snapshot.error}');
    }
    return Text('Count: \${snapshot.data}');
  },
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["StreamBuilder"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["hasError"],
          caseSensitive: true,
          points: 1
        }
      ]
    },
    {
      title: "GlobalKey Syntax",
      description: "Complete the GlobalKey syntax for form validation:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["flutter", "widgets"],
      codeTemplate: `final _formKey = ___blank1___<FormState>();

Form(
  key: _formKey,
  child: Column(
    children: [
      TextFormField(),
      ElevatedButton(
        onPressed: () {
          if (_formKey.currentState!.___blank2___()) {
            // Process form
          }
        },
        child: Text('Submit'),
      ),
    ],
  ),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["GlobalKey"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["validate"],
          caseSensitive: true,
          points: 1
        }
      ]
    },
    {
      title: "Hero Animation Syntax",
      description: "Complete the Hero widget syntax for transitions:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["flutter", "animations"],
      codeTemplate: `___blank1___(
  tag: 'hero-image',
  child: Image.asset('assets/image.png'),
)

// On destination screen:
___blank2___(
  tag: '___blank3___',
  child: Image.asset('assets/image.png'),
)`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["Hero"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["Hero"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["hero-image"],
          caseSensitive: true,
          points: 1
        }
      ]
    }
  ]
};

async function seedFlutterQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE Flutter question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(flutterQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(flutterQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = flutterQuestions.fillInTheBlank.length;
    const totalBlanks = flutterQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    
    // Count categories for fill-in-blank questions
    const uiFillInBlanks = flutterQuestions.fillInTheBlank.filter(q => q.preferredCategory === 'ui').length;
    const syntaxFillInBlanks = flutterQuestions.fillInTheBlank.filter(q => q.preferredCategory === 'syntax').length;
    
    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Fill-in-blank categories: ${uiFillInBlanks} ui + ${syntaxFillInBlanks} syntax`);
    console.log(`🎯 Flutter supports: ui and syntax categories only\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('flutter');

    // Delete existing Flutter questions
    await processor.deleteByLanguage('flutter');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(flutterQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'flutter', status: 'active' },
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
    console.log('🔍 Running COMPREHENSIVE validation with enhanced grading testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Only fill-in-blank grading validation for Flutter (no code execution)
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'Flutter');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE Flutter question seeding completed successfully!');
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
      return await Question.find({ language: 'flutter' }).select('_id title type');

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
    console.error('💥 Flutter seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedFlutterQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive Flutter questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust validation testing!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed Flutter questions:', error);
      process.exit(1);
    });
}

module.exports = { seedFlutterQuestions, flutterQuestions };