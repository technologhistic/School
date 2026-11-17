import React, { useMemo, useState } from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { calculateAttendanceSummary } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';
import { DataStateShell } from '../../components/common/DataStateShell';
import { AttendanceStatus } from '../../types/school';

export const StudentAttendancePage: React.FC = () => {
  const { attendance, activeStudentId, students } = useSchoolStore();
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];
  const [filter, setFilter] = useState<'all' | AttendanceStatus>('all');

  const records = useMemo(
    () =>
      attendance
        .filter((a) => a.studentId === student?.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [attendance, student?.id]
  );

  const summary = calculateAttendanceSummary(records);
  const filtered = filter === 'all' ? records : records.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Overall Attendance</div>
          <div className="font-display text-2xl font-bold text-[#0F2544] tabular-nums mt-1">
            {summary.percentage}%
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Present Days</div>
          <div className="font-display text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {summary.present}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Late Arrivals</div>
          <div className="font-display text-2xl font-bold text-amber-700 tabular-nums mt-1">
            {summary.late}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Absent Days</div>
          <div className="font-display text-2xl font-bold text-red-700 tabular-nums mt-1">
            {summary.absent}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
          {(['all', 'present', 'late', 'absent'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                filter === st ? 'bg-[#0F2544] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 tabular-nums">{filtered.length} records shown</div>
      </div>

      <DataStateShell
        isEmpty={filtered.length === 0}
        emptyTitle="No attendance entries for this filter"
        emptyDescription="Select 'All' to view your complete attendance log."
        emptyActionLabel="Show All"
        onEmptyAction={() => setFilter('all')}
      >
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <DateDisplay date={rec.date} />
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-semibold capitalize ${
                        rec.status === 'present'
                          ? 'text-emerald-700'
                          : rec.status === 'late'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{rec.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataStateShell>
    </div>
  );
};
