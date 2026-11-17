import React, { useState } from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getSubjectName } from '../../services/schoolService';

export const TeacherClassesPage: React.FC = () => {
  const state = useSchoolStore();
  const teacher = state.teachers.find((t) => t.id === state.activeTeacherId) ?? state.teachers[0];
  const assignedClasses = state.classes.filter((c) => teacher?.classIds.includes(c.id));

  const [selectedClassId, setSelectedClassId] = useState(assignedClasses[0]?.id ?? '');
  const activeClass = assignedClasses.find((c) => c.id === selectedClassId) ?? assignedClasses[0];
  const roster = state.students
    .filter((s) => s.classId === activeClass?.id)
    .sort((a, b) => a.rollNumber - b.rollNumber);

  const teacherTimetable = state.timetable.filter((t) => t.teacherId === teacher?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {assignedClasses.map((cls) => (
          <button
            key={cls.id}
            type="button"
            onClick={() => setSelectedClassId(cls.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              activeClass?.id === cls.id
                ? 'bg-[#0F2544] text-white border-[#0F2544]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cls.grade} – Section {cls.section}
          </button>
        ))}
      </div>

      {activeClass && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                {activeClass.grade} – Section {activeClass.section} Roster
              </h2>
              <p className="text-xs text-slate-500">{activeClass.room}</p>
            </div>
            <div className="text-xs font-medium text-slate-600 tabular-nums">
              {roster.length} enrolled demo students
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Roll No.</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Guardian</th>
                  <th className="py-3 px-4">Demo Email</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {roster.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 tabular-nums font-mono text-xs text-slate-600">
                      #{stu.rollNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{stu.name}</td>
                    <td className="py-3 px-4 text-slate-600">{stu.guardianName}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">{stu.emailDemo}</td>
                    <td className="py-3 px-4 text-xs capitalize font-medium text-emerald-700">
                      {stu.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher's Weekly Schedule (TCH-07) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">
            My Weekly Teaching Schedule
          </h3>
          <p className="text-xs text-slate-500">Assigned lecture & lab periods across sections</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-4">Day</th>
                <th className="py-2.5 px-4">Period & Time</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {teacherTimetable.map((slot) => (
                <tr key={slot.id}>
                  <td className="py-2.5 px-4 font-medium text-slate-900">{slot.day}</td>
                  <td className="py-2.5 px-4 text-xs text-slate-600 tabular-nums">
                    Period {slot.period} · {slot.timeRange}
                  </td>
                  <td className="py-2.5 px-4 text-slate-800">
                    {getSubjectName(state, slot.subjectId)}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">{slot.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
