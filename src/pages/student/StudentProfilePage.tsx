import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getClassLabel } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';

export const StudentProfilePage: React.FC = () => {
  const state = useSchoolStore();
  const student = state.students.find((s) => s.id === state.activeStudentId) ?? state.students[0];

  const [emailDemo, setEmailDemo] = useState(student?.emailDemo ?? '');
  const [phoneDemo, setPhoneDemo] = useState(student?.phoneDemo ?? '');
  const [addressDemo, setAddressDemo] = useState(student?.addressDemo ?? '');
  const [guardianName, setGuardianName] = useState(student?.guardianName ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  if (!student) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDemo.trim())) next.emailDemo = 'Enter a valid demo email address.';
    if (!/^[+\d\s-]{7,18}$/.test(phoneDemo.trim())) next.phoneDemo = 'Enter a valid demo contact number.';
    if (addressDemo.trim().length < 4) next.addressDemo = 'Enter a valid local address.';
    if (guardianName.trim().length < 2) next.guardianName = 'Enter guardian name.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    state.updateStudent(student.id, {
      emailDemo: emailDemo.trim(),
      phoneDemo: phoneDemo.trim(),
      addressDemo: addressDemo.trim(),
      guardianName: guardianName.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">{student.name}</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {getClassLabel(state, student.classId)} · Roll No. {student.rollNumber}
            </p>
          </div>
          <div className="text-xs text-slate-500">
            DOB: <DateDisplay date={student.dateOfBirthAD} />
          </div>
        </div>

        {saved && (
          <div className="mt-5 p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Demo profile fields updated in local state.</span>
          </div>
        )}

        <form onSubmit={handleSave} noValidate className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stu-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Demo Student Email *
              </label>
              <input
                id="stu-email"
                type="email"
                value={emailDemo}
                onChange={(e) => setEmailDemo(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
              {errors.emailDemo && <p className="text-xs text-red-600 mt-1">{errors.emailDemo}</p>}
            </div>

            <div>
              <label htmlFor="stu-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Demo Contact Number *
              </label>
              <input
                id="stu-phone"
                type="tel"
                value={phoneDemo}
                onChange={(e) => setPhoneDemo(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
              {errors.phoneDemo && <p className="text-xs text-red-600 mt-1">{errors.phoneDemo}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stu-guardian" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Guardian Name *
              </label>
              <input
                id="stu-guardian"
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
              {errors.guardianName && <p className="text-xs text-red-600 mt-1">{errors.guardianName}</p>}
            </div>

            <div>
              <label htmlFor="stu-address" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Residential Address *
              </label>
              <input
                id="stu-address"
                type="text"
                value={addressDemo}
                onChange={(e) => setAddressDemo(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
              {errors.addressDemo && <p className="text-xs text-red-600 mt-1">{errors.addressDemo}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
