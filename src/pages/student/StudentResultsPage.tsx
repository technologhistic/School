import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSchoolStore } from '../../store/useSchoolStore';
import { calculateTermAverage, getSubjectName } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';
import { DataStateShell } from '../../components/common/DataStateShell';

export const StudentResultsPage: React.FC = () => {
  const state = useSchoolStore();
  const student = state.students.find((s) => s.id === state.activeStudentId) ?? state.students[0];
  const [selectedExamId, setSelectedExamId] = useState(state.exams[state.exams.length - 1]?.id ?? '');

  const exam = state.exams.find((e) => e.id === selectedExamId);
  const examResults = state.results.filter(
    (r) => r.studentId === student?.id && r.examId === selectedExamId
  );
  const summary = calculateTermAverage(examResults);

  const chartData = examResults.map((r) => ({
    subject: state.subjects.find((s) => s.id === r.subjectId)?.code ?? r.subjectId,
    marks: r.marks,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg self-start">
          {state.exams.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setSelectedExamId(ex.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedExamId === ex.id
                  ? 'bg-[#0F2544] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>

        {exam && (
          <div className="text-xs text-slate-500">
            Assessment Date: <DateDisplay date={exam.dateAD} />
          </div>
        )}
      </div>

      {/* Term Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Total Score</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {summary.totalMarks} / {summary.totalMax}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Term Percentage</div>
          <div className="font-display text-2xl font-bold text-[#0F2544] tabular-nums mt-1">
            {summary.averagePct}%
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">GPA</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {summary.gpa}
          </div>
        </div>
      </div>

      <DataStateShell
        isEmpty={examResults.length === 0}
        emptyTitle="No marks published for this term"
        emptyDescription="Select another examination tab or check back once marks are published."
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-right">Marks</th>
                  <th className="py-3 px-4 text-right">Grade</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {examResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {getSubjectName(state, res.subjectId)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-800">
                      {res.marks} / {res.maxMarks}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#0F2544]">
                      {res.grade}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{res.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-display text-sm font-bold text-slate-900 mb-4">
              Subject Marks Comparison
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="marks" fill="#2B548A" radius={[4, 4, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </DataStateShell>
    </div>
  );
};
