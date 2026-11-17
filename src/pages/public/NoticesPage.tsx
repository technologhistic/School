import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { DateDisplay } from '../../components/common/DateDisplay';
import { ModalDialog } from '../../components/common/ModalDialog';
import { DataStateShell } from '../../components/common/DataStateShell';
import { Notice, NoticeCategory } from '../../types/school';
import { downloadSampleNoticePdf } from '../../utils/pdfDownload';
import { formatSchoolDate } from '../../utils/bsDate';

const CATEGORIES: Array<'All' | NoticeCategory> = [
  'All',
  'Academic',
  'Examination',
  'Holiday',
  'Event',
  'Administrative',
];

export const NoticesPage: React.FC = () => {
  const { notices, config, language, calendarMode } = useSchoolStore();
  const [category, setCategory] = useState<'All' | NoticeCategory>('All');
  const [search, setSearch] = useState('');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  const publishedNotices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notices
      .filter((n) => n.published)
      .filter((n) => category === 'All' || n.category === category)
      .filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          (n.titleNp && n.titleNp.includes(q))
      )
      .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  }, [notices, category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="max-w-3xl space-y-2">
        <div className="text-xs font-medium text-[#2B548A]">Announcements & Circulars</div>
        <h1 className="font-display text-3xl font-bold text-slate-900">School Notices</h1>
        <p className="text-sm text-slate-600">
          Official announcements, examination schedules, Dashain & Tihar vacation notices, and downloadable sample circulars.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-[#0F2544] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2544]"
          />
        </div>
      </div>

      <DataStateShell
        isEmpty={publishedNotices.length === 0}
        emptyTitle="No published notices found"
        emptyDescription="Adjust your category filter or search query."
        emptyActionLabel="Show All Notices"
        onEmptyAction={() => {
          setCategory('All');
          setSearch('');
        }}
      >
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {publishedNotices.map((notice) => (
            <div
              key={notice.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-[#2B548A]">{notice.category}</span>
                  <span aria-hidden="true">·</span>
                  <DateDisplay date={notice.publishDate} />
                  <span aria-hidden="true">·</span>
                  <span>Audience: {notice.audience}</span>
                </div>
                <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900">
                  {language === 'np' && notice.titleNp ? notice.titleNp : notice.title}
                </h2>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {language === 'np' && notice.bodyNp ? notice.bodyNp : notice.body}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveNotice(notice)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Read Detail
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadSampleNoticePdf({
                      schoolName: config.schoolName,
                      address: config.address,
                      title: notice.title,
                      category: notice.category,
                      dateLabel: formatSchoolDate(notice.publishDate, calendarMode, 'en'),
                      body: notice.body,
                      fileName: notice.attachmentName,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </DataStateShell>

      <ModalDialog
        open={Boolean(activeNotice)}
        onClose={() => setActiveNotice(null)}
        title={activeNotice?.title ?? ''}
        description={
          activeNotice
            ? `${activeNotice.category} · ${formatSchoolDate(activeNotice.publishDate, calendarMode, language)}`
            : ''
        }
      >
        {activeNotice && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {language === 'np' && activeNotice.bodyNp ? activeNotice.bodyNp : activeNotice.body}
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Audience: {activeNotice.audience}</span>
              <button
                type="button"
                onClick={() =>
                  downloadSampleNoticePdf({
                    schoolName: config.schoolName,
                    address: config.address,
                    title: activeNotice.title,
                    category: activeNotice.category,
                    dateLabel: formatSchoolDate(activeNotice.publishDate, calendarMode, 'en'),
                    body: activeNotice.body,
                    fileName: activeNotice.attachmentName,
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample PDF</span>
              </button>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
};
