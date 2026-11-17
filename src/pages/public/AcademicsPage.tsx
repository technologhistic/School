import React from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';

export const AcademicsPage: React.FC = () => {
  const { subjects, config } = useSchoolStore();

  const divisions = [
    {
      level: 'Grades 1 – 5',
      title: 'Primary Division',
      focus: 'Literacy, bilingual fluency (English & Nepali), arithmetic foundations, and creative inquiry.',
      assessment: 'Continuous classroom observation + two terminal evaluations per academic year.',
    },
    {
      level: 'Grades 6 – 8',
      title: 'Lower Secondary Division',
      focus: 'Algebraic reasoning, integrated general science, social & civic studies, and computing fundamentals.',
      assessment: 'Unit tests, laboratory notebooks, and terminal examinations.',
    },
    {
      level: 'Grades 9 – 10',
      title: 'Secondary (SEE Preparation)',
      focus: 'National Curriculum Board aligned compulsory & elective subjects with structured lab practicums.',
      assessment: 'Terminal examinations, practical evaluations, and mock SEE assessments.',
    },
    {
      level: 'Grades 11 – 12',
      title: '+2 Science & Management',
      focus: 'NEB streams offering Physics, Chemistry, Biology, Mathematics, Computer Science, and Accountancy.',
      assessment: 'Internal term assessments alongside NEB board examinations.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-medium text-[#2B548A]">
          Academic Session {config.academicYearBS} · {config.academicYearAD}
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Academics & Curriculum Overview
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Structured progression from foundational primary grades through NEB secondary and +2 streams.
        </p>
      </div>

      {/* Divisions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {divisions.map((div) => (
          <div key={div.title} className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <div className="text-xs font-medium text-[#2B548A]">{div.level}</div>
            <h2 className="font-display text-lg font-bold text-slate-900">{div.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{div.focus}</p>
            <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
              Evaluation: {div.assessment}
            </div>
          </div>
        ))}
      </div>

      {/* Core Subjects Table */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Core Curriculum Subjects</h2>
          <p className="text-sm text-slate-600 mt-1">
            Standard secondary subjects actively tracked in our Student, Teacher, and Parent portals.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Nepali Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Weekly Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{sub.code}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{sub.name}</td>
                  <td className="py-3 px-4 text-slate-600">{sub.nameNp}</td>
                  <td className="py-3 px-4 text-slate-600">{sub.department}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-800">{sub.creditHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
