import { useNavigate } from 'react-router-dom';
import {
  Zap,
  PuzzleIcon,
  Target,
  BarChart3,
  Clock,
  Trophy,
  TrendingUp,
  Code,
  Check
} from 'lucide-react';

const ForIndividualsPage = () => {
  const navigate = useNavigate();

  const testingCategories = [
    {
      title: 'Technical Skill Assessment',
      icon: Zap,
      description: 'Comprehensive evaluation of your programming fundamentals and problem-solving abilities.',
      skills: ['Syntax mastery', 'Logic and reasoning', 'Code comprehension', 'Best practices'],
      languages: ['JavaScript', 'Python', 'HTML/CSS'],
      testTypes: ['Fill-in-the-Blank', 'Multiple Choice', 'True/False', 'Code Analysis'],
      outcome: 'Validate core programming knowledge and identify areas for improvement'
    },
    {
      title: 'Advanced Problem Solving',
      icon: PuzzleIcon,
      description: 'Challenge yourself with complex algorithmic thinking and optimization problems.',
      skills: ['Algorithm design', 'Data structure application', 'Performance optimization', 'Debugging'],
      languages: ['JavaScript', 'Python', 'TypeScript', 'React', 'SQL'],
      testTypes: ['Code Challenges', 'Debugging Exercises', 'Architecture Questions'],
      outcome: 'Demonstrate professional-level problem-solving and technical reasoning skills'
    },
    {
      title: 'Interview Preparation',
      icon: Target,
      description: 'Practice with real interview-style questions and coding challenges.',
      skills: ['Live coding simulation', 'Time management', 'Communication', 'Technical explanation'],
      languages: ['All supported languages', 'Framework-specific questions', 'System design'],
      testTypes: ['Timed Assessments', 'Code Challenges', 'Technical Interviews'],
      outcome: 'Build confidence and readiness for technical interviews and job applications'
    }
  ];

  const testingBenefits = [
    {
      title: 'Comprehensive Skill Evaluation',
      icon: BarChart3,
      description: 'Get detailed insights into your technical abilities across multiple programming areas.',
      features: [
        'Detailed performance analytics and scoring',
        'Strengths and weakness identification',
        'Skill-level benchmarking against industry standards',
        'Progress tracking over time',
        'Personalized improvement recommendations'
      ]
    },
    {
      title: 'Flexible Testing Environment',
      icon: Clock,
      description: 'Take assessments on your schedule with a user-friendly testing interface.',
      features: [
        'Access tests 24/7 from any device',
        'No installation required - browser-based testing',
        'Save and resume progress on longer assessments',
        'Multiple attempt options for skill validation',
        'Immediate feedback and detailed explanations'
      ]
    },
    {
      title: 'Career Readiness Validation',
      icon: Trophy,
      description: 'Prove your skills with industry-relevant assessments and certifications.',
      features: [
        'Employer-recognized skill verification',
        'Portfolio-worthy assessment results',
        'Interview preparation with real scenarios',
        'Certification badges for LinkedIn profiles',
        'Competitive benchmarking data'
      ]
    },
    {
      title: 'Continuous Improvement Tracking',
      icon: TrendingUp,
      description: 'Monitor your progress and track skill development over time.',
      features: [
        'Historical performance comparison',
        'Skill progression visualization',
        'Goal setting and achievement tracking',
        'Weakness-focused practice recommendations',
        'Regular assessment updates and new content'
      ]
    }
  ];

  const assessmentAreas = [
    {
      category: 'Programming Fundamentals',
      description: 'Core concepts every developer should master',
      skills: [
        { name: 'Variables & Data Types', difficulty: 'Beginner', available: true },
        { name: 'Control Structures & Logic', difficulty: 'Beginner', available: true },
        { name: 'Functions & Scope', difficulty: 'Intermediate', available: true },
        { name: 'Object-Oriented Concepts', difficulty: 'Intermediate', available: true }
      ]
    },
    {
      category: 'Data Structures & Algorithms',
      description: 'Essential problem-solving and optimization skills',
      skills: [
        { name: 'Arrays & String Manipulation', difficulty: 'Beginner', available: true },
        { name: 'Sorting & Searching Algorithms', difficulty: 'Intermediate', available: true },
        { name: 'Trees & Graph Traversal', difficulty: 'Advanced', available: false },
        { name: 'Dynamic Programming', difficulty: 'Advanced', available: false }
      ]
    },
    {
      category: 'Web Development',
      description: 'Modern web technologies and frameworks',
      skills: [
        { name: 'HTML Structure & Semantics', difficulty: 'Beginner', available: true },
        { name: 'CSS Styling & Layout', difficulty: 'Beginner', available: true },
        { name: 'JavaScript DOM Manipulation', difficulty: 'Intermediate', available: true },
        { name: 'React Component Development', difficulty: 'Intermediate', available: true }
      ]
    },
    {
      category: 'Database & Backend',
      description: 'Server-side development and data management',
      skills: [
        { name: 'SQL Query Writing', difficulty: 'Beginner', available: true },
        { name: 'Database Relationships', difficulty: 'Intermediate', available: true },
        { name: 'API Design & Implementation', difficulty: 'Advanced', available: false },
        { name: 'System Architecture', difficulty: 'Advanced', available: false }
      ]
    }
  ];

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'badge-green';
      case 'Intermediate':
        return 'badge-amber';
      case 'Advanced':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-[#0a0a0b] to-purple-500/10" />
        <div className="absolute inset-0 grid-overlay opacity-50" />

        <div className="container-section relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-amber mb-4 inline-block">Skill Assessment Platform</span>
              <h1 className="font-mono text-4xl md:text-5xl font-bold mb-6">
                Test Your{' '}
                <span className="text-gradient">Coding Skills</span>
              </h1>
              <p className="text-xl text-[#a1a1aa] mb-6">
                Comprehensive programming assessments to validate your technical abilities,
                prepare for interviews, and track your skill development over time.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                <span className="badge-gray">Skill Validation</span>
                <span className="badge-gray">Interview Prep</span>
                <span className="badge-gray">Progress Tracking</span>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  className="btn-primary px-6 py-3"
                  onClick={() => navigate('/register')}
                >
                  Start Testing
                </button>
                <button
                  className="btn-secondary px-6 py-3"
                  onClick={() => navigate('/features')}
                >
                  View Sample Questions
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-mono text-lg font-semibold text-blue-400 mb-4">
                Assessment Overview
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Available Test Categories</span>
                  <span className="badge-blue">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Supported Languages</span>
                  <span className="badge-green">14</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Question Types</span>
                  <span className="badge-purple">6</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-[#a1a1aa] mb-2">Currently Available:</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="badge-green text-xs">Fill-in-the-Blank</span>
                  <span className="badge-green text-xs">Multiple Choice</span>
                  <span className="badge-green text-xs">True/False</span>
                  <span className="badge-green text-xs">Code Challenges</span>
                  <span className="badge-green text-xs">Debugging</span>
                  <span className="badge-green text-xs">Drag & Drop</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-gray text-xs">Practice Coding</span>
                  <span className="text-xs text-[#6b6b70]">Coming Soon</span>
                </div>
              </div>

              <button
                className="btn-primary w-full"
                onClick={() => navigate('/features')}
              >
                Explore Assessments
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testing Categories */}
      <section className="py-16">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Comprehensive Testing Categories
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Evaluate your programming skills across different complexity levels
              and prepare for real-world technical challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testingCategories.map((category, index) => (
              <div
                key={index}
                className="card p-6 border-l-4 border-blue-500 bg-gradient-to-br from-[#141416] to-[#1c1c1f]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-mono text-lg font-semibold">{category.title}</h3>
                </div>

                <p className="text-[#a1a1aa] text-sm mb-4">{category.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Assessment Focus:</h4>
                  <ul className="text-xs text-[#6b6b70] space-y-1">
                    {category.skills.map((skill, idx) => (
                      <li key={idx}>• {skill}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Languages Covered:</h4>
                  <div className="flex flex-wrap gap-1">
                    {category.languages.map((lang, idx) => (
                      <span key={idx} className="badge-gray text-xs">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Test Types:</h4>
                  <div className="flex flex-wrap gap-1">
                    {category.testTypes.map((type, idx) => (
                      <span key={idx} className="badge-purple text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-l-2 border-blue-500 pl-3 bg-blue-500/5 py-2 rounded-r">
                  <p className="text-xs text-blue-400">
                    <strong>Outcome:</strong> {category.outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testing Benefits */}
      <section className="py-16 bg-[#141416]">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Why Use Our Assessment Platform?
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Designed for developers who want to validate their skills,
              prepare for interviews, and track their technical growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testingBenefits.map((benefit, index) => (
              <div key={index} className="card-hover p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-mono text-xl font-semibold">{benefit.title}</h3>
                </div>

                <p className="text-[#a1a1aa] mb-4">{benefit.description}</p>

                <div className="border-l-2 border-blue-500 pl-4 bg-blue-500/5 py-3 rounded-r">
                  <ul className="space-y-2">
                    {benefit.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Areas */}
      <section className="py-16">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Assessment Areas & Availability
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Explore the technical skills you can test today, with more
              advanced assessments and code challenges coming soon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {assessmentAreas.map((area, index) => (
              <div key={index} className="card p-6">
                <h3 className="font-mono text-lg font-semibold text-blue-400 mb-2">
                  {area.category}
                </h3>
                <p className="text-sm text-[#6b6b70] mb-4">{area.description}</p>

                <div className="space-y-3">
                  {area.skills.map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={skill.available ? 'text-[#f5f5f4] font-medium' : 'text-[#6b6b70]'}>
                          {skill.name}
                        </span>
                        <span className={`text-xs ${getDifficultyBadge(skill.difficulty)}`}>
                          {skill.difficulty}
                        </span>
                      </div>
                      {skill.available ? (
                        <span className="badge-green text-xs">Available</span>
                      ) : (
                        <span className="badge-gray text-xs">Coming Soon</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Alert */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="card p-6 border-blue-500/50 bg-blue-500/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-mono text-lg font-semibold mb-2">
                    Practice Coding Environment Coming Soon
                  </h3>
                  <p className="text-[#a1a1aa]">
                    We're developing an interactive practice environment for hands-on coding exercises
                    and interview preparation. This will complement our certificate assessments with
                    practical coding challenges to help you prepare for technical interviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="container-section">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Ready to Test Your Skills?
            </h2>
            <p className="text-[#a1a1aa] text-lg mb-8">
              Start with our available assessments today and prepare for the
              upcoming practice coding features.
            </p>
            <div className="flex justify-center gap-4 flex-wrap mb-6">
              <button
                className="btn-primary px-6 py-3"
                onClick={() => navigate('/register')}
              >
                Create Free Account
              </button>
              <button
                className="btn-secondary px-6 py-3"
                onClick={() => navigate('/features')}
              >
                Try Sample Test
              </button>
              <button
                className="btn-secondary px-6 py-3"
                onClick={() => navigate('/languages')}
              >
                View All Languages
              </button>
            </div>
            <p className="text-sm text-[#6b6b70]">
              <Check className="w-4 h-4 inline mr-2" />
              Free to start • No installation required • Immediate results
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForIndividualsPage;
