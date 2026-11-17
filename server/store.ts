export type AuthRole = 'admin' | 'teacher' | 'student';

export interface AdminRecord {
  id: string;
  googleEmail: string;
  role: string;
  schoolId: string;
}

export interface TeacherRecord {
  id: string;
  fullName: string;
  phoneNumber: string;
  passwordHash: string;
  department: string;
  subjects: string[];
  classes: string[];
  status: 'active' | 'inactive';
  mustChangePassword: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentRecord {
  id: string;
  full_name: string;
  phone_number: string;
  password_hash: string | null;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  account_status: 'active' | 'inactive';
  must_change_password: number;
  approved_by: string | null;
  approved_at: string | null;
  class_id: string;
  section: string;
  roll_number: number;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRequestRecord {
  id: string;
  full_name: string;
  phone_number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  school_id: string;
  created_at: string;
  student_id?: string | null;
  account_status?: string | null;
  approval_status?: string | null;
  class_id?: string | null;
  section?: string | null;
  roll_number?: number | null;
}

export interface SessionRecord {
  id: string;
  userId: string;
  role: AuthRole;
  schoolId: string;
  expiresAt: string;
}

export interface AuditLogRecord {
  id: string;
  actor_id: string | null;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  details_json: string;
  created_at: string;
}

export interface AdminOverviewPayload {
  requests: RegistrationRequestRecord[];
  students: Array<Omit<StudentRecord, 'password_hash' | 'school_id'>>;
  teachers: Array<Omit<TeacherRecord, 'passwordHash' | 'schoolId'>>;
  auditLogs: AuditLogRecord[];
  counts: {
    totalStudents: number;
    pendingApprovals: number;
    approvedStudents: number;
    rejectedApplications: number;
    totalTeachers: number;
    activeTeachers: number;
  };
}

export interface CreateTeacherInput {
  fullName: string;
  phoneNumber: string;
  passwordHash: string;
  department: string;
  subjects: string[];
  classes: string[];
  schoolId: string;
  adminId: string;
}

export interface UpdateTeacherInput {
  fullName?: string;
  phoneNumber?: string;
  department?: string;
  subjects?: string[];
  classes?: string[];
  status?: 'active' | 'inactive';
  adminId: string;
}

export interface UpdateStudentInput {
  fullName?: string;
  phoneNumber?: string;
  classId?: string;
  section?: string;
  rollNumber?: number;
  accountStatus?: 'active' | 'inactive';
  adminId: string;
}

export interface AuthStore {
  readonly kind: 'sqlite' | 'supabase';
  getAuthorizedAdminByEmail(email: string): Promise<AdminRecord | null>;
  getAdminByIdAndSchool(id: string, schoolId: string): Promise<AdminRecord | null>;

  createSession(userId: string, role: AuthRole, schoolId: string, tokenHash: string, expiresAt: string): Promise<void>;
  getSessionByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  deleteSessionById(id: string): Promise<void>;
  deleteSessionByTokenHash(tokenHash: string): Promise<void>;
  deleteUserSessions(userId: string, role: AuthRole): Promise<void>;
  expireSessionsForRole(role: AuthRole, expiresAt: string): Promise<void>;

  getTeacherByIdAndSchool(id: string, schoolId: string): Promise<TeacherRecord | null>;
  getTeacherByPhone(phoneNumber: string): Promise<TeacherRecord | null>;
  findTeacherPhoneConflict(phoneNumber: string, excludeId?: string): Promise<boolean>;
  createTeacher(input: CreateTeacherInput): Promise<Omit<TeacherRecord, 'passwordHash' | 'schoolId'>>;
  updateTeacher(
    teacherId: string,
    schoolId: string,
    updates: UpdateTeacherInput
  ): Promise<Omit<TeacherRecord, 'passwordHash' | 'schoolId'> | null>;
  deleteTeacher(teacherId: string, schoolId: string, adminId: string): Promise<{ fullName: string } | null>;
  updateTeacherPassword(
    teacherId: string,
    schoolId: string,
    passwordHash: string,
    mustChangePassword: boolean,
    actorId: string,
    auditAction: string
  ): Promise<void>;

  getStudentByIdAndSchool(id: string, schoolId: string): Promise<StudentRecord | null>;
  getStudentByPhone(phoneNumber: string): Promise<StudentRecord | null>;
  findStudentPhoneConflict(phoneNumber: string, excludeId?: string): Promise<boolean>;
  getRegistrationRequestByPhone(phoneNumber: string): Promise<RegistrationRequestRecord | null>;
  createStudentRegistration(
    fullName: string,
    phoneNumber: string,
    schoolId: string
  ): Promise<{ reqId: string; studentId: string }>;
  approveStudent(
    targetId: string,
    schoolId: string,
    adminId: string,
    passwordHash: string,
    classId?: string,
    section?: string,
    rollNumber?: number
  ): Promise<Omit<StudentRecord, 'password_hash' | 'school_id'> | null>;
  rejectStudent(targetId: string, schoolId: string, adminId: string, reason: string): Promise<boolean>;
  updateStudent(
    studentId: string,
    schoolId: string,
    updates: UpdateStudentInput
  ): Promise<Omit<StudentRecord, 'password_hash' | 'school_id'> | null>;
  updateStudentPassword(
    studentId: string,
    schoolId: string,
    passwordHash: string,
    mustChangePassword: boolean,
    actorId: string,
    auditAction: string
  ): Promise<void>;

  getAdminOverview(schoolId: string): Promise<AdminOverviewPayload>;
  logAudit(
    actorId: string | null,
    actorRole: string,
    action: string,
    targetType: string,
    targetId: string,
    details: Record<string, unknown>,
    schoolId?: string
  ): Promise<void>;
}
