export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export type CalendarMode = 'AD' | 'BS';

export type LanguageCode = 'en' | 'np';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type AssignmentStatus = 'pending' | 'submitted' | 'graded';

export type NoticeCategory = 'Academic' | 'Holiday' | 'Examination' | 'Event' | 'Administrative';

export type AdmissionStatus = 'pending' | 'under_review' | 'accepted' | 'waitlisted';

export interface SchoolConfig {
  schoolName: string;
  schoolNameNp: string;
  motto: string;
  mottoNp: string;
  establishedYear: string;
  address: string;
  addressNp: string;
  city: string;
  phone: string;
  email: string;
  officeHours: string;
  academicYearAD: string;
  academicYearBS: string;
  activeTerm: string;
  principalName: string;
  principalTitle: string;
  principalMessage: string;
  aboutHistory: string;
  aboutVision: string;
  aboutMission: string;
  mapCoordinatesLabel: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  nameNp: string;
  department: string;
  creditHours: number;
}

export interface SchoolClass {
  id: string;
  grade: string;
  section: string;
  room: string;
  classTeacherId: string;
  subjectIds: string[];
  teacherIds: string[];
  capacity: number;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  section: string;
  rollNumber: number;
  parentIds: string[];
  emailDemo: string;
  phoneDemo: string;
  addressDemo: string;
  dateOfBirthAD: string;
  guardianName: string;
  status: 'active' | 'inactive';
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  emailDemo: string;
  phoneDemo: string;
  subjectIds: string[];
  classIds: string[];
  experienceYears: number;
  bio: string;
}

export interface Parent {
  id: string;
  name: string;
  relation: string;
  linkedStudentIds: string[];
  contactDemo: string;
  emailDemo: string;
  occupation: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD (AD)
  status: AttendanceStatus;
  markedBy: string;
  remarks?: string;
}

export interface Exam {
  id: string;
  name: string;
  term: string;
  dateAD: string;
  maxMarks: number;
}

export interface ResultRecord {
  id: string;
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

export interface Assignment {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dueDate: string; // YYYY-MM-DD
  description: string;
  status: AssignmentStatus;
  maxPoints: number;
}

export interface LearningMaterial {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  resourceType: 'PDF Guide' | 'Worksheet' | 'Slide Deck' | 'Lab Notes';
  uploadedDate: string;
  fileSize: string;
  summary: string;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  timeRange: string;
  subjectId: string;
  teacherId: string;
  room: string;
}

export interface Notice {
  id: string;
  title: string;
  titleNp?: string;
  body: string;
  bodyNp?: string;
  category: NoticeCategory;
  publishDate: string; // YYYY-MM-DD
  published: boolean;
  audience: 'All' | 'Students' | 'Teachers' | 'Parents';
  attachmentName?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  titleNp?: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  location: string;
  category: 'Cultural' | 'Academic' | 'Sports' | 'Holiday';
}

export interface AdmissionApplication {
  id: string;
  applicantName: string;
  grade: string;
  guardianName: string;
  contactDemo: string;
  emailDemo: string;
  previousSchool: string;
  statement: string;
  submittedAt: string; // YYYY-MM-DD
  status: AdmissionStatus;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Campus' | 'Academics' | 'Sports' | 'Cultural';
  date: string;
  caption: string;
  accentTone: 'navy' | 'slate' | 'emerald' | 'amber';
  illustrationType: 'library' | 'science' | 'campus' | 'sports' | 'assembly' | 'arts';
}

export interface NotificationItem {
  id: string;
  role: UserRole | 'all';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}
