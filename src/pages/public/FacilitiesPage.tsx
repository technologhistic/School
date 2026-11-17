import React from 'react';
import { GalleryIllustration } from '../../components/common/SchoolArtwork';

export const FacilitiesPage: React.FC = () => {
  const facilities = [
    {
      title: 'Central Reference Library & Quiet Reading Hall',
      type: 'library' as const,
      meta: 'Block A, Ground Floor',
      description:
        'Open from 8:30 AM to 4:30 PM with dedicated Grade 1–5 picture book corners, NEB reference archives, and periodicals in English and Nepali.',
    },
    {
      title: 'Integrated Physics, Chemistry & Biology Labs',
      type: 'science' as const,
      meta: 'Block B, Second Floor',
      description:
        'Equipped with optical benches, fume-safe titration stations, compound microscopes, and safety gear for Grades 6 through +2 Science practicums.',
    },
    {
      title: 'Computer Science & Digital Literacy Lab',
      type: 'campus' as const,
      meta: 'Block B, First Floor',
      description:
        'Structured programming workstations supporting Python, web fundamentals, spreadsheet modeling, and supervised internet research.',
    },
    {
      title: 'All-Weather Athletics & Basketball Ground',
      type: 'sports' as const,
      meta: 'South Courtyard · Outdoor Courts',
      description:
        'Full-size outdoor basketball court, sprint track, table tennis tables, and covered physical education equipment storage.',
    },
    {
      title: 'Multi-Purpose Assembly & Performing Arts Hall',
      type: 'assembly' as const,
      meta: 'Central Wing · Main Auditorium',
      description:
        'Acoustically treated auditorium for science exhibitions, inter-house debates, Dashain/Tihar assemblies, and parent orientations.',
    },
    {
      title: 'Visual Arts & Craft Studio',
      type: 'arts' as const,
      meta: 'Block A, Top Floor · North Daylight',
      description:
        'Natural-light studio dedicated to architectural sketching, watercolor, clay modeling, and traditional Nepali geometry workshops.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-3xl space-y-2">
        <div className="text-xs font-medium text-[#2B548A]">Campus Infrastructure</div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Library, Laboratories & Campus Facilities
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Every facility is scheduled into weekly class timetables to ensure practical learning alongside classroom theory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac) => (
          <div
            key={fac.title}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
          >
            <GalleryIllustration type={fac.type} className="w-full h-48" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-xs font-medium text-[#2B548A]">{fac.meta}</div>
              <h2 className="font-display text-base font-bold text-slate-900 mt-1.5">
                {fac.title}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{fac.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
