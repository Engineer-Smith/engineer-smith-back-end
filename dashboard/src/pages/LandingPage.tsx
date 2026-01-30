import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Bug, PenLine, Play, CheckCircle, Rocket, LogIn } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoScenarios = [
    {
      type: 'Code Challenge',
      language: 'JavaScript',
      question: 'Implement a function to find the longest palindrome',
      code: `function longestPalindrome(s) {
  // Your implementation here
  return "";
}`,
      difficulty: 'Medium',
      points: 15
    },
    {
      type: 'Fill-in-the-Blank',
      language: 'Python',
      question: 'Complete the binary search implementation',
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + ______) // 2
        # ... rest of implementation`,
      difficulty: 'Easy',
      points: 8
    },
    {
      type: 'Code Debugging',
      language: 'React',
      question: 'Fix the infinite re-render loop',
      code: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }); // Missing dependency array`,
      difficulty: 'Hard',
      points: 20
    }
  ];

  const useCases = [
    {
      icon: Code,
      title: 'Individual Learners',
      description: 'Take comprehensive coding assessments, track progress, and validate your skills across multiple programming languages.',
      features: ['Self-paced learning', 'Progress tracking', 'Skill validation', 'Career development'],
      cta: 'Explore Individual Learning',
      path: '/for-individuals'
    },
    {
      icon: Bug,
      title: 'Educational Organizations',
      description: 'Complete institutional management with custom content creation, role-based access, and detailed analytics.',
      features: ['Student management', 'Custom assessments', 'Instructor tools', 'Analytics dashboard'],
      cta: 'Learn About Organizations',
      path: '/for-organizations'
    },
    {
      icon: PenLine,
      title: 'Assessment Platform',
      description: 'Advanced testing infrastructure with multiple question types, auto-grading, and real-time code execution.',
      features: ['Code challenges', 'Auto-grading', 'Multiple formats', 'Secure execution'],
      cta: 'Explore Features',
      path: '/features'
    }
  ];

  const quickStats = [
    { number: '14', label: 'Programming Languages' },
    { number: '6', label: 'Question Types' },
    { number: '3', label: 'User Roles' },
    { number: '∞', label: 'Organizations' }
  ];

  const languages = [
    'JavaScript', 'Python', 'TypeScript', 'React/JSX', 'Swift', 'SwiftUI', 'Flutter', 'SQL', 'HTML/CSS'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoScenarios.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'badge-green';
      case 'Medium': return 'badge-amber';
      case 'Hard': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay" />

        {/* Gradient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl" />

        <div className="container-section relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Hero text */}
            <div>
              <div className="mb-6">
                <span className="badge-amber text-sm font-mono">
                  Professional Assessment Platform
                </span>
              </div>

              <h1 className="font-mono text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                <span className="text-gradient">EngineerSmith</span>
                <span className="block text-2xl lg:text-3xl text-[#a1a1aa] mt-3 font-normal">
                  Code Assessment & Testing Platform
                </span>
              </h1>

              <p className="text-xl text-[#a1a1aa] mb-8 leading-relaxed max-w-xl">
                Comprehensive educational testing platform with advanced code execution,
                intelligent grading, and organizational management.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                <span className="badge-green">Auto-Grading Engine</span>
                <span className="badge-blue">Multi-Language Support</span>
                <span className="badge-amber">Real-time Testing</span>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
                  onClick={() => navigate('/register')}
                >
                  <Rocket className="w-5 h-5" />
                  Get Started
                </button>
                <button
                  className="btn-secondary text-lg px-8 py-3"
                  onClick={() => navigate('/features')}
                >
                  View Demo
                </button>
              </div>

              <p className="text-sm text-[#6b6b70]">
                Individual learners • Educational institutions • Enterprise teams
              </p>
            </div>

            {/* Right column - Code demo card */}
            <div className="card p-6 glow-amber">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="badge-blue">{demoScenarios[currentDemo].language}</span>
                  <span className="badge-gray">{demoScenarios[currentDemo].type}</span>
                  <span className={getDifficultyColor(demoScenarios[currentDemo].difficulty)}>
                    {demoScenarios[currentDemo].difficulty}
                  </span>
                </div>
                <span className="text-amber-500 font-mono font-semibold">
                  {demoScenarios[currentDemo].points} pts
                </span>
              </div>

              <h3 className="text-lg font-medium text-amber-400 mb-4">
                {demoScenarios[currentDemo].question}
              </h3>

              <div className="code-block mb-4">
                <pre className="text-[#e4e4e7]">
                  <code>{demoScenarios[currentDemo].code}</code>
                </pre>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-green-500 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Auto-graded with test cases
                </span>
                <button className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Run Tests
                </button>
              </div>

              {/* Progress indicator */}
              <div className="mt-4">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((currentDemo + 1) / demoScenarios.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#6b6b70] mt-2">
                  Question {currentDemo + 1} of {demoScenarios.length} in demo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 border-y border-[#1c1c1f]">
        <div className="container-section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center">
                <h2 className="font-mono text-4xl font-bold text-amber-500 mb-2">
                  {stat.number}
                </h2>
                <p className="text-[#a1a1aa]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container-section">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-mono text-4xl font-bold mb-4">
              Built for Every Learning Environment
            </h2>
            <p className="text-xl text-[#a1a1aa]">
              Whether you're an individual learner, educational institution, or exploring our platform capabilities,
              we have solutions tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={index}
                  className="card-hover p-8 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Icon className="w-8 h-8 text-amber-500" />
                  </div>

                  <h3 className="font-mono text-xl font-semibold mb-3">
                    {useCase.title}
                  </h3>

                  <p className="text-[#a1a1aa] mb-6">
                    {useCase.description}
                  </p>

                  <div className="bg-[#0a0a0b] border-l-2 border-amber-500/50 rounded-r-lg p-4 mb-6 text-left">
                    <ul className="space-y-2 text-sm">
                      {useCase.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[#a1a1aa]">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="btn-secondary w-full"
                    onClick={() => navigate(useCase.path)}
                  >
                    {useCase.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Language Support */}
      <section className="py-20 border-t border-[#1c1c1f]">
        <div className="container-section">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="font-mono text-3xl font-bold mb-4">
              Multi-Language Assessment Engine
            </h3>
            <p className="text-xl text-[#a1a1aa] mb-8">
              Comprehensive support for modern programming languages with secure code execution and intelligent validation.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {languages.map((lang, index) => (
                <span key={index} className="badge-green text-sm">
                  {lang}
                </span>
              ))}
              <span className="badge-blue text-sm">+ More</span>
            </div>

            <button
              className="btn-secondary text-lg px-8 py-3"
              onClick={() => navigate('/languages')}
            >
              View All Languages & Features
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#141416] to-[#0a0a0b]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="container-section relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-mono text-4xl font-bold mb-6">
              Ready to Start?
            </h2>
            <p className="text-xl text-[#a1a1aa] mb-8">
              Join thousands of learners and educators using our comprehensive assessment platform.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                onClick={() => navigate('/register')}
              >
                <Rocket className="w-5 h-5" />
                Get Started
              </button>
              <button
                className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
                onClick={() => navigate('/login')}
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
