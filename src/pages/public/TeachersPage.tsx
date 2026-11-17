import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { DataStateShell } from '../../components/common/DataStateShell';

export const TeachersPage: React.FC = () => {
  const { teachers, subjects } = useSchoolStore();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  const departments = useMemo(
    () => ['All', ...Array.from(new Set(teachers.map((t) => t.department)))],
    [teachers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      const deptOk = department === 'All' || t.department === department;
      const queryOk =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.designation.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q);
      return deptOk && queryOk;
    });
  }, [teachers, search, department]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="max-w-3xl space-y-2">
        <div className="text-xs font-medium text-[#2B548A]">Faculty & Staff Directory</div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Meet Our Educators</h1>
        <p className="text-sm text-slate-600">
          Filter department leads and subject teachers across primary, secondary, and +2 divisions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartment(dept)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                department === dept
                  ? 'bg-[#0F2544] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2544]"
          />
        </div>
      </div>

      <DataStateShell
        isEmpty={filtered.length === 0}
        emptyTitle="No faculty match your filter"
        emptyDescription="Clear the search term or select 'All' departments."
        emptyActionLabel="Reset Filter"
        onEmptyAction={() => {
          setSearch('');
          setDepartment('All');
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((teacher) => {
            const subNames = teacher.subjectIds
              .map((sid) => subjects.find((s) => s.id === sid)?.name)
              .filter(Boolean)
              .join(', ');
            return (
              <div
                key={teacher.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="text-xs text-slate-500">
                    {teacher.department} · {teacher.experienceYears} yrs experience
                  </div>
                  <h2 className="font-display text-lg font-bold text-slate-900 mt-1">
                    {teacher.name}
                  </h2>
                  <div className="text-xs font-medium text-[#2B548A] mt-0.5">
                    {teacher.designation}
                  </div>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">{teacher.bio}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  <div>
                    <span className="font-medium text-slate-700">Subjects:</span> {subNames || 'General'}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Qualification:</span>{' '}
                    {teacher.qualification}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 pt-1">
                    {teacher.emailDemo}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DataStateShell>
    </div>
  );
};
