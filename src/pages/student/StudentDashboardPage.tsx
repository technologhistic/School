import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowRight, BookOpen, Calendar, CheckSquare, ClipboardList } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import {
  calculateAttendanceSummary,
  calculateTermAverage,
  getClassLabel,
  getSubjectName,
} from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';

export const StudentDashboardPage: React.FC = () => {
  const state = useSchoolStore();
  const student = state.students.find((s) => s.id === state.activeStudentId) ?? state.students[0];

  if (!student) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
        No demo student profile available. Reset demo data to restore defaults.
      </div>
    );
  }

  const studentAttendance = state.attendance.filter((a) => a.studentId === student.id);
  const attSummary = calculateAttendanceSummary(studentAttendance);

  const latestExam = state.exams[state.exams.length - 1];
  const latestResults = state.results.filter(
    (r) => r.studentId === student.id && r.examId === latestExam?.id
  );
  const termAvg = calculateTermAverage(latestResults);

  const classHomework = state.assignments.filter((a) => a.classId === student.classId);
  const pendingHomework = classHomework.filter((a) => a.status === 'pending');

  const chartData = latestResults.map((r) => {
    const sub = state.subjects.find((s) => s.id === r.subjectId);
    return {
      subject: sub ? sub.code : r.subjectId,
      name: sub ? sub.name : r.subjectId,
      marks: r.marks,
    };
  });

  const recentNotices = state.notices.filter((n) => n.published).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Summary Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#2B548A]">
            {getClassLabel(state, student.classId)} · Roll No. {student.rollNumber}
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
            Welcome back, {student.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {state.config.activeTerm} · Sample student workspace
          </p>
        </div>
        <Link
          to="/student/timetable"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>View Weekly Timetable</span>
        </Link>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Attendance Rate</span>
            <CheckSquare className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {attSummary.percentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {attSummary.present} present · {attSummary.late} late · {attSummary.absent} absent
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Latest Term Average</span>
            <BookOpen className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {termAvg.averagePct}%
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            Sample GPA {termAvg.gpa} / 4.00
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Homework</span>
            <ClipboardList className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {pendingHomework.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            Out of {classHomework.length} class assignments
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Published Notices</span>
            <Calendar className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {state.notices.filter((n) => n.published).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">School & exam circulars</div>
        </div>
      </div>

      {/* Main Grid: Results Chart + Pending Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                {latestExam?.name ?? 'Term Marks'} Overview
              </h3>
              <p className="text-xs text-slate-500">Derived from current sample result records</p>
            </div>
            <Link to="/student/results" className="text-xs font-semibold text-[#0F2544] hover:underline">
              Full Report
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="marks" fill="#0F2544" radius={[4, 4, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-slate-900">Upcoming Homework</h3>
              <Link to="/student/homework" className="text-xs font-semibold text-[#0F2544] hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {classHomework.slice(0, 4).map((asg) => (
                <div key={asg.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{getSubjectName(state, asg.subjectId)}</span>
                    <span className="capitalize font-medium text-slate-700">{asg.status}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 mt-0.5">{asg.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Due <DateDisplay date={asg.dueDate} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/student/materials"
            className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F2544] hover:underline"
          >
            <span>Open Study Materials & Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Notices Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold text-slate-900">Recent School Notices</h3>
          <Link to="/notices" className="text-xs font-semibold text-[#0F2544] hover:underline">
            Public Notice Board
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentNotices.map((n) => (
            <div key={n.id} className="border border-slate-200 rounded-lg p-4 bg-[#F6F7F9]/50">
              <div className="text-xs text-slate-500">
                {n.category} · <DateDisplay date={n.publishDate} />
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-1">{n.title}</div>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
