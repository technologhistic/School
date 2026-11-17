import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSchoolStore } from '../../store/useSchoolStore';
import {
  calculateAttendanceSummary,
  calculateTermAverage,
  getClassLabel,
  getSubjectName,
} from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';

export const ParentDashboardPage: React.FC = () => {
  const state = useSchoolStore();
  const parent = state.parents.find((p) => p.id === state.activeParentId) ?? state.parents[0];
  const linkedChildren = state.students.filter((s) =>
    parent?.linkedStudentIds.includes(s.id)
  );
  const child =
    linkedChildren.find((c) => c.id === state.selectedChildId) ?? linkedChildren[0];

  if (!child) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
        No linked demo children found. Use Admin &gt; Parents or Reset Demo Data.
      </div>
    );
  }

  const attRecords = state.attendance.filter((a) => a.studentId === child.id);
  const attSummary = calculateAttendanceSummary(attRecords);

  const latestExam = state.exams[state.exams.length - 1];
  const latestResults = state.results.filter(
    (r) => r.studentId === child.id && r.examId === latestExam?.id
  );
  const termAvg = calculateTermAverage(latestResults);
  const homework = state.assignments.filter((a) => a.classId === child.classId);

  const chartData = latestResults.map((r) => ({
    subject: state.subjects.find((s) => s.id === r.subjectId)?.code ?? r.subjectId,
    marks: r.marks,
  }));

  return (
    <div className="space-y-6">
      {/* Child Switcher Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#2B548A]">
            Guardian: {parent?.name} · Reviewing Sample Child Record
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
            {child.name} — {getClassLabel(state, child.classId)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">Roll No. {child.rollNumber}</p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {linkedChildren.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => state.setSelectedChildId(c.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                child.id === c.id
                  ? 'bg-[#0F2544] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c.name.split(' ')[0]} ({getClassLabel(state, c.classId)})
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Attendance Summary</div>
          <div className="font-display text-2xl font-bold text-[#0F2544] tabular-nums mt-1">
            {attSummary.percentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {attSummary.present} present of {attSummary.total} recorded days
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Latest Term Average</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {termAvg.averagePct}%
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">Sample GPA {termAvg.gpa}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Class Assignments</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {homework.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {homework.filter((h) => h.status === 'pending').length} pending completion
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900">
              {child.name.split(' ')[0]}’s Subject Marks ({latestExam?.name})
            </h3>
            <Link to="/parent/results" className="text-xs font-semibold text-[#0F2544] hover:underline">
              View Details
            </Link>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="marks" fill="#16345E" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-900">Recent Homework</h3>
            <Link to="/parent/homework" className="text-xs font-semibold text-[#0F2544] hover:underline">
              All Tasks
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {homework.slice(0, 4).map((asg) => (
              <div key={asg.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{getSubjectName(state, asg.subjectId)}</span>
                  <span className="capitalize font-medium text-slate-700">{asg.status}</span>
                </div>
                <div className="text-sm font-medium text-slate-900 mt-0.5">{asg.title}</div>
                <div className="text-xs text-slate-500">
                  Due <DateDisplay date={asg.dueDate} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
