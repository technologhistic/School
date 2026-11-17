import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';

export const ContactPage: React.FC = () => {
  const { config, submitContactInquiry } = useSchoolStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (subject.trim().length < 3) next.subject = 'Please enter a short subject.';
    if (message.trim().length < 10) next.message = 'Please enter at least 10 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitContactInquiry({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    setSent(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-3xl space-y-2">
        <div className="text-xs font-medium text-[#2B548A]">School Administration Office</div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Contact & Campus Location</h1>
        <p className="text-sm text-slate-600">
          Reach our admissions and administrative desk during campus office hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">{config.schoolName}</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0F2544] shrink-0 mt-0.5" />
                <span>
                  {config.address}, {config.city}
                </span>
              </div>
              <div className="flex items-center gap-3 tabular-nums">
                <Phone className="w-4 h-4 text-[#0F2544] shrink-0" />
                <span>{config.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#0F2544] shrink-0" />
                <span>{config.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#0F2544] shrink-0" />
                <span>{config.officeHours}</span>
              </div>
            </div>
          </div>

          {/* Campus Location Map Placeholder */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-[#EEF2F6] h-56 relative flex items-center justify-center p-6">
              <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden="true">
                <rect width="320" height="180" fill="#EEF2F6" />
                <path d="M0 95 L320 70" stroke="#CBD5E1" strokeWidth="8" />
                <path d="M135 0 L155 180" stroke="#CBD5E1" strokeWidth="6" />
                <path d="M40 30 L280 150" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="4 4" />
                <circle cx="145" cy="83" r="16" fill="#0F2544" opacity="0.15" />
                <circle cx="145" cy="83" r="7" fill="#0F2544" />
                <rect x="158" y="66" width="124" height="28" rx="4" fill="#FFFFFF" stroke="#CBD5E1" />
                <text x="166" y="84" fill="#0F2544" fontSize="10" fontWeight="600">
                  Campus Main Gate
                </text>
              </svg>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 text-xs font-mono text-slate-600">
              {config.mapCoordinatesLabel}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-slate-900">Send an Inquiry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Have a question about admissions, curriculum, or campus visits? Send us a message below.
          </p>

          {sent && (
            <div className="mt-5 p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold">Inquiry Recorded</div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Thank you for contacting our school office. Your inquiry has been saved for administrative review.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cnt-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  id="cnt-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="cnt-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  id="cnt-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="cnt-subject" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject *
              </label>
              <input
                id="cnt-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Campus tour appointment or fee structure inquiry"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
              {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="cnt-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Message *
              </label>
              <textarea
                id="cnt-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your question for the school office..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
              {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors"
            >
              Submit Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
