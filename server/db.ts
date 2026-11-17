import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword } from './security.ts';

export const DEFAULT_SCHOOL_ID = 'sagarmatha-valley-academy';

export function getAuthorizedAdminEmails(): string[] {
  const raw = process.env.AUTHORIZED_ADMIN_EMAIL || 'sapkotalaxmi703@gmail.com';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function initDatabase(dbPath?: string): DatabaseSync {
  const resolvedPath = dbPath || process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'shikshyaplatform.db');
  if (resolvedPath !== ':memory:') {
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  }

  const db = new DatabaseSync(resolvedPath);
  db.exec('PRAGMA foreign_keys = ON;');
  if (resolvedPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      google_email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'admin',
      school_id TEXT NOT NULL DEFAULT '${DEFAULT_SCHOOL_ID}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      department TEXT NOT NULL,
      subjects_json TEXT NOT NULL DEFAULT '[]',
      classes_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      must_change_password INTEGER NOT NULL DEFAULT 1,
      school_id TEXT NOT NULL DEFAULT '${DEFAULT_SCHOOL_ID}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
      account_status TEXT NOT NULL DEFAULT 'inactive' CHECK (account_status IN ('active', 'inactive')),
      must_change_password INTEGER NOT NULL DEFAULT 1,
      approved_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
      approved_at TEXT,
      class_id TEXT NOT NULL DEFAULT 'cls-10a',
      section TEXT NOT NULL DEFAULT 'A',
      roll_number INTEGER NOT NULL DEFAULT 1,
      school_id TEXT NOT NULL DEFAULT '${DEFAULT_SCHOOL_ID}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS registration_requests (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
      reviewed_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
      reviewed_at TEXT,
      rejection_reason TEXT,
      school_id TEXT NOT NULL DEFAULT '${DEFAULT_SCHOOL_ID}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
      session_token_hash TEXT NOT NULL UNIQUE,
      school_id TEXT NOT NULL DEFAULT '${DEFAULT_SCHOOL_ID}',
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details_json TEXT NOT NULL DEFAULT '{}',
      school_id TEXT NOT NULL DEFAULT '${DEFAULT_SCHOOL_ID}',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_teachers_phone ON teachers(phone_number);
    CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone_number);
    CREATE INDEX IF NOT EXISTS idx_students_status ON students(approval_status, account_status);
    CREATE INDEX IF NOT EXISTS idx_reg_status ON registration_requests(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_hash ON user_sessions(session_token_hash);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id, role);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  `);

  seedInitialData(db);
  return db;
}

export function withTransaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function seedInitialData(db: DatabaseSync) {
  const now = new Date().toISOString();
  const authorizedEmails = getAuthorizedAdminEmails();

  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO admins (id, google_email, role, school_id, created_at)
    VALUES (?, ?, 'admin', ?, ?)
  `);
  authorizedEmails.forEach((email, idx) => {
    insertAdmin.run(`adm-root-${idx + 1}`, email, DEFAULT_SCHOOL_ID, now);
  });

  const teacherCount = (db.prepare('SELECT COUNT(*) as cnt FROM teachers').get() as { cnt: number }).cnt;
  if (teacherCount === 0) {
    const sampleHash = hashPassword('Teacher@123');
    const insertTeacher = db.prepare(`
      INSERT INTO teachers (id, full_name, phone_number, password_hash, department, subjects_json, classes_json, status, must_change_password, school_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?, ?)
    `);
    insertTeacher.run(
      'tch-1',
      'Sunita Shrestha',
      '9800000101',
      sampleHash,
      'Mathematics',
      JSON.stringify(['sub-math']),
      JSON.stringify(['cls-10a', 'cls-9a']),
      DEFAULT_SCHOOL_ID,
      now,
      now
    );
    insertTeacher.run(
      'tch-2',
      'Bikram Thapa',
      '9800000102',
      sampleHash,
      'Science',
      JSON.stringify(['sub-sci']),
      JSON.stringify(['cls-10a', 'cls-6b']),
      DEFAULT_SCHOOL_ID,
      now,
      now
    );
  }

  const studentCount = (db.prepare('SELECT COUNT(*) as cnt FROM students').get() as { cnt: number }).cnt;
  if (studentCount === 0) {
    const adminRow = db.prepare('SELECT id FROM admins LIMIT 1').get() as { id: string } | undefined;
    const adminId = adminRow?.id ?? null;
    const stuHash = hashPassword('Student@123');

    const insertStudent = db.prepare(`
      INSERT INTO students (id, full_name, phone_number, password_hash, approval_status, account_status, must_change_password, approved_by, approved_at, class_id, section, roll_number, school_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertReq = db.prepare(`
      INSERT INTO registration_requests (id, full_name, phone_number, status, reviewed_by, reviewed_at, rejection_reason, school_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStudent.run(
      'stu-1',
      'Aarav Adhikari',
      '9800000301',
      stuHash,
      'APPROVED',
      'active',
      0,
      adminId,
      now,
      'cls-10a',
      'A',
      1,
      DEFAULT_SCHOOL_ID,
      now,
      now
    );
    insertReq.run('req-1', 'Aarav Adhikari', '9800000301', 'APPROVED', adminId, now, null, DEFAULT_SCHOOL_ID, now);

    // One pending registration request so Admin immediately sees approval workflow
    insertStudent.run(
      'stu-pending-1',
      'Niharika Poudel',
      '9800000401',
      null,
      'PENDING',
      'inactive',
      1,
      null,
      null,
      'cls-10a',
      'A',
      12,
      DEFAULT_SCHOOL_ID,
      now,
      now
    );
    insertReq.run('req-2', 'Niharika Poudel', '9800000401', 'PENDING', null, null, null, DEFAULT_SCHOOL_ID, now);
  }
}
