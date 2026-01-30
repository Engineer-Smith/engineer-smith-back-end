// src/pages/ContactPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Check,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User
} from 'lucide-react';

export default function ContactPage() {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: 'general',
    message: ''
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
          <h2 className="font-mono text-2xl font-bold mb-3">Message Sent!</h2>
          <p className="text-[#a1a1aa] mb-6">
            Thank you for reaching out. We'll get back to you within 24-48 hours.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-500/10 to-transparent">
        <div className="container-section py-12">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary mb-6 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h1 className="font-mono text-4xl font-bold text-[#f5f5f4] mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-[#a1a1aa] max-w-2xl">
            Have questions about Engineer Smith? We'd love to hear from you.
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="container-section py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-4 border-b border-[#2a2a2e]">
                <h2 className="font-mono font-semibold flex items-center gap-2">
                  <MessageSquare size={18} />
                  Send us a message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Name <span className="text-red-400">*</span>
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
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="input w-full pl-10"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company/Organization
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="input w-full pl-10"
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="input w-full pl-10"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className="select w-full"
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="demo">Request a Demo</option>
                    <option value="pricing">Pricing Information</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className="input w-full resize-none"
                    rows={5}
                    placeholder="Tell us how we can help..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-mono font-semibold mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#f5f5f4]">Email</p>
                    <a href="mailto:hello@engineersmith.com" className="text-blue-400 hover:text-blue-300">
                      hello@engineersmith.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#f5f5f4]">Phone</p>
                    <a href="tel:+1-555-000-0000" className="text-blue-400 hover:text-blue-300">
                      +1 (555) 000-0000
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-mono font-semibold mb-4">Office Hours</h3>
              <div className="space-y-2 text-[#a1a1aa]">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="text-[#f5f5f4]">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-[#f5f5f4]">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-[#6b6b70]">Closed</span>
                </div>
              </div>
              <p className="text-xs text-[#6b6b70] mt-4">
                All times are in Eastern Time (ET)
              </p>
            </div>

            <div className="card p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <h3 className="font-mono font-semibold mb-2">Need Immediate Help?</h3>
              <p className="text-[#a1a1aa] text-sm mb-4">
                Check our documentation and FAQ for quick answers to common questions.
              </p>
              <button
                onClick={() => navigate('/features')}
                className="btn-secondary w-full"
              >
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
