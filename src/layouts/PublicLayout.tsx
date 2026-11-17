import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { useSchoolStore } from '../store/useSchoolStore';
import { TRANSLATIONS } from '../i18n/translations';
import { SchoolCrest } from '../components/common/SchoolArtwork';
import { ModalDialog } from '../components/common/ModalDialog';
import { formatSchoolDate } from '../utils/bsDate';

export const PublicLayout: React.FC = () => {
  const { config, language, setLanguage, calendarMode, setCalendarMode, notices, teachers, events, resetDemoData } =
    useSchoolStore();
  const t = TRANSLATIONS[language];
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [campusMenuOpen, setCampusMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const schoolDisplayName = language === 'np' ? config.schoolNameNp : config.schoolName;

  const q = searchQuery.trim().toLowerCase();
  const matchedNotices = q
    ? notices.filter((n) => n.published && (n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)))
    : [];
  const matchedTeachers = q
    ? teachers.filter((tch) => tch.name.toLowerCase().includes(q) || tch.department.toLowerCase().includes(q))
    : [];
  const matchedEvents = q
    ? events.filter((ev) => ev.title.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-slate-900 hover:opacity-90 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <SchoolCrest className="w-7 h-7 shrink-0" />
            <span className="font-display text-base sm:text-lg font-bold tracking-tight">
              {schoolDisplayName}
            </span>
          </Link>

          {/* Zone 2: Concise single-line navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Main navigation">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive ? 'text-[#0F2544] border-[#0F2544] font-semibold' : 'border-transparent hover:text-slate-900'
                }`
              }
            >
              {t.nav.about}
            </NavLink>
            <NavLink
              to="/academics"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive ? 'text-[#0F2544] border-[#0F2544] font-semibold' : 'border-transparent hover:text-slate-900'
                }`
              }
            >
              {t.nav.academics}
            </NavLink>
            <NavLink
              to="/admissions"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive ? 'text-[#0F2544] border-[#0F2544] font-semibold' : 'border-transparent hover:text-slate-900'
                }`
              }
            >
              {t.nav.admissions}
            </NavLink>
            <NavLink
              to="/notices"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive ? 'text-[#0F2544] border-[#0F2544] font-semibold' : 'border-transparent hover:text-slate-900'
                }`
              }
            >
              {t.nav.notices}
            </NavLink>

            <div className="relative">
              <button
                type="button"
                onClick={() => setCampusMenuOpen((v) => !v)}
                aria-expanded={campusMenuOpen}
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span>{t.nav.campusMenu}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {campusMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setCampusMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg py-1.5 z-20">
                    {[
                      { to: '/teachers', label: t.nav.teachers },
                      { to: '/events', label: t.nav.events },
                      { to: '/facilities', label: t.nav.facilities },
                      { to: '/gallery', label: t.nav.gallery },
                      { to: '/contact', label: t.nav.contact },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setCampusMenuOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          location.pathname === item.to
                            ? 'bg-slate-100 text-[#0F2544] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setCampusMenuOpen(false);
                        setSearchOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <span>Search Directory</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.portalLogin}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              {[
                { to: '/', label: t.nav.home },
                { to: '/about', label: t.nav.about },
                { to: '/academics', label: t.nav.academics },
                { to: '/admissions', label: t.nav.admissions },
                { to: '/teachers', label: t.nav.teachers },
                { to: '/notices', label: t.nav.notices },
                { to: '/events', label: t.nav.events },
                { to: '/facilities', label: t.nav.facilities },
                { to: '/gallery', label: t.nav.gallery },
                { to: '/contact', label: t.nav.contact },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === link.to
                      ? 'bg-[#0F2544] text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-[#0F2544] rounded-lg"
              >
                {t.nav.portalLogin}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Institutional Footer */}
      <footer className="bg-[#0F2544] text-slate-200 border-t border-[#1F467A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-white">
                <SchoolCrest className="w-7 h-7" />
                <span className="font-display font-bold text-base">{schoolDisplayName}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {language === 'np' ? config.mottoNp : config.motto}
              </p>
              <div className="text-xs text-slate-300 space-y-1 pt-1">
                <div>{language === 'np' ? config.addressNp : config.address}</div>
                <div className="tabular-nums">{config.phone}</div>
                <div>{config.email}</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Public Website</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/about" className="hover:text-white transition-colors">{t.nav.about}</Link></li>
                <li><Link to="/academics" className="hover:text-white transition-colors">{t.nav.academics}</Link></li>
                <li><Link to="/admissions" className="hover:text-white transition-colors">{t.nav.admissions}</Link></li>
                <li><Link to="/teachers" className="hover:text-white transition-colors">{t.nav.teachers}</Link></li>
                <li><Link to="/notices" className="hover:text-white transition-colors">{t.nav.notices}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Campus & Portals</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/events" className="hover:text-white transition-colors">{t.nav.events}</Link></li>
                <li><Link to="/facilities" className="hover:text-white transition-colors">{t.nav.facilities}</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">{t.nav.gallery}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t.nav.contact}</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors font-medium text-white">{t.nav.portalLogin}</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Display Preferences</h3>
              <div className="space-y-2.5">
                <div>
                  <span className="block text-xs text-slate-300 mb-1.5">{t.portal.language}</span>
                  <div className="inline-flex rounded-lg bg-[#09182E] p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        language === 'en' ? 'bg-white text-[#0F2544]' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('np')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        language === 'np' ? 'bg-white text-[#0F2544]' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      नेपाली
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-slate-300 mb-1.5">{t.portal.calendarMode}</span>
                  <div className="inline-flex rounded-lg bg-[#09182E] p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setCalendarMode('BS')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        calendarMode === 'BS' ? 'bg-white text-[#0F2544]' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Bikram Sambat (BS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMode('AD')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        calendarMode === 'AD' ? 'bg-white text-[#0F2544]' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Gregorian (AD)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-300">
            <p>
              {config.schoolName} · {config.academicYearBS} ({config.academicYearAD}) · Frontend demonstration using fictional sample records.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hover:text-white underline underline-offset-4"
              >
                Search Site
              </button>
              <button
                type="button"
                onClick={resetDemoData}
                className="hover:text-white underline underline-offset-4"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* PUB-12: Site-wide Search Modal */}
      <ModalDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Search Public Content"
        description="Search published notices, faculty members, and campus events."
        maxWidthClass="max-w-xl"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notices, teachers, or events (e.g. Dashain, Mathematics)..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2544]"
              autoFocus
            />
          </div>

          {!q ? (
            <p className="text-xs text-slate-500">Type a keyword above to search across notices, faculty directory, and events.</p>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5">Notices ({matchedNotices.length})</div>
                {matchedNotices.length === 0 ? (
                  <p className="text-xs text-slate-400">No matching notices.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {matchedNotices.map((n) => (
                      <Link
                        key={n.id}
                        to="/notices"
                        onClick={() => setSearchOpen(false)}
                        className="block px-3 py-2 hover:bg-slate-50"
                      >
                        <div className="text-sm font-medium text-slate-900">{n.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {n.category} · {formatSchoolDate(n.publishDate, calendarMode, language)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5">Faculty ({matchedTeachers.length})</div>
                {matchedTeachers.length === 0 ? (
                  <p className="text-xs text-slate-400">No matching faculty members.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {matchedTeachers.map((tch) => (
                      <Link
                        key={tch.id}
                        to="/teachers"
                        onClick={() => setSearchOpen(false)}
                        className="block px-3 py-2 hover:bg-slate-50"
                      >
                        <div className="text-sm font-medium text-slate-900">{tch.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {tch.designation} · {tch.department}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5">Events ({matchedEvents.length})</div>
                {matchedEvents.length === 0 ? (
                  <p className="text-xs text-slate-400">No matching events.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {matchedEvents.map((ev) => (
                      <Link
                        key={ev.id}
                        to="/events"
                        onClick={() => setSearchOpen(false)}
                        className="block px-3 py-2 hover:bg-slate-50"
                      >
                        <div className="text-sm font-medium text-slate-900">{ev.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {ev.location} · {formatSchoolDate(ev.startDate, calendarMode, language)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalDialog>
    </div>
  );
};
