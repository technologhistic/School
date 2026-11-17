import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';

export const AdminSettingsPage: React.FC = () => {
  const { config, updateConfig } = useSchoolStore();
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Configurable School Identity & Content
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Changes made here immediately update the public website header, About page, Contact details, and footer.
            </p>
          </div>
        </div>

        {saved && (
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>School configuration updated across public website and portals.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                School Name (English)
              </label>
              <input
                type="text"
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                School Name (Nepali)
              </label>
              <input
                type="text"
                value={form.schoolNameNp}
                onChange={(e) => setForm({ ...form, schoolNameNp: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Year (BS)
              </label>
              <input
                type="text"
                value={form.academicYearBS}
                onChange={(e) => setForm({ ...form, academicYearBS: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Year (AD)
              </label>
              <input
                type="text"
                value={form.academicYearAD}
                onChange={(e) => setForm({ ...form, academicYearAD: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Active Term
              </label>
              <input
                type="text"
                value={form.activeTerm}
                onChange={(e) => setForm({ ...form, activeTerm: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Principal Name & Message
            </label>
            <input
              type="text"
              value={form.principalName}
              onChange={(e) => setForm({ ...form, principalName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg mb-2"
            />
            <textarea
              rows={3}
              value={form.principalMessage}
              onChange={(e) => setForm({ ...form, principalMessage: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              School History (Public About Page)
            </label>
            <textarea
              rows={3}
              value={form.aboutHistory}
              onChange={(e) => setForm({ ...form, aboutHistory: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors"
          >
            Save School Settings
          </button>
        </form>
      </div>

    </div>
  );
};
