import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  INITIAL_ADMISSIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_CLASSES,
  INITIAL_EVENTS,
  INITIAL_EXAMS,
  INITIAL_GALLERY,
  INITIAL_MATERIALS,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PARENTS,
  INITIAL_RESULTS,
  INITIAL_SCHOOL_CONFIG,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_TIMETABLE,
} from '../data/mockData';
import {
  AdmissionApplication,
  AdmissionStatus,
  Assignment,
  AttendanceRecord,
  AttendanceStatus,
  CalendarMode,
  ContactInquiry,
  Exam,
  GalleryItem,
  LanguageCode,
  LearningMaterial,
  Notice,
  NotificationItem,
  Parent,
  ResultRecord,
  SchoolClass,
  SchoolConfig,
  SchoolEvent,
  Student,
  Subject,
  Teacher,
  TimetableSlot,
  UserRole,
} from '../types/school';

export function computeLetterGrade(marks: number, maxMarks = 100): string {
  const pct = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 40) return 'C';
  if (pct >= 35) return 'D';
  return 'NG';
}

export interface SchoolState {
  // Preferences & Demo Session
  activeRole: UserRole | null;
  activeStudentId: string;
  activeTeacherId: string;
  activeParentId: string;
  selectedChildId: string;
  language: LanguageCode;
  calendarMode: CalendarMode;

  // Entities
  config: SchoolConfig;
  subjects: Subject[];
  classes: SchoolClass[];
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  results: ResultRecord[];
  assignments: Assignment[];
  materials: LearningMaterial[];
  timetable: TimetableSlot[];
  notices: Notice[];
  events: SchoolEvent[];
  admissions: AdmissionApplication[];
  gallery: GalleryItem[];
  notifications: NotificationItem[];
  contactInquiries: ContactInquiry[];

  // Actions
  setRole: (role: UserRole | null) => void;
  setLanguage: (lang: LanguageCode) => void;
  setCalendarMode: (mode: CalendarMode) => void;
  setSelectedChildId: (studentId: string) => void;
  updateConfig: (patch: Partial<SchoolConfig>) => void;

  // Student Profile
  updateStudent: (id: string, patch: Partial<Student>) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  deleteStudent: (id: string) => void;

  // Teachers
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Parents
  addParent: (parent: Omit<Parent, 'id'>) => void;
  updateParent: (id: string, patch: Partial<Parent>) => void;
  deleteParent: (id: string) => void;

