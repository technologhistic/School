import React from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getClassLabel, getSubjectName, getTeacherName } from '../../services/schoolService';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export const StudentTimetablePage: React.FC = () => {
  const state = useSchoolStore();
  const student = state.students.find((s) => s.id === state.activeStudentId) ?? state.students[0];

  const slots = state.timetable.filter((t) => t.classId === student?.classId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Weekly Class Schedule · {student ? getClassLabel(state, student.classId) : ''}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Sunday through Friday Nepal academic week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DAYS.map((day) => {
          const daySlots = slots
            .filter((s) => s.day === day)
            .sort((a, b) => a.period - b.period);

          return (
            <div key={day} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-[#0F2544] text-white text-sm font-semibold flex items-center justify-between">
                <span>{day}</span>
                <span className="text-xs text-slate-300 tabular-nums">{daySlots.length} periods</span>
              </div>
              <div className="divide-y divide-slate-100">
                {daySlots.length === 0 ? (
                  <div className="p-4 text-xs text-slate-500">Co-curricular / Club Hour</div>
                ) : (
                  daySlots.map((slot) => (
                    <div key={slot.id} className="p-4 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                        <span>Period {slot.period}</span>
                        <span>{slot.timeRange}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {getSubjectName(state, slot.subjectId)}
                      </div>
                      <div className="text-xs text-slate-600">
                        {getTeacherName(state, slot.teacherId)} · {slot.room}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
