import React from 'react';
import { Mail, Phone, Check } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getClassLabel } from '../../services/schoolService';

export const ParentChildrenPage: React.FC = () => {
  const state = useSchoolStore();
  const parent = state.parents.find((p) => p.id === state.activeParentId) ?? state.parents[0];
  const linkedChildren = state.students.filter((s) =>
    parent?.linkedStudentIds.includes(s.id)
  );
  const selectedChild =
    linkedChildren.find((c) => c.id === state.selectedChildId) ?? linkedChildren[0];

  const childClass = state.classes.find((c) => c.id === selectedChild?.classId);
  const childTeachers = state.teachers.filter((t) => childClass?.teacherIds.includes(t.id));

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">Linked Children</h2>
          <p className="text-xs text-slate-500">
            Select a fictional child profile to inspect their attendance, marks, and homework across the Parent Portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {linkedChildren.map((child) => {
            const isSelected = child.id === selectedChild?.id;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => state.setSelectedChildId(child.id)}
                className={`text-left bg-white border rounded-xl p-6 transition-colors ${
                  isSelected
                    ? 'border-[#0F2544] ring-1 ring-[#0F2544]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-[#2B548A]">
                      {getClassLabel(state, child.classId)} · Roll No. {child.rollNumber}
                    </div>
                    <div className="font-display text-lg font-bold text-slate-900 mt-1">
                      {child.name}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2544]">
                      <Check className="w-4 h-4" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-3">{child.addressDemo}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* PAR-07: School-Approved Teacher Contacts */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Approved Faculty Contacts ({selectedChild?.name})
          </h2>
          <p className="text-xs text-slate-500">
            School-approved sample contact channels for {selectedChild ? getClassLabel(state, selectedChild.classId) : ''}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {childTeachers.map((tch) => (
            <div key={tch.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
              <div className="text-xs text-[#2B548A] font-medium">{tch.department}</div>
              <div className="font-display text-base font-bold text-slate-900">{tch.name}</div>
              <div className="text-xs text-slate-500">{tch.designation}</div>
              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{tch.emailDemo}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tch.phoneDemo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
