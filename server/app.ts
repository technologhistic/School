import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { DEFAULT_SCHOOL_ID, getAuthorizedAdminEmails } from './db.ts';
import {
  generateSessionToken,
  generateTempPassword,
  hashPassword,
  hashSessionToken,
  normalizePhoneNumber,
  verifyGoogleFirebaseIdToken,
  verifyPassword,
  verifySupabaseAccessToken,
} from './security.ts';
import type { AuthRole, AuthStore } from './store.ts';
import { SqliteAuthStore } from './sqliteStore.ts';
import { SupabaseAuthStore } from './supabaseStore.ts';

export type { AuthRole };

export interface SessionContext {
  sessionId: string;
  userId: string;
  role: AuthRole;
  schoolId: string;
  user: Record<string, unknown>;
}

export interface AuthedRequest extends Request {
  sessionCtx?: SessionContext;
}

export interface CreateAppOptions {
  dbPath?: string;
  store?: AuthStore;
  disableRateLimit?: boolean;
  verifyGoogleToken?: (
    idToken: string
  ) => Promise<{ email: string; emailVerified: boolean; name?: string }>;
}

const SESSION_COOKIE_NAME = 'sp_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions(req: Request) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  return {
    httpOnly: true,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    secure: isHttps,
    path: '/',
    maxAge: SESSION_TTL_MS,
  };
}

async function resolveStore(options: CreateAppOptions): Promise<AuthStore> {
  if (options.store) return options.store;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!options.dbPath && supabaseUrl && supabaseServiceKey) {
    const sbStore = new SupabaseAuthStore(supabaseUrl, supabaseServiceKey);
    const ready = await sbStore.verifySchemaAndSeed();
    if (ready) {
      console.log(`Connected to Supabase Postgres store (${supabaseUrl})`);
      return sbStore;
    }
    console.warn(
      'Supabase credentials found, but auth tables are missing. Run supabase/schema.sql in Supabase SQL Editor. Falling back to local SQLite store.'
    );
  } else if (!options.dbPath && supabaseUrl && !supabaseServiceKey) {
    console.info(
      'Supabase URL configured. Set SUPABASE_SERVICE_ROLE_KEY in Secrets after running supabase/schema.sql to switch auth storage from local SQLite to Supabase Postgres.'
    );
  }

  return new SqliteAuthStore(options.dbPath);
}

async function issueSession(
  store: AuthStore,
  userId: string,
  role: AuthRole,
  schoolId: string
): Promise<string> {
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await store.createSession(userId, role, schoolId, tokenHash, expiresAt);
  return rawToken;
}

