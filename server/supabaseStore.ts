import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { DEFAULT_SCHOOL_ID, getAuthorizedAdminEmails } from './db.ts';
import { hashPassword } from './security.ts';
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

function parseArrayField(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapSupabaseTeacher(row: any): TeacherRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    passwordHash: row.password_hash,
    department: row.department,
    subjects: parseArrayField(row.subjects_json),
    classes: parseArrayField(row.classes_json),
    status: row.status,
    mustChangePassword: Boolean(row.must_change_password),
    schoolId: row.school_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSupabaseStudent(row: any): StudentRecord {
  return {
    id: row.id,
    full_name: row.full_name,
    phone_number: row.phone_number,
    password_hash: row.password_hash ?? null,
    approval_status: row.approval_status,
    account_status: row.account_status,
    must_change_password: row.must_change_password ? 1 : 0,
    approved_by: row.approved_by ?? null,
    approved_at: row.approved_at ?? null,
    class_id: row.class_id,
    section: row.section,
    roll_number: Number(row.roll_number ?? 1),
    school_id: row.school_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export class SupabaseAuthStore implements AuthStore {
  readonly kind = 'supabase' as const;
  private readonly client: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async verifySchemaAndSeed(): Promise<boolean> {
    const check = await this.client.from('admins').select('id', { count: 'exact', head: true });
    if (check.error) {
      return false;
    }

    const authorizedEmails = getAuthorizedAdminEmails();
    for (let i = 0; i < authorizedEmails.length; i += 1) {
      const email = authorizedEmails[i];
      await this.client.from('admins').upsert(
        {
          id: `adm-root-${i + 1}`,
          google_email: email,
          role: 'admin',
          school_id: DEFAULT_SCHOOL_ID,
        },
        { onConflict: 'google_email', ignoreDuplicates: true }
      );
    }

    const teacherCount = await this.client.from('teachers').select('id', { count: 'exact', head: true });
    if (!teacherCount.error && (teacherCount.count ?? 0) === 0) {
      const sampleHash = hashPassword('Teacher@123');
      await this.client.from('teachers').insert([
        {
          id: 'tch-1',
          full_name: 'Sunita Shrestha',
          phone_number: '9800000101',
          password_hash: sampleHash,
          department: 'Mathematics',
          subjects_json: ['sub-math'],
          classes_json: ['cls-10a', 'cls-9a'],
          status: 'active',
          must_change_password: false,
          school_id: DEFAULT_SCHOOL_ID,
        },
        {
          id: 'tch-2',
          full_name: 'Bikram Thapa',
          phone_number: '9800000102',
          password_hash: sampleHash,
          department: 'Science',
          subjects_json: ['sub-sci'],
          classes_json: ['cls-10a', 'cls-6b'],
          status: 'active',
          must_change_password: false,
          school_id: DEFAULT_SCHOOL_ID,
        },
      ]);
    }

    const studentCount = await this.client.from('students').select('id', { count: 'exact', head: true });
    if (!studentCount.error && (studentCount.count ?? 0) === 0) {
      const { data: adminRow } = await this.client.from('admins').select('id').limit(1).maybeSingle();
      const adminId = adminRow?.id ?? null;
      const stuHash = hashPassword('Student@123');
      const now = new Date().toISOString();

      await this.client.from('students').insert([
        {
          id: 'stu-1',
          full_name: 'Aarav Adhikari',
          phone_number: '9800000301',
          password_hash: stuHash,
          approval_status: 'APPROVED',
          account_status: 'active',
          must_change_password: false,
          approved_by: adminId,
          approved_at: now,
          class_id: 'cls-10a',
          section: 'A',
          roll_number: 1,
          school_id: DEFAULT_SCHOOL_ID,
        },
        {
          id: 'stu-pending-1',
          full_name: 'Niharika Poudel',
          phone_number: '9800000401',
          password_hash: null,
          approval_status: 'PENDING',
          account_status: 'inactive',
          must_change_password: true,
          approved_by: null,
          approved_at: null,
          class_id: 'cls-10a',
          section: 'A',
          roll_number: 12,
          school_id: DEFAULT_SCHOOL_ID,
        },
      ]);

      await this.client.from('registration_requests').insert([
        {
          id: 'req-1',
          full_name: 'Aarav Adhikari',
          phone_number: '9800000301',
          status: 'APPROVED',
          reviewed_by: adminId,
          reviewed_at: now,
          school_id: DEFAULT_SCHOOL_ID,
        },
        {
          id: 'req-2',
          full_name: 'Niharika Poudel',
          phone_number: '9800000401',
          status: 'PENDING',
          school_id: DEFAULT_SCHOOL_ID,
        },
      ]);
    }

    return true;
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
    await this.client.from('audit_logs').insert({
      id: `aud-${randomUUID()}`,
      actor_id: actorId,
      actor_role: actorRole,
      action,
      target_type: targetType,
      target_id: targetId,
      details_json: details,
      school_id: schoolId,
      created_at: new Date().toISOString(),
    });
  }

  async getAuthorizedAdminByEmail(email: string): Promise<AdminRecord | null> {
    const { data, error } = await this.client
      .from('admins')
      .select('id, google_email, role, school_id')
      .ilike('google_email', email.trim())
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      googleEmail: data.google_email,
      role: data.role,
      schoolId: data.school_id,
    };
  }

  async getAdminByIdAndSchool(id: string, schoolId: string): Promise<AdminRecord | null> {
    const { data, error } = await this.client
      .from('admins')
      .select('id, google_email, role, school_id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      googleEmail: data.google_email,
      role: data.role,
      schoolId: data.school_id,
    };
  }

  async createSession(
    userId: string,
    role: AuthRole,
    schoolId: string,
    tokenHash: string,
    expiresAt: string
  ): Promise<void> {
    const { error } = await this.client.from('user_sessions').insert({
      id: `ses-${randomUUID()}`,
      user_id: userId,
      role,
      session_token_hash: tokenHash,
      school_id: schoolId,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }

  async getSessionByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const { data, error } = await this.client
      .from('user_sessions')
      .select('id, user_id, role, school_id, expires_at')
      .eq('session_token_hash', tokenHash)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      role: data.role as AuthRole,
      schoolId: data.school_id,
      expiresAt: data.expires_at,
    };
  }

  async deleteSessionById(id: string): Promise<void> {
    await this.client.from('user_sessions').delete().eq('id', id);
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    await this.client.from('user_sessions').delete().eq('session_token_hash', tokenHash);
  }

  async deleteUserSessions(userId: string, role: AuthRole): Promise<void> {
    await this.client.from('user_sessions').delete().eq('user_id', userId).eq('role', role);
  }

  async expireSessionsForRole(role: AuthRole, expiresAt: string): Promise<void> {
    await this.client.from('user_sessions').update({ expires_at: expiresAt }).eq('role', role);
  }

  async getTeacherByIdAndSchool(id: string, schoolId: string): Promise<TeacherRecord | null> {
    const { data, error } = await this.client
      .from('teachers')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();
    if (error || !data) return null;
    return mapSupabaseTeacher(data);
  }

  async getTeacherByPhone(phoneNumber: string): Promise<TeacherRecord | null> {
    const { data, error } = await this.client
      .from('teachers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    if (error || !data) return null;
    return mapSupabaseTeacher(data);
  }

  async findTeacherPhoneConflict(phoneNumber: string, excludeId?: string): Promise<boolean> {
    let query = this.client.from('teachers').select('id').eq('phone_number', phoneNumber);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data } = await query.maybeSingle();
    return Boolean(data);
  }

  async createTeacher(input: CreateTeacherInput) {
    const id = `tch-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const { error } = await this.client.from('teachers').insert({
      id,
      full_name: input.fullName,
      phone_number: input.phoneNumber,
      password_hash: input.passwordHash,
      department: input.department,
      subjects_json: input.subjects,
      classes_json: input.classes,
      status: 'active',
      must_change_password: true,
      school_id: input.schoolId,
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(error.message);

    await this.logAudit(
      input.adminId,
      'admin',
      'TEACHER_CREATED',
      'teacher',
      id,
      { fullName: input.fullName, phoneNumber: input.phoneNumber, department: input.department },
      input.schoolId
    );

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
    const existing = await this.getTeacherByIdAndSchool(teacherId, schoolId);
    if (!existing) return null;

    const nextStatus =
      updates.status === 'active' || updates.status === 'inactive' ? updates.status : existing.status;
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('teachers')
      .update({
        full_name: (updates.fullName || existing.fullName).trim(),
        phone_number: updates.phoneNumber || existing.phoneNumber,
        department: (updates.department || existing.department).trim(),
        subjects_json: Array.isArray(updates.subjects) ? updates.subjects : existing.subjects,
        classes_json: Array.isArray(updates.classes) ? updates.classes : existing.classes,
        status: nextStatus,
        updated_at: now,
      })
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to update teacher');

    if (nextStatus === 'inactive') {
      await this.deleteUserSessions(teacherId, 'teacher');
    }

    await this.logAudit(
      updates.adminId,
      'admin',
      'TEACHER_UPDATED',
      'teacher',
      teacherId,
      { status: nextStatus },
      schoolId
    );

    const mapped = mapSupabaseTeacher(data);
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
    const existing = await this.getTeacherByIdAndSchool(teacherId, schoolId);
    if (!existing) return null;

    await this.deleteUserSessions(teacherId, 'teacher');
    const { error } = await this.client
      .from('teachers')
      .delete()
      .eq('id', teacherId)
      .eq('school_id', schoolId);
    if (error) throw new Error(error.message);

    await this.logAudit(
      adminId,
      'admin',
      'TEACHER_DELETED',
      'teacher',
      teacherId,
      { fullName: existing.fullName },
      schoolId
    );
    return { fullName: existing.fullName };
  }

  async updateTeacherPassword(
    teacherId: string,
    schoolId: string,
    passwordHash: string,
    mustChangePassword: boolean,
    actorId: string,
    auditAction: string
  ): Promise<void> {
    const { error } = await this.client
      .from('teachers')
      .update({
        password_hash: passwordHash,
        must_change_password: mustChangePassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teacherId)
      .eq('school_id', schoolId);
    if (error) throw new Error(error.message);

    if (mustChangePassword) {
      await this.deleteUserSessions(teacherId, 'teacher');
    }

    await this.logAudit(
      actorId,
      auditAction === 'TEACHER_CHANGED_PASSWORD' ? 'teacher' : 'admin',
      auditAction,
      'teacher',
      teacherId,
      {},
      schoolId
    );
  }

  async getStudentByIdAndSchool(id: string, schoolId: string): Promise<StudentRecord | null> {
    const { data, error } = await this.client
      .from('students')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();
    if (error || !data) return null;
    return mapSupabaseStudent(data);
  }

  async getStudentByPhone(phoneNumber: string): Promise<StudentRecord | null> {
    const { data, error } = await this.client
      .from('students')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    if (error || !data) return null;
    return mapSupabaseStudent(data);
  }

  async findStudentPhoneConflict(phoneNumber: string, excludeId?: string): Promise<boolean> {
    let query = this.client.from('students').select('id').eq('phone_number', phoneNumber);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data } = await query.maybeSingle();
    return Boolean(data);
  }

  async getRegistrationRequestByPhone(phoneNumber: string): Promise<RegistrationRequestRecord | null> {
    const { data, error } = await this.client
      .from('registration_requests')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    if (error || !data) return null;
    return data as RegistrationRequestRecord;
  }

  async createStudentRegistration(fullName: string, phoneNumber: string, schoolId: string) {
    const now = new Date().toISOString();
    const studentId = `stu-${randomUUID().slice(0, 8)}`;
    const reqId = `req-${randomUUID().slice(0, 8)}`;

    const { error: stuErr } = await this.client.from('students').insert({
      id: studentId,
      full_name: fullName,
      phone_number: phoneNumber,
      password_hash: null,
      approval_status: 'PENDING',
      account_status: 'inactive',
      must_change_password: true,
      school_id: schoolId,
      created_at: now,
      updated_at: now,
    });
    if (stuErr) throw new Error(stuErr.message);

    const { error: reqErr } = await this.client.from('registration_requests').insert({
      id: reqId,
      full_name: fullName,
      phone_number: phoneNumber,
      status: 'PENDING',
      school_id: schoolId,
      created_at: now,
    });
    if (reqErr) throw new Error(reqErr.message);

    await this.logAudit(
      studentId,
      'student',
      'STUDENT_REGISTRATION_REQUESTED',
      'registration_request',
      reqId,
      { fullName, phoneNumber },
      schoolId
    );

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
    let { data: student } = await this.client
      .from('students')
      .select('*')
      .eq('id', targetId)
      .eq('school_id', schoolId)
      .maybeSingle();
    let { data: regReq } = await this.client
      .from('registration_requests')
      .select('*')
      .eq('id', targetId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!student && regReq) {
      const res = await this.client
        .from('students')
        .select('*')
        .eq('phone_number', regReq.phone_number)
        .eq('school_id', schoolId)
        .maybeSingle();
      student = res.data;
    }
    if (!regReq && student) {
      const res = await this.client
        .from('registration_requests')
        .select('*')
        .eq('phone_number', student.phone_number)
        .eq('school_id', schoolId)
        .maybeSingle();
      regReq = res.data;
    }

    if (!student && !regReq) return null;

    const finalStudentId = student ? student.id : `stu-${randomUUID().slice(0, 8)}`;
    const finalName = student?.full_name ?? regReq.full_name;
    const finalPhone = student?.phone_number ?? regReq.phone_number;

    let updatedStudent: any;
    if (student) {
      const { data, error } = await this.client
        .from('students')
        .update({
          password_hash: passwordHash,
          approval_status: 'APPROVED',
          account_status: 'active',
          must_change_password: true,
          approved_by: adminId,
          approved_at: now,
          class_id: classId || student.class_id,
          section: section || student.section,
          roll_number: rollNumber ?? student.roll_number,
          updated_at: now,
        })
        .eq('id', student.id)
        .eq('school_id', schoolId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      updatedStudent = data;
    } else {
      const { data, error } = await this.client
        .from('students')
        .insert({
          id: finalStudentId,
          full_name: finalName,
          phone_number: finalPhone,
          password_hash: passwordHash,
          approval_status: 'APPROVED',
          account_status: 'active',
          must_change_password: true,
          approved_by: adminId,
          approved_at: now,
          class_id: classId || 'cls-10a',
          section: section || 'A',
          roll_number: rollNumber ?? 1,
          school_id: schoolId,
          created_at: now,
          updated_at: now,
        })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      updatedStudent = data;
    }

    if (regReq) {
      await this.client
        .from('registration_requests')
        .update({
          status: 'APPROVED',
          reviewed_by: adminId,
          reviewed_at: now,
          rejection_reason: null,
        })
        .eq('id', regReq.id)
        .eq('school_id', schoolId);
    }

    await this.logAudit(
      adminId,
      'admin',
      'STUDENT_APPROVED',
      'student',
      finalStudentId,
      { fullName: finalName, phoneNumber: finalPhone },
      schoolId
    );

    const mapped = mapSupabaseStudent(updatedStudent);
    const { password_hash: _p, school_id: _s, ...safe } = mapped;
    return safe;
  }

  async rejectStudent(targetId: string, schoolId: string, adminId: string, reason: string): Promise<boolean> {
    const now = new Date().toISOString();
    let { data: student } = await this.client
      .from('students')
      .select('*')
      .eq('id', targetId)
      .eq('school_id', schoolId)
      .maybeSingle();
    let { data: regReq } = await this.client
      .from('registration_requests')
      .select('*')
      .eq('id', targetId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!student && regReq) {
      const res = await this.client
        .from('students')
        .select('*')
        .eq('phone_number', regReq.phone_number)
        .eq('school_id', schoolId)
        .maybeSingle();
      student = res.data;
    }
    if (!regReq && student) {
      const res = await this.client
        .from('registration_requests')
        .select('*')
        .eq('phone_number', student.phone_number)
        .eq('school_id', schoolId)
        .maybeSingle();
      regReq = res.data;
    }

    if (!student && !regReq) return false;

    if (student) {
      await this.client
        .from('students')
        .update({
          approval_status: 'REJECTED',
          account_status: 'inactive',
          updated_at: now,
        })
        .eq('id', student.id)
        .eq('school_id', schoolId);
      await this.deleteUserSessions(student.id, 'student');
    }

    if (regReq) {
      await this.client
        .from('registration_requests')
        .update({
          status: 'REJECTED',
          reviewed_by: adminId,
          reviewed_at: now,
          rejection_reason: reason,
        })
        .eq('id', regReq.id)
        .eq('school_id', schoolId);
    }

    await this.logAudit(
      adminId,
      'admin',
      'STUDENT_REJECTED',
      'student',
      student?.id ?? regReq.id,
      { reason },
      schoolId
    );
    return true;
  }

  async updateStudent(studentId: string, schoolId: string, updates: UpdateStudentInput) {
    const existing = await this.getStudentByIdAndSchool(studentId, schoolId);
    if (!existing) return null;

    const nextStatus =
      updates.accountStatus === 'active' || updates.accountStatus === 'inactive'
        ? updates.accountStatus
        : existing.account_status;
    const nextName = (updates.fullName || existing.full_name).trim();
    const nextPhone = updates.phoneNumber || existing.phone_number;
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('students')
      .update({
        full_name: nextName,
        phone_number: nextPhone,
        class_id: updates.classId || existing.class_id,
        section: updates.section || existing.section,
        roll_number: updates.rollNumber ?? existing.roll_number,
        account_status: nextStatus,
        updated_at: now,
      })
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to update student');

    await this.client
      .from('registration_requests')
      .update({ full_name: nextName, phone_number: nextPhone })
      .eq('phone_number', existing.phone_number)
      .eq('school_id', schoolId);

    if (nextStatus === 'inactive') {
      await this.deleteUserSessions(studentId, 'student');
    }

    await this.logAudit(
      updates.adminId,
      'admin',
      'STUDENT_UPDATED',
      'student',
      studentId,
      { accountStatus: nextStatus },
      schoolId
    );

    const mapped = mapSupabaseStudent(data);
    const { password_hash: _p, school_id: _s, ...safe } = mapped;
    return safe;
  }

  async updateStudentPassword(
    studentId: string,
    schoolId: string,
    passwordHash: string,
    mustChangePassword: boolean,
    actorId: string,
    auditAction: string
  ): Promise<void> {
    const { error } = await this.client
      .from('students')
      .update({
        password_hash: passwordHash,
        must_change_password: mustChangePassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId)
      .eq('school_id', schoolId);
    if (error) throw new Error(error.message);

    if (mustChangePassword) {
      await this.deleteUserSessions(studentId, 'student');
    }

    await this.logAudit(
      actorId,
      auditAction === 'STUDENT_CHANGED_PASSWORD' ? 'student' : 'admin',
      auditAction,
      'student',
      studentId,
      {},
      schoolId
    );
  }

  async getAdminOverview(schoolId: string): Promise<AdminOverviewPayload> {
    const [reqRes, stuRes, tchRes, audRes] = await Promise.all([
      this.client
        .from('registration_requests')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false }),
      this.client
        .from('students')
        .select('id, full_name, phone_number, approval_status, account_status, must_change_password, approved_by, approved_at, class_id, section, roll_number, created_at, updated_at')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false }),
      this.client
        .from('teachers')
        .select('id, full_name, phone_number, department, subjects_json, classes_json, status, must_change_password, created_at, updated_at')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false }),
      this.client
        .from('audit_logs')
        .select('id, actor_id, actor_role, action, target_type, target_id, details_json, created_at')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

    const rawStudents = stuRes.data || [];
    const studentsByPhone = new Map<string, any>();
    rawStudents.forEach((s: any) => studentsByPhone.set(s.phone_number, s));

    const requests: RegistrationRequestRecord[] = (reqRes.data || []).map((r: any) => {
      const stu = studentsByPhone.get(r.phone_number);
      return {
        ...r,
        student_id: stu?.id ?? null,
        account_status: stu?.account_status ?? null,
        approval_status: stu?.approval_status ?? null,
        class_id: stu?.class_id ?? null,
        section: stu?.section ?? null,
        roll_number: stu?.roll_number ?? null,
      };
    });

    const students = rawStudents.map((s: any) => ({
      id: s.id,
      full_name: s.full_name,
      phone_number: s.phone_number,
      approval_status: s.approval_status,
      account_status: s.account_status,
      must_change_password: s.must_change_password ? 1 : 0,
      approved_by: s.approved_by,
      approved_at: s.approved_at,
      class_id: s.class_id,
      section: s.section,
      roll_number: Number(s.roll_number ?? 1),
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));

    const teachers = (tchRes.data || []).map((t: any) => {
      const mapped = mapSupabaseTeacher(t);
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
    });

    const auditLogs = (audRes.data || []).map((a: any) => ({
      ...a,
      details_json: typeof a.details_json === 'string' ? a.details_json : JSON.stringify(a.details_json || {}),
    }));

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