  // Classes
  addClass: (cls: Omit<SchoolClass, 'id'>) => void;
  updateClass: (id: string, patch: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;

  // Attendance
  markAttendance: (studentId: string, classId: string, date: string, status: AttendanceStatus, markedBy: string, remarks?: string) => void;

  // Assignments
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, patch: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Results
  upsertResult: (studentId: string, examId: string, subjectId: string, marks: number, maxMarks: number, remarks: string) => void;

  // Materials
  addMaterial: (material: Omit<LearningMaterial, 'id'>) => void;
  deleteMaterial: (id: string) => void;

  // Notices
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (id: string, patch: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;

  // Events & Gallery
  addEvent: (event: Omit<SchoolEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;

  // Admissions & Contact
  submitAdmission: (app: Omit<AdmissionApplication, 'id' | 'submittedAt' | 'status'>) => AdmissionApplication;
  updateAdmissionStatus: (id: string, status: AdmissionStatus) => void;
  submitContactInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'submittedAt'>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: UserRole) => void;

  // Reset
  resetDemoData: () => void;
}

const getInitialSnapshot = () => ({
  activeRole: null as UserRole | null,
  activeStudentId: 'stu-1',
  activeTeacherId: 'tch-1',
  activeParentId: 'par-1',
  selectedChildId: 'stu-1',
  language: 'en' as LanguageCode,
  calendarMode: 'BS' as CalendarMode,
  config: INITIAL_SCHOOL_CONFIG,
  subjects: INITIAL_SUBJECTS,
  classes: INITIAL_CLASSES,
  students: INITIAL_STUDENTS,
  teachers: INITIAL_TEACHERS,
  parents: INITIAL_PARENTS,
  attendance: INITIAL_ATTENDANCE,
  exams: INITIAL_EXAMS,
  results: INITIAL_RESULTS,
  assignments: INITIAL_ASSIGNMENTS,
  materials: INITIAL_MATERIALS,
  timetable: INITIAL_TIMETABLE,
  notices: INITIAL_NOTICES,
  events: INITIAL_EVENTS,
  admissions: INITIAL_ADMISSIONS,
  gallery: INITIAL_GALLERY,
  notifications: INITIAL_NOTIFICATIONS,
  contactInquiries: [] as ContactInquiry[],
});

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set) => ({
      ...getInitialSnapshot(),

      setRole: (role) => set({ activeRole: role }),
      setLanguage: (language) => set({ language }),
      setCalendarMode: (calendarMode) => set({ calendarMode }),
      setSelectedChildId: (selectedChildId) => set({ selectedChildId }),
      updateConfig: (patch) =>
        set((state) => ({ config: { ...state.config, ...patch } })),

      addStudent: (student) =>
        set((state) => ({
          students: [
            { ...student, id: `stu-${Date.now().toString(36)}` },
            ...state.students,
          ],
        })),
      updateStudent: (id, patch) =>
        set((state) => ({
          students: state.students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
          attendance: state.attendance.filter((a) => a.studentId !== id),
          results: state.results.filter((r) => r.studentId !== id),
        })),

      addTeacher: (teacher) =>
        set((state) => ({
          teachers: [
            { ...teacher, id: `tch-${Date.now().toString(36)}` },
            ...state.teachers,
          ],
        })),
      updateTeacher: (id, patch) =>
        set((state) => ({
          teachers: state.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTeacher: (id) =>
        set((state) => ({
          teachers: state.teachers.filter((t) => t.id !== id),
        })),

      addParent: (parent) =>
        set((state) => ({
          parents: [
            { ...parent, id: `par-${Date.now().toString(36)}` },
            ...state.parents,
          ],
        })),
      updateParent: (id, patch) =>
        set((state) => ({
          parents: state.parents.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteParent: (id) =>
        set((state) => ({
          parents: state.parents.filter((p) => p.id !== id),
        })),

      addClass: (cls) =>
        set((state) => ({
          classes: [
            ...state.classes,
            { ...cls, id: `cls-${Date.now().toString(36)}` },
          ],
        })),
      updateClass: (id, patch) =>
        set((state) => ({
          classes: state.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteClass: (id) =>
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== id),
        })),

      markAttendance: (studentId, classId, date, status, markedBy, remarks) =>
        set((state) => {
          const existingIdx = state.attendance.findIndex(
            (a) => a.studentId === studentId && a.date === date
          );
          if (existingIdx >= 0) {
            const next = [...state.attendance];
            next[existingIdx] = {
              ...next[existingIdx],
              status,
              markedBy,
              remarks,
            };
            return { attendance: next };
          }
          return {
            attendance: [
              {
                id: `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
                studentId,
                classId,
                date,
                status,
                markedBy,
                remarks,
              },
              ...state.attendance,
            ],
          };
        }),

      addAssignment: (assignment) =>
        set((state) => ({
          assignments: [
            { ...assignment, id: `asg-${Date.now().toString(36)}` },
            ...state.assignments,
          ],
        })),
      updateAssignment: (id, patch) =>
        set((state) => ({
          assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),

      upsertResult: (studentId, examId, subjectId, marks, maxMarks, remarks) =>
        set((state) => {
          const grade = computeLetterGrade(marks, maxMarks);
          const idx = state.results.findIndex(
            (r) =>
              r.studentId === studentId &&
              r.examId === examId &&
              r.subjectId === subjectId
          );
          if (idx >= 0) {
            const next = [...state.results];
            next[idx] = { ...next[idx], marks, maxMarks, grade, remarks };
            return { results: next };
          }
          return {
            results: [
              {
                id: `res-${Date.now().toString(36)}`,
                studentId,
                examId,
                subjectId,
                marks,
                maxMarks,
                grade,
                remarks,
              },
              ...state.results,
            ],
          };
        }),

      addMaterial: (material) =>
        set((state) => ({
          materials: [
            { ...material, id: `mat-${Date.now().toString(36)}` },
            ...state.materials,
          ],
        })),
      deleteMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        })),

      addNotice: (notice) =>
        set((state) => ({
          notices: [
            { ...notice, id: `not-${Date.now().toString(36)}` },
            ...state.notices,
          ],
        })),
      updateNotice: (id, patch) =>
        set((state) => ({
          notices: state.notices.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        })),
      deleteNotice: (id) =>
        set((state) => ({
          notices: state.notices.filter((n) => n.id !== id),
        })),

      addEvent: (event) =>
        set((state) => ({
          events: [
            { ...event, id: `evt-${Date.now().toString(36)}` },
            ...state.events,
          ],
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      addGalleryItem: (item) =>
        set((state) => ({
          gallery: [
            { ...item, id: `gal-${Date.now().toString(36)}` },
            ...state.gallery,
          ],
        })),
      deleteGalleryItem: (id) =>
        set((state) => ({
          gallery: state.gallery.filter((g) => g.id !== id),
        })),

      submitAdmission: (app) => {
        const created: AdmissionApplication = {
          ...app,
          id: `adm-${Date.now().toString(36)}`,
          submittedAt: '2026-11-17',
          status: 'pending',
        };
        set((state) => ({
          admissions: [created, ...state.admissions],
          notifications: [
            {
              id: `ntf-${Date.now().toString(36)}`,
              role: 'admin',
              title: 'New Demo Admission Inquiry',
              message: `${created.applicantName} applied for ${created.grade}.`,
              date: '2026-11-17',
              read: false,
            },
            ...state.notifications,
          ],
        }));
        return created;
      },
      updateAdmissionStatus: (id, status) =>
        set((state) => ({
          admissions: state.admissions.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      submitContactInquiry: (inquiry) =>
        set((state) => ({
          contactInquiries: [
            {
              ...inquiry,
              id: `inq-${Date.now().toString(36)}`,
              submittedAt: '2026-11-17',
            },
            ...state.contactInquiries,
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: (role) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.role === role || n.role === 'all' ? { ...n, read: true } : n
          ),
        })),

      resetDemoData: () => set(getInitialSnapshot()),
    }),
    {
      name: 'sagarmatha_school_demo_v1',
      partialize: (state) => ({
        language: state.language,
        calendarMode: state.calendarMode,
        selectedChildId: state.selectedChildId,
        config: state.config,
        students: state.students,
        teachers: state.teachers,
        parents: state.parents,
        classes: state.classes,
        attendance: state.attendance,
        results: state.results,
        assignments: state.assignments,
        materials: state.materials,
        notices: state.notices,
        events: state.events,
        admissions: state.admissions,
        gallery: state.gallery,
        notifications: state.notifications,
        contactInquiries: state.contactInquiries,
      }),
    }
  )
);
