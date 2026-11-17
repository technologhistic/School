import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getClassLabel } from '../../services/schoolService';
import { ConfirmDialog, ModalDialog } from '../../components/common/ModalDialog';
import { DataStateShell } from '../../components/common/DataStateShell';
import { Student } from '../../types/school';

export const AdminStudentsPage: React.FC = () => {
  const state = useSchoolStore();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const [name, setName] = useState('');
  const [classId, setClassId] = useState(state.classes[0]?.id ?? 'cls-10a');
  const [rollNumber, setRollNumber] = useState('10');
  const [guardianName, setGuardianName] = useState('');
  const [emailDemo, setEmailDemo] = useState('');
  const [phoneDemo, setPhoneDemo] = useState('+977-9800000099');
  const [addressDemo, setAddressDemo] = useState('Lalitpur');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.students.filter((s) => {
      const classOk = classFilter === 'all' || s.classId === classFilter;
      const queryOk =
        !q || s.name.toLowerCase().includes(q) || s.guardianName.toLowerCase().includes(q);
      return classOk && queryOk;
    });
  }, [state.students, search, classFilter]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setClassId(state.classes[0]?.id ?? 'cls-10a');
    setRollNumber(String(state.students.length + 1));
    setGuardianName('');
    setEmailDemo('');
    setPhoneDemo('+977-9800000099');
    setAddressDemo('Lalitpur');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (stu: Student) => {
    setEditing(stu);
    setName(stu.name);
    setClassId(stu.classId);
    setRollNumber(String(stu.rollNumber));
    setGuardianName(stu.guardianName);
    setEmailDemo(stu.emailDemo);
    setPhoneDemo(stu.phoneDemo);
    setAddressDemo(stu.addressDemo);
    setError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || guardianName.trim().length < 2) {
      setError('Enter student name and guardian name.');
      return;
    }
    const cls = state.classes.find((c) => c.id === classId);
    const payload = {
      name: name.trim(),
      classId,
      section: cls?.section ?? 'A',
      rollNumber: Math.max(1, Number(rollNumber) || 1),
      parentIds: editing?.parentIds ?? [],
      emailDemo: emailDemo.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@demo.student.np`,
      phoneDemo: phoneDemo.trim(),
      addressDemo: addressDemo.trim(),
      dateOfBirthAD: editing?.dateOfBirthAD ?? '2012-04-15',
      guardianName: guardianName.trim(),
      status: 'active' as const,
    };

    if (editing) {
      state.updateStudent(editing.id, payload);
    } else {
      state.addStudent(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search demo students..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2544]"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
          >
            <option value="all">All Classes</option>
            {state.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grade} – {c.section}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Demo Student</span>
        </button>
      </div>

      <DataStateShell
        isEmpty={filtered.length === 0}
        emptyTitle="No student records match your filter"
        emptyDescription="Clear the search filter or add a new fictional demo student."
        emptyActionLabel="Add Demo Student"
        onEmptyAction={openCreate}
      >
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Guardian</th>
                <th className="py-3 px-4">Demo Email</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                    #{stu.rollNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{stu.name}</td>
                  <td className="py-3 px-4 text-slate-600">{getClassLabel(state, stu.classId)}</td>
                  <td className="py-3 px-4 text-slate-600">{stu.guardianName}</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">{stu.emailDemo}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(stu)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(stu)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
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
        title={editing ? 'Edit Demo Student' : 'Add Fictional Demo Student'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {state.classes.map((c) => (
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
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name *</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={addressDemo}
                onChange={(e) => setAddressDemo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Demo Email</label>
              <input
                type="email"
                value={emailDemo}
                onChange={(e) => setEmailDemo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Demo Phone</label>
              <input
                type="text"
                value={phoneDemo}
                onChange={(e) => setPhoneDemo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
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
              {editing ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && state.deleteStudent(deleteTarget.id)}
        title="Delete Demo Student"
        message={`Delete "${deleteTarget?.name}" from local demo state? Associated demo attendance and marks for this student will also be removed.`}
      />
    </div>
  );
};
