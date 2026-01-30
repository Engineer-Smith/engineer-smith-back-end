import { useNavigate } from 'react-router-dom';
import { Code, FileCode, Bug, ListChecks, CheckSquare, Zap, Target, Rocket, BarChart3, Shield, CheckCircle } from 'lucide-react';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const questionTypes = [
    {
      type: 'Code Challenge',
      icon: Code,
      description: 'Complete programming problems with test case validation and real-time code execution.',
      features: [
        'Multiple test cases with automatic validation',
        'Real-time code execution in secure sandbox',
        'Syntax highlighting and error detection',
        'Support for 14+ programming languages',
        'Automatic scoring based on test results',
        'Performance analysis and optimization hints'
      ],
      example: `function isPalindrome(str) {
  // Write your solution here
  return false;
}

// Test cases will validate:
// isPalindrome("racecar") → true
// isPalindrome("hello") → false`,
      difficulty: 'Medium to Hard',
      timeEstimate: '10-30 minutes',
      languages: ['JavaScript', 'Python', 'TypeScript', 'Dart', 'Express.js']
    },
    {
      type: 'Fill-in-the-Blank',
      icon: FileCode,
      description: 'Complete code snippets by filling in missing parts with intelligent validation.',
      features: [
        'Context-aware blank placement',
        'Multiple correct answer support',
        'Immediate feedback on answers',
        'Progressive difficulty levels',
        'Syntax-aware grading system',
        'Hint system for guidance'
      ],
      example: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= ______) {
    let mid = Math.floor((left + ______) / 2);

    if (arr[mid] === ______) {
      return mid;
    }
  }
  return -1;
}`,
      difficulty: 'Easy to Medium',
      timeEstimate: '3-10 minutes',
      languages: ['All supported languages', 'HTML/CSS', 'React', 'Flutter']
    },
    {
      type: 'Code Debugging',
      icon: Bug,
      description: 'Identify and fix errors in existing code with comprehensive error analysis.',
      features: [
        'Real-world debugging scenarios',
        'Multiple error types (syntax, logic, performance)',
        'Step-by-step validation process',
        'Detailed explanations of fixes required',
        'Best practices reinforcement',
        'Common mistake pattern recognition'
      ],
      example: `function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }

  return total;
}

