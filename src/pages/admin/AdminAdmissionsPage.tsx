import React, { useState } from 'react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { AdmissionStatus } from '../../types/school';
import { DateDisplay } from '../../components/common/DateDisplay';
import { DataStateShell } from '../../components/common/DataStateShell';

export const AdminAdmissionsPage: React.FC = () => {
  const { admissions, updateAdmissionStatus } = useSchoolStore();
  const [filter, setFilter] = useState<'all' | AdmissionStatus>('all');

  const filtered =
    filter === 'all' ? admissions : admissions.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap p-1 bg-white border border-slate-200 rounded-lg self-start">
          {(['all', 'pending', 'under_review', 'accepted', 'waitlisted'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                filter === st ? 'bg-[#0F2544] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 tabular-nums">{filtered.length} applications</div>
      </div>

      <DataStateShell
        isEmpty={filtered.length === 0}
        emptyTitle="No admission applications in this status"
        emptyDescription="Submit an application from the public Admissions page or switch filters."
        emptyActionLabel="Show All"
        onEmptyAction={() => setFilter('all')}
      >
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-[#2B548A]">{app.grade}</span>
                  {' · '}
                  <span>Submitted <DateDisplay date={app.submittedAt} /></span>
                  {' · '}
                  <span>Previous: {app.previousSchool}</span>
                </div>
                <div className="text-base font-bold text-slate-900">{app.applicantName}</div>
                <div className="text-xs text-slate-600">
                  Guardian: {app.guardianName} · {app.contactDemo} · {app.emailDemo}
                </div>
                <p className="text-xs text-slate-500 pt-1">{app.statement}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <label className="text-xs font-medium text-slate-500" htmlFor={`status-${app.id}`}>
                  Status
                </label>
                <select
                  id={`status-${app.id}`}
                  value={app.status}
                  onChange={(e) =>
                    updateAdmissionStatus(app.id, e.target.value as AdmissionStatus)
                  }
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0F2544]"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="waitlisted">Waitlisted</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </DataStateShell>
    </div>
  );
};
