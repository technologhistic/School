import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { computeLetterGrade, useSchoolStore } from '../../store/useSchoolStore';

export const TeacherResultsPage: React.FC = () => {
  const state = useSchoolStore();
  const [classId, setClassId] = useState(state.classes[0]?.id ?? 'cls-10a');
  const [examId, setExamId] = useState(state.exams[state.exams.length - 1]?.id ?? 'exm-2');
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id ?? 'sub-math');
  const [savedStudent, setSavedStudent] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roster = state.students
    .filter((s) => s.classId === classId)
    .sort((a, b) => a.rollNumber - b.rollNumber);

  const getExisting = (studentId: string) =>
    state.results.find(
      (r) => r.studentId === studentId && r.examId === examId && r.subjectId === subjectId
    );

  const handleMarkUpdate = (studentId: string, studentName: string, rawVal: string, remarks: string) => {
    const parsed = Number(rawVal);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      setErrorMsg(`Invalid marks for ${studentName}. Enter a value between 0 and 100.`);
      return;
    }
    setErrorMsg(null);
    state.upsertResult(studentId, examId, subjectId, parsed, 100, remarks || 'Recorded by subject teacher');
    setSavedStudent(studentName);
    setTimeout(() => setSavedStudent(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
          >
            {state.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grade} – Section {c.section}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Examination</label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
          >
            {state.exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
          >
            {state.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs">
          {errorMsg}
        </div>
      )}

      {savedStudent && (
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Saved sample marks for {savedStudent}.</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Roll</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Marks (0–100)</th>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {roster.map((stu) => {
              const rec = getExisting(stu.id);
              const marks = rec?.marks ?? 0;
              const grade = rec ? computeLetterGrade(marks, 100) : '—';
              return (
                <tr key={stu.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                    #{stu.rollNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{stu.name}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={rec ? rec.marks : ''}
                      placeholder="0–100"
                      onChange={(e) =>
                        handleMarkUpdate(stu.id, stu.name, e.target.value, rec?.remarks ?? '')
                      }
                      className="w-24 px-2.5 py-1.5 text-sm tabular-nums border border-slate-300 rounded-md focus:outline-none focus:border-[#0F2544]"
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#0F2544]">{grade}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={rec?.remarks ?? ''}
                      placeholder="Evaluation comment..."
                      onChange={(e) =>
                        handleMarkUpdate(stu.id, stu.name, String(marks), e.target.value)
                      }
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