const asyncHandler =
  (fn: (req: AuthedRequest, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: AuthedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export async function createApp(options: CreateAppOptions = {}) {
  const store = await resolveStore(options);
  const verifyGoogleToken = options.verifyGoogleToken ?? verifyGoogleFirebaseIdToken;
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const authLimiter = options.disableRateLimit
    ? (_req: Request, _res: Response, next: NextFunction) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 40,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many authentication attempts. Please wait a few minutes and try again.' },
      });

  // Session resolution middleware
  app.use(
    asyncHandler(async (req: AuthedRequest, _res: Response, next: NextFunction) => {
      const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
      if (!rawToken || typeof rawToken !== 'string') {
        return next();
      }

      const tokenHash = hashSessionToken(rawToken);
      const sessionRow = await store.getSessionByTokenHash(tokenHash);
      if (!sessionRow) {
        return next();
      }

      if (new Date(sessionRow.expiresAt).getTime() <= Date.now()) {
        await store.deleteSessionById(sessionRow.id);
        return next();
      }

      if (sessionRow.role === 'admin') {
        const admin = await store.getAdminByIdAndSchool(sessionRow.userId, sessionRow.schoolId);
        if (admin && getAuthorizedAdminEmails().includes(admin.googleEmail.toLowerCase())) {
          req.sessionCtx = {
            sessionId: sessionRow.id,
            userId: admin.id,
            role: 'admin',
            schoolId: admin.schoolId,
            user: {
              id: admin.id,
              email: admin.googleEmail,
              fullName: 'School Administrator',
              role: 'admin',
              mustChangePassword: false,
            },
          };
        }
      } else if (sessionRow.role === 'teacher') {
        const teacher = await store.getTeacherByIdAndSchool(sessionRow.userId, sessionRow.schoolId);
        if (teacher && teacher.status === 'active') {
          req.sessionCtx = {
            sessionId: sessionRow.id,
            userId: teacher.id,
            role: 'teacher',
            schoolId: teacher.schoolId,
            user: {
              id: teacher.id,
              fullName: teacher.fullName,
              phoneNumber: teacher.phoneNumber,
              department: teacher.department,
              subjects: teacher.subjects,
              classes: teacher.classes,
              status: teacher.status,
              mustChangePassword: teacher.mustChangePassword,
              role: 'teacher',
            },
          };
        }
      } else if (sessionRow.role === 'student') {
        const student = await store.getStudentByIdAndSchool(sessionRow.userId, sessionRow.schoolId);
        if (student && student.approval_status === 'APPROVED' && student.account_status === 'active') {
          req.sessionCtx = {
            sessionId: sessionRow.id,
            userId: student.id,
            role: 'student',
            schoolId: student.school_id,
            user: {
              id: student.id,
              fullName: student.full_name,
              phoneNumber: student.phone_number,
              classId: student.class_id,
              section: student.section,
              rollNumber: student.roll_number,
              approvalStatus: student.approval_status,
              accountStatus: student.account_status,
              mustChangePassword: Boolean(student.must_change_password),
              role: 'student',
            },
          };
        }
      }

      return next();
    })
  );

  const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.sessionCtx) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    return next();
  };

  const requireRole = (role: AuthRole) => (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.sessionCtx) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    if (req.sessionCtx.role !== role) {
      return res.status(403).json({ error: `Forbidden: ${role} role required.` });
    }
    return next();
  };

  // ==========================================
  // GENERAL AUTH ENDPOINTS
  // ==========================================
  app.get('/api/v1/auth/me', (req: AuthedRequest, res: Response) => {
    if (!req.sessionCtx) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.json({ user: req.sessionCtx.user });
  });

  app.post(
    '/api/v1/auth/logout',
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
      if (rawToken && typeof rawToken === 'string') {
        const tokenHash = hashSessionToken(rawToken);
        await store.deleteSessionByTokenHash(tokenHash);
      }
      const opts = getCookieOptions(req);
      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: opts.httpOnly,
        sameSite: opts.sameSite,
        secure: opts.secure,
        path: opts.path,
      });
      return res.json({ ok: true });
    })
  );

  // ==========================================
  // 1. ADMIN GOOGLE AUTHENTICATION
  // ==========================================
  app.post(
    '/api/v1/auth/admin/google',
    authLimiter,
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      try {
        const { idToken, supabaseAccessToken } = req.body as {
          idToken?: string;
          supabaseAccessToken?: string;
        };

        let verified: { email: string; emailVerified: boolean; name?: string };
        if (supabaseAccessToken && typeof supabaseAccessToken === 'string') {
          verified = await verifySupabaseAccessToken(supabaseAccessToken);
        } else if (idToken && typeof idToken === 'string') {
          verified = await verifyGoogleToken(idToken);
        } else {
          return res.status(400).json({ error: 'Google ID token is required.' });
        }

        if (!verified.emailVerified) {
          return res.status(403).json({ error: 'Access Denied: Google account email is not verified.' });
        }

        const email = verified.email.trim().toLowerCase();
        const authorizedEmails = getAuthorizedAdminEmails();

        if (!authorizedEmails.includes(email)) {
          await store.logAudit(null, 'anonymous', 'ADMIN_LOGIN_DENIED', 'admin', email, {
            reason: 'Unauthorized Google email',
          });
          return res.status(403).json({ error: 'Access Denied: Unauthorized Admin Account' });
        }

        const admin = await store.getAuthorizedAdminByEmail(email);
        if (!admin) {
          return res.status(403).json({ error: 'Access Denied: Unauthorized Admin Account' });
        }

        const rawToken = await issueSession(store, admin.id, 'admin', admin.schoolId);
        await store.logAudit(admin.id, 'admin', 'ADMIN_GOOGLE_LOGIN', 'admin', admin.id, {
          email: admin.googleEmail,
        });

        res.cookie(SESSION_COOKIE_NAME, rawToken, getCookieOptions(req));
        return res.json({
          user: {
            id: admin.id,
            email: admin.googleEmail,
            fullName: verified.name || 'School Administrator',
            role: 'admin',
            mustChangePassword: false,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Google token verification failed';
        return res.status(401).json({ error: `Authentication failed: ${message}` });
      }
    })
  );

  // ==========================================
  // 2. TEACHER AUTHENTICATION
  // ==========================================
  app.post(
    '/api/v1/auth/teacher/login',
    authLimiter,
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const { phoneNumber, password } = req.body as { phoneNumber?: string; password?: string };
      const normalizedPhone = normalizePhoneNumber(phoneNumber || '');
      if (!normalizedPhone) {
        return res.status(400).json({ error: 'Please enter a valid registered phone number.' });
      }
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required.' });
      }

      const teacher = await store.getTeacherByPhone(normalizedPhone);
      if (!teacher) {
        return res.status(401).json({
          error: 'Your phone number is not registered. Contact your school administrator.',
        });
      }

      if (teacher.status !== 'active') {
        await store.logAudit(teacher.id, 'teacher', 'TEACHER_LOGIN_DENIED_INACTIVE', 'teacher', teacher.id, {
          phoneNumber: normalizedPhone,
        });
        return res.status(403).json({
          error: 'Your teacher account is deactivated. Contact your school administrator.',
        });
      }

      if (!verifyPassword(password, teacher.passwordHash)) {
        return res.status(401).json({ error: 'Invalid phone number or password.' });
      }

      const rawToken = await issueSession(store, teacher.id, 'teacher', teacher.schoolId);
      await store.logAudit(teacher.id, 'teacher', 'TEACHER_LOGIN', 'teacher', teacher.id, {});
      res.cookie(SESSION_COOKIE_NAME, rawToken, getCookieOptions(req));

      return res.json({
        user: {
          id: teacher.id,
          fullName: teacher.fullName,
          phoneNumber: teacher.phoneNumber,
          department: teacher.department,
          subjects: teacher.subjects,
          classes: teacher.classes,
          status: teacher.status,
          mustChangePassword: teacher.mustChangePassword,
          role: 'teacher',
        },
      });
    })
  );

  app.post(
    '/api/v1/auth/teacher/change-password',
    requireAuth,
    requireRole('teacher'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: 'Provide your current password and a new password (min 6 characters).' });
      }
      if (currentPassword === newPassword) {
        return res
          .status(400)
          .json({ error: 'New password must differ from your current password.' });
      }

      const teacher = await store.getTeacherByIdAndSchool(req.sessionCtx!.userId, req.sessionCtx!.schoolId);
      if (!teacher || !verifyPassword(currentPassword, teacher.passwordHash)) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      const newHash = hashPassword(newPassword);
      await store.updateTeacherPassword(
        teacher.id,
        req.sessionCtx!.schoolId,
        newHash,
        false,
        teacher.id,
        'TEACHER_CHANGED_PASSWORD'
      );
      return res.json({ ok: true, mustChangePassword: false });
    })
  );

  app.get('/api/v1/teacher/workspace', requireAuth, requireRole('teacher'), (req: AuthedRequest, res: Response) => {
    return res.json({ teacher: req.sessionCtx!.user });
  });

  // ==========================================
  // 3. STUDENT REGISTRATION & AUTHENTICATION
  // ==========================================
  app.post(
    '/api/v1/auth/student/register',
    authLimiter,
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const { fullName, phoneNumber } = req.body as { fullName?: string; phoneNumber?: string };
      const cleanName = (fullName || '').trim();
      const normalizedPhone = normalizePhoneNumber(phoneNumber || '');

      if (cleanName.length < 2) {
        return res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
      }
      if (!normalizedPhone) {
        return res.status(400).json({ error: 'Please enter a valid phone number (7–15 digits).' });
      }

      const existingReq = await store.getRegistrationRequestByPhone(normalizedPhone);
      if (existingReq) {
        if (existingReq.status === 'PENDING') {
          return res.status(409).json({
            status: 'PENDING',
            error: 'A registration request for this phone number is already pending administrator approval.',
          });
        }
        if (existingReq.status === 'APPROVED') {
          return res.status(409).json({
            status: 'APPROVED',
            error: 'This phone number is already approved. Please use Student Login.',
          });
        }
        return res.status(403).json({
          status: 'REJECTED',
          error: 'This registration request was rejected. Please contact the school administrator.',
        });
      }

      const { reqId } = await store.createStudentRegistration(cleanName, normalizedPhone, DEFAULT_SCHOOL_ID);
      return res.status(201).json({
        id: reqId,
        status: 'PENDING',
        message:
          'Your registration request has been submitted successfully. Please wait for administrator approval.',
      });
    })
  );

  app.get(
    '/api/v1/auth/student/registration-status',
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const rawPhone = typeof req.query.phone === 'string' ? req.query.phone : '';
      const normalizedPhone = normalizePhoneNumber(rawPhone);
      if (!normalizedPhone) {
        return res.status(400).json({ error: 'Provide a valid phone query parameter.' });
      }

      const reqRow = await store.getRegistrationRequestByPhone(normalizedPhone);
      if (!reqRow) {
        return res.json({ status: 'NOT_FOUND' });
      }

      return res.json({
        id: reqRow.id,
        fullName: reqRow.full_name,
        phoneNumber: reqRow.phone_number,
        status: reqRow.status,
        rejectionReason: reqRow.rejection_reason,
        createdAt: reqRow.created_at,
        reviewedAt: reqRow.reviewed_at,
      });
    })
  );

  app.post(
    '/api/v1/auth/student/login',
    authLimiter,
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const { phoneNumber, password } = req.body as { phoneNumber?: string; password?: string };
      const normalizedPhone = normalizePhoneNumber(phoneNumber || '');
      if (!normalizedPhone) {
        return res.status(400).json({ error: 'Please enter a valid phone number.' });
      }
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required.' });
      }

      const student = await store.getStudentByPhone(normalizedPhone);
      if (!student) {
        return res.status(401).json({
          error: 'No student account found for this phone number. Submit a registration request first.',
        });
      }

      if (student.approval_status === 'PENDING') {
        return res.status(403).json({
          error: 'Your registration request is pending administrator approval. You cannot log in yet.',
        });
      }

      if (student.approval_status === 'REJECTED') {
        return res.status(403).json({
          error: 'Your registration request has been rejected. Contact your school administrator.',
        });
      }

      if (student.account_status !== 'active') {
        return res.status(403).json({
          error: 'Your student account is deactivated. Contact your school administrator.',
        });
      }

      if (!verifyPassword(password, student.password_hash)) {
        return res.status(401).json({ error: 'Invalid phone number or password.' });
      }

      const rawToken = await issueSession(store, student.id, 'student', student.school_id);
      await store.logAudit(student.id, 'student', 'STUDENT_LOGIN', 'student', student.id, {});
      res.cookie(SESSION_COOKIE_NAME, rawToken, getCookieOptions(req));

      return res.json({
        user: {
          id: student.id,
          fullName: student.full_name,
          phoneNumber: student.phone_number,
          classId: student.class_id,
          section: student.section,
          rollNumber: student.roll_number,
          approvalStatus: student.approval_status,
          accountStatus: student.account_status,
          mustChangePassword: Boolean(student.must_change_password),
          role: 'student',
        },
      });
    })
  );

  app.post(
    '/api/v1/auth/student/change-password',
    requireAuth,
    requireRole('student'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: 'Provide your current password and a new password (min 6 characters).' });
      }
      if (currentPassword === newPassword) {
        return res
          .status(400)
          .json({ error: 'New password must differ from your current password.' });
      }

      const student = await store.getStudentByIdAndSchool(req.sessionCtx!.userId, req.sessionCtx!.schoolId);
      if (!student || !verifyPassword(currentPassword, student.password_hash)) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      const newHash = hashPassword(newPassword);
      await store.updateStudentPassword(
        student.id,
        req.sessionCtx!.schoolId,
        newHash,
        false,
        student.id,
        'STUDENT_CHANGED_PASSWORD'
      );
      return res.json({ ok: true, mustChangePassword: false });
    })
  );

  app.get('/api/v1/student/workspace', requireAuth, requireRole('student'), (req: AuthedRequest, res: Response) => {
    return res.json({ student: req.sessionCtx!.user });
  });

  // ==========================================
  // 4. ADMIN MANAGEMENT ENDPOINTS (PROTECTED)
  // ==========================================
  app.get(
    '/api/v1/admin/registrations',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const overview = await store.getAdminOverview(req.sessionCtx!.schoolId);
      return res.json(overview);
    })
  );

  app.post(
    '/api/v1/admin/students/:id/approve',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const targetId = String(req.params.id);
      const schoolId = req.sessionCtx!.schoolId;
      const adminId = req.sessionCtx!.userId;
      const { initialPassword, classId, section, rollNumber } = req.body as {
        initialPassword?: string;
        classId?: string;
        section?: string;
        rollNumber?: number;
      };

      const assignedPassword =
        initialPassword && initialPassword.trim().length >= 6
          ? initialPassword.trim()
          : initialPassword && initialPassword.trim().length > 0
          ? ''
          : generateTempPassword();

      if (!assignedPassword) {
        return res
          .status(400)
          .json({ error: 'Initial password must be at least 6 characters (or leave blank to auto-generate).' });
      }

      const passwordHash = hashPassword(assignedPassword);
      const student = await store.approveStudent(
        targetId,
        schoolId,
        adminId,
        passwordHash,
        classId,
        section,
        rollNumber
      );

      if (!student) {
        return res.status(404).json({ error: 'Student or registration request not found.' });
      }

      return res.json({ student, assignedPassword });
    })
  );

  app.post(
    '/api/v1/admin/students/:id/reject',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const targetId = String(req.params.id);
      const schoolId = req.sessionCtx!.schoolId;
      const adminId = req.sessionCtx!.userId;
      const { reason } = req.body as { reason?: string };
      const rejectionReason = (reason || 'Application declined by school administration.').trim();

      const ok = await store.rejectStudent(targetId, schoolId, adminId, rejectionReason);
      if (!ok) {
        return res.status(404).json({ error: 'Student or registration request not found.' });
      }
      return res.json({ ok: true, status: 'REJECTED' });
    })
  );

  app.put(
    '/api/v1/admin/students/:id',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const studentId = String(req.params.id);
      const schoolId = req.sessionCtx!.schoolId;
      const adminId = req.sessionCtx!.userId;
      const { fullName, phoneNumber, classId, section, rollNumber, accountStatus } = req.body as {
        fullName?: string;
        phoneNumber?: string;
        classId?: string;
        section?: string;
        rollNumber?: number;
        accountStatus?: 'active' | 'inactive';
      };

      const existing = await store.getStudentByIdAndSchool(studentId, schoolId);
      if (!existing) {
        return res.status(404).json({ error: 'Student not found.' });
      }

      const nextPhone = phoneNumber ? normalizePhoneNumber(phoneNumber) : existing.phone_number;
      if (!nextPhone) {
        return res.status(400).json({ error: 'Invalid phone number.' });
      }

      if (await store.findStudentPhoneConflict(nextPhone, studentId)) {
        return res.status(409).json({ error: 'Another student already uses this phone number.' });
      }

      const updated = await store.updateStudent(studentId, schoolId, {
        fullName,
        phoneNumber: nextPhone,
        classId,
        section,
        rollNumber,
        accountStatus,
        adminId,
      });
      return res.json({ student: updated });
    })
  );

  app.post(
    '/api/v1/admin/students/:id/reset-password',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const studentId = String(req.params.id);
      const schoolId = req.sessionCtx!.schoolId;
      const adminId = req.sessionCtx!.userId;
      const { newPassword } = req.body as { newPassword?: string };

      const assignedPassword =
        newPassword && newPassword.trim().length >= 6
          ? newPassword.trim()
          : newPassword && newPassword.trim().length > 0
          ? ''
          : generateTempPassword();

      if (!assignedPassword) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const existing = await store.getStudentByIdAndSchool(studentId, schoolId);
      if (!existing) {
        return res.status(404).json({ error: 'Student not found.' });
      }

      const hash = hashPassword(assignedPassword);
      await store.updateStudentPassword(studentId, schoolId, hash, true, adminId, 'STUDENT_PASSWORD_RESET');
      return res.json({ ok: true, assignedPassword });
    })
  );

  app.post(
    '/api/v1/admin/teachers',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const schoolId = req.sessionCtx!.schoolId;
      const adminId = req.sessionCtx!.userId;
      const { fullName, phoneNumber, initialPassword, department, subjects, classes } = req.body as {
        fullName?: string;
        phoneNumber?: string;
        initialPassword?: string;
        department?: string;
        subjects?: string[];
        classes?: string[];
      };

      const cleanName = (fullName || '').trim();
      const normalizedPhone = normalizePhoneNumber(phoneNumber || '');
      const cleanDept = (department || 'General').trim();
      const password = (initialPassword || '').trim();

      if (cleanName.length < 2) {
        return res.status(400).json({ error: 'Teacher full name is required.' });
      }
      if (!normalizedPhone) {
        return res.status(400).json({ error: 'Valid unique phone number is required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Initial password must be at least 6 characters.' });
      }

      if (await store.findTeacherPhoneConflict(normalizedPhone)) {
        return res.status(409).json({ error: 'A teacher with this phone number is already registered.' });
      }

      const teacher = await store.createTeacher({
        fullName: cleanName,
        phoneNumber: normalizedPhone,
        passwordHash: hashPassword(password),
        department: cleanDept,
        subjects: Array.isArray(subjects) ? subjects : [],
        classes: Array.isArray(classes) ? classes : [],
        schoolId,
        adminId,
      });

      return res.status(201).json({ teacher });
    })
  );

  app.put(
    '/api/v1/admin/teachers/:id',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const teacherId = String(req.params.id);
      const schoolId = req.sessionCtx!.schoolId;
      const adminId = req.sessionCtx!.userId;
      const { fullName, phoneNumber, department, subjects, classes, status } = req.body as {
        fullName?: string;
        phoneNumber?: string;
        department?: string;
        subjects?: string[];
        classes?: string[];
        status?: 'active' | 'inactive';
      };

      const existing = await store.getTeacherByIdAndSchool(teacherId, schoolId);
      if (!existing) {
        return res.status(404).json({ error: 'Teacher not found.' });
      }

      const nextPhone = phoneNumber ? normalizePhoneNumber(phoneNumber) : existing.phoneNumber;
      if (!nextPhone) {
        return res.status(400).json({ error: 'Invalid phone number.' });
      }

      if (await store.findTeacherPhoneConflict(nextPhone, teacherId)) {
        return res.status(409).json({ error: 'Another teacher already uses this phone number.' });
      }

      const teacher = await store.updateTeacher(teacherId, schoolId, {
        fullName,
        phoneNumber: nextPhone,
        department,
        subjects,
        classes,
        status,
        adminId,
      });
      return res.json({ teacher });
    })
  );

  app.delete(
    '/api/v1/admin/teachers/:id',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const teacherId = String(req.params.id);
      const schoolId = req.sessionCtx!.schoolId;
      const adminId = req.sessionCtx!.userId;

      const deleted = await store.deleteTeacher(teacherId, schoolId, adminId);
      if (!deleted) {
        return res.status(404).json({ error: 'Teacher not found.' });
      }
      return res.json({ ok: true });
    })
  );

  app.post(
    '/api/v1/admin/teachers/:id/reset-password',
    requireAuth,
    requireRole('admin'),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      const teacherId = String(req.params.id);
      const schoolId = req.sessionCtx!.schoolId;
      const adminId = req.sessionCtx!.userId;
      const { newPassword } = req.body as { newPassword?: string };

      const assignedPassword =
        newPassword && newPassword.trim().length >= 6
          ? newPassword.trim()
          : newPassword && newPassword.trim().length > 0
          ? ''
          : generateTempPassword();

      if (!assignedPassword) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const existing = await store.getTeacherByIdAndSchool(teacherId, schoolId);
      if (!existing) {
        return res.status(404).json({ error: 'Teacher not found.' });
      }

      const hash = hashPassword(assignedPassword);
      await store.updateTeacherPassword(teacherId, schoolId, hash, true, adminId, 'TEACHER_PASSWORD_RESET');
      return res.json({ ok: true, assignedPassword });
    })
  );

  // Express JSON error middleware
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  });

  return { app, store };
}
