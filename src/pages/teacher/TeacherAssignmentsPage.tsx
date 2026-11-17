import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getClassLabel, getSubjectName } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';
import { ConfirmDialog, ModalDialog } from '../../components/common/ModalDialog';
import { Assignment, LearningMaterial } from '../../types/school';

export const TeacherAssignmentsPage: React.FC = () => {
  const state = useSchoolStore();
  const teacher = state.teachers.find((t) => t.id === state.activeTeacherId) ?? state.teachers[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState(teacher?.classIds[0] ?? 'cls-10a');
  const [subjectId, setSubjectId] = useState(teacher?.subjectIds[0] ?? 'sub-math');
  const [dueDate, setDueDate] = useState('2026-11-25');
  const [maxPoints, setMaxPoints] = useState('20');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Learning Material Add Modal (TCH-06)
  const [matModalOpen, setMatModalOpen] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<LearningMaterial['resourceType']>('PDF Guide');
  const [matSummary, setMatSummary] = useState('');

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setClassId(teacher?.classIds[0] ?? 'cls-10a');
    setSubjectId(teacher?.subjectIds[0] ?? 'sub-math');
    setDueDate('2026-11-25');
    setMaxPoints('20');
    setDescription('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (asg: Assignment) => {
    setEditing(asg);
    setTitle(asg.title);
    setClassId(asg.classId);
    setSubjectId(asg.subjectId);
    setDueDate(asg.dueDate);
    setMaxPoints(String(asg.maxPoints));
    setDescription(asg.description);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3 || description.trim().length < 5) {
      setFormError('Please provide an assignment title and short instructions.');
      return;
    }
    const pts = Math.max(1, Math.min(100, Number(maxPoints) || 20));
    if (editing) {
      state.updateAssignment(editing.id, {
        title: title.trim(),
        classId,
        subjectId,
        dueDate,
        maxPoints: pts,
        description: description.trim(),
      });
    } else {
      state.addAssignment({
        title: title.trim(),
        classId,
        subjectId,
        teacherId: teacher?.id ?? 'tch-1',
        dueDate,
        maxPoints: pts,
        description: description.trim(),
        status: 'pending',
      });
    }
    setModalOpen(false);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (matTitle.trim().length < 3) return;
    state.addMaterial({
      title: matTitle.trim(),
      classId: teacher?.classIds[0] ?? 'cls-10a',
      subjectId: teacher?.subjectIds[0] ?? 'sub-math',
      teacherId: teacher?.id ?? 'tch-1',
      resourceType: matType,
      uploadedDate: '2026-11-17',
      fileSize: '340 KB',
      summary: matSummary.trim() || 'Study resource shared by subject teacher.',
    });
    setMatTitle('');
    setMatSummary('');
    setMatModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Homework CRUD */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Homework Assignments</h2>
            <p className="text-xs text-slate-500">Create, edit, or delete class assignments</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] self-start"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {state.assignments.map((asg) => (
            <div
              key={asg.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-[#2B548A]">
                    {getClassLabel(state, asg.classId)}
                  </span>
                  {' · '}
                  <span>{getSubjectName(state, asg.subjectId)}</span>
                  {' · '}
                  <span>Due <DateDisplay date={asg.dueDate} /></span>
                </div>
                <div className="text-sm font-bold text-slate-900">{asg.title}</div>
                <p className="text-xs text-slate-600">{asg.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(asg)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(asg)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Materials List (TCH-06) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Study Materials Metadata</h2>
            <p className="text-xs text-slate-500">Shared resources visible in Student Materials</p>
          </div>
          <button
            type="button"
            onClick={() => setMatModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource Metadata</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {state.materials.map((mat) => (
            <div key={mat.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">
                  {mat.resourceType} · {getClassLabel(state, mat.classId)} · {getSubjectName(state, mat.subjectId)}
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{mat.title}</div>
              </div>
              <button
                type="button"
                onClick={() => state.deleteMaterial(mat.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Assignment' : 'Create Assignment'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {state.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Points</label>
              <input
                type="number"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {editing ? 'Save Changes' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </ModalDialog>

      <ModalDialog
        open={matModalOpen}
        onClose={() => setMatModalOpen(false)}
        title="Add Study Resource Metadata"
      >
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Title *</label>
            <input
              type="text"
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              placeholder="e.g. Chapter 5 Revision Notes"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Type</label>
            <select
              value={matType}
              onChange={(e) => setMatType(e.target.value as LearningMaterial['resourceType'])}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {['PDF Guide', 'Worksheet', 'Slide Deck', 'Lab Notes'].map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
            <textarea
              rows={2}
              value={matSummary}
              onChange={(e) => setMatSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMatModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg"
            >
              Add Resource
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && state.deleteAssignment(deleteTarget.id)}
        title="Delete Assignment"
        message={`Remove "${deleteTarget?.title}" from the class homework list?`}
      />
    </div>
  );
};
