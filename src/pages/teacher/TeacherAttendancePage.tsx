import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { AttendanceStatus } from '../../types/school';
import { DateDisplay } from '../../components/common/DateDisplay';

export const TeacherAttendancePage: React.FC = () => {
  const state = useSchoolStore();
  const teacher = state.teachers.find((t) => t.id === state.activeTeacherId) ?? state.teachers[0];
  const assignedClasses = state.classes.filter((c) => teacher?.classIds.includes(c.id));

  const [classId, setClassId] = useState(assignedClasses[0]?.id ?? state.classes[0]?.id ?? '');
  const [date, setDate] = useState('2026-11-17');
  const [savedNotice, setSavedNotice] = useState(false);

  const roster = state.students
    .filter((s) => s.classId === classId)
    .sort((a, b) => a.rollNumber - b.rollNumber);

  const getStatusFor = (studentId: string): AttendanceStatus => {
    const rec = state.attendance.find((a) => a.studentId === studentId && a.date === date);
    return rec?.status ?? 'present';
  };

  const getRemarksFor = (studentId: string): string => {
    const rec = state.attendance.find((a) => a.studentId === studentId && a.date === date);
    return rec?.remarks ?? '';
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    state.markAttendance(studentId, classId, date, status, teacher?.id ?? 'tch-1', getRemarksFor(studentId));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    state.markAttendance(studentId, classId, date, getStatusFor(studentId), teacher?.id ?? 'tch-1', remarks);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="att-class" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Class
            </label>
            <select
              id="att-class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0F2544]"
            >
              {assignedClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.grade} – Section {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="att-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Attendance Date
            </label>
            <input
              id="att-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Selected: <DateDisplay date={date} className="font-semibold text-slate-800" />
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Demo attendance updated in local state (reflected across Student & Parent portals).</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Roll</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Attendance Status</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {roster.map((stu) => {
              const current = getStatusFor(stu.id);
              return (
                <tr key={stu.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                    #{stu.rollNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{stu.name}</td>
                  <td className="py-3 px-4">
                    <div className="inline-flex p-1 bg-slate-100 rounded-lg">
                      {(['present', 'late', 'absent'] as AttendanceStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(stu.id, st)}
                          className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                            current === st
                              ? st === 'present'
                                ? 'bg-emerald-700 text-white'
                                : st === 'late'
                                ? 'bg-amber-600 text-white'
                                : 'bg-red-700 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={getRemarksFor(stu.id)}
                      onChange={(e) => handleRemarksChange(stu.id, e.target.value)}
                      placeholder="Optional note..."
                      className="w-full max-w-xs px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#0F2544]"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
