import React, { useState } from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { calculateTermAverage, getClassLabel, getSubjectName } from '../../services/schoolService';
import { DataStateShell } from '../../components/common/DataStateShell';

export const ParentResultsPage: React.FC = () => {
  const state = useSchoolStore();
  const parent = state.parents.find((p) => p.id === state.activeParentId) ?? state.parents[0];
  const linkedChildren = state.students.filter((s) =>
    parent?.linkedStudentIds.includes(s.id)
  );
  const child =
    linkedChildren.find((c) => c.id === state.selectedChildId) ?? linkedChildren[0];
  const [selectedExamId, setSelectedExamId] = useState(state.exams[state.exams.length - 1]?.id ?? '');

  const examResults = state.results.filter(
    (r) => r.studentId === child?.id && r.examId === selectedExamId
  );
  const summary = calculateTermAverage(examResults);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            {child?.name} · Academic Results
          </h2>
          <p className="text-xs text-slate-500">
            {child ? getClassLabel(state, child.classId) : ''} · Examination records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
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

          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
            {state.exams.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setSelectedExamId(ex.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedExamId === ex.id ? 'bg-[#16345E] text-white' : 'text-slate-600'
                }`}
              >
                {ex.name.replace(' Examination', '').replace(' Assessment', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Score</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {summary.totalMarks} / {summary.totalMax}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Term Percentage</div>
          <div className="font-display text-2xl font-bold text-[#0F2544] tabular-nums mt-1">
            {summary.averagePct}%
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">GPA</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {summary.gpa}
          </div>
        </div>
      </div>

      <DataStateShell
        isEmpty={examResults.length === 0}
        emptyTitle="No marks recorded for this term"
        emptyDescription="Select another term or check after subject marks are entered."
      >
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-right">Marks</th>
                <th className="py-3 px-4 text-right">Grade</th>
                <th className="py-3 px-4">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {examResults.map((res) => (
                <tr key={res.id}>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {getSubjectName(state, res.subjectId)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {res.marks} / {res.maxMarks}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#0F2544]">{res.grade}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{res.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataStateShell>
    </div>
  );
};
