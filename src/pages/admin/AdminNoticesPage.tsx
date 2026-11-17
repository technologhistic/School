import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { DateDisplay } from '../../components/common/DateDisplay';
import { ConfirmDialog, ModalDialog } from '../../components/common/ModalDialog';
import { Notice, NoticeCategory, SchoolEvent } from '../../types/school';

export const AdminNoticesPage: React.FC = () => {
  const state = useSchoolStore();

  // Notices State
  const [noticeModal, setNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteNoticeTarget, setDeleteNoticeTarget] = useState<Notice | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Academic');
  const [audience, setAudience] = useState<Notice['audience']>('All');
  const [publishDate, setPublishDate] = useState('2026-11-17');
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(true);

  // Events State (ADM-08)
  const [eventModal, setEventModal] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evCategory, setEvCategory] = useState<SchoolEvent['category']>('Academic');
  const [evDate, setEvDate] = useState('2026-12-10');
  const [evLocation, setEvLocation] = useState('Multi-Purpose Hall');
  const [evDesc, setEvDesc] = useState('');

  const openCreateNotice = () => {
    setEditingNotice(null);
    setTitle('');
    setCategory('Academic');
    setAudience('All');
    setPublishDate('2026-11-17');
    setBody('');
    setPublished(true);
    setNoticeModal(true);
  };

  const openEditNotice = (n: Notice) => {
    setEditingNotice(n);
    setTitle(n.title);
    setCategory(n.category);
    setAudience(n.audience);
    setPublishDate(n.publishDate);
    setBody(n.body);
    setPublished(n.published);
    setNoticeModal(true);
  };

  const saveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3 || body.trim().length < 5) return;
    if (editingNotice) {
      state.updateNotice(editingNotice.id, {
        title: title.trim(),
        category,
        audience,
        publishDate,
        body: body.trim(),
        published,
      });
    } else {
      state.addNotice({
        title: title.trim(),
        category,
        audience,
        publishDate,
        body: body.trim(),
        published,
      });
    }
    setNoticeModal(false);
  };

  const saveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (evTitle.trim().length < 3) return;
    state.addEvent({
      title: evTitle.trim(),
      category: evCategory,
      startDate: evDate,
      endDate: evDate,
      location: evLocation.trim() || 'Campus Courtyard',
      description: evDesc.trim() || 'Scheduled campus event.',
    });
    setEvTitle('');
    setEvDesc('');
    setEventModal(false);
  };

  return (
    <div className="space-y-10">
      {/* Notices CRUD */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">School Notices</h2>
            <p className="text-xs text-slate-500">
              Create, edit, publish/unpublish, and delete notices synced to the public notice board
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateNotice}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Notice</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {state.notices.map((n) => (
            <div
              key={n.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-[#2B548A]">{n.category}</span>
                  <span>·</span>
                  <DateDisplay date={n.publishDate} />
                  <span>·</span>
                  <span className={n.published ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {n.published ? 'Published' : 'Unpublished Draft'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{n.title}</div>
                <p className="text-xs text-slate-600 line-clamp-1">{n.body}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => state.updateNotice(n.id, { published: !n.published })}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {n.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => openEditNotice(n)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteNoticeTarget(n)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events Management (ADM-08) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Campus Events</h2>
            <p className="text-xs text-slate-500">Manage upcoming and past events shown on the public website</p>
          </div>
          <button
            type="button"
            onClick={() => setEventModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {state.events.map((ev) => (
            <div key={ev.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">
                  {ev.category} · <DateDisplay date={ev.startDate} /> · {ev.location}
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{ev.title}</div>
              </div>
              <button
                type="button"
                onClick={() => state.deleteEvent(ev.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <ModalDialog
        open={noticeModal}
        onClose={() => setNoticeModal(false)}
        title={editingNotice ? 'Edit Notice' : 'Create Notice'}
      >
        <form onSubmit={saveNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {['Academic', 'Examination', 'Holiday', 'Event', 'Administrative'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as Notice['audience'])}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {['All', 'Students', 'Teachers', 'Parents'].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Body *</label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>Publish immediately on public website</span>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNoticeModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg"
            >
              {editingNotice ? 'Save Changes' : 'Save Notice'}
            </button>
          </div>
        </form>
      </ModalDialog>

      <ModalDialog open={eventModal} onClose={() => setEventModal(false)} title="Add Campus Event">
        <form onSubmit={saveEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={evCategory}
                onChange={(e) => setEvCategory(e.target.value as SchoolEvent['category'])}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {['Academic', 'Cultural', 'Sports', 'Holiday'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={evDate}
                onChange={(e) => setEvDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={evLocation}
              onChange={(e) => setEvLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={evDesc}
              onChange={(e) => setEvDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEventModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg"
            >
              Add Event
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteNoticeTarget)}
        onClose={() => setDeleteNoticeTarget(null)}
        onConfirm={() => deleteNoticeTarget && state.deleteNotice(deleteNoticeTarget.id)}
        title="Delete Notice"
        message={`Delete "${deleteNoticeTarget?.title}"?`}
      />
    </div>
  );
};
