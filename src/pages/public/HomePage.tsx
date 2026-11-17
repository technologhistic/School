import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Download, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { TRANSLATIONS } from '../../i18n/translations';
import { CampusHeroIllustration, GalleryIllustration } from '../../components/common/SchoolArtwork';
import { DateDisplay } from '../../components/common/DateDisplay';
import { ModalDialog } from '../../components/common/ModalDialog';
import { downloadSampleNoticePdf } from '../../utils/pdfDownload';
import { formatSchoolDate } from '../../utils/bsDate';
import { GalleryItem, Notice } from '../../types/school';

export const HomePage: React.FC = () => {
  const { config, language, calendarMode, notices, events, gallery } =
    useSchoolStore();
  const t = TRANSLATIONS[language];

  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);

  const publishedNotices = notices.filter((n) => n.published).slice(0, 4);
  const upcomingEvents = events.filter((e) => e.startDate >= '2026-11-17').slice(0, 3);
  const galleryPreview = gallery.slice(0, 4);

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="text-xs font-medium text-[#2B548A] tracking-wide">
                {t.hero.kicker}
              </div>
              <h1
                className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-slate-900 tracking-tight leading-[1.15]"
                style={{ textWrap: 'balance' }}
              >
                {t.hero.headline}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                {t.hero.subheadline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/admissions"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors whitespace-nowrap"
                >
                  <span>{t.hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <span>{t.hero.secondaryCta}</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span>Session {config.academicYearBS} ({config.academicYearAD})</span>
                <span aria-hidden="true">·</span>
                <span>{config.address}</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <CampusHeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* 2. School Introduction & Key Statistics */}
      <section className="py-14 border-b border-slate-200 bg-[#F6F7F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {t.sections.statsTitle}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {config.aboutHistory}
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2544] hover:underline pt-1"
              >
                <span>Read school history & leadership</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Academic Divisions', value: 'Grades 1 – 12', sub: 'Primary, Secondary & +2 Streams' },
                { label: 'Curriculum Track', value: 'NEB & National', sub: 'Science & Management Streams' },
                { label: 'Academic Calendar', value: 'BS & AD Dates', sub: 'Dual Calendar Synchronized' },
                { label: 'Digital Portals', value: '3 Role Workspaces', sub: 'Admin, Teacher & Student' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white border border-slate-200 rounded-xl p-5"
                >
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className="font-display text-lg font-bold text-[#0F2544] mt-1">
                    {item.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Academic Programs & Facilities Highlights */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {t.sections.programsTitle}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Progressive curriculum tracks supported by dedicated science, computing, and library facilities.
              </p>
            </div>
            <Link
              to="/academics"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2544] hover:underline whitespace-nowrap"
            >
              <span>{t.sections.exploreAcademics}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-xl p-6 bg-[#F6F7F9]/50">
              <div className="text-xs font-medium text-[#2B548A]">Grades 1 – 5</div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mt-1.5">
                Primary Foundations
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Bilingual literacy in English and Nepali, foundational numeracy, environmental inquiry, and guided reading habits.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-[#F6F7F9]/50">
              <div className="text-xs font-medium text-[#2B548A]">Grades 6 – 10</div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mt-1.5">
                Secondary & SEE Track
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Rigorous mathematics, integrated physics/chemistry/biology laboratory practicums, and structured computer programming.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-[#F6F7F9]/50">
              <div className="text-xs font-medium text-[#2B548A]">Grades 11 – 12</div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mt-1.5">
                +2 Science & Management
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                NEB-aligned senior secondary specialization with dedicated laboratory mentorship and university readiness advising.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0F2544]" />
                Reference library & reading hall
              </span>
              <span>Physics, Chemistry & Computing labs</span>
              <span>Outdoor basketball & athletics ground</span>
            </div>
            <Link to="/facilities" className="font-semibold text-[#0F2544] hover:underline">
              Explore all facilities
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Why Choose This School */}
      <section className="py-14 bg-[#F6F7F9] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-8">
            {t.sections.whyChooseTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01.',
                title: 'Transparent Academic Tracking',
                desc: 'Attendance, term assessments, and weekly homework live in one shared portal for students and families.',
              },
              {
                num: '02.',
                title: 'Bilingual & Dual-Calendar Ready',
                desc: 'Full support for Bikram Sambat (BS) and Gregorian (AD) academic dates alongside English and Nepali copy.',
              },
              {
                num: '03.',
                title: 'Qualified Faculty Mentorship',
                desc: 'Low student-to-advisor ratios ensure every learner receives timely feedback on lab reports and essays.',
              },
              {
                num: '04.',
                title: 'Calm, Safe Campus Culture',
                desc: 'Purpose-built classrooms, regulated transport routes, and disciplined daily routines in Jawalakhel.',
              },
            ].map((item) => (
              <div key={item.num} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="font-mono text-xs font-semibold text-[#2B548A]">{item.num}</div>
                <h3 className="font-display text-base font-semibold text-slate-900 mt-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest Notices & Upcoming Events */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-8">
            {t.sections.noticesEventsTitle}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Notices List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Official Notices</h3>
                <Link to="/notices" className="text-xs font-semibold text-[#0F2544] hover:underline">
                  {t.sections.viewAllNotices}
                </Link>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
                {publishedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-[#2B548A]">{notice.category}</span>
                        <span aria-hidden="true">·</span>
                        <DateDisplay date={notice.publishDate} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedNotice(notice)}
                        className="text-left font-medium text-sm text-slate-900 hover:text-[#0F2544] mt-1 block"
                      >
                        {language === 'np' && notice.titleNp ? notice.titleNp : notice.title}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(notice)}
                      className="text-xs font-medium text-slate-600 hover:text-[#0F2544] whitespace-nowrap shrink-0 mt-1"
                    >
                      Read
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Upcoming Events</h3>
                <Link to="/events" className="text-xs font-semibold text-[#0F2544] hover:underline">
                  {t.sections.viewAllEvents}
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="border border-slate-200 rounded-xl p-4 bg-[#F6F7F9]/60">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-[#2B548A]" />
                      <DateDisplay date={ev.startDate} />
                      <span aria-hidden="true">·</span>
                      <span>{ev.category}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mt-1.5">
                      {language === 'np' && ev.titleNp ? ev.titleNp : ev.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">{ev.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Gallery Preview */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {t.sections.galleryTitle}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Click any campus card to inspect details in lightbox view.
              </p>
            </div>
            <Link to="/gallery" className="text-sm font-semibold text-[#0F2544] hover:underline whitespace-nowrap">
              {t.sections.openGallery}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {galleryPreview.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedGallery(item)}
                className="text-left border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-colors group"
              >
                <GalleryIllustration type={item.illustrationType} className="w-full h-40" />
                <div className="p-4">
                  <div className="text-xs text-slate-500">
                    {item.category} · <DateDisplay date={item.date} />
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-1 group-hover:text-[#0F2544]">
                    {item.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact Information Band */}
      <section className="py-14 bg-[#F6F7F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold text-slate-900">
                {t.sections.contactTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#0F2544]" />
                  {config.address}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Phone className="w-4 h-4 text-[#0F2544]" />
                  {config.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#0F2544]" />
                  {config.email}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/contact"
                className="px-4 py-2.5 text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Send Message
              </Link>
              <Link
                to="/admissions"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply for Admission</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notice Detail Dialog */}
      <ModalDialog
        open={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title ?? ''}
        description={
          selectedNotice
            ? `${selectedNotice.category} · ${formatSchoolDate(selectedNotice.publishDate, calendarMode, language)}`
            : ''
        }
      >
        {selectedNotice && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {language === 'np' && selectedNotice.bodyNp ? selectedNotice.bodyNp : selectedNotice.body}
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Audience: {selectedNotice.audience}</span>
              <button
                type="button"
                onClick={() =>
                  downloadSampleNoticePdf({
                    schoolName: config.schoolName,
                    address: config.address,
                    title: selectedNotice.title,
                    category: selectedNotice.category,
                    dateLabel: formatSchoolDate(selectedNotice.publishDate, calendarMode, 'en'),
                    body: selectedNotice.body,
                    fileName: selectedNotice.attachmentName,
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Notice PDF</span>
              </button>
            </div>
          </div>
        )}
      </ModalDialog>

      {/* Gallery Lightbox Dialog */}
      <ModalDialog
        open={Boolean(selectedGallery)}
        onClose={() => setSelectedGallery(null)}
        title={selectedGallery?.title ?? ''}
        description={
          selectedGallery
            ? `${selectedGallery.category} · ${formatSchoolDate(selectedGallery.date, calendarMode, language)}`
            : ''
        }
        maxWidthClass="max-w-2xl"
      >
        {selectedGallery && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <GalleryIllustration type={selectedGallery.illustrationType} className="w-full h-72" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedGallery.caption}</p>
          </div>
        )}
      </ModalDialog>
    </div>
  );
};
