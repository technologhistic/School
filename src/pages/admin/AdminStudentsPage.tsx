import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Eye, KeyRound, Pencil, Search, ShieldBan, ShieldCheck, X } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { ConfirmDialog, ModalDialog } from '../../components/common/ModalDialog';
import { DataStateShell } from '../../components/common/DataStateShell';

interface BackendStudent {
  id: string;
  full_name: string;
  phone_number: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  account_status: 'active' | 'inactive';
  must_change_password: number;
  approved_by: string | null;
  approved_at: string | null;
  class_id: string;
  section: string;
  roll_number: number;
  created_at: string;
}

interface BackendRegRequest {
  id: string;
  full_name: string;
  phone_number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface AdminRegistrationsResponse {
  requests: BackendRegRequest[];
  students: BackendStudent[];
  counts: {
    totalStudents: number;
    pendingApprovals: number;
    approvedStudents: number;
    rejectedApplications: number;
  };
}

export const AdminStudentsPage: React.FC = () => {
  const schoolState = useSchoolStore();
  const [data, setData] = useState<AdminRegistrationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Modals
  const [approveTarget, setApproveTarget] = useState<BackendStudent | null>(null);
  const [approvePassword, setApprovePassword] = useState('');
  const [approveClassId, setApproveClassId] = useState('cls-10a');
  const [assignedTempNotice, setAssignedTempNotice] = useState<{ name: string; phone: string; password: string } | null>(null);

  const [rejectTarget, setRejectTarget] = useState<BackendStudent | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [detailTarget, setDetailTarget] = useState<BackendStudent | null>(null);
  const [editTarget, setEditTarget] = useState<BackendStudent | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editClassId, setEditClassId] = useState('cls-10a');
  const [editRoll, setEditRoll] = useState('1');

