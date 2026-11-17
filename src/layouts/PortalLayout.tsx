import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  Home,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Settings,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { UserRole } from '../types/school';
import { useSchoolStore } from '../store/useSchoolStore';
import { TRANSLATIONS } from '../i18n/translations';
import { SchoolCrest } from '../components/common/SchoolArtwork';
import { ConfirmDialog } from '../components/common/ModalDialog';
import { formatSchoolDate } from '../utils/bsDate';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const ROLE_CONFIG: Record<
  UserRole,
  {
    portalLabel: string;
    accentBg: string;
    nav: NavItem[];
  }
> = {
  student: {
    portalLabel: 'Student Portal',
    accentBg: 'bg-[#0F2544]',
    nav: [
      { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/student/profile', label: 'My Profile', icon: User },
      { to: '/student/attendance', label: 'Attendance', icon: CheckSquare },
      { to: '/student/results', label: 'Exam Results', icon: GraduationCap },
      { to: '/student/homework', label: 'Homework', icon: ClipboardList },
      { to: '/student/materials', label: 'Study Materials', icon: FolderOpen },
      { to: '/student/timetable', label: 'Timetable', icon: Calendar },
    ],
  },
  teacher: {
    portalLabel: 'Teacher Portal',
    accentBg: 'bg-[#132B4F]',
    nav: [
      { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/teacher/classes', label: 'Assigned Classes', icon: BookOpen },
      { to: '/teacher/attendance', label: 'Mark Attendance', icon: CheckSquare },
      { to: '/teacher/assignments', label: 'Homework & Materials', icon: ClipboardList },
      { to: '/teacher/results', label: 'Enter Marks', icon: GraduationCap },
    ],
  },
  parent: {
    portalLabel: 'Parent Portal',
    accentBg: 'bg-[#16345E]',
    nav: [
      { to: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/parent/children', label: 'Linked Children', icon: Users },
      { to: '/parent/attendance', label: 'Attendance', icon: CheckSquare },
      { to: '/parent/results', label: 'Exam Results', icon: GraduationCap },
      { to: '/parent/homework', label: 'Homework & Updates', icon: ClipboardList },
    ],
  },
  admin: {
    portalLabel: 'Administrator Portal',
    accentBg: 'bg-[#09182E]',
    nav: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/students', label: 'Students', icon: Users },
      { to: '/admin/teachers', label: 'Teachers', icon: UserCheck },
      { to: '/admin/parents', label: 'Parents', icon: User },
      { to: '/admin/classes', label: 'Classes & Subjects', icon: BookOpen },
      { to: '/admin/notices', label: 'Notices & Events', icon: FileText },
      { to: '/admin/admissions', label: 'Admissions', icon: ClipboardList },
      { to: '/admin/settings', label: 'School Settings', icon: Settings },
    ],
  },
};

export const PortalLayout: React.FC<{ role: UserRole }> = ({ role }) => {
  const {
    config,
    language,
    setLanguage,
    calendarMode,
    setCalendarMode,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    students,
    teachers,
    parents,
    activeStudentId,
    activeTeacherId,
    activeParentId,
  } = useSchoolStore();

  const t = TRANSLATIONS[language];
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const roleMeta = ROLE_CONFIG[role];
  const roleNotifications = notifications.filter((n) => n.role === role || n.role === 'all');
  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const activeUserName =
    role === 'student'
      ? students.find((s) => s.id === activeStudentId)?.name ?? 'Demo Student'
      : role === 'teacher'
      ? teachers.find((tch) => tch.id === activeTeacherId)?.name ?? 'Demo Teacher'
      : role === 'parent'
      ? parents.find((p) => p.id === activeParentId)?.name ?? 'Demo Parent'
      : 'Prakash Gurung (Admin)';

  const currentNav = roleMeta.nav.find((n) => location.pathname.startsWith(n.to));
  const pageTitle = currentNav?.label ?? roleMeta.portalLabel;
  const isNested = currentNav && currentNav.to !== `/${role}/dashboard`;

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <SchoolCrest className="w-7 h-7 shrink-0" />
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-slate-900 truncate">
              {config.schoolName}
            </div>
            <div className="text-xs text-slate-500 truncate">{roleMeta.portalLabel}</div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <div className="text-xs text-slate-500">Demo Account</div>
        <div className="text-sm font-semibold text-slate-900 truncate mt-0.5">{activeUserName}</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label={`${roleMeta.portalLabel} navigation`}>
        {roleMeta.nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? `${roleMeta.accentBg} text-white`
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-1.5">
        <Link
          to="/login"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.portal.switchRole}</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.portal.publicSite}</span>
        </Link>
        <button
          type="button"
          onClick={() => setResetConfirmOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-left"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.portal.resetDemo}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F6F7F9] text-slate-900">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10">{SidebarContent}</aside>
        </div>
      )}

      {/* Main Portal Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Portal Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Open portal navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              {isNested ? (
                <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
                  <Link to={`/${role}/dashboard`} className="hover:text-slate-900">
                    {roleMeta.portalLabel}
                  </Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-900 font-medium truncate">{pageTitle}</span>
                </nav>
              ) : (
                <div className="text-xs text-slate-500 truncate">{t.portal.demoBanner}</div>
              )}
              <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Calendar Mode Toggle */}
            <button
              type="button"
              onClick={() => setCalendarMode(calendarMode === 'BS' ? 'AD' : 'BS')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Switch between Bikram Sambat and Gregorian calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span className="tabular-nums">{calendarMode}</span>
            </button>

            {/* Language Switch */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'np' : 'en')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Switch UI language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>{language === 'en' ? 'EN' : 'नेपाली'}</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Toggle notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0F2544] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setNotifOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        {t.portal.notifications} ({unreadCount} unread)
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllNotificationsRead(role)}
                          className="text-xs font-medium text-[#2B548A] hover:underline"
                        >
                          {t.portal.markAllRead}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {roleNotifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-500">
                          {t.portal.noNotifications}
                        </div>
                      ) : (
                        roleNotifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => markNotificationRead(n.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                              n.read ? 'opacity-65' : 'bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                              {!n.read && <span className="text-[11px] font-medium text-[#2B548A]">Unread</span>}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                            <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
                              {formatSchoolDate(n.date, calendarMode, language)}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={resetDemoData}
        title="Reset Demo Data"
        message="This will restore all fictional students, attendance marks, homework assignments, results, notices, admissions, and school settings to their initial default values."
        confirmLabel="Reset to Defaults"
      />
    </div>
  );
};
