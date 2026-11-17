import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BookOpen, ClipboardList, UserCheck, Users } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { DateDisplay } from '../../components/common/DateDisplay';

export const AdminDashboardPage: React.FC = () => {
  const state = useSchoolStore();

  const enrollmentChart = state.classes.map((cls) => ({
    name: `${cls.grade} ${cls.section}`,
    students: state.students.filter((s) => s.classId === cls.id).length,
    capacity: cls.capacity,
  }));

  const pendingAdmissions = state.admissions.filter(
    (a) => a.status === 'pending' || a.status === 'under_review'
  );

  return (
    <div className="space-y-6">
      {/* KPI Totals derived directly from store */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/students"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Demo Students</span>
            <Users className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {state.students.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Manage student records</div>
        </Link>

        <Link
          to="/admin/teachers"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Demo Teachers</span>
            <UserCheck className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {state.teachers.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Manage faculty directory</div>
        </Link>

        <Link
          to="/admin/classes"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Classes</span>
            <BookOpen className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {state.classes.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {state.parents.length} linked parent profiles
          </div>
        </Link>

        <Link
          to="/admin/admissions"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Admissions Queue</span>
            <ClipboardList className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-[#0F2544] tabular-nums mt-2">
            {pendingAdmissions.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {state.admissions.length} total demo applications
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-base font-bold text-slate-900 mb-1">
            Demo Enrollment by Class Section
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Live count derived from student roster records
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentChart} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="students" fill="#0F2544" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">
              Recent Demo Activity
            </h2>
            <Link to="/admin/admissions" className="text-xs font-semibold text-[#0F2544] hover:underline">
              Review Admissions
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {state.admissions.slice(0, 3).map((adm) => (
              <div key={adm.id} className="py-3 first:pt-0">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{adm.grade}</span>
                  <span className="capitalize font-medium text-[#2B548A]">
                    {adm.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  Application: {adm.applicantName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Submitted <DateDisplay date={adm.submittedAt} />
                </div>
              </div>
            ))}
            {state.notices.slice(0, 2).map((n) => (
              <div key={n.id} className="py-3 last:pb-0">
                <div className="text-xs text-slate-500">
                  Notice · {n.published ? 'Published' : 'Draft'}
                </div>
                <div className="text-sm font-medium text-slate-900 mt-0.5 truncate">{n.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
