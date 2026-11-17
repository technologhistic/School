import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BellRing, BookOpen, CheckCircle2, Clock, UserCheck, Users } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';

interface AdminOverviewData {
  counts: {
    totalStudents: number;
    pendingApprovals: number;
    approvedStudents: number;
    rejectedApplications: number;
    totalTeachers: number;
    activeTeachers: number;
  };
  requests: Array<{
    id: string;
    full_name: string;
    phone_number: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
  }>;
  auditLogs: Array<{
    id: string;
    actor_role: string;
    action: string;
    target_type: string;
    target_id: string;
    created_at: string;
  }>;
}

export const AdminDashboardPage: React.FC = () => {
  const state = useSchoolStore();
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/v1/admin/registrations', { credentials: 'include' });
        if (res.ok) {
          const data = (await res.json()) as AdminOverviewData;
          setOverview(data);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const enrollmentChart = state.classes.map((cls) => ({
    name: `${cls.grade} ${cls.section}`,
    students: state.students.filter((s) => s.classId === cls.id).length,
    capacity: cls.capacity,
  }));

  const pendingRequests = (overview?.requests ?? []).filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* KPI Totals derived from live backend DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/students"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Students (DB)</span>
            <Users className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {loading ? '—' : overview?.counts.totalStudents ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {overview?.counts.approvedStudents ?? 0} approved · {overview?.counts.rejectedApplications ?? 0} rejected
          </div>
        </Link>

        <Link
          to="/admin/students"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Student Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display text-2xl font-bold text-[#0F2544] tabular-nums mt-2">
            {loading ? '—' : overview?.counts.pendingApprovals ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Requires admin approval</div>
        </Link>

        <Link
          to="/admin/teachers"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Registered Teachers</span>
            <UserCheck className="w-4 h-4 text-[#2B548A]" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {loading ? '—' : overview?.counts.totalTeachers ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {overview?.counts.activeTeachers ?? 0} active accounts
          </div>
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
            {state.admissions.length} public inquiries
          </div>
        </Link>
      </div>

      {/* Approval Notifications Panel (PRD Sec 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#0F2544]" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Approval Notifications ({pendingRequests.length} pending)
              </h2>
            </div>
            <Link
              to="/admin/students"
              className="text-xs font-semibold text-[#0F2544] hover:underline"
            >
              Manage Approvals
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#F6F7F9] border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>All student registration requests have been reviewed.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {pendingRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{req.full_name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {req.phone_number} · Requested {new Date(req.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    to="/admin/students"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0F2544] rounded-md hover:bg-[#16345E] shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Activity */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            Recent Security & Approval Audit Log
          </h2>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {(overview?.auditLogs ?? []).slice(0, 8).map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <span className="text-slate-500"> · {log.target_type} ({log.target_id})</span>
                </div>
                <span className="text-slate-400 tabular-nums shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Existing Enrollment Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-display text-base font-bold text-slate-900 mb-1">
          Class Section Enrollment Overview
        </h2>
        <p className="text-xs text-slate-500 mb-4">Active class section distribution</p>
        <div className="h-56 w-full">
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
    </div>
  );
};
