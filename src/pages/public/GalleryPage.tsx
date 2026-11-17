import React, { useState } from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { GalleryIllustration } from '../../components/common/SchoolArtwork';
import { DateDisplay } from '../../components/common/DateDisplay';
import { ModalDialog } from '../../components/common/ModalDialog';
import { GalleryItem } from '../../types/school';
import { formatSchoolDate } from '../../utils/bsDate';

const CATEGORIES: Array<'All' | GalleryItem['category']> = [
  'All',
  'Campus',
  'Academics',
  'Sports',
  'Cultural',
];

export const GalleryPage: React.FC = () => {
  const { gallery, calendarMode, language } = useSchoolStore();
  const [category, setCategory] = useState<'All' | GalleryItem['category']>('All');
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const filtered =
    category === 'All' ? gallery : gallery.filter((item) => item.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#2B548A]">Campus Showcase</div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            School Photo & Visual Gallery
          </h1>
          <p className="text-sm text-slate-600">
            Select any card to inspect campus spaces and activities in lightbox preview.
          </p>
        </div>

        <div className="inline-flex flex-wrap p-1 bg-white border border-slate-200 rounded-lg self-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                category === cat ? 'bg-[#0F2544] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors group"
          >
            <GalleryIllustration type={item.illustrationType} className="w-full h-52" />
            <div className="p-5">
              <div className="text-xs text-slate-500">
                {item.category} · <DateDisplay date={item.date} />
              </div>
              <h2 className="font-display text-base font-bold text-slate-900 mt-1 group-hover:text-[#0F2544]">
                {item.title}
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{item.caption}</p>
            </div>
          </button>
        ))}
      </div>

      <ModalDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        description={
          selected
            ? `${selected.category} · ${formatSchoolDate(selected.date, calendarMode, language)}`
            : ''
        }
        maxWidthClass="max-w-2xl"
      >
        {selected && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <GalleryIllustration type={selected.illustrationType} className="w-full h-80" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selected.caption}</p>
          </div>
        )}
      </ModalDialog>
    </div>
  );
};
