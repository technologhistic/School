import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from './app.ts';

interface RequestResult {
  status: number;
  body: any;
  cookies: string[];
}

function requestJson(
  baseUrl: string,
  path: string,
  options: { method?: string; body?: unknown; cookie?: string } = {}
): Promise<RequestResult> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = options.body !== undefined ? JSON.stringify(options.body) : undefined;
    const headers: Record<string, string> = {};
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = String(Buffer.byteLength(payload));
    }
    if (options.cookie) {
      headers['Cookie'] = options.cookie;
    }

    const req = http.request(
      url,
      { method: options.method || 'GET', headers },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          const setCookies = res.headers['set-cookie'] || [];
          let parsed: any = raw;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            // keep text
          }
          resolve({
            status: res.statusCode || 0,
            body: parsed,
            cookies: setCookies.map((c) => c.split(';')[0]),
          });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

test('ShikshyaPlus Three-Role Auth & Admin Approval System (17 Scenarios)', async (t) => {
  process.env.AUTHORIZED_ADMIN_EMAIL = 'admin@gmail.com';

  const { app, store } = await createApp({
    dbPath: ':memory:',
    disableRateLimit: true,
    verifyGoogleToken: async (token: string) => {
      if (token === 'valid-admin-token') {
        return { email: 'admin@gmail.com', emailVerified: true, name: 'Principal Admin' };
      }
      if (token === 'unauthorized-google-token') {
        return { email: 'random.user@gmail.com', emailVerified: true, name: 'Random User' };
      }
      if (token === 'unverified-email-token') {
        return { email: 'admin@gmail.com', emailVerified: false, name: 'Unverified' };
      }
      throw new Error('Invalid token');
    },
  });

  const server = await new Promise<http.Server>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => {
    server.close();
  });

  let adminCookie = '';
  let teacherCookie = '';
  let createdTeacherId = '';
  let pendingStudentReqId = '';
  let approvedStudentId = '';
  let approvedStudentTempPwd = '';
  let approvedStudentCookie = '';
  let rejectedStudentPhone = '9800009002';

  await t.test('1. Authorized Google Admin login succeeds with session cookie', async () => {
    const res = await requestJson(baseUrl, '/api/v1/auth/admin/google', {
      method: 'POST',
      body: { idToken: 'valid-admin-token' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'admin');
    assert.equal(res.body.user.email, 'admin@gmail.com');
    assert.ok(res.cookies.some((c) => c.startsWith('sp_session=')));
    adminCookie = res.cookies.find((c) => c.startsWith('sp_session='))!;
  });

  await t.test('2. Unauthorized Google account returns 403 and never creates admin row', async () => {
    const res = await requestJson(baseUrl, '/api/v1/auth/admin/google', {
      method: 'POST',
      body: { idToken: 'unauthorized-google-token' },
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'Access Denied: Unauthorized Admin Account');
    const row = await store.getAuthorizedAdminByEmail('random.user@gmail.com');
    assert.equal(row, null);
  });

  await t.test('3. Admin adds a new teacher with initial password', async () => {
    const res = await requestJson(baseUrl, '/api/v1/admin/teachers', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        fullName: 'Kiran Gurung',
        phoneNumber: '9800008001',
        initialPassword: 'InitTeach#2082',
        department: 'Computer Science',
        subjects: ['sub-comp'],
        classes: ['cls-10a'],
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.teacher.phoneNumber, '9800008001');
    assert.equal(res.body.teacher.status, 'active');
    createdTeacherId = res.body.teacher.id;
  });

  await t.test('4. Unregistered teacher phone login returns exact denial message', async () => {
    const res = await requestJson(baseUrl, '/api/v1/auth/teacher/login', {
      method: 'POST',
      body: { phoneNumber: '9899999999', password: 'AnyPassword1' },
    });
    assert.equal(res.status, 401);
    assert.equal(
      res.body.error,
      'Your phone number is not registered. Contact your school administrator.'
    );
  });

  await t.test('5. Registered teacher login with correct password succeeds', async () => {
    const res = await requestJson(baseUrl, '/api/v1/auth/teacher/login', {
      method: 'POST',
      body: { phoneNumber: '9800008001', password: 'InitTeach#2082' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'teacher');
    assert.equal(res.body.user.mustChangePassword, true);
    teacherCookie = res.cookies.find((c) => c.startsWith('sp_session='))!;
    assert.ok(teacherCookie);
  });

  await t.test('6. Registered teacher login with incorrect password fails with 401', async () => {
    const res = await requestJson(baseUrl, '/api/v1/auth/teacher/login', {
      method: 'POST',
      body: { phoneNumber: '9800008001', password: 'WrongPassword!' },
    });
    assert.equal(res.status, 401);
  });

  await t.test('7. Student submits registration request and receives PENDING confirmation', async () => {
    const res = await requestJson(baseUrl, '/api/v1/auth/student/register', {
      method: 'POST',
      body: { fullName: 'Prakriti Lama', phoneNumber: '9800009001' },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'PENDING');
    assert.equal(
      res.body.message,
      'Your registration request has been submitted successfully. Please wait for administrator approval.'
    );
    pendingStudentReqId = res.body.id;

    // Also submit second student to test rejection
    const rejRes = await requestJson(baseUrl, '/api/v1/auth/student/register', {
      method: 'POST',
      body: { fullName: 'Rejected Applicant', phoneNumber: rejectedStudentPhone },
    });
    assert.equal(rejRes.status, 201);
  });

  await t.test('8. Pending student cannot log in', async () => {
    const res = await requestJson(baseUrl, '/api/v1/auth/student/login', {
      method: 'POST',
      body: { phoneNumber: '9800009001', password: 'SomePassword1' },
    });
    assert.equal(res.status, 403);
    assert.match(res.body.error, /pending administrator approval/i);
  });

  await t.test('9. Admin approves student and assigns auto-generated temporary password', async () => {
    const res = await requestJson(baseUrl, `/api/v1/admin/students/${pendingStudentReqId}/approve`, {
      method: 'POST',
      cookie: adminCookie,
      body: { classId: 'cls-10a', section: 'A' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.student.approval_status, 'APPROVED');
    assert.equal(res.body.student.account_status, 'active');
    assert.ok(res.body.assignedPassword && res.body.assignedPassword.length >= 6);
    approvedStudentId = res.body.student.id;
    approvedStudentTempPwd = res.body.assignedPassword;
  });

  await t.test('10. Approved student logs in using assigned temporary password', async () => {
    const res = await requestJson(baseUrl, '/api/v1/auth/student/login', {
      method: 'POST',
      body: { phoneNumber: '9800009001', password: approvedStudentTempPwd },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'student');
    assert.equal(res.body.user.mustChangePassword, true);
    approvedStudentCookie = res.cookies.find((c) => c.startsWith('sp_session='))!;
    assert.ok(approvedStudentCookie);
  });

  await t.test('11. Rejected student cannot log in and status shows REJECTED', async () => {
    const reqList = await requestJson(baseUrl, '/api/v1/admin/registrations', {
      cookie: adminCookie,
    });
    const targetReq = reqList.body.requests.find(
      (r: any) => r.phone_number === rejectedStudentPhone
    );
    assert.ok(targetReq);

    const rejAction = await requestJson(
      baseUrl,
      `/api/v1/admin/students/${targetReq.id}/reject`,
      {
        method: 'POST',
        cookie: adminCookie,
        body: { reason: 'Incomplete admission documents' },
      }
    );
    assert.equal(rejAction.status, 200);

    const loginAttempt = await requestJson(baseUrl, '/api/v1/auth/student/login', {
      method: 'POST',
      body: { phoneNumber: rejectedStudentPhone, password: 'AnyPassword1' },
    });
    assert.equal(loginAttempt.status, 403);
    assert.match(loginAttempt.body.error, /rejected/i);

    const statusCheck = await requestJson(
      baseUrl,
      `/api/v1/auth/student/registration-status?phone=${rejectedStudentPhone}`
    );
    assert.equal(statusCheck.status, 200);
    assert.equal(statusCheck.body.status, 'REJECTED');
  });

  await t.test('12. Teacher & student password change updates password and clears mustChangePassword', async () => {
    const tchChange = await requestJson(baseUrl, '/api/v1/auth/teacher/change-password', {
      method: 'POST',
      cookie: teacherCookie,
      body: { currentPassword: 'InitTeach#2082', newPassword: 'NewTeach#2083' },
    });
    assert.equal(tchChange.status, 200);
    assert.equal(tchChange.body.mustChangePassword, false);

    const stuChange = await requestJson(baseUrl, '/api/v1/auth/student/change-password', {
      method: 'POST',
      cookie: approvedStudentCookie,
      body: { currentPassword: approvedStudentTempPwd, newPassword: 'NewStudent#2083' },
    });
    assert.equal(stuChange.status, 200);
    assert.equal(stuChange.body.mustChangePassword, false);

    // Re-login with new password
    const stuRelogin = await requestJson(baseUrl, '/api/v1/auth/student/login', {
      method: 'POST',
      body: { phoneNumber: '9800009001', password: 'NewStudent#2083' },
    });
    assert.equal(stuRelogin.status, 200);
    assert.equal(stuRelogin.body.user.mustChangePassword, false);
  });

  await t.test('13. RBAC enforcement: Student cannot access /admin/* or /teacher/* routes', async () => {
    const r1 = await requestJson(baseUrl, '/api/v1/admin/registrations', {
      cookie: approvedStudentCookie,
    });
    assert.equal(r1.status, 403);
    const r2 = await requestJson(baseUrl, '/api/v1/teacher/workspace', {
      cookie: approvedStudentCookie,
    });
    assert.equal(r2.status, 403);
  });

  await t.test('14. RBAC enforcement: Teacher cannot access /admin/* routes', async () => {
    const r = await requestJson(baseUrl, '/api/v1/admin/registrations', {
      cookie: teacherCookie,
    });
    assert.equal(r.status, 403);
  });

  await t.test('15. Deactivating teacher revokes active session & blocks login', async () => {
    const upd = await requestJson(baseUrl, `/api/v1/admin/teachers/${createdTeacherId}`, {
      method: 'PUT',
      cookie: adminCookie,
      body: { status: 'inactive' },
    });
    assert.equal(upd.status, 200);

    const me = await requestJson(baseUrl, '/api/v1/auth/me', { cookie: teacherCookie });
    assert.equal(me.status, 401);

    const login = await requestJson(baseUrl, '/api/v1/auth/teacher/login', {
      method: 'POST',
      body: { phoneNumber: '9800008001', password: 'NewTeach#2083' },
    });
    assert.equal(login.status, 403);
  });

  await t.test('16. Deactivating student revokes active session & blocks login', async () => {
    const upd = await requestJson(baseUrl, `/api/v1/admin/students/${approvedStudentId}`, {
      method: 'PUT',
      cookie: adminCookie,
      body: { accountStatus: 'inactive' },
    });
    assert.equal(upd.status, 200);

    const me = await requestJson(baseUrl, '/api/v1/auth/me', { cookie: approvedStudentCookie });
    assert.equal(me.status, 401);

    const login = await requestJson(baseUrl, '/api/v1/auth/student/login', {
      method: 'POST',
      body: { phoneNumber: '9800009001', password: 'NewStudent#2083' },
    });
    assert.equal(login.status, 403);
  });

  await t.test('17. Session expiration & logout revocation invalidate session cleanly', async () => {
    // Verify admin session works right now
    const meOk = await requestJson(baseUrl, '/api/v1/auth/me', { cookie: adminCookie });
    assert.equal(meOk.status, 200);

    // Expire session in store and check rejection
    await store.expireSessionsForRole(
      'admin',
      new Date(Date.now() - 10_000).toISOString()
    );
    const meExpired = await requestJson(baseUrl, '/api/v1/auth/me', { cookie: adminCookie });
    assert.equal(meExpired.status, 401);

    // Re-login and test explicit logout revocation
    const relogin = await requestJson(baseUrl, '/api/v1/auth/admin/google', {
      method: 'POST',
      body: { idToken: 'valid-admin-token' },
    });
    const freshCookie = relogin.cookies.find((c) => c.startsWith('sp_session='))!;
    const logoutRes = await requestJson(baseUrl, '/api/v1/auth/logout', {
      method: 'POST',
      cookie: freshCookie,
    });
    assert.equal(logoutRes.status, 200);
    const afterLogout = await requestJson(baseUrl, '/api/v1/auth/me', { cookie: freshCookie });
    assert.equal(afterLogout.status, 401);
  });
});