// Issues: Off-by-one error, missing null checks`,
      difficulty: 'Medium to Hard',
      timeEstimate: '5-15 minutes',
      languages: ['JavaScript', 'Python', 'TypeScript', 'Express.js']
    },
    {
      type: 'Multiple Choice',
      icon: ListChecks,
      description: 'Select correct answers from provided options with detailed explanations.',
      features: [
        'Single and multiple correct answers',
        'Code snippet analysis questions',
        'Concept understanding validation',
        'Immediate feedback with explanations',
        'Randomized option order',
        'Difficulty-based question pools'
      ],
      example: `Which will output "Hello World"?

A) console.log("Hello" + " " + "World");
B) console.log("Hello", "World");
C) console.log(\`Hello World\`);
D) All of the above

Correct: D`,
      difficulty: 'Easy to Medium',
      timeEstimate: '1-3 minutes',
      languages: ['All supported languages']
    },
    {
      type: 'True/False',
      icon: CheckSquare,
      description: 'Evaluate statements about programming concepts with comprehensive explanations.',
      features: [
        'Concept verification questions',
        'Quick knowledge assessment',
        'Detailed explanations for both answers',
        'Common misconception identification',
        'Foundation building exercises',
        'Progressive concept introduction'
      ],
      example: `True or False:
JavaScript arrays can contain mixed data types.

Answer: True

Arrays are dynamically typed and can contain
strings, numbers, objects, and functions.`,
      difficulty: 'Easy',
      timeEstimate: '30 seconds - 2 minutes',
      languages: ['All supported languages']
    },
    {
      type: 'Drag & Drop',
      icon: ListChecks,
      description: 'Interactive code completion by dragging code fragments into the correct positions.',
      features: [
        'Visual drag-and-drop interface',
        'Multiple code fragment options',
        'Order-dependent validation',
        'Engaging interactive experience',
        'Supports complex code structures',
        'Immediate visual feedback'
      ],
      example: `// Drag & Drop Example
Drag the correct code fragments into place:

function sortArray(arr) {
  return arr._____(_____, _____);
}

Available fragments:
[sort] [a, b] [a - b] [b - a]

// Answer: sort, (a, b), a - b`,
      difficulty: 'Easy to Medium',
      timeEstimate: '2-5 minutes',
      languages: ['All supported languages']
    }
  ];

  const platformCapabilities = [
    {
      title: 'Advanced Code Execution Engine',
      icon: Zap,
      description: 'Secure, sandboxed environment for running and testing code across multiple languages.',
      benefits: [
        'Isolated execution prevents security risks',
        'Resource limits protect against infinite loops',
        'Real-time output capture and display',
        'Comprehensive error handling and debugging info',
        'Support for external libraries and frameworks',
        'Performance monitoring and optimization suggestions'
      ]
    },
    {
      title: 'Intelligent Auto-Grading System',
      icon: Target,
      description: 'Sophisticated grading algorithms that provide accurate assessment and meaningful feedback.',
      benefits: [
        'Test case validation with edge case coverage',
        'Partial credit for incomplete but correct solutions',
        'Code quality and style assessment',
        'Performance evaluation and benchmarking',
        'Immediate feedback generation with suggestions',
        'Learning analytics and progress tracking'
      ]
    },
    {
      title: 'Real-time Testing Platform',
      icon: Rocket,
      description: 'Live assessment environment with seamless user experience and robust session management.',
      benefits: [
        'Automatic session state management',
        'Auto-save functionality prevents data loss',
        'Visual progress indicators and time tracking',
        'Flexible time limits and attempt tracking',
        'Offline capability with sync when reconnected',
        'Mobile-responsive design for any device'
      ]
    },
    {
      title: 'Comprehensive Analytics Dashboard',
      icon: BarChart3,
      description: 'Detailed insights into performance, learning patterns, and improvement opportunities.',
      benefits: [
        'Individual progress tracking over time',
        'Question-level performance analytics',
        'Skill gap identification and recommendations',
        'Learning pattern analysis and insights',
        'Custom reporting for organizations',
        'Comparative analysis and benchmarking'
      ]
    }
  ];

  const workflowSteps = [
    {
      step: '1',
      title: 'Assessment Creation',
      description: 'Instructors create comprehensive assessments using our question bank and custom content tools.',
      details: ['Drag-and-drop question builder', 'Pre-built templates', 'Difficulty estimation tools', 'Test case generator', 'Preview before publishing']
    },
    {
      step: '2',
      title: 'Student Access & Setup',
      description: 'Students receive secure access to assigned tests with clear instructions.',
      details: ['Unique session links', 'System compatibility checks', 'Clear instructions', 'Practice mode', 'Technical support']
    },
    {
      step: '3',
      title: 'Live Assessment Experience',
      description: 'Real-time testing with immediate feedback and seamless user experience.',
      details: ['Syntax highlighting', 'Real-time error detection', 'Test case validation', 'Progress saving', 'Question navigation']
    },
    {
      step: '4',
      title: 'Automated Grading & Analysis',
      description: 'Intelligent grading with detailed feedback and performance analysis.',
      details: ['Multiple validation methods', 'Partial credit calculation', 'Performance metrics', 'Detailed feedback', 'Integrity monitoring']
    },
    {
      step: '5',
      title: 'Results & Insights',
      description: 'Comprehensive reporting for students and instructors with actionable insights.',
      details: ['Detailed score breakdowns', 'Progress recommendations', 'Class-wide analytics', 'Export capabilities', 'Learning trends']
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-overlay" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="container-section relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-mono text-5xl font-bold mb-6">
              Comprehensive Assessment <span className="text-gradient">Features</span>
            </h1>
            <p className="text-xl text-[#a1a1aa] mb-8">
              Advanced testing infrastructure with intelligent grading, real-time code execution,
              and comprehensive analytics designed for educational excellence.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-3" onClick={() => navigate('/register')}>
                Start Using Features
              </button>
              <button className="btn-secondary text-lg px-8 py-3" onClick={() => navigate('/register')}>
                Try Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Question Types Section */}
      <section className="py-20 border-t border-[#1c1c1f]">
        <div className="container-section">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-mono text-4xl font-bold mb-4">
              Six Comprehensive Question Types
            </h2>
            <p className="text-xl text-[#a1a1aa]">
              Multiple assessment formats to evaluate different aspects of coding knowledge,
              from basic syntax to complex problem-solving skills.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {questionTypes.map((qType, index) => {
              const Icon = qType.icon;
              return (
                <div key={index} className="card p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-mono text-xl font-semibold mb-2">{qType.type}</h3>
                      <div className="flex gap-2">
                        <span className="badge-blue text-xs">{qType.difficulty}</span>
                        <span className="badge-gray text-xs">{qType.timeEstimate}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[#a1a1aa] mb-4">{qType.description}</p>

                  <div className="code-block mb-4">
                    <pre className="text-sm"><code>{qType.example}</code></pre>
                  </div>

                  <div className="bg-[#0a0a0b] border-l-2 border-amber-500/50 rounded-r-lg p-4">
                    <h4 className="text-sm font-medium text-amber-400 mb-2">Key Capabilities:</h4>
                    <ul className="space-y-1 text-sm text-[#a1a1aa]">
                      {qType.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-[#6b6b70] mt-3">
                      <span className="text-amber-500">Languages: </span>
                      {qType.languages.join(', ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Capabilities Section */}
      <section className="py-20 border-t border-[#1c1c1f]">
        <div className="container-section">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-mono text-4xl font-bold mb-4">
              Enterprise-Grade Platform Capabilities
            </h2>
            <p className="text-xl text-[#a1a1aa]">
              Robust infrastructure designed for educational institutions and organizations
              requiring reliable, scalable assessment solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {platformCapabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <div key={index} className="card-hover p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="font-mono text-xl font-semibold">{capability.title}</h3>
                  </div>

                  <p className="text-[#a1a1aa] mb-4">{capability.description}</p>

                  <ul className="space-y-2">
                    {capability.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-blue-400 mb-2">Security & Performance</h4>
              <p className="text-sm text-blue-300/80">
                All code execution happens in secure, isolated environments with resource limits
                and timeout protection. The platform handles thousands of concurrent users
                while maintaining fast response times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testing Workflow Section */}
      <section className="py-20 border-t border-[#1c1c1f]">
        <div className="container-section">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-mono text-4xl font-bold mb-4">
              Complete Assessment Workflow
            </h2>
            <p className="text-xl text-[#a1a1aa]">
              End-to-end process from test creation to detailed analytics,
              designed for seamless educational experiences.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {workflowSteps.map((workflow, index) => (
              <div key={index} className="relative pl-12 pb-10 last:pb-0 border-l-2 border-amber-500/30 ml-4">
                <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-mono font-bold text-[#0a0a0b]">
                  {workflow.step}
                </div>
                <h3 className="font-mono text-xl font-semibold mb-2">{workflow.title}</h3>
                <p className="text-[#a1a1aa] mb-3">{workflow.description}</p>
                <ul className="space-y-1 text-sm text-[#6b6b70]">
                  {workflow.details.map((detail, idx) => (
                    <li key={idx}>• {detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#1c1c1f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#141416] to-[#0a0a0b]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="container-section relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-mono text-4xl font-bold mb-4">Experience These Features</h2>
            <p className="text-xl text-[#a1a1aa] mb-8">
              Ready to transform your coding education approach?
              See how these features work together to create effective learning experiences.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-3" onClick={() => navigate('/register')}>
                Try Interactive Demo
              </button>
              <button className="btn-secondary text-lg px-8 py-3" onClick={() => navigate('/register')}>
                Get Started
              </button>
              <button className="btn-secondary text-lg px-8 py-3" onClick={() => navigate('/languages')}>
                View Languages
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
