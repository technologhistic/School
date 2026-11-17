-- ShikshyaPlus Three-Role Authentication & Approval Schema for Supabase (PostgreSQL)
-- Run this SQL in your Supabase Dashboard -> SQL Editor.

CREATE TABLE IF NOT EXISTS public.admins (
  id TEXT PRIMARY KEY,
  google_email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  school_id TEXT NOT NULL DEFAULT 'sagarmatha-valley-academy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  department TEXT NOT NULL,
  subjects_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  classes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  school_id TEXT NOT NULL DEFAULT 'sagarmatha-valley-academy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  account_status TEXT NOT NULL DEFAULT 'inactive' CHECK (account_status IN ('active', 'inactive')),
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  approved_by TEXT REFERENCES public.admins(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  class_id TEXT NOT NULL DEFAULT 'cls-10a',
  section TEXT NOT NULL DEFAULT 'A',
  roll_number INTEGER NOT NULL DEFAULT 1,
  school_id TEXT NOT NULL DEFAULT 'sagarmatha-valley-academy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.registration_requests (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by TEXT REFERENCES public.admins(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  school_id TEXT NOT NULL DEFAULT 'sagarmatha-valley-academy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  session_token_hash TEXT NOT NULL UNIQUE,
  school_id TEXT NOT NULL DEFAULT 'sagarmatha-valley-academy',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  school_id TEXT NOT NULL DEFAULT 'sagarmatha-valley-academy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teachers_phone ON public.teachers(phone_number);
CREATE INDEX IF NOT EXISTS idx_students_phone ON public.students(phone_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(approval_status, account_status);
CREATE INDEX IF NOT EXISTS idx_reg_status ON public.registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_sessions_hash ON public.user_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.user_sessions(user_id, role);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- Strict Row Level Security (only Express server with service_role key queries auth tables)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Seed initial authorized Admin account (replace or add emails matching AUTHORIZED_ADMIN_EMAIL)
INSERT INTO public.admins (id, google_email, role, school_id)
VALUES ('adm-root-1', 'sapkotalaxmi703@gmail.com', 'admin', 'sagarmatha-valley-academy')
ON CONFLICT (google_email) DO NOTHING;
