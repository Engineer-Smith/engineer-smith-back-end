// src/pages/DemoPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Code,
  Loader2,
  Mail,
  Play,
  Send,
  User,
  Users
} from 'lucide-react';

export default function DemoPage() {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    teamSize: '',
    useCase: '',
    preferredTime: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6">
        <div className="card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="font-mono text-2xl font-bold mb-3">Demo Requested!</h2>
          <p className="text-[#a1a1aa] mb-6">
            Thank you for your interest! Our team will reach out within 24 hours to schedule your personalized demo.
          </p>
          <div className="space-y-3">
            <button onClick={() => navigate('/features')} className="btn-primary w-full">
              Explore Features
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary w-full">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-500/10 to-transparent">
        <div className="container-section py-12">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary mb-6 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-mono text-4xl font-bold text-[#f5f5f4] mb-4">
                See Engineer Smith in Action
              </h1>
              <p className="text-xl text-[#a1a1aa] mb-6">
                Get a personalized walkthrough of our platform and see how it can transform your technical assessments and coding education.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[#a1a1aa]">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>30-minute personalized demo</span>
                </div>
                <div className="flex items-center gap-3 text-[#a1a1aa]">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>See all features in action</span>
                </div>
                <div className="flex items-center gap-3 text-[#a1a1aa]">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Q&A with our product team</span>
                </div>
                <div className="flex items-center gap-3 text-[#a1a1aa]">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Custom pricing discussion</span>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-[#2a2a2e] bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <h2 className="font-mono font-semibold flex items-center gap-2">
                  <Play size={18} className="text-purple-400" />
                  Request Your Demo
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="input w-full pl-10"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Work Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="input w-full pl-10"
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="input w-full pl-10"
                        placeholder="Acme Inc."
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Role <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="select w-full"
                      required
                    >
                      <option value="">Select your role</option>
                      <option value="educator">Educator/Instructor</option>
                      <option value="admin">School Administrator</option>
                      <option value="hr">HR/Talent Acquisition</option>
                      <option value="engineering">Engineering Manager</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Team Size <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                      <select
                        value={formData.teamSize}
                        onChange={(e) => handleChange('teamSize', e.target.value)}
                        className="select w-full pl-10"
                        required
                      >
                        <option value="">Select team size</option>
                        <option value="1-10">1-10 users</option>
                        <option value="11-50">11-50 users</option>
                        <option value="51-200">51-200 users</option>
                        <option value="201-500">201-500 users</option>
                        <option value="500+">500+ users</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preferred Time
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => handleChange('preferredTime', e.target.value)}
                        className="select w-full pl-10"
                      >
                        <option value="">Any time works</option>
                        <option value="morning">Morning (9AM-12PM ET)</option>
                        <option value="afternoon">Afternoon (12PM-5PM ET)</option>
                        <option value="evening">Evening (5PM-7PM ET)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Use Case <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Code className="absolute left-3 top-3 w-4 h-4 text-[#6b6b70]" />
                    <textarea
                      value={formData.useCase}
                      onChange={(e) => handleChange('useCase', e.target.value)}
                      className="input w-full pl-10 resize-none"
                      rows={3}
                      placeholder="Tell us about your assessment needs..."
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Request Demo
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-[#6b6b70]">
                  By submitting, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="container-section py-16">
        <h2 className="font-mono text-2xl font-bold text-center mb-8">
          What You'll See in the Demo
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Question Bank',
              description: 'Create and manage coding questions with multiple types including fill-in-blank, code challenges, and more.',
              color: 'blue'
            },
            {
              title: 'Test Builder',
              description: 'Build comprehensive assessments with sections, time limits, and automatic grading.',
              color: 'purple'
            },
            {
              title: 'Analytics Dashboard',
              description: 'Track student performance with detailed analytics and insights.',
              color: 'green'
            }
          ].map((feature, index) => (
            <div key={index} className={`card p-6 border-t-4 border-${feature.color}-500`}>
              <h3 className="font-mono font-semibold mb-2">{feature.title}</h3>
              <p className="text-[#a1a1aa] text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
