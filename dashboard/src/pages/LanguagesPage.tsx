import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Code, Terminal, Database, Zap } from 'lucide-react';

interface LanguageInfo {
  name: string;
  status: string;
  statusColor: 'green' | 'amber' | 'blue' | 'red';
  description: string;
  categories: string[];
  questionTypes: string[];
  runtime?: string;
  executionCapabilities: string[];
  codeExample: string;
  testingFeatures: string[];
}

const LanguagesPage = () => {
  const navigate = useNavigate();

  const languageData: Record<string, LanguageInfo> = {
    javascript: {
      name: 'JavaScript',
      status: 'Production',
      statusColor: 'green',
      description: 'Full-featured JavaScript execution with Node.js runtime. Supports ES6+, async programming, and comprehensive testing frameworks.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'node',
      executionCapabilities: [
        'ES6+ syntax support',
        'Async/await execution',
        'Function testing with test cases',
        'Performance benchmarking',
        'Memory usage tracking',
        'Error handling validation'
      ],
      codeExample: `// JavaScript Logic Challenge
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test cases validate implementation
// Input: fibonacci(5) → Expected: 5
// Input: fibonacci(10) → Expected: 55`,
      testingFeatures: [
        'Automated test case execution',
        'Runtime error detection',
        'Performance analysis',
        'Memory leak detection'
      ]
    },
    typescript: {
      name: 'TypeScript',
      status: 'Production',
      statusColor: 'green',
      description: 'TypeScript with static type checking, compilation validation, and modern language features. Full Node.js runtime support.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'node',
      executionCapabilities: [
        'Static type checking validation',
        'Interface compliance testing',
        'Generic type verification',
        'Compilation error detection',
        'Advanced typing patterns',
        'Decorator support'
      ],
      codeExample: `// TypeScript Logic Challenge
interface Calculator {
  add(a: number, b: number): number;
}

class BasicCalculator implements Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// Test: calculator.add(5, 3) → Expected: 8`,
      testingFeatures: [
        'Type checking validation',
        'Compilation verification',
        'Interface compliance testing',
        'Runtime behavior validation'
      ]
    },
    python: {
      name: 'Python',
      status: 'Production',
      statusColor: 'green',
      description: 'Comprehensive Python 3.x support with extensive standard library access. Perfect for algorithms, data structures, and logic challenges.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'python',
      executionCapabilities: [
        'Python 3.x execution',
        'Standard library access',
        'Object-oriented programming',
        'List comprehensions',
        'Exception handling',
        'File I/O operations'
      ],
      codeExample: `# Python Logic Challenge
def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

# Test: binary_search([1,3,5,7,9], 5) → Expected: 2`,
      testingFeatures: [
        'Automated test execution',
        'Exception handling validation',
        'Performance profiling',
        'Memory usage analysis'
      ]
    },
    sql: {
      name: 'SQL',
      status: 'Production',
      statusColor: 'green',
      description: 'Complete SQL query execution and validation. Supports complex queries, joins, aggregations, and database design concepts.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'sql',
      executionCapabilities: [
        'Query execution validation',
        'Result set verification',
        'JOIN operations',
        'Aggregate functions',
        'Subquery support',
        'Window functions'
      ],
      codeExample: `-- SQL Logic Challenge
SELECT
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;`,
      testingFeatures: [
        'Query result validation',
        'Performance analysis',
        'Syntax error detection',
        'Data integrity checking'
      ]
    },
    dart: {
      name: 'Dart',
      status: 'Production',
      statusColor: 'green',
      description: 'Modern Dart language support for algorithmic thinking and programming fundamentals. Strong typing with excellent async support.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'dart',
      executionCapabilities: [
        'Strong type system',
        'Async programming patterns',
        'Collection operations',
        'Object-oriented features',
        'Functional programming',
        'Error handling'
      ],
      codeExample: `// Dart Logic Challenge
class Calculator {
  double add(double a, double b) => a + b;

  Future<double> asyncCalculation(double x) async {
    await Future.delayed(Duration(seconds: 1));
    return x * 2;
  }
}

// Test: Calculator().add(5.0, 3.0) → Expected: 8.0`,
      testingFeatures: [
        'Async code testing',
        'Type safety validation',
        'Performance benchmarking',
        'Memory management analysis'
      ]
    },
    express: {
      name: 'Express.js',
      status: 'Production',
      statusColor: 'green',
      description: 'Express.js web framework assessment with routing, middleware, and API development patterns. Full Node.js runtime support.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'node',
      executionCapabilities: [
        'Route handling validation',
        'Middleware function testing',
        'HTTP request/response patterns',
        'Authentication middleware',
        'Error handling patterns',
        'API endpoint validation'
      ],
      codeExample: `// Express.js Logic Challenge
const express = require('express');
const app = express();

app.use(express.json());

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/api/users', authenticate, (req, res) => {
  res.json({ users: [] });
});`,
      testingFeatures: [
        'Route testing',
        'Middleware validation',
        'HTTP response verification',
        'Error handling testing'
      ]
    },
    html: {
      name: 'HTML',
      status: 'Production',
      statusColor: 'green',
      description: 'Semantic HTML markup and structure validation. Focus on accessibility, forms, and modern HTML5 features.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Semantic element validation',
        'Form structure assessment',
        'Accessibility compliance',
        'HTML5 feature usage',
        'Document structure validation',
        'Meta tag optimization'
      ],
      codeExample: `<!-- HTML Fill-in-Blank Example -->
<___blank1___ class="hero-section">
  <div class="container">
    <h1>Welcome to Our Platform</h1>
    <___blank2___ action="/contact" method="post">
      <___blank3___ for="email">Email:</label>
      <input type="email" id="email" required>
      <button type="submit">Subscribe</button>
    </form>
  </div>
</section>

<!-- Answers: section, form, label -->`,
      testingFeatures: [
        'Semantic structure validation',
        'Accessibility compliance checking',
        'Form validation testing',
        'HTML5 feature verification'
      ]
    },
    css: {
      name: 'CSS',
      status: 'Production',
      statusColor: 'green',
      description: 'Modern CSS styling and layout assessment. Covers Flexbox, Grid, responsive design, and advanced CSS features.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Layout system validation',
        'Responsive design patterns',
        'CSS Grid and Flexbox',
        'Animation and transitions',
        'Custom properties usage',
        'Cross-browser compatibility'
      ],
      codeExample: `/* CSS Fill-in-Blank Example */
.container {
  display: ___blank1___;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  ___blank2___: transform 0.3s ease;
  ___blank3___: translateY(-4px);
}

.card:hover {
  transform: var(--hover-transform);
}

/* Answers: grid, transition, --hover-transform */`,
      testingFeatures: [
        'Layout behavior validation',
        'Responsive design testing',
        'Animation verification',
        'Property value validation'
      ]
    },
    react: {
      name: 'React/JSX',
      status: 'Production',
      statusColor: 'green',
      description: 'React component development with hooks, state management, and modern patterns. Focus on component architecture and lifecycle.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Component structure validation',
        'Hook usage patterns',
        'Props and state management',
        'Event handling patterns',
        'Conditional rendering',
        'Component lifecycle understanding'
      ],
      codeExample: `// React Fill-in-Blank Example
import React, { ___blank1___, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = ___blank2___(null);
  const [loading, setLoading] = useState(true);

  ___blank3___(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}

// Answers: useState, useState, useEffect`,
      testingFeatures: [
        'Component structure validation',
        'Hook dependency verification',
        'Props validation',
        'State management patterns'
      ]
    },
    reactNative: {
      name: 'React Native',
      status: 'Production',
      statusColor: 'green',
      description: 'React Native mobile development patterns with native components and mobile-specific UI paradigms.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Native component usage',
        'Mobile UI patterns',
        'Platform-specific code',
        'Navigation patterns',
        'TouchableOpacity handling',
        'StyleSheet optimization'
      ],
      codeExample: `// React Native Fill-in-Blank
import React from 'react';
import { View, Text, ___blank1___ } from 'rn-library';

function CounterScreen() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text>Count: {count}</Text>
      <___blank2___ onPress={() => setCount(count + 1)}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
}

// Answers: TouchableOpacity, TouchableOpacity`,
      testingFeatures: [
        'Component rendering validation',
        'Touch interaction patterns',
        'Platform behavior verification',
        'Style application testing'
      ]
    },
    flutter: {
      name: 'Flutter/Dart',
      status: 'Production',
      statusColor: 'green',
      description: 'Flutter widget composition and mobile UI development. Focus on Material Design and cross-platform patterns.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Widget composition patterns',
        'State management approaches',
        'Material Design components',
        'Custom widget creation',
        'Animation and transitions',
        'Platform integration'
      ],
      codeExample: `// Flutter Fill-in-Blank Example
class CounterWidget extends ___blank1___ {
  @override
  _CounterWidgetState createState() => _CounterWidgetState();
}

class _CounterWidgetState extends ___blank2___<CounterWidget> {
  int _counter = 0;

  @override
  Widget build(BuildContext context) {
    return ___blank3___(
      body: Text('Count: $_counter'),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => _counter++),
      ),
    );
  }
}

// Answers: StatefulWidget, State, Scaffold`,
      testingFeatures: [
        'Widget structure validation',
        'State management verification',
        'Material Design compliance',
        'UI behavior testing'
      ]
    },
    json: {
      name: 'JSON',
      status: 'Production',
      statusColor: 'green',
      description: 'JSON data structure validation, syntax verification, and schema compliance testing.',
      categories: ['syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'JSON syntax validation',
        'Data structure verification',
        'Schema compliance',
        'Nested object handling',
        'Array structure validation',
        'Data type verification'
      ],
      codeExample: `// JSON Fill-in-Blank Example
{
  "user": {
    "id": "123",
    "profile": {
      "name": "John Doe",
      "preferences": ___blank1___,
      "orders": [
        {
          "id": "order_001",
          "total": ___blank2___
        }
      ]
    }
  }
}

// Answers: {}, 999.99`,
      testingFeatures: [
        'Syntax validation',
        'Schema compliance testing',
        'Data type verification',
        'Structure validation'
      ]
    },
    swift: {
      name: 'Swift',
      status: 'Production',
      statusColor: 'green',
      description: 'Swift language support for iOS/macOS concepts. UI and syntax questions only - no code execution. Ideal for testing Swift fundamentals and patterns.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False', 'Drag & Drop'],
      executionCapabilities: [
        'Syntax validation questions',
        'UI pattern recognition',
        'Protocol concept testing',
        'Optionals understanding',
        'Swift idiom recognition',
        'Code structure analysis'
      ],
      codeExample: `// Swift Syntax Question (Fill-in-Blank)
func greet(_ name: String) -> String {
    return "Hello, \\(___)"  // Answer: name
}

// Swift UI Question (Multiple Choice)
// Which SwiftUI modifier centers content?
// A) .center()  B) .alignment(.center)  C) .frame(alignment: .center)`,
      testingFeatures: [
        'Pattern matching validation',
        'Syntax correctness checking',
        'Concept comprehension testing',
        'Best practices assessment'
      ]
    },
    swiftui: {
      name: 'SwiftUI',
      status: 'Production',
      statusColor: 'green',
      description: 'SwiftUI declarative UI framework for building native Apple platform interfaces. Focus on View composition and state management.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'View composition patterns',
        'State management (@State, @Binding)',
        'Property wrappers',
        'Environment values',
        'Custom modifiers',
        'Navigation patterns'
      ],
      codeExample: `// SwiftUI Fill-in-Blank Example
struct CounterView: ___blank1___ {
    @State private var count = 0

    var body: some View {
        VStack {
            Text("Count: \\(count)")
            ___blank2___(action: { count += 1 }) {
                Text("Increment")
            }
        }
    }
}

// Answers: View, Button`,
      testingFeatures: [
        'View structure validation',
        'State management verification',
        'Property wrapper usage',
        'Modifier chain validation'
      ]
    }
  };

  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');

  const logicLanguages = Object.entries(languageData).filter(([_, lang]) =>
    lang.categories.includes('logic')
  );

  const uiLanguages = Object.entries(languageData).filter(([_, lang]) =>
    lang.categories.includes('ui')
  );

  const syntaxOnlyLanguages = Object.entries(languageData).filter(([_, lang]) =>
    lang.categories.length === 1 && lang.categories.includes('syntax')
  );

  const badgeColors: Record<string, string> = {
    green: 'badge-green',
    amber: 'badge-amber',
    blue: 'badge-blue',
    red: 'badge-red'
  };

  const categoryColors: Record<string, string> = {
    logic: 'border-green-500',
    ui: 'border-blue-500',
    syntax: 'border-purple-500'
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-[#0a0a0b] to-purple-500/10" />
        <div className="absolute inset-0 grid-overlay opacity-50" />

        <div className="container-section relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="badge-amber mb-4 inline-block">Multi-Language Platform</span>
            <h1 className="font-mono text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">14 Languages</span>
              <br />
              <span className="text-[#f5f5f4]">3 Assessment Categories</span>
            </h1>
            <p className="text-xl text-[#a1a1aa] mb-8 max-w-2xl mx-auto">
              Comprehensive programming language support with real code execution,
              intelligent testing, and automated grading across multiple runtimes.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <span className="badge-green">
                {Object.keys(languageData).length} Production Languages
              </span>
              <span className="badge-blue">6 Question Types</span>
              <span className="badge-amber">4 Runtime Engines</span>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Categories */}
      <section className="py-16">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl font-bold mb-4">Assessment Categories</h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Our platform supports three distinct assessment categories, each designed for specific learning objectives.
            </p>
          </div>

          {/* Logic Category */}
          <div className={`border-l-4 ${categoryColors.logic} pl-6 mb-10`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="badge-green">LOGIC</span>
              <h3 className="font-mono text-xl font-semibold">Code Execution & Algorithms</h3>
            </div>
            <p className="text-[#a1a1aa] mb-4 max-w-3xl">
              Full code execution with automated testing, performance analysis, and real-time validation.
              Perfect for algorithm challenges, debugging exercises, and programming logic assessment.
            </p>
            <p className="text-[#6b6b70] text-sm mb-6">
              <strong className="text-[#a1a1aa]">Question Types:</strong> Code Challenge, Code Debugging, Fill-in-Blank, Multiple Choice, True/False
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {logicLanguages.map(([key, lang]) => (
                <div
                  key={key}
                  className="card p-4 cursor-pointer hover:border-[#3a3a3f] transition-colors"
                  onClick={() => setSelectedLanguage(key)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{lang.name}</h4>
                    {lang.runtime && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                        {lang.runtime}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6b6b70] line-clamp-2">
                    {lang.description.split('.')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* UI Category */}
          <div className={`border-l-4 ${categoryColors.ui} pl-6 mb-10`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="badge-blue">UI</span>
              <h3 className="font-mono text-xl font-semibold">User Interface & Frameworks</h3>
            </div>
            <p className="text-[#a1a1aa] mb-4 max-w-3xl">
              Component structure, UI patterns, and framework-specific concepts.
              Focus on practical application of modern web and mobile development patterns.
            </p>
            <p className="text-[#6b6b70] text-sm mb-6">
              <strong className="text-[#a1a1aa]">Question Types:</strong> Fill-in-Blank, Multiple Choice, True/False
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {uiLanguages.map(([key, lang]) => (
                <div
                  key={key}
                  className="card p-4 cursor-pointer hover:border-[#3a3a3f] transition-colors"
                  onClick={() => setSelectedLanguage(key)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{lang.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      UI
                    </span>
                  </div>
                  <p className="text-sm text-[#6b6b70] line-clamp-2">
                    {lang.description.split('.')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Syntax Category */}
          <div className={`border-l-4 ${categoryColors.syntax} pl-6`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="badge-purple">SYNTAX</span>
              <h3 className="font-mono text-xl font-semibold">Language Syntax & Fundamentals</h3>
            </div>
            <p className="text-[#a1a1aa] mb-4 max-w-3xl">
              Core language syntax, data structures, and fundamental programming concepts.
              Available across all supported languages for comprehensive assessment.
            </p>
            <p className="text-[#6b6b70] text-sm mb-6">
              <strong className="text-[#a1a1aa]">Question Types:</strong> Fill-in-Blank, Multiple Choice, True/False
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {syntaxOnlyLanguages.map(([key, lang]) => (
                <div
                  key={key}
                  className="card p-4 cursor-pointer hover:border-[#3a3a3f] transition-colors"
                  onClick={() => setSelectedLanguage(key)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{lang.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      Syntax
                    </span>
                  </div>
                  <p className="text-sm text-[#6b6b70] line-clamp-2">
                    {lang.description.split('.')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Language Details */}
      <section className="py-16 bg-[#141416]">
        <div className="container-section">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Language Selector */}
            <div className="lg:col-span-1">
              <h3 className="font-mono text-lg font-semibold mb-4">Explore Languages</h3>
              <div className="space-y-2">
                {Object.entries(languageData).map(([key, lang]) => (
                  <div
                    key={key}
                    className={`card p-3 cursor-pointer transition-all ${selectedLanguage === key
                        ? 'border-amber-500 bg-amber-500/5'
                        : 'hover:border-[#3a3a3f]'
                      }`}
                    onClick={() => setSelectedLanguage(key)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{lang.name}</span>
                      <div className="flex gap-1">
                        {lang.runtime && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">
                            {lang.runtime}
                          </span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded ${badgeColors[lang.statusColor]} bg-opacity-10`}>
                          {lang.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Details Panel */}
            <div className="lg:col-span-3">
              {selectedLanguage && languageData[selectedLanguage] && (
                <div>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="font-mono text-2xl font-bold">
                        {languageData[selectedLanguage].name}
                      </h2>
                      {languageData[selectedLanguage].runtime && (
                        <span className="badge-green">
                          Runtime: {languageData[selectedLanguage].runtime}
                        </span>
                      )}
                      <span className={badgeColors[languageData[selectedLanguage].statusColor]}>
                        {languageData[selectedLanguage].status}
                      </span>
                    </div>
                    <p className="text-[#a1a1aa] text-lg">
                      {languageData[selectedLanguage].description}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="card p-5">
                      <h4 className="font-mono font-semibold mb-4">Assessment Categories</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {languageData[selectedLanguage].categories.map((category, idx) => (
                          <span
                            key={idx}
                            className={
                              category === 'logic' ? 'badge-green' :
                                category === 'ui' ? 'badge-blue' : 'badge-purple'
                            }
                          >
                            {category.toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <h5 className="text-sm text-[#a1a1aa] mb-2">Question Types:</h5>
                      <ul className="text-sm text-[#6b6b70] space-y-1">
                        {languageData[selectedLanguage].questionTypes.map((type, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            {type}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card p-5">
                      <h4 className="font-mono font-semibold mb-4">Execution Capabilities</h4>
                      <ul className="text-sm text-[#6b6b70] space-y-1">
                        {languageData[selectedLanguage].executionCapabilities.map((capability, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {capability}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="card p-5 mb-6">
                    <h4 className="font-mono font-semibold mb-4">Example Assessment</h4>
                    <div className="code-block overflow-x-auto">
                      <pre className="text-sm text-[#a1a1aa]">
                        <code>{languageData[selectedLanguage].codeExample}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="card p-5">
                    <h4 className="font-mono font-semibold mb-4">Testing & Validation Features</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {languageData[selectedLanguage].testingFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                          <Check className="w-4 h-4 text-blue-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Runtime Support */}
      <section className="py-16">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl font-bold mb-4">Execution Runtime Support</h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Our platform provides secure, sandboxed execution environments for real code testing and validation.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="card p-6 text-center">
              <Terminal className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h4 className="font-mono font-semibold text-green-500 mb-2">Node.js</h4>
              <p className="text-sm text-[#6b6b70]">JavaScript, TypeScript, Express.js</p>
            </div>
            <div className="card p-6 text-center">
              <Code className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h4 className="font-mono font-semibold text-green-500 mb-2">Python</h4>
              <p className="text-sm text-[#6b6b70]">Python 3.x with standard library</p>
            </div>
            <div className="card p-6 text-center">
              <Database className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h4 className="font-mono font-semibold text-green-500 mb-2">SQL</h4>
              <p className="text-sm text-[#6b6b70]">Database query execution</p>
            </div>
            <div className="card p-6 text-center">
              <Zap className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h4 className="font-mono font-semibold text-green-500 mb-2">Dart</h4>
              <p className="text-sm text-[#6b6b70]">Modern Dart runtime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-500/10 to-purple-500/10">
        <div className="container-section">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Experience Our Assessment Platform
            </h2>
            <p className="text-[#a1a1aa] text-lg mb-8">
              Test drive our comprehensive multi-language assessment platform with real code execution,
              automated grading, and intelligent testing across all supported languages and question types.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                className="btn-primary px-6 py-3"
                onClick={() => navigate('/register')}
              >
                Try Live Demo
              </button>
              <button
                className="btn-secondary px-6 py-3"
                onClick={() => navigate('/register')}
              >
                Start Creating Assessments
              </button>
              <button
                className="btn-secondary px-6 py-3"
                onClick={() => navigate('/features')}
              >
                Explore All Features
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LanguagesPage;
