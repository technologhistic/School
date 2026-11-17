import React from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { calculateAttendanceSummary, getClassLabel } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';
import { DataStateShell } from '../../components/common/DataStateShell';

export const ParentAttendancePage: React.FC = () => {
  const state = useSchoolStore();
  const parent = state.parents.find((p) => p.id === state.activeParentId) ?? state.parents[0];
  const linkedChildren = state.students.filter((s) =>
    parent?.linkedStudentIds.includes(s.id)
  );
  const child =
    linkedChildren.find((c) => c.id === state.selectedChildId) ?? linkedChildren[0];

  const records = state.attendance
    .filter((a) => a.studentId === child?.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const summary = calculateAttendanceSummary(records);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            {child?.name} · Attendance Record
          </h2>
          <p className="text-xs text-slate-500">
            {child ? getClassLabel(state, child.classId) : ''}
          </p>
        </div>

        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg self-start">
          {linkedChildren.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => state.setSelectedChildId(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                child?.id === c.id ? 'bg-[#0F2544] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Attendance Rate</div>
          <div className="font-display text-2xl font-bold text-[#0F2544] tabular-nums mt-1">
            {summary.percentage}%
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Present</div>
          <div className="font-display text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {summary.present}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Late</div>
          <div className="font-display text-2xl font-bold text-amber-700 tabular-nums mt-1">
            {summary.late}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Absent</div>
          <div className="font-display text-2xl font-bold text-red-700 tabular-nums mt-1">
            {summary.absent}
          </div>
        </div>
      </div>

      <DataStateShell
        isEmpty={records.length === 0}
        emptyTitle="No attendance records logged"
        emptyDescription="Attendance marked in the Teacher Portal will appear here."
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
              {records.map((rec) => (
                <tr key={rec.id}>
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
                  <td className="py-3 px-4 text-xs text-slate-600">{rec.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataStateShell>
    </div>
  );
};