  const [resetTarget, setResetTarget] = useState<BackendStudent | null>(null);
  const [resetPwdValue, setResetPwdValue] = useState('');
  const [toggleTarget, setToggleTarget] = useState<BackendStudent | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/registrations', { credentials: 'include' });
      if (!res.ok) {
        const errBody = (await res.json()) as { error?: string };
        throw new Error(errBody.error || 'Failed to load student registrations');
      }
      const json = (await res.json()) as AdminRegistrationsResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const filtered = useMemo(() => {
    const list = data?.students ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((s) => {
      const statusOk = statusFilter === 'ALL' || s.approval_status === statusFilter;
      const queryOk =
        !q || s.full_name.toLowerCase().includes(q) || s.phone_number.includes(q);
      return statusOk && queryOk;
    });
  }, [data?.students, search, statusFilter]);

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveTarget) return;
    const cls = schoolState.classes.find((c) => c.id === approveClassId);
    const res = await fetch(`/api/v1/admin/students/${approveTarget.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        initialPassword: approvePassword.trim() || undefined,
        classId: approveClassId,
        section: cls?.section ?? 'A',
      }),
    });
    const body = (await res.json()) as { assignedPassword?: string; error?: string };
    if (!res.ok) {
      setError(body.error || 'Approval failed');
      return;
    }
    setAssignedTempNotice({
      name: approveTarget.full_name,
      phone: approveTarget.phone_number,
      password: body.assignedPassword || approvePassword,
    });
    setApproveTarget(null);
    setApprovePassword('');
    await fetchStudents();
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    const res = await fetch(`/api/v1/admin/students/${rejectTarget.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason: rejectReason.trim() || 'Declined by administrator' }),
    });
    if (!res.ok) {
      const errBody = (await res.json()) as { error?: string };
      setError(errBody.error || 'Failed to reject student registration');
      return;
    }
    setRejectTarget(null);
    setRejectReason('');
    await fetchStudents();
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const cls = schoolState.classes.find((c) => c.id === editClassId);
    const res = await fetch(`/api/v1/admin/students/${editTarget.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fullName: editName.trim(),
        phoneNumber: editPhone.trim(),
        classId: editClassId,
        section: cls?.section ?? 'A',
        rollNumber: Number(editRoll) || 1,
      }),
    });
    if (!res.ok) {
      const errBody = (await res.json()) as { error?: string };
      setError(errBody.error || 'Failed to update student details');
      return;
    }
    setEditTarget(null);
    await fetchStudents();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    const res = await fetch(`/api/v1/admin/students/${resetTarget.id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ newPassword: resetPwdValue.trim() || undefined }),
    });
    const body = (await res.json()) as { assignedPassword?: string; error?: string };
    if (!res.ok) {
      setError(body.error || 'Failed to reset student password');
      return;
    }
    setAssignedTempNotice({
      name: resetTarget.full_name,
      phone: resetTarget.phone_number,
      password: body.assignedPassword || resetPwdValue,
    });
    setResetTarget(null);
    setResetPwdValue('');
    await fetchStudents();
  };

  const handleToggleAccountStatus = async () => {
    if (!toggleTarget) return;
    const nextStatus = toggleTarget.account_status === 'active' ? 'inactive' : 'active';
    const res = await fetch(`/api/v1/admin/students/${toggleTarget.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ accountStatus: nextStatus }),
    });
    if (!res.ok) {
      const errBody = (await res.json()) as { error?: string };
      setError(errBody.error || 'Failed to change account status');
      return;
    }
    setToggleTarget(null);
    await fetchStudents();
  };

  const reqFor = (phone: string) =>
    data?.requests.find((r) => r.phone_number === phone);

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Students</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {data?.counts.totalStudents ?? 0}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Pending Approvals</div>
          <div className="font-display text-2xl font-bold text-amber-700 tabular-nums mt-1">
            {data?.counts.pendingApprovals ?? 0}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Approved Students</div>
          <div className="font-display text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {data?.counts.approvedStudents ?? 0}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Rejected Applications</div>
          <div className="font-display text-2xl font-bold text-red-700 tabular-nums mt-1">
            {data?.counts.rejectedApplications ?? 0}
          </div>
        </div>
      </div>

      {/* One-time generated password alert for Admin */}
      {assignedTempNotice && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-emerald-950 space-y-1">
            <div className="font-bold text-sm">
              Password Assigned for {assignedTempNotice.name} ({assignedTempNotice.phone})
            </div>
            <p>
              Share this temporary password securely with the student (they will be required to change it on first login):{' '}
              <code className="px-2 py-0.5 rounded bg-white border border-emerald-300 font-mono font-bold text-slate-900">
                {assignedTempNotice.password}
              </code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAssignedTempNotice(null)}
            className="text-xs font-semibold text-emerald-900 underline self-start sm:self-center"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap p-1 bg-white border border-slate-200 rounded-lg self-start">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === st ? 'bg-[#0F2544] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or phone..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2544]"
          />
        </div>
      </div>

      <DataStateShell
        isLoading={loading}
        error={error}
        onRetry={() => void fetchStudents()}
        isEmpty={filtered.length === 0}
        emptyTitle="No student registrations found"
        emptyDescription="Students who submit a registration request from the Student Portal will appear here for approval."
      >
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-medium text-slate-900">{stu.full_name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums">
                    {stu.phone_number}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 tabular-nums">
                    {new Date(stu.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold">
                    <span
                      className={
                        stu.approval_status === 'APPROVED'
                          ? 'text-emerald-700'
                          : stu.approval_status === 'REJECTED'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }
                    >
                      {stu.approval_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs capitalize">
                    <span
                      className={
                        stu.account_status === 'active'
                          ? 'text-emerald-700 font-medium'
                          : 'text-slate-500'
                      }
                    >
                      {stu.account_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                    {stu.approval_status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setApproveTarget(stu);
                            setApprovePassword('');
                            setApproveClassId(stu.class_id || 'cls-10a');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 rounded-md hover:bg-emerald-800"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectTarget(stu);
                            setRejectReason('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setDetailTarget(stu)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                    {stu.approval_status === 'APPROVED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditTarget(stu);
                            setEditName(stu.full_name);
                            setEditPhone(stu.phone_number);
                            setEditClassId(stu.class_id);
                            setEditRoll(String(stu.roll_number));
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(stu);
                            setResetPwdValue('');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToggleTarget(stu)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                          title={stu.account_status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {stu.account_status === 'active' ? (
                            <ShieldBan className="w-3 h-3 text-red-600" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          )}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataStateShell>

      {/* Approve Modal */}
      <ModalDialog
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        title={`Approve Student: ${approveTarget?.full_name ?? ''}`}
        description="Assign an initial password or leave blank to auto-generate a secure temporary password."
      >
        <form onSubmit={handleApproveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial / Temporary Password (optional, min 6 chars)
            </label>
            <input
              type="text"
              value={approvePassword}
              onChange={(e) => setApprovePassword(e.target.value)}
              placeholder="Leave empty to auto-generate secure password"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Class</label>
            <select
              value={approveClassId}
              onChange={(e) => setApproveClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {schoolState.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade} – Section {c.section}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setApproveTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
            >
              Confirm Approval
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Reject Modal */}
      <ModalDialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title={`Reject Registration: ${rejectTarget?.full_name ?? ''}`}
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason shown in status check..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-red-700 rounded-lg hover:bg-red-800"
            >
              Confirm Reject
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Details Modal */}
      <ModalDialog
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title={detailTarget?.full_name ?? 'Student Details'}
      >
        {detailTarget && (
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Phone Number</dt>
              <dd className="font-mono text-slate-900">{detailTarget.phone_number}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Approval Status</dt>
              <dd className="font-semibold">{detailTarget.approval_status}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Account Status</dt>
              <dd className="capitalize">{detailTarget.account_status}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Registered At</dt>
              <dd className="tabular-nums">{new Date(detailTarget.created_at).toLocaleString()}</dd>
            </div>
            {reqFor(detailTarget.phone_number)?.rejection_reason && (
              <div className="py-2.5">
                <dt className="text-slate-500 text-xs">Rejection Reason</dt>
                <dd className="text-red-700 text-xs mt-1">
                  {reqFor(detailTarget.phone_number)?.rejection_reason}
                </dd>
              </div>
            )}
          </dl>
        )}
      </ModalDialog>

      {/* Edit Student Modal */}
      <ModalDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title={`Edit Student: ${editTarget?.full_name ?? ''}`}
      >
        <form onSubmit={handleEditSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
              <select
                value={editClassId}
                onChange={(e) => setEditClassId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {schoolState.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.grade} – {c.section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="number"
                value={editRoll}
                onChange={(e) => setEditRoll(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Reset Student Password Modal */}
      <ModalDialog
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        title={`Reset Password: ${resetTarget?.full_name ?? ''}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Temporary Password (leave blank to auto-generate)
            </label>
            <input
              type="text"
              value={resetPwdValue}
              onChange={(e) => setResetPwdValue(e.target.value)}
              placeholder="Min 6 characters or leave blank"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResetTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg"
            >
              Reset Password
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => void handleToggleAccountStatus()}
        title={
          toggleTarget?.account_status === 'active'
            ? 'Deactivate Student Account'
            : 'Activate Student Account'
        }
        message={
          toggleTarget?.account_status === 'active'
            ? `Deactivating "${toggleTarget?.full_name}" will immediately revoke their active session and prevent login.`
            : `Re-activate "${toggleTarget?.full_name}" so they can log into the Student Portal?`
        }
        confirmLabel={
          toggleTarget?.account_status === 'active' ? 'Deactivate' : 'Activate'
        }
      />
    </div>
  );
};
