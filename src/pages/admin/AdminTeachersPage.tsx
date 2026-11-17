import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { ConfirmDialog, ModalDialog } from '../../components/common/ModalDialog';
import { Teacher } from '../../types/school';

export const AdminTeachersPage: React.FC = () => {
  const state = useSchoolStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Mathematics');
  const [qualification, setQualification] = useState('');
  const [emailDemo, setEmailDemo] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDesignation('Subject Teacher');
    setDepartment('Mathematics');
    setQualification('M.Sc. / M.A.');
    setEmailDemo('');
    setExperienceYears('5');
    setBio('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (tch: Teacher) => {
    setEditing(tch);
    setName(tch.name);
    setDesignation(tch.designation);
    setDepartment(tch.department);
    setQualification(tch.qualification);
    setEmailDemo(tch.emailDemo);
    setExperienceYears(String(tch.experienceYears));
    setBio(tch.bio);
    setError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || designation.trim().length < 2) {
      setError('Enter teacher name and designation.');
      return;
    }
    const payload = {
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim(),
      qualification: qualification.trim() || 'Master’s Degree',
      emailDemo: emailDemo.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@demo.school.edu.np`,
      phoneDemo: editing?.phoneDemo ?? '+977-9800000199',
      subjectIds: editing?.subjectIds ?? ['sub-math'],
      classIds: editing?.classIds ?? ['cls-10a'],
      experienceYears: Math.max(1, Number(experienceYears) || 1),
      bio: bio.trim() || 'Dedicated faculty member.',
    };
    if (editing) {
      state.updateTeacher(editing.id, payload);
    } else {
      state.addTeacher(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Faculty records managed here automatically update the public Faculty Directory.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Demo Teacher</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Teacher Name</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Demo Email</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {state.teachers.map((tch) => (
              <tr key={tch.id} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-medium text-slate-900">{tch.name}</td>
                <td className="py-3 px-4 text-slate-600">{tch.designation}</td>
                <td className="py-3 px-4 text-slate-600">{tch.department}</td>
                <td className="py-3 px-4 text-xs font-mono text-slate-500">{tch.emailDemo}</td>
                <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(tch)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(tch)}
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

      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Demo Teacher' : 'Add Fictional Demo Teacher'}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
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
              {editing ? 'Save Changes' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && state.deleteTeacher(deleteTarget.id)}
        title="Delete Demo Teacher"
        message={`Remove "${deleteTarget?.name}" from the faculty directory?`}
      />
    </div>
  );
};
