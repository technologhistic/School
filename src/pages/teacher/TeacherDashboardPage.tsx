import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BookOpen, CheckSquare, ClipboardList, Users } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getClassLabel, getSubjectName } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';

export const TeacherDashboardPage: React.FC = () => {
  const state = useSchoolStore();
  const teacher = state.teachers.find((t) => t.id === state.activeTeacherId) ?? state.teachers[0];

  const assignedClasses = state.classes.filter((c) => teacher?.classIds.includes(c.id));
  const assignedStudents = state.students.filter((s) =>
    assignedClasses.some((c) => c.id === s.classId)
  );
  const myAssignments = state.assignments.filter((a) => a.teacherId === teacher?.id);
  const mySchedule = state.timetable.filter((t) => t.teacherId === teacher?.id);

  const attendanceChartData = assignedClasses.map((cls) => {
    const clsRecords = state.attendance.filter((a) => a.classId === cls.id);
    const present = clsRecords.filter((a) => a.status === 'present').length;
    const total = clsRecords.length;
    return {
      name: `${cls.grade} ${cls.section}`,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#2B548A]">
            {teacher?.designation} · {teacher?.department}
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
            {teacher?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {state.config.activeTerm} · Sample faculty workspace
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/teacher/attendance"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors whitespace-nowrap"
          >
            Mark Attendance
          </Link>
          <Link
            to="/teacher/assignments"
            className="px-4 py-2 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Post Homework
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Assigned Classes</span>
            <BookOpen className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {assignedClasses.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Active sections</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Assigned Students</span>
            <Users className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {assignedStudents.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across assigned rosters</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Assignments</span>
            <ClipboardList className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {myAssignments.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Published homework tasks</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Weekly Teaching Slots</span>
            <CheckSquare className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {mySchedule.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Scheduled periods</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="font-display text-base font-bold text-slate-900 mb-1">
            Attendance Rate by Assigned Class
          </h3>
          <p className="text-xs text-slate-500 mb-4">Calculated from recorded sample attendance</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="rate" fill="#0F2544" radius={[4, 4, 0, 0]} maxBarSize={46} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900">Recent Assignments</h3>
            <Link to="/teacher/assignments" className="text-xs font-semibold text-[#0F2544] hover:underline">
              Manage All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {myAssignments.slice(0, 4).map((asg) => (
              <div key={asg.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">
                    {getClassLabel(state, asg.classId)} · {getSubjectName(state, asg.subjectId)}
                  </div>
                  <div className="text-sm font-medium text-slate-900 mt-0.5">{asg.title}</div>
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
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
