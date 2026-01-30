import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, Shield, Trophy, Check, Rocket, Building2, GraduationCap, Briefcase } from 'lucide-react';

const ForOrganizationsPage = () => {
  const navigate = useNavigate();

  const platformFeatures = [
    {
      title: 'Multi-User Management',
      icon: Users,
      description: 'Organize users with role-based permissions designed for educational and training environments.',
      features: [
        'Admin, Instructor, and Student role types',
        'Bulk user registration and management',
        'Customizable permissions per role',
        'User activity and assessment progress tracking'
      ]
    },
    {
      title: 'Assessment Organization',
      icon: ClipboardList,
      description: 'Centralized tools for managing and administering coding assessments across your organization.',
      features: [
        'Assign assessments to user groups',
        'Track completion rates and progress',
        'Generate performance reports and analytics',
        'Export data for external analysis'
      ]
    },
    {
      title: 'Security & Integration',
      icon: Shield,
      description: 'Enterprise-grade security features and integration capabilities for institutional use.',
      features: [
        'Single Sign-On (SSO) support',
        'User authentication integration',
        'Secure data handling and storage',
        'API access for custom integrations'
      ]
    },
    {
      title: 'Certification Features',
      icon: Trophy,
      description: 'Tools for managing skill validation and certification processes.',
      features: [
        'Certificate generation for completed assessments',
        'Skill verification and validation',
        'Progress tracking and reporting',
        'Custom certification criteria'
      ]
    }
  ];

  const userRoles = [
    {
      role: 'Administrator',
      responsibilities: [
        'Manage organizational settings',
        'Add and remove users',
        'Access all reports and analytics',
        'Configure integrations and security'
      ]
    },
    {
      role: 'Instructor',
      responsibilities: [
        'Assign assessments to students',
        'Monitor student progress',
        'Generate class reports',
        'Provide feedback and guidance'
      ]
    },
    {
      role: 'Student',
      responsibilities: [
        'Take assigned assessments',
        'View personal progress',
        'Access certificates',
        'Review feedback and recommendations'
      ]
    }
  ];

  const organizationTypes = [
    {
      type: 'Educational Institutions',
      icon: GraduationCap,
      description: 'Universities, colleges, and schools using coding assessments for coursework evaluation',
      benefits: [
        'Standardized assessment across multiple sections',
        'Consistent grading and evaluation',
        'Progress tracking for student cohorts',
        'Data-driven curriculum insights'
      ]
    },
    {
      type: 'Corporate Training',
      icon: Briefcase,
      description: 'Companies implementing technical skills assessment for employee development',
      benefits: [
        'Skills validation for training programs',
        'Progress tracking for development initiatives',
        'Integration with existing HR systems',
        'Evidence-based skill certification'
      ]
    },
    {
      type: 'Professional Programs',
      icon: Building2,
      description: 'Bootcamps and certification programs requiring standardized skill evaluation',
      benefits: [
        'Consistent graduate skill validation',
        'Industry-standard assessment practices',
        'Credential management and verification',
        'Program effectiveness measurement'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-[#0a0a0b] to-blue-500/10" />
        <div className="absolute inset-0 grid-overlay opacity-50" />

        <div className="container-section relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-amber mb-4 inline-block">Enterprise Testing Platform</span>
              <h1 className="font-mono text-4xl md:text-5xl font-bold mb-6">
                Coding Assessment for{' '}
                <span className="text-gradient">Organizations</span>
              </h1>
              <p className="text-xl text-[#a1a1aa] mb-6">
                Comprehensive skill testing platform with user management,
                assessment administration, and certification tools designed
                for educational institutions and training programs.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                <span className="badge-gray">Role-Based Access</span>
                <span className="badge-gray">Assessment Management</span>
                <span className="badge-gray">Progress Tracking</span>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  className="btn-primary px-6 py-3"
                  onClick={() => navigate('/features')}
                >
                  Request Demo
                </button>
                <button
                  className="btn-secondary px-6 py-3"
                  onClick={() => navigate('/features')}
                >
                  Contact Sales
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-mono text-lg font-semibold text-amber-500 mb-4">
                Platform Capabilities
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">User Role Types</span>
                  <span className="badge-blue">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Assessment Categories</span>
                  <span className="badge-green">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Question Types</span>
                  <span className="badge-purple">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Programming Languages</span>
                  <span className="badge-amber">14</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-[#a1a1aa] mb-2">Available Now:</h4>
                <div className="flex flex-wrap gap-1">
                  <span className="badge-gray text-xs">Fill-in-the-Blank</span>
                  <span className="badge-gray text-xs">Multiple Choice</span>
                  <span className="badge-gray text-xs">True/False</span>
                  <span className="badge-gray text-xs">Code Challenges</span>
                  <span className="badge-gray text-xs">Debugging</span>
                  <span className="badge-gray text-xs">Drag & Drop</span>
                </div>
              </div>

              <button
                className="btn-primary w-full"
                onClick={() => navigate('/features')}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Built for Organizational Assessment
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Comprehensive tools designed to manage coding assessments
              across educational institutions and training programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="card-hover p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-mono text-xl font-semibold">{feature.title}</h3>
                </div>

                <p className="text-[#a1a1aa] mb-4">{feature.description}</p>

                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-[#6b6b70]">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-16 bg-[#141416]">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Three User Role Types
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Structured access control with clear responsibilities
              for different types of users in your organization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {userRoles.map((role, index) => (
              <div
                key={index}
                className="border-l-4 border-purple-500 bg-purple-500/5 p-6 rounded-r-lg"
              >
                <h3 className="font-mono text-lg font-semibold text-purple-400 mb-4">
                  {role.role}
                </h3>
                <ul className="space-y-2">
                  {role.responsibilities.map((responsibility, idx) => (
                    <li key={idx} className="text-[#a1a1aa] text-sm flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Types */}
      <section className="py-16">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Designed for Different Organization Types
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Flexible platform that adapts to various educational
              and training environments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {organizationTypes.map((org, index) => (
              <div key={index} className="card-hover p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <org.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-mono text-lg font-semibold text-blue-400 mb-2">
                  {org.type}
                </h3>
                <p className="text-[#6b6b70] text-sm mb-4">{org.description}</p>

                <div className="border-l-2 border-green-500 pl-4 bg-green-500/5 py-3 rounded-r">
                  <h4 className="text-sm font-medium text-green-400 mb-2">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {org.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-xs text-[#a1a1aa]">
                        • {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 bg-[#141416]">
        <div className="container-section">
          <div className="max-w-3xl mx-auto">
            <div className="card p-6 border-blue-500/50 bg-blue-500/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-mono text-lg font-semibold mb-2">Getting Started</h3>
                  <p className="text-[#a1a1aa]">
                    Organizations can get started with user setup, role configuration,
                    and assessment assignment. We provide guidance for platform setup
                    and user onboarding to ensure successful implementation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="container-section">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-mono text-3xl font-bold mb-4">
              Ready to Implement Organizational Testing?
            </h2>
            <p className="text-[#a1a1aa] text-lg mb-8">
              Get started with a comprehensive coding assessment platform
              designed for educational institutions and training programs.
            </p>
            <div className="flex justify-center gap-4 flex-wrap mb-6">
              <button
                className="btn-primary px-6 py-3"
                onClick={() => navigate('/features')}
              >
                Schedule Demo
              </button>
              <button
                className="btn-secondary px-6 py-3"
                onClick={() => navigate('/features')}
              >
                Get Information
              </button>
              <button
                className="btn-secondary px-6 py-3"
                onClick={() => navigate('/features')}
              >
                Contact Us
              </button>
            </div>
            <p className="text-sm text-[#6b6b70]">
              <Shield className="w-4 h-4 inline mr-2" />
              Secure platform • Role-based access • Assessment management
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForOrganizationsPage;
