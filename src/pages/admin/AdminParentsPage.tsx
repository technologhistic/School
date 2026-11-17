import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { ConfirmDialog, ModalDialog } from '../../components/common/ModalDialog';
import { Parent } from '../../types/school';

export const AdminParentsPage: React.FC = () => {
  const state = useSchoolStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Parent | null>(null);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [contactDemo, setContactDemo] = useState('+977-9800000250');
  const [emailDemo, setEmailDemo] = useState('');
  const [occupation, setOccupation] = useState('');
  const [linkedIds, setLinkedIds] = useState<string[]>([state.students[0]?.id ?? 'stu-1']);

  const toggleStudentLink = (stuId: string) => {
    setLinkedIds((prev) =>
      prev.includes(stuId) ? prev.filter((id) => id !== stuId) : [...prev, stuId]
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    state.addParent({
      name: name.trim(),
      relation,
      contactDemo: contactDemo.trim(),
      emailDemo: emailDemo.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@family.sagarmathaacademy.edu.np`,
      occupation: occupation.trim() || 'Guardian',
      linkedStudentIds: linkedIds,
    });
    setName('');
    setEmailDemo('');
    setOccupation('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Manage parent/guardian accounts and linked student relationships.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Parent</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Guardian Name</th>
              <th className="py-3 px-4">Relation</th>
              <th className="py-3 px-4">Linked Children</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {state.parents.map((par) => {
              const childNames = par.linkedStudentIds
                .map((sid) => state.students.find((s) => s.id === sid)?.name)
                .filter(Boolean)
                .join(', ');
              return (
                <tr key={par.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-medium text-slate-900">{par.name}</td>
                  <td className="py-3 px-4 text-slate-600">{par.relation}</td>
                  <td className="py-3 px-4 text-slate-700">{childNames || 'None linked'}</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">{par.contactDemo}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(par)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalDialog open={modalOpen} onClose={() => setModalOpen(false)} title="Add Parent / Guardian">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relation</label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={contactDemo}
                onChange={(e) => setContactDemo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Link Students
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {state.students.map((stu) => (
                <label key={stu.id} className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={linkedIds.includes(stu.id)}
                    onChange={() => toggleStudentLink(stu.id)}
                  />
                  <span>{stu.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
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
              Add Parent
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && state.deleteParent(deleteTarget.id)}
        title="Delete Parent Record"
        message={`Remove "${deleteTarget?.name}" from parent records?`}
      />
    </div>
  );
};
