import React from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getClassLabel, getSubjectName } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';

export const ParentHomeworkPage: React.FC = () => {
  const state = useSchoolStore();
  const parent = state.parents.find((p) => p.id === state.activeParentId) ?? state.parents[0];
  const linkedChildren = state.students.filter((s) =>
    parent?.linkedStudentIds.includes(s.id)
  );
  const child =
    linkedChildren.find((c) => c.id === state.selectedChildId) ?? linkedChildren[0];

  const homework = state.assignments.filter((a) => a.classId === child?.classId);
  const notices = state.notices.filter((n) => n.published).slice(0, 4);
  const upcomingEvents = state.events.filter((e) => e.startDate >= '2026-11-17').slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            {child?.name} · Homework & Completion Status
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
                child?.id === c.id ? 'bg-[#0F2544] text-white' : 'text-slate-600'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {homework.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No assignments posted for this class yet.</div>
        ) : (
          homework.map((asg) => (
            <div key={asg.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-[#2B548A]">
                    {getSubjectName(state, asg.subjectId)}
                  </span>
                  {' · '}
                  <span>Due <DateDisplay date={asg.dueDate} /></span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">{asg.title}</div>
                <p className="text-xs text-slate-600 mt-1">{asg.description}</p>
              </div>
              <span
                className={`text-xs font-semibold capitalize shrink-0 ${
                  asg.status === 'graded'
                    ? 'text-emerald-700'
                    : asg.status === 'submitted'
                    ? 'text-[#2B548A]'
                    : 'text-amber-700'
                }`}
              >
                {asg.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* PAR-06: School Updates (Notices + Upcoming Events) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900">School Notices</h3>
          <div className="divide-y divide-slate-100">
            {notices.map((n) => (
              <div key={n.id} className="py-3 first:pt-0 last:pb-0">
                <div className="text-xs text-slate-500">
                  {n.category} · <DateDisplay date={n.publishDate} />
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{n.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900">Upcoming School Events</h3>
          <div className="divide-y divide-slate-100">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="py-3 first:pt-0 last:pb-0">
                <div className="text-xs text-slate-500">
                  <DateDisplay date={ev.startDate} /> · {ev.location}
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{ev.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
