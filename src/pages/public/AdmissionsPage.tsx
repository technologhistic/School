import React, { useState } from 'react';
import { CheckCircle2, FileText } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';

export const AdmissionsPage: React.FC = () => {
  const { config, submitAdmission } = useSchoolStore();

  const [applicantName, setApplicantName] = useState('');
  const [grade, setGrade] = useState('Grade 6');
  const [guardianName, setGuardianName] = useState('');
  const [contactDemo, setContactDemo] = useState('');
  const [emailDemo, setEmailDemo] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [statement, setStatement] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (applicantName.trim().length < 2) next.applicantName = 'Enter the applicant full name.';
    if (guardianName.trim().length < 2) next.guardianName = 'Enter parent or guardian full name.';
    if (!/^[+\d\s-]{7,18}$/.test(contactDemo.trim())) next.contactDemo = 'Enter a valid contact number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDemo.trim())) next.emailDemo = 'Enter a valid email address.';
    if (previousSchool.trim().length < 2) next.previousSchool = 'Enter previous school or "First Enrollment".';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const created = submitAdmission({
      applicantName: applicantName.trim(),
      grade,
      guardianName: guardianName.trim(),
      contactDemo: contactDemo.trim(),
      emailDemo: emailDemo.trim(),
      previousSchool: previousSchool.trim(),
      statement: statement.trim() || 'Interested in joining the upcoming academic session.',
    });
    setSubmittedRef(created.id.toUpperCase());
    setApplicantName('');
    setGuardianName('');
    setContactDemo('');
    setEmailDemo('');
    setPreviousSchool('');
    setStatement('');
    setErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-medium text-[#2B548A]">
          Admissions Open · {config.academicYearBS} ({config.academicYearAD})
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Admissions Process & Inquiry Form
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Learn how prospective families join {config.schoolName} and submit an admission inquiry for review by our administrative office.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Process & Requirements */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Admission Steps</h2>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="font-mono text-xs font-semibold text-[#2B548A] mt-0.5">01.</span>
                <span>Submit the preliminary inquiry form with grade preference and guardian contact.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs font-semibold text-[#2B548A] mt-0.5">02.</span>
                <span>Attend a scheduled campus tour and informal student readiness interaction.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs font-semibold text-[#2B548A] mt-0.5">03.</span>
                <span>Present transfer certificate, previous grade sheet, and birth registration copy at the office.</span>
              </li>
            </ol>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText className="w-4 h-4 text-[#0F2544]" />
              <span>Required Documents (At Enrollment)</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
              <li>Copy of Municipal Birth Registration Certificate</li>
              <li>Previous school academic transcript / mark sheet</li>
              <li>Original Transfer Certificate (Grade 2 and above)</li>
              <li>Two recent passport-size photographs</li>
            </ul>
          </div>
        </div>

        {/* Validated Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-slate-900">Admission Inquiry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete the student and parent/guardian details below to request an admissions review.
          </p>

          {submittedRef && (
            <div className="mt-5 p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold">Admission Inquiry Recorded ({submittedRef})</div>
                <p className="text-xs mt-1 text-emerald-800">
                  Your inquiry has been submitted to the admissions office for review.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adm-student" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Full Name *
                </label>
                <input
                  id="adm-student"
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Kabir Sharma"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                {errors.applicantName && <p className="text-xs text-red-600 mt-1">{errors.applicantName}</p>}
              </div>

              <div>
                <label htmlFor="adm-grade" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Applying For Grade *
                </label>
                <select
                  id="adm-grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0F2544]"
                >
                  {[
                    'Grade 1',
                    'Grade 2',
                    'Grade 3',
                    'Grade 4',
                    'Grade 5',
                    'Grade 6',
                    'Grade 7',
                    'Grade 8',
                    'Grade 9',
                    'Grade 11 (Science)',
                    'Grade 11 (Management)',
                  ].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adm-guardian" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Parent / Guardian Name *
                </label>
                <input
                  id="adm-guardian"
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                {errors.guardianName && <p className="text-xs text-red-600 mt-1">{errors.guardianName}</p>}
              </div>

              <div>
                <label htmlFor="adm-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Number *
                </label>
                <input
                  id="adm-phone"
                  type="tel"
                  value={contactDemo}
                  onChange={(e) => setContactDemo(e.target.value)}
                  placeholder="+977-9800000000"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                {errors.contactDemo && <p className="text-xs text-red-600 mt-1">{errors.contactDemo}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adm-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  id="adm-email"
                  type="email"
                  value={emailDemo}
                  onChange={(e) => setEmailDemo(e.target.value)}
                  placeholder="guardian@example.edu.np"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                {errors.emailDemo && <p className="text-xs text-red-600 mt-1">{errors.emailDemo}</p>}
              </div>

              <div>
                <label htmlFor="adm-prev" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Previous School *
                </label>
                <input
                  id="adm-prev"
                  type="text"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  placeholder="Previous school name"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                {errors.previousSchool && <p className="text-xs text-red-600 mt-1">{errors.previousSchool}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="adm-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student Interests / Notes
              </label>
              <textarea
                id="adm-notes"
                rows={3}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Optional academic interests or questions for the admissions office..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors"
            >
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
