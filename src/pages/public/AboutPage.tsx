import React from 'react';
import { Link } from 'react-router-dom';
import { useSchoolStore } from '../../store/useSchoolStore';

export const AboutPage: React.FC = () => {
  const { config, teachers } = useSchoolStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-medium text-[#2B548A]">Established {config.establishedYear}</div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          About {config.schoolName}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">{config.aboutHistory}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <div className="text-xs font-semibold text-[#2B548A]">Our Vision</div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Academic Rigor & Character
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{config.aboutVision}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <div className="text-xs font-semibold text-[#2B548A]">Our Mission</div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Daily Classroom Commitment
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{config.aboutMission}</p>
        </div>
      </div>

      {/* Principal & Leadership */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">School Leadership</h2>
            <p className="text-sm text-slate-600 mt-1">
              Academic governance and department coordinators. (Editable in Admin Settings)
            </p>
          </div>
          <Link
            to="/teachers"
            className="text-sm font-semibold text-[#0F2544] hover:underline whitespace-nowrap"
          >
            View full faculty directory
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-200 rounded-xl p-5 bg-[#F6F7F9]/60">
            <div className="text-xs text-[#2B548A] font-medium">{config.principalTitle}</div>
            <h3 className="font-display text-base font-bold text-slate-900 mt-1">
              {config.principalName}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {config.principalMessage}
            </p>
          </div>

          {teachers.slice(0, 2).map((tch) => (
            <div key={tch.id} className="border border-slate-200 rounded-xl p-5 bg-white">
              <div className="text-xs text-[#2B548A] font-medium">{tch.designation}</div>
              <h3 className="font-display text-base font-bold text-slate-900 mt-1">{tch.name}</h3>
              <div className="text-xs text-slate-500 mt-1">{tch.qualification}</div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{tch.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
