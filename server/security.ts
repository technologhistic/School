import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { argon2id } from '@noble/hashes/argon2.js';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const SESSION_SECRET = process.env.SESSION_SECRET || 'shikshyaplus-dev-session-secret-change-in-prod';

const ARGON_OPTS = {
  t: 2,
  m: 19456,
  p: 1,
  dkLen: 32,
};

export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16);
  const derived = argon2id(plainPassword, salt, ARGON_OPTS);
  const saltB64 = Buffer.from(salt).toString('base64');
  const hashB64 = Buffer.from(derived).toString('base64');
  return `$argon2id$m=${ARGON_OPTS.m},t=${ARGON_OPTS.t},p=${ARGON_OPTS.p}$${saltB64}$${hashB64}`;
}

export function verifyPassword(plainPassword: string, storedHash: string | null | undefined): boolean {
  if (!storedHash || !storedHash.startsWith('$argon2id$')) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 5) return false;
  const paramPart = parts[2];
  const saltB64 = parts[3];
  const hashB64 = parts[4];

  const mMatch = /m=(\d+)/.exec(paramPart);
  const tMatch = /t=(\d+)/.exec(paramPart);
  const pMatch = /p=(\d+)/.exec(paramPart);
  if (!mMatch || !tMatch || !pMatch) return false;

  const salt = Buffer.from(saltB64, 'base64');
  const expectedHash = Buffer.from(hashB64, 'base64');
  const derived = argon2id(plainPassword, salt, {
    m: Number(mMatch[1]),
    t: Number(tMatch[1]),
    p: Number(pMatch[1]),
    dkLen: expectedHash.length,
  });

  if (derived.length !== expectedHash.length) return false;
  return timingSafeEqual(Buffer.from(derived), expectedHash);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashSessionToken(rawToken: string): string {
  return createHmac('sha256', SESSION_SECRET).update(rawToken).digest('hex');
}

export function normalizePhoneNumber(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return '';
  }
  if (hasPlus && digitsOnly.startsWith('977') && digitsOnly.length === 13) {
    return digitsOnly.slice(3);
  }
  return digitsOnly;
}

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(10);
  let out = 'Sp!';
  for (let i = 0; i < 8; i += 1) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

let cachedProjectId: string | null = null;
function getFirebaseProjectId(): string {
  if (cachedProjectId) return cachedProjectId;
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as { projectId?: string };
    cachedProjectId = raw.projectId || '';
    return cachedProjectId;
  } catch {
    return '';
  }
}

const oauthClient = new OAuth2Client();
let certsCache: { certs: Record<string, string>; expiresAt: number } | null = null;

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certsCache && certsCache.expiresAt > now) {
    return certsCache.certs;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error('Unable to fetch Google public certificates');
  }
  const certs = (await resp.json()) as Record<string, string>;
  certsCache = { certs, expiresAt: now + 3600 * 1000 };
  return certs;
}

export async function verifyGoogleFirebaseIdToken(idToken: string): Promise<{
  email: string;
  emailVerified: boolean;
  name?: string;
}> {
  const projectId = getFirebaseProjectId();
  if (!projectId) {
    throw new Error('Firebase projectId is not configured on the server');
  }
  const certs = await getFirebasePublicCerts();
  const ticket = await oauthClient.verifySignedJwtWithCertsAsync(
    idToken,
    certs,
    projectId,
    [`https://securetoken.google.com/${projectId}`]
  );
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Token payload missing verified email');
  }
  return {
    email: payload.email.toLowerCase(),
    emailVerified: Boolean(payload.email_verified),
    name: payload.name,
  };
}

export async function verifySupabaseAccessToken(accessToken: string): Promise<{
  email: string;
  emailVerified: boolean;
  name?: string;
}> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase project credentials are not configured on the server');
  }
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.auth.getUser(accessToken);
  if (error || !data.user || !data.user.email) {
    throw new Error(error?.message || 'Invalid Supabase access token');
  }
  return {
    email: data.user.email.toLowerCase(),
    emailVerified: Boolean(data.user.email_confirmed_at),
    name: (data.user.user_metadata?.full_name as string | undefined) || undefined,
  };
}
