import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyRound, Pencil, Plus, Search, ShieldBan, ShieldCheck, Trash2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { ConfirmDialog, ModalDialog } from '../../components/common/ModalDialog';
import { DataStateShell } from '../../components/common/DataStateShell';

interface BackendTeacher {
  id: string;
  fullName: string;
  phoneNumber: string;
  department: string;
  subjects: string[];
  classes: string[];
  status: 'active' | 'inactive';
  mustChangePassword: boolean;
  createdAt: string;
}

export const AdminTeachersPage: React.FC = () => {
  const schoolState = useSchoolStore();
  const [teachers, setTeachers] = useState<BackendTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BackendTeacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BackendTeacher | null>(null);
  const [resetTarget, setResetTarget] = useState<BackendTeacher | null>(null);
  const [resetPwdValue, setResetPwdValue] = useState('');
  const [tempPwdNotice, setTempPwdNotice] = useState<{ name: string; phone: string; password: string } | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [department, setDepartment] = useState('Mathematics');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['sub-math']);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['cls-10a']);
  const [formError, setFormError] = useState('');

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/registrations', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load teachers');
      const data = (await res.json()) as { teachers: BackendTeacher[] };
      setTeachers(data.teachers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load teachers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTeachers();
  }, [loadTeachers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter(
      (t) =>
        !q ||
        t.fullName.toLowerCase().includes(q) ||
        t.phoneNumber.includes(q) ||
        t.department.toLowerCase().includes(q)
    );
  }, [teachers, search]);

  const openCreate = () => {
    setEditing(null);
    setFullName('');
    setPhoneNumber('');
    setInitialPassword('');
    setDepartment('Mathematics');
    setSelectedSubjects(['sub-math']);
    setSelectedClasses(['cls-10a']);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (t: BackendTeacher) => {
    setEditing(t);
    setFullName(t.fullName);
    setPhoneNumber(t.phoneNumber);
    setInitialPassword('');
    setDepartment(t.department);
    setSelectedSubjects(t.subjects);
    setSelectedClasses(t.classes);
    setFormError('');
    setModalOpen(true);
  };

  const toggleItem = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (fullName.trim().length < 2) {
      setFormError('Teacher full name is required.');
      return;
    }
    if (phoneNumber.replace(/\D/g, '').length < 7) {
      setFormError('Valid phone number is required.');
      return;
    }
    if (!editing && initialPassword.trim().length < 6) {
      setFormError('Initial password must be at least 6 characters.');
      return;
    }

    const url = editing
      ? `/api/v1/admin/teachers/${editing.id}`
      : '/api/v1/admin/teachers';
    const method = editing ? 'PUT' : 'POST';

    const payload = editing
      ? {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          department: department.trim(),
          subjects: selectedSubjects,
          classes: selectedClasses,
        }
      : {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          initialPassword: initialPassword.trim(),
          department: department.trim(),
          subjects: selectedSubjects,
          classes: selectedClasses,
        };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setFormError(data.error || 'Failed to save teacher.');
      return;
    }
    setModalOpen(false);
    await loadTeachers();
  };

  const handleToggleStatus = async (t: BackendTeacher) => {
    const nextStatus = t.status === 'active' ? 'inactive' : 'active';
    await fetch(`/api/v1/admin/teachers/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: nextStatus }),
    });
    await loadTeachers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/v1/admin/teachers/${deleteTarget.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setDeleteTarget(null);
    await loadTeachers();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    const res = await fetch(`/api/v1/admin/teachers/${resetTarget.id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ newPassword: resetPwdValue.trim() || undefined }),
    });
    const body = (await res.json()) as { assignedPassword?: string };
    setTempPwdNotice({
      name: resetTarget.fullName,
      phone: resetTarget.phoneNumber,
      password: body.assignedPassword || resetPwdValue,
    });
    setResetTarget(null);
    setResetPwdValue('');
    await loadTeachers();
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Teachers</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {teachers.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Active Accounts</div>
          <div className="font-display text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {teachers.filter((t) => t.status === 'active').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Deactivated Accounts</div>
          <div className="font-display text-2xl font-bold text-slate-600 tabular-nums mt-1">
            {teachers.filter((t) => t.status === 'inactive').length}
          </div>
        </div>
      </div>

      {tempPwdNotice && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-emerald-950 space-y-1">
            <div className="font-bold text-sm">
              Password Reset for {tempPwdNotice.name} ({tempPwdNotice.phone})
            </div>
            <p>
              Temporary password:{' '}
              <code className="px-2 py-0.5 rounded bg-white border border-emerald-300 font-mono font-bold text-slate-900">
                {tempPwdNotice.password}
              </code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTempPwdNotice(null)}
            className="text-xs font-semibold text-emerald-900 underline self-start sm:self-center"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher name, phone, dept..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2544]"
          />
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Teacher</span>
        </button>
      </div>

      <DataStateShell
        isLoading={loading}
        error={error}
        onRetry={() => void loadTeachers()}
        isEmpty={filtered.length === 0}
        emptyTitle="No registered teachers found"
        emptyDescription="Add a teacher with a phone number and initial password to grant Teacher Portal access."
        emptyActionLabel="Add Teacher"
        onEmptyAction={openCreate}
      >
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-medium text-slate-900">{t.fullName}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums">
                    {t.phoneNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{t.department}</td>
                  <td className="py-3 px-4 text-xs font-semibold capitalize">
                    <span className={t.status === 'active' ? 'text-emerald-700' : 'text-red-700'}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetTarget(t);
                        setResetPwdValue('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                      title="Reset Password"
                    >
                      <KeyRound className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleStatus(t)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                      title={t.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {t.status === 'active' ? (
                        <ShieldBan className="w-3 h-3 text-amber-700" />
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(t)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                      title="Delete Teacher"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataStateShell>

      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Registered Teacher' : 'Register New Teacher'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (Unique) *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="9800000109"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {!editing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Password (min 6 characters) *
              </label>
              <input
                type="text"
                value={initialPassword}
                onChange={(e) => setInitialPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Assigned initial password"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Subjects
            </label>
            <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-lg p-2.5 max-h-28 overflow-y-auto">
              {schoolState.subjects.map((sub) => (
                <label key={sub.id} className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(sub.id)}
                    onChange={() =>
                      toggleItem(selectedSubjects, sub.id, setSelectedSubjects)
                    }
                  />
                  <span className="truncate">{sub.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Classes
            </label>
            <div className="grid grid-cols-3 gap-2 border border-slate-200 rounded-lg p-2.5">
              {schoolState.classes.map((cls) => (
                <label key={cls.id} className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(cls.id)}
                    onChange={() =>
                      toggleItem(selectedClasses, cls.id, setSelectedClasses)
                    }
                  />
                  <span>
                    {cls.grade} {cls.section}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg"
            >
              {editing ? 'Save Changes' : 'Register Teacher'}
            </button>
          </div>
        </form>
      </ModalDialog>

      <ModalDialog
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        title={`Reset Teacher Password: ${resetTarget?.fullName ?? ''}`}
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
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Delete Teacher Account"
        message={`Delete "${deleteTarget?.fullName}" (${deleteTarget?.phoneNumber})? This revokes their active session and removes their login access.`}
      />
    </div>
  );
};
