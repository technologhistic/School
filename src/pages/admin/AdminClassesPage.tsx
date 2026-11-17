import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getTeacherName } from '../../services/schoolService';
import { ConfirmDialog, ModalDialog } from '../../components/common/ModalDialog';
import { SchoolClass } from '../../types/school';

export const AdminClassesPage: React.FC = () => {
  const state = useSchoolStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null);

  const [grade, setGrade] = useState('Grade 8');
  const [section, setSection] = useState('A');
  const [room, setRoom] = useState('Block A · Room 105');
  const [classTeacherId, setClassTeacherId] = useState(state.teachers[0]?.id ?? 'tch-1');
  const [capacity, setCapacity] = useState('34');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    state.addClass({
      grade: grade.trim(),
      section: section.trim() || 'A',
      room: room.trim() || 'Block A',
      classTeacherId,
      subjectIds: state.subjects.map((s) => s.id),
      teacherIds: [classTeacherId],
      capacity: Math.max(10, Number(capacity) || 34),
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Classes & Sections</h2>
            <p className="text-xs text-slate-500">Manage class sections, homeroom rooms, and capacities</p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Section</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {state.classes.map((cls) => {
            const count = state.students.filter((s) => s.classId === cls.id).length;
            return (
              <div key={cls.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-slate-500">{cls.room}</div>
                    <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                      {cls.grade} – Section {cls.section}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cls)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                    aria-label={`Delete ${cls.grade}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>Class Teacher: {getTeacherName(state, cls.classTeacherId)}</div>
                  <div className="tabular-nums">
                    Enrolled: {count} / {cls.capacity} capacity · {cls.subjectIds.length} subjects
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curriculum Subjects Overview */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-slate-900">Configured Subjects</h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Nepali Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Weekly Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {state.subjects.map((sub) => (
                <tr key={sub.id}>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{sub.code}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{sub.name}</td>
                  <td className="py-3 px-4 text-slate-600">{sub.nameNp}</td>
                  <td className="py-3 px-4 text-slate-600">{sub.department}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{sub.creditHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ModalDialog open={modalOpen} onClose={() => setModalOpen(false)} title="Add Class Section">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grade *</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Label</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class Teacher</label>
            <select
              value={classTeacherId}
              onChange={(e) => setClassTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {state.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
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
              Add Class
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && state.deleteClass(deleteTarget.id)}
        title="Delete Class Section"
        message={`Remove "${deleteTarget?.grade} – ${deleteTarget?.section}" from active classes?`}
      />
    </div>
  );
};
