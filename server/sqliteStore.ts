import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { DEFAULT_SCHOOL_ID, initDatabase, withTransaction } from './db.ts';
import type {
  AdminOverviewPayload,
  AdminRecord,
  AuthRole,
  AuthStore,
  CreateTeacherInput,
  RegistrationRequestRecord,
  SessionRecord,
  StudentRecord,
  TeacherRecord,
  UpdateStudentInput,
  UpdateTeacherInput,
} from './store.ts';

function mapTeacher(row: any): TeacherRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    passwordHash: row.password_hash,
    department: row.department,
    subjects: JSON.parse(row.subjects_json || '[]'),
    classes: JSON.parse(row.classes_json || '[]'),
    status: row.status,
    mustChangePassword: Boolean(row.must_change_password),
    schoolId: row.school_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SqliteAuthStore implements AuthStore {
  readonly kind = 'sqlite' as const;
  readonly db: DatabaseSync;

  constructor(dbPath?: string) {
    this.db = initDatabase(dbPath);
  }

  private writeAudit(
    actorId: string | null,
    actorRole: string,
    action: string,
    targetType: string,
    targetId: string,
    details: Record<string, unknown>,
    schoolId = DEFAULT_SCHOOL_ID
  ) {
    this.db
      .prepare(`
        INSERT INTO audit_logs (id, actor_id, actor_role, action, target_type, target_id, details_json, school_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        `aud-${randomUUID()}`,
        actorId,
        actorRole,
        action,
        targetType,
        targetId,
        JSON.stringify(details),
        schoolId,
        new Date().toISOString()
      );
  }

  async logAudit(
    actorId: string | null,
    actorRole: string,
    action: string,
    targetType: string,
    targetId: string,
    details: Record<string, unknown>,
    schoolId = DEFAULT_SCHOOL_ID
  ): Promise<void> {
    this.writeAudit(actorId, actorRole, action, targetType, targetId, details, schoolId);
  }

  async getAuthorizedAdminByEmail(email: string): Promise<AdminRecord | null> {
    const row = this.db
      .prepare('SELECT id, google_email, role, school_id FROM admins WHERE LOWER(google_email) = ?')
      .get(email.toLowerCase()) as
      | { id: string; google_email: string; role: string; school_id: string }
      | undefined;
    return row
      ? { id: row.id, googleEmail: row.google_email, role: row.role, schoolId: row.school_id }
      : null;
  }

  async getAdminByIdAndSchool(id: string, schoolId: string): Promise<AdminRecord | null> {
    const row = this.db
      .prepare('SELECT id, google_email, role, school_id FROM admins WHERE id = ? AND school_id = ?')
      .get(id, schoolId) as
      | { id: string; google_email: string; role: string; school_id: string }
      | undefined;
    return row
      ? { id: row.id, googleEmail: row.google_email, role: row.role, schoolId: row.school_id }
      : null;
  }

  async createSession(
    userId: string,
    role: AuthRole,
    schoolId: string,
    tokenHash: string,
    expiresAt: string
  ): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO user_sessions (id, user_id, role, session_token_hash, school_id, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(`ses-${randomUUID()}`, userId, role, tokenHash, schoolId, expiresAt, new Date().toISOString());
  }

  async getSessionByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const row = this.db
      .prepare('SELECT id, user_id, role, school_id, expires_at FROM user_sessions WHERE session_token_hash = ?')
      .get(tokenHash) as
      | { id: string; user_id: string; role: AuthRole; school_id: string; expires_at: string }
      | undefined;
    return row
      ? {
          id: row.id,
          userId: row.user_id,
          role: row.role,
          schoolId: row.school_id,
          expiresAt: row.expires_at,
        }
      : null;
  }

  async deleteSessionById(id: string): Promise<void> {
    this.db.prepare('DELETE FROM user_sessions WHERE id = ?').run(id);
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    this.db.prepare('DELETE FROM user_sessions WHERE session_token_hash = ?').run(tokenHash);
  }

  async deleteUserSessions(userId: string, role: AuthRole): Promise<void> {
    this.db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND role = ?').run(userId, role);
  }

  async expireSessionsForRole(role: AuthRole, expiresAt: string): Promise<void> {
    this.db.prepare('UPDATE user_sessions SET expires_at = ? WHERE role = ?').run(expiresAt, role);
  }

  async getTeacherByIdAndSchool(id: string, schoolId: string): Promise<TeacherRecord | null> {
    const row = this.db
      .prepare('SELECT * FROM teachers WHERE id = ? AND school_id = ?')
      .get(id, schoolId);
    return row ? mapTeacher(row) : null;
  }

  async getTeacherByPhone(phoneNumber: string): Promise<TeacherRecord | null> {
    const row = this.db
      .prepare('SELECT * FROM teachers WHERE phone_number = ?')
      .get(phoneNumber);
    return row ? mapTeacher(row) : null;
  }

  async findTeacherPhoneConflict(phoneNumber: string, excludeId?: string): Promise<boolean> {
    const row = excludeId
      ? this.db.prepare('SELECT id FROM teachers WHERE phone_number = ? AND id != ?').get(phoneNumber, excludeId)
      : this.db.prepare('SELECT id FROM teachers WHERE phone_number = ?').get(phoneNumber);
    return Boolean(row);
  }

  async createTeacher(input: CreateTeacherInput) {
    const id = `tch-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    withTransaction(this.db, () => {
      this.db
        .prepare(`
          INSERT INTO teachers (id, full_name, phone_number, password_hash, department, subjects_json, classes_json, status, must_change_password, school_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?, ?)
        `)
        .run(
          id,
          input.fullName,
          input.phoneNumber,
          input.passwordHash,
          input.department,
          JSON.stringify(input.subjects),
          JSON.stringify(input.classes),
          input.schoolId,
          now,
          now
        );

      this.writeAudit(input.adminId, 'admin', 'TEACHER_CREATED', 'teacher', id, {
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        department: input.department,
      }, input.schoolId);
    });

    return {
      id,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      department: input.department,
      subjects: input.subjects,
      classes: input.classes,
      status: 'active' as const,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateTeacher(teacherId: string, schoolId: string, updates: UpdateTeacherInput) {
    const existing = this.db
      .prepare('SELECT * FROM teachers WHERE id = ? AND school_id = ?')
      .get(teacherId, schoolId) as any;
    if (!existing) return null;

    const nextStatus = updates.status === 'active' || updates.status === 'inactive' ? updates.status : existing.status;
    const now = new Date().toISOString();

    withTransaction(this.db, () => {
      this.db
        .prepare(`
          UPDATE teachers
          SET full_name = ?, phone_number = ?, department = ?, subjects_json = ?, classes_json = ?, status = ?, updated_at = ?
          WHERE id = ? AND school_id = ?
        `)
        .run(
          (updates.fullName || existing.full_name).trim(),
          updates.phoneNumber || existing.phone_number,
          (updates.department || existing.department).trim(),
          JSON.stringify(
            Array.isArray(updates.subjects) ? updates.subjects : JSON.parse(existing.subjects_json || '[]')
          ),
          JSON.stringify(
            Array.isArray(updates.classes) ? updates.classes : JSON.parse(existing.classes_json || '[]')
          ),
          nextStatus,
          now,
          teacherId,
          schoolId
        );

      if (nextStatus === 'inactive') {
        this.db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND role = ?').run(teacherId, 'teacher');
      }

      this.writeAudit(updates.adminId, 'admin', 'TEACHER_UPDATED', 'teacher', teacherId, {
        status: nextStatus,
      }, schoolId);
    });

    const updated = this.db
      .prepare(
        'SELECT id, full_name, phone_number, department, subjects_json, classes_json, status, must_change_password, school_id, created_at, updated_at FROM teachers WHERE id = ?'
      )
      .get(teacherId);
    const mapped = mapTeacher({ ...(updated as object), password_hash: '' });
    return {
      id: mapped.id,
      fullName: mapped.fullName,
      phoneNumber: mapped.phoneNumber,
      department: mapped.department,
      subjects: mapped.subjects,
      classes: mapped.classes,
      status: mapped.status,
      mustChangePassword: mapped.mustChangePassword,
      createdAt: mapped.createdAt,
      updatedAt: mapped.updatedAt,
    };
  }

  async deleteTeacher(teacherId: string, schoolId: string, adminId: string) {
    const existing = this.db
      .prepare('SELECT id, full_name FROM teachers WHERE id = ? AND school_id = ?')
      .get(teacherId, schoolId) as { id: string; full_name: string } | undefined;
    if (!existing) return null;

    withTransaction(this.db, () => {
      this.db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND role = ?').run(teacherId, 'teacher');
      this.db.prepare('DELETE FROM teachers WHERE id = ? AND school_id = ?').run(teacherId, schoolId);
      this.writeAudit(adminId, 'admin', 'TEACHER_DELETED', 'teacher', teacherId, {
        fullName: existing.full_name,
      }, schoolId);
    });
    return { fullName: existing.full_name };
  }

  async updateTeacherPassword(
    teacherId: string,
    schoolId: string,
    passwordHash: string,
    mustChangePassword: boolean,
    actorId: string,
    auditAction: string
  ): Promise<void> {
    const now = new Date().toISOString();
    withTransaction(this.db, () => {
      this.db
        .prepare('UPDATE teachers SET password_hash = ?, must_change_password = ?, updated_at = ? WHERE id = ? AND school_id = ?')
        .run(passwordHash, mustChangePassword ? 1 : 0, now, teacherId, schoolId);
      if (mustChangePassword) {
        this.db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND role = ?').run(teacherId, 'teacher');
      }
      this.writeAudit(
        actorId,
        auditAction.startsWith('TEACHER_') && !auditAction.includes('RESET') ? 'teacher' : 'admin',
        auditAction,
        'teacher',
        teacherId,
        {},
        schoolId
      );
    });
  }

  async getStudentByIdAndSchool(id: string, schoolId: string): Promise<StudentRecord | null> {
    const row = this.db
      .prepare('SELECT * FROM students WHERE id = ? AND school_id = ?')
      .get(id, schoolId) as StudentRecord | undefined;
    return row ?? null;
  }

  async getStudentByPhone(phoneNumber: string): Promise<StudentRecord | null> {
    const row = this.db
      .prepare('SELECT * FROM students WHERE phone_number = ?')
      .get(phoneNumber) as StudentRecord | undefined;
    return row ?? null;
  }

  async findStudentPhoneConflict(phoneNumber: string, excludeId?: string): Promise<boolean> {
    const row = excludeId
      ? this.db.prepare('SELECT id FROM students WHERE phone_number = ? AND id != ?').get(phoneNumber, excludeId)
      : this.db.prepare('SELECT id FROM students WHERE phone_number = ?').get(phoneNumber);
    return Boolean(row);
  }

  async getRegistrationRequestByPhone(phoneNumber: string): Promise<RegistrationRequestRecord | null> {
    const row = this.db
      .prepare('SELECT * FROM registration_requests WHERE phone_number = ?')
      .get(phoneNumber) as RegistrationRequestRecord | undefined;
    return row ?? null;
  }

  async createStudentRegistration(fullName: string, phoneNumber: string, schoolId: string) {
    const now = new Date().toISOString();
    const studentId = `stu-${randomUUID().slice(0, 8)}`;
    const reqId = `req-${randomUUID().slice(0, 8)}`;

    withTransaction(this.db, () => {
      this.db
        .prepare(`
          INSERT INTO students (id, full_name, phone_number, password_hash, approval_status, account_status, must_change_password, school_id, created_at, updated_at)
          VALUES (?, ?, ?, NULL, 'PENDING', 'inactive', 1, ?, ?, ?)
        `)
        .run(studentId, fullName, phoneNumber, schoolId, now, now);

      this.db
        .prepare(`
          INSERT INTO registration_requests (id, full_name, phone_number, status, school_id, created_at)
          VALUES (?, ?, ?, 'PENDING', ?, ?)
        `)
        .run(reqId, fullName, phoneNumber, schoolId, now);

      this.writeAudit(studentId, 'student', 'STUDENT_REGISTRATION_REQUESTED', 'registration_request', reqId, {
        fullName,
        phoneNumber,
      }, schoolId);
    });

    return { reqId, studentId };
  }

  async approveStudent(
    targetId: string,
    schoolId: string,
    adminId: string,
    passwordHash: string,
    classId?: string,
    section?: string,
    rollNumber?: number
  ) {
    const now = new Date().toISOString();
    return withTransaction(this.db, () => {
      let student = this.db
        .prepare('SELECT * FROM students WHERE id = ? AND school_id = ?')
        .get(targetId, schoolId) as any;
      let regReq = this.db
        .prepare('SELECT * FROM registration_requests WHERE id = ? AND school_id = ?')
        .get(targetId, schoolId) as any;

      if (!student && regReq) {
        student = this.db
          .prepare('SELECT * FROM students WHERE phone_number = ? AND school_id = ?')
          .get(regReq.phone_number, schoolId);
      }
      if (!regReq && student) {
        regReq = this.db
          .prepare('SELECT * FROM registration_requests WHERE phone_number = ? AND school_id = ?')
          .get(student.phone_number, schoolId);
      }

      if (!student && !regReq) return null;

      const finalStudentId = student ? student.id : `stu-${randomUUID().slice(0, 8)}`;
      const finalName = student?.full_name ?? regReq.full_name;
      const finalPhone = student?.phone_number ?? regReq.phone_number;

      if (student) {
        this.db
          .prepare(`
            UPDATE students
            SET password_hash = ?, approval_status = 'APPROVED', account_status = 'active',
                must_change_password = 1, approved_by = ?, approved_at = ?,
                class_id = COALESCE(?, class_id), section = COALESCE(?, section),
                roll_number = COALESCE(?, roll_number), updated_at = ?
            WHERE id = ? AND school_id = ?
          `)
          .run(
            passwordHash,
            adminId,
            now,
            classId || null,
            section || null,
            rollNumber ?? null,
            now,
            student.id,
            schoolId
          );
      } else {
        this.db
          .prepare(`
            INSERT INTO students (id, full_name, phone_number, password_hash, approval_status, account_status, must_change_password, approved_by, approved_at, class_id, section, roll_number, school_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'APPROVED', 'active', 1, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .run(
            finalStudentId,
            finalName,
            finalPhone,
            passwordHash,
            adminId,
            now,
            classId || 'cls-10a',
            section || 'A',
            rollNumber ?? 1,
            schoolId,
            now,
            now
          );
      }

      if (regReq) {
        this.db
          .prepare(`
            UPDATE registration_requests
            SET status = 'APPROVED', reviewed_by = ?, reviewed_at = ?, rejection_reason = NULL
            WHERE id = ? AND school_id = ?
          `)
          .run(adminId, now, regReq.id, schoolId);
      }

      this.writeAudit(adminId, 'admin', 'STUDENT_APPROVED', 'student', finalStudentId, {
        fullName: finalName,
        phoneNumber: finalPhone,
      }, schoolId);

      return this.db
        .prepare(
          'SELECT id, full_name, phone_number, approval_status, account_status, must_change_password, approved_by, approved_at, class_id, section, roll_number, created_at, updated_at FROM students WHERE id = ?'
        )
        .get(finalStudentId) as Omit<StudentRecord, 'password_hash' | 'school_id'>;
    });
  }

  async rejectStudent(targetId: string, schoolId: string, adminId: string, reason: string): Promise<boolean> {
    const now = new Date().toISOString();
    return withTransaction(this.db, () => {
      let student = this.db
        .prepare('SELECT * FROM students WHERE id = ? AND school_id = ?')
        .get(targetId, schoolId) as any;
      let regReq = this.db
        .prepare('SELECT * FROM registration_requests WHERE id = ? AND school_id = ?')
        .get(targetId, schoolId) as any;

      if (!student && regReq) {
        student = this.db
          .prepare('SELECT * FROM students WHERE phone_number = ? AND school_id = ?')
          .get(regReq.phone_number, schoolId);
      }
      if (!regReq && student) {
        regReq = this.db
          .prepare('SELECT * FROM registration_requests WHERE phone_number = ? AND school_id = ?')
          .get(student.phone_number, schoolId);
      }

      if (!student && !regReq) return false;

      if (student) {
        this.db
          .prepare(`
            UPDATE students
            SET approval_status = 'REJECTED', account_status = 'inactive', updated_at = ?
            WHERE id = ? AND school_id = ?
          `)
          .run(now, student.id, schoolId);
        this.db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND role = ?').run(student.id, 'student');
      }

      if (regReq) {
        this.db
          .prepare(`
            UPDATE registration_requests
            SET status = 'REJECTED', reviewed_by = ?, reviewed_at = ?, rejection_reason = ?
            WHERE id = ? AND school_id = ?
          `)
          .run(adminId, now, reason, regReq.id, schoolId);
      }

      this.writeAudit(
        adminId,
        'admin',
        'STUDENT_REJECTED',
        'student',
        student?.id ?? regReq.id,
        { reason },
        schoolId
      );

      return true;
    });
  }

  async updateStudent(studentId: string, schoolId: string, updates: UpdateStudentInput) {
    const existing = this.db
      .prepare('SELECT * FROM students WHERE id = ? AND school_id = ?')
      .get(studentId, schoolId) as any;
    if (!existing) return null;

    const nextStatus =
      updates.accountStatus === 'active' || updates.accountStatus === 'inactive'
        ? updates.accountStatus
        : existing.account_status;
    const nextName = (updates.fullName || existing.full_name).trim();
    const nextPhone = updates.phoneNumber || existing.phone_number;
    const now = new Date().toISOString();

    withTransaction(this.db, () => {
      this.db
        .prepare(`
          UPDATE students
          SET full_name = ?, phone_number = ?, class_id = ?, section = ?, roll_number = ?, account_status = ?, updated_at = ?
          WHERE id = ? AND school_id = ?
        `)
        .run(
          nextName,
          nextPhone,
          updates.classId || existing.class_id,
          updates.section || existing.section,
          updates.rollNumber ?? existing.roll_number,
          nextStatus,
          now,
          studentId,
          schoolId
        );

      this.db
        .prepare(`
          UPDATE registration_requests
          SET full_name = ?, phone_number = ?
          WHERE phone_number = ? AND school_id = ?
        `)
        .run(nextName, nextPhone, existing.phone_number, schoolId);

      if (nextStatus === 'inactive') {
        this.db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND role = ?').run(studentId, 'student');
      }

      this.writeAudit(updates.adminId, 'admin', 'STUDENT_UPDATED', 'student', studentId, {
        accountStatus: nextStatus,
      }, schoolId);
    });

    return this.db
      .prepare(
        'SELECT id, full_name, phone_number, approval_status, account_status, must_change_password, approved_by, approved_at, class_id, section, roll_number, created_at, updated_at FROM students WHERE id = ?'
      )
      .get(studentId) as Omit<StudentRecord, 'password_hash' | 'school_id'>;
  }

  async updateStudentPassword(
    studentId: string,
    schoolId: string,
    passwordHash: string,
    mustChangePassword: boolean,
    actorId: string,
    auditAction: string
  ): Promise<void> {
    const now = new Date().toISOString();
    withTransaction(this.db, () => {
      this.db
        .prepare('UPDATE students SET password_hash = ?, must_change_password = ?, updated_at = ? WHERE id = ? AND school_id = ?')
        .run(passwordHash, mustChangePassword ? 1 : 0, now, studentId, schoolId);
      if (mustChangePassword) {
        this.db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND role = ?').run(studentId, 'student');
      }
      this.writeAudit(
        actorId,
        auditAction === 'STUDENT_CHANGED_PASSWORD' ? 'student' : 'admin',
        auditAction,
        'student',
        studentId,
        {},
        schoolId
      );
    });
  }

  async getAdminOverview(schoolId: string): Promise<AdminOverviewPayload> {
    const requests = this.db
      .prepare(`
        SELECT r.id, r.full_name, r.phone_number, r.status, r.reviewed_by, r.reviewed_at, r.rejection_reason, r.school_id, r.created_at,
               s.id as student_id, s.account_status, s.approval_status, s.class_id, s.section, s.roll_number
        FROM registration_requests r
        LEFT JOIN students s ON s.phone_number = r.phone_number AND s.school_id = r.school_id
        WHERE r.school_id = ?
        ORDER BY r.created_at DESC
      `)
      .all(schoolId) as unknown as RegistrationRequestRecord[];

    const students = this.db
      .prepare(`
        SELECT id, full_name, phone_number, approval_status, account_status, must_change_password,
               approved_by, approved_at, class_id, section, roll_number, created_at, updated_at
        FROM students
        WHERE school_id = ?
        ORDER BY created_at DESC
      `)
      .all(schoolId) as unknown as Array<Omit<StudentRecord, 'password_hash' | 'school_id'>>;

    const teachers = this.db
      .prepare(`
        SELECT id, full_name, phone_number, department, subjects_json, classes_json, status,
               must_change_password, created_at, updated_at
        FROM teachers
        WHERE school_id = ?
        ORDER BY created_at DESC
      `)
      .all(schoolId)
      .map((t: any) => ({
        id: t.id,
        fullName: t.full_name,
        phoneNumber: t.phone_number,
        department: t.department,
        subjects: JSON.parse(t.subjects_json || '[]'),
        classes: JSON.parse(t.classes_json || '[]'),
        status: t.status,
        mustChangePassword: Boolean(t.must_change_password),
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));

    const auditLogs = this.db
      .prepare(`
        SELECT id, actor_id, actor_role, action, target_type, target_id, details_json, created_at
        FROM audit_logs
        WHERE school_id = ?
        ORDER BY created_at DESC
        LIMIT 30
      `)
      .all(schoolId) as unknown as AdminOverviewPayload['auditLogs'];

    return {
      requests,
      students,
      teachers,
      auditLogs,
      counts: {
        totalStudents: students.length,
        pendingApprovals: students.filter((s) => s.approval_status === 'PENDING').length,
        approvedStudents: students.filter((s) => s.approval_status === 'APPROVED').length,
        rejectedApplications: students.filter((s) => s.approval_status === 'REJECTED').length,
        totalTeachers: teachers.length,
        activeTeachers: teachers.filter((t) => t.status === 'active').length,
      },
    };
  }
}
