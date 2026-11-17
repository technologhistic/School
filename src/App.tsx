import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { PortalLayout } from './layouts/PortalLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { AcademicsPage } from './pages/public/AcademicsPage';
import { AdmissionsPage } from './pages/public/AdmissionsPage';
import { TeachersPage } from './pages/public/TeachersPage';
import { NoticesPage } from './pages/public/NoticesPage';
import { EventsPage } from './pages/public/EventsPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { FacilitiesPage } from './pages/public/FacilitiesPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';

// Student Portal
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentResultsPage } from './pages/student/StudentResultsPage';
import { StudentHomeworkPage } from './pages/student/StudentHomeworkPage';
import { StudentMaterialsPage } from './pages/student/StudentMaterialsPage';
import { StudentTimetablePage } from './pages/student/StudentTimetablePage';

// Teacher Portal
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import { TeacherResultsPage } from './pages/teacher/TeacherResultsPage';

// Parent Portal
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ParentChildrenPage } from './pages/parent/ParentChildrenPage';
import { ParentAttendancePage } from './pages/parent/ParentAttendancePage';
import { ParentResultsPage } from './pages/parent/ParentResultsPage';
import { ParentHomeworkPage } from './pages/parent/ParentHomeworkPage';

// Admin Portal
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminTeachersPage } from './pages/admin/AdminTeachersPage';
import { AdminParentsPage } from './pages/admin/AdminParentsPage';
import { AdminClassesPage } from './pages/admin/AdminClassesPage';
import { AdminNoticesPage } from './pages/admin/AdminNoticesPage';
import { AdminAdmissionsPage } from './pages/admin/AdminAdmissionsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public School Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Student Portal */}
        <Route path="/student" element={<PortalLayout role="student" />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="homework" element={<StudentHomeworkPage />} />
          <Route path="materials" element={<StudentMaterialsPage />} />
          <Route path="timetable" element={<StudentTimetablePage />} />
        </Route>

        {/* Teacher Portal */}
        <Route path="/teacher" element={<PortalLayout role="teacher" />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="classes" element={<TeacherClassesPage />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="assignments" element={<TeacherAssignmentsPage />} />
          <Route path="results" element={<TeacherResultsPage />} />
        </Route>

        {/* Parent Portal */}
        <Route path="/parent" element={<PortalLayout role="parent" />}>
          <Route index element={<Navigate to="/parent/dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboardPage />} />
          <Route path="children" element={<ParentChildrenPage />} />
          <Route path="attendance" element={<ParentAttendancePage />} />
          <Route path="results" element={<ParentResultsPage />} />
          <Route path="homework" element={<ParentHomeworkPage />} />
        </Route>

        {/* Administrator Portal */}
        <Route path="/admin" element={<PortalLayout role="admin" />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="teachers" element={<AdminTeachersPage />} />
          <Route path="parents" element={<AdminParentsPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
          <Route path="notices" element={<AdminNoticesPage />} />
          <Route path="admissions" element={<AdminAdmissionsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
