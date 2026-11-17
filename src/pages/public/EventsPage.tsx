import React, { useMemo, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { DateDisplay } from '../../components/common/DateDisplay';
import { DataStateShell } from '../../components/common/DataStateShell';

const REFERENCE_TODAY = '2026-11-17';

export const EventsPage: React.FC = () => {
  const { events, language } = useSchoolStore();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const filtered = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
    if (tab === 'upcoming') return sorted.filter((e) => e.endDate >= REFERENCE_TODAY);
    if (tab === 'past') return sorted.filter((e) => e.endDate < REFERENCE_TODAY).reverse();
    return sorted;
  }, [events, tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#2B548A]">Academic & Cultural Calendar</div>
          <h1 className="font-display text-3xl font-bold text-slate-900">School Events</h1>
          <p className="text-sm text-slate-600">
            Upcoming term meetings, science exhibitions, sports days, and cultural assemblies.
          </p>
        </div>

        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg self-start">
          {(
            [
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'past', label: 'Past Events' },
              { id: 'all', label: 'All Events' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                tab === item.id ? 'bg-[#0F2544] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <DataStateShell
        isEmpty={filtered.length === 0}
        emptyTitle="No events in this timeframe"
        emptyDescription="Switch tabs to view all scheduled or past events."
        emptyActionLabel="View All Events"
        onEmptyAction={() => setTab('all')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((ev) => (
            <div key={ev.id} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#2B548A]">{ev.category}</span>
                <span>{ev.endDate >= REFERENCE_TODAY ? 'Scheduled' : 'Completed'}</span>
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                {language === 'np' && ev.titleNp ? ev.titleNp : ev.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{ev.description}</p>
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0F2544]" />
                  <DateDisplay date={ev.startDate} />
                  {ev.endDate !== ev.startDate && (
                    <>
                      <span>–</span>
                      <DateDisplay date={ev.endDate} />
                    </>
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0F2544]" />
                  {ev.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DataStateShell>
    </div>
  );
};
