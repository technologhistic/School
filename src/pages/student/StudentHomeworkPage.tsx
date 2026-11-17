import React, { useMemo, useState } from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getSubjectName, getTeacherName } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';
import { ModalDialog } from '../../components/common/ModalDialog';
import { DataStateShell } from '../../components/common/DataStateShell';
import { Assignment, AssignmentStatus } from '../../types/school';

export const StudentHomeworkPage: React.FC = () => {
  const state = useSchoolStore();
  const student = state.students.find((s) => s.id === state.activeStudentId) ?? state.students[0];
  const [statusFilter, setStatusFilter] = useState<'all' | AssignmentStatus>('all');
  const [selected, setSelected] = useState<Assignment | null>(null);

  const classAssignments = useMemo(() => {
    const list = state.assignments.filter((a) => a.classId === student?.classId);
    if (statusFilter === 'all') return list;
    return list.filter((a) => a.status === statusFilter);
  }, [state.assignments, student?.classId, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg self-start">
          {(['all', 'pending', 'submitted', 'graded'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#0F2544] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 tabular-nums">{classAssignments.length} assignments</div>
      </div>

      <DataStateShell
        isEmpty={classAssignments.length === 0}
        emptyTitle="No homework in this status"
        emptyDescription="Switch filter tabs to see all class assignments."
        emptyActionLabel="Show All"
        onEmptyAction={() => setStatusFilter('all')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classAssignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-[#2B548A]">
                    {getSubjectName(state, asg.subjectId)}
                  </span>
                  <span
                    className={`capitalize font-semibold ${
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
                <h2 className="font-display text-base font-bold text-slate-900 mt-1.5">
                  {asg.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{asg.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  Due <DateDisplay date={asg.dueDate} /> · {asg.maxPoints} pts
                </div>
                <div className="flex items-center gap-2">
                  {asg.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => state.updateAssignment(asg.id, { status: 'submitted' })}
                      className="px-2.5 py-1.5 font-semibold text-white bg-[#0F2544] rounded-md hover:bg-[#16345E]"
                    >
                      Mark Submitted
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelected(asg)}
                    className="px-2.5 py-1.5 font-semibold text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataStateShell>

      <ModalDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        description={
          selected ? `${getSubjectName(state, selected.subjectId)} · ${getTeacherName(state, selected.teacherId)}` : ''
        }
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block">Due Date</span>
                <span className="font-semibold text-slate-900">
                  <DateDisplay date={selected.dueDate} />
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Maximum Points</span>
                <span className="font-semibold text-slate-900 tabular-nums">{selected.maxPoints}</span>
              </div>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
};
