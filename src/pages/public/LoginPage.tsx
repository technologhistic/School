import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { signInWithGoogleForAdmin } from '../../lib/firebaseAuth';
import { AuthenticatedUser, useAuthStore } from '../../store/useAuthStore';
import { useSchoolStore } from '../../store/useSchoolStore';

type PortalSelection = 'select' | 'admin' | 'teacher' | 'student';
type StudentMode = 'login' | 'register' | 'status';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { config } = useSchoolStore();
  const { user, setUser, fetchMe } = useAuthStore();

  const paramRole = searchParams.get('role');
  const initialSelection: PortalSelection =
    paramRole === 'admin' || paramRole === 'teacher' || paramRole === 'student'
      ? paramRole
      : 'select';

  const [view, setView] = useState<PortalSelection>(initialSelection);
  const [studentMode, setStudentMode] = useState<StudentMode>('login');

  // Shared UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Teacher Login state
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPwd, setShowTeacherPwd] = useState(false);

  // Student Login state
  const [studentPhone, setStudentPhone] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPwd, setShowStudentPwd] = useState(false);

  // Student Registration state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Student Status Check state
  const [statusPhone, setStatusPhone] = useState('');
  const [statusResult, setStatusResult] = useState<{
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_FOUND';
    fullName?: string;
    rejectionReason?: string | null;
  } | null>(null);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (paramRole === 'admin' || paramRole === 'teacher' || paramRole === 'student') {
      setView(paramRole);
      setError('');
    }
  }, [paramRole]);

  const selectRoleView = (next: PortalSelection) => {
    setView(next);
    setError('');
    setRegSuccessMessage('');
    if (next === 'select') {
      setSearchParams({});
    } else {
      setSearchParams({ role: next });
    }
  };

  // 1. Admin Google OAuth handler
  const handleAdminGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { idToken } = await signInWithGoogleForAdmin();
      const res = await fetch('/api/v1/auth/admin/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });
      const data = (await res.json()) as { user?: AuthenticatedUser; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || 'Access Denied: Unauthorized Admin Account');
        return;
      }
      setUser(data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      const msg =
        err instanceof Error && err.message.includes('popup-closed')
          ? 'Google sign-in popup was closed before completing authentication.'
          : err instanceof Error
          ? err.message
          : 'Google authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Teacher Login handler
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!teacherPhone.trim() || !teacherPassword) {
      setError('Enter your registered phone number and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber: teacherPhone.trim(),
          password: teacherPassword,
        }),
      });
      const data = (await res.json()) as { user?: AuthenticatedUser; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || 'Unable to sign in.');
        return;
      }
      setUser(data.user);
      navigate('/teacher/dashboard');
    } catch {
      setError('Network error while connecting to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  // 3A. Student Login handler
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!studentPhone.trim() || !studentPassword) {
      setError('Enter your registered phone number and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber: studentPhone.trim(),
          password: studentPassword,
        }),
      });
      const data = (await res.json()) as { user?: AuthenticatedUser; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || 'Unable to sign in.');
        return;
      }
      setUser(data.user);
      navigate('/student/dashboard');
    } catch {
      setError('Network error while connecting to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  // 3B. Student Registration Request handler
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegSuccessMessage('');
    if (regName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (regPhone.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: regName.trim(),
          phoneNumber: regPhone.trim(),
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string; status?: string };
      if (!res.ok) {
        setError(data.error || 'Unable to submit registration request.');
        return;
      }
      setRegSuccessMessage(
        data.message ||
          'Your registration request has been submitted successfully. Please wait for administrator approval.'
      );
      setRegName('');
      setRegPhone('');
    } catch {
      setError('Network error while submitting registration request.');
    } finally {
      setLoading(false);
    }
  };

  // 3C. Student Status Check handler
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusResult(null);
    if (statusPhone.replace(/\D/g, '').length < 7) {
      setError('Enter a valid phone number to check status.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/auth/student/registration-status?phone=${encodeURIComponent(statusPhone.trim())}`,
        { credentials: 'include' }
      );
      const data = (await res.json()) as {
        status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_FOUND';
        fullName?: string;
        rejectionReason?: string | null;
        error?: string;
      };
      if (!res.ok || !data.status) {
        setError(data.error || 'Could not retrieve status.');
        return;
      }
      setStatusResult({
        status: data.status,
        fullName: data.fullName,
        rejectionReason: data.rejectionReason,
      });
    } catch {
      setError('Network error while checking registration status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Already signed-in quick banner */}
      {user && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-slate-700">
            Signed in as <span className="font-semibold text-slate-900">{user.fullName}</span> (
            <span className="capitalize">{user.role}</span>)
          </div>
          <button
            type="button"
            onClick={() => navigate(`/${user.role}/dashboard`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] self-start sm:self-auto"
          >
            <span>Open {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ROLE SELECTION SCREEN */}
      {view === 'select' && (
        <div className="space-y-8">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-medium text-[#2B548A]">
              {config.schoolName} · ShikshyaPlus Portal Access
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              Sign In to Your School Portal
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose your role below. Each portal enforces server-side verification, role-based access control, and administrator approval policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Card */}
            <button
              type="button"
              onClick={() => selectRoleView('admin')}
              className="text-left bg-white border border-slate-200 rounded-xl p-6 hover:border-[#0F2544] transition-colors flex flex-col justify-between gap-6 group"
            >
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-lg bg-[#F6F7F9] border border-slate-200 text-[#0F2544]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#0F2544]">
                    Continue as Admin
                  </h2>
                  <p className="text-xs font-medium text-[#2B548A] mt-0.5">
                    Google Sign-In Verification
                  </p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Authorized school administrators authenticate with Google to manage teachers, student approvals, classes, and notices.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-[#0F2544]">
                <span>Admin Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Teacher Card */}
            <button
              type="button"
              onClick={() => selectRoleView('teacher')}
              className="text-left bg-white border border-slate-200 rounded-xl p-6 hover:border-[#0F2544] transition-colors flex flex-col justify-between gap-6 group"
            >
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-lg bg-[#F6F7F9] border border-slate-200 text-[#0F2544]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#0F2544]">
                    Continue as Teacher
                  </h2>
                  <p className="text-xs font-medium text-[#2B548A] mt-0.5">
                    Admin-Registered Credentials
                  </p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Faculty registered by the administrator sign in using their phone number and password to manage classes, attendance, and marks.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-[#0F2544]">
                <span>Teacher Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Student Card */}
            <button
              type="button"
              onClick={() => selectRoleView('student')}
              className="text-left bg-white border border-slate-200 rounded-xl p-6 hover:border-[#0F2544] transition-colors flex flex-col justify-between gap-6 group"
            >
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-lg bg-[#F6F7F9] border border-slate-200 text-[#0F2544]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#0F2544]">
                    Continue as Student
                  </h2>
                  <p className="text-xs font-medium text-[#2B548A] mt-0.5">
                    Login or Request Approval
                  </p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Approved students sign in with their registered phone number and password; new students submit a registration request for admin approval.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-[#0F2544]">
                <span>Student Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED ADMIN GOOGLE LOGIN INTERFACE */}
      {view === 'admin' && (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <button
            type="button"
            onClick={() => selectRoleView('select')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to role selection</span>
          </button>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#2B548A]">Administrator Access</div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Admin Google Sign-In
            </h1>
            <p className="text-sm text-slate-600">
              Only the authorized administrator Google email configured on the server is permitted to access the Admin Dashboard.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800 flex items-start gap-2.5"
            >
              <XCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdminGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>{loading ? 'Verifying Google Account...' : 'Continue with Google'}</span>
          </button>

          <p className="text-xs text-slate-500 border-t border-slate-100 pt-4">
            Server authorization checks your verified Google email against the configured <code className="font-mono text-[11px]">AUTHORIZED_ADMIN_EMAIL</code> environment variable.
          </p>
        </div>
      )}

      {/* DEDICATED TEACHER LOGIN INTERFACE */}
      {view === 'teacher' && (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <button
            type="button"
            onClick={() => selectRoleView('select')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to role selection</span>
          </button>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#2B548A]">Faculty Authentication</div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Teacher Sign-In</h1>
            <p className="text-sm text-slate-600">
              Teachers cannot self-register. Enter the phone number and password assigned by your school administrator.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800 flex items-start gap-2.5"
            >
              <XCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <label htmlFor="tch-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Phone Number *
              </label>
              <input
                id="tch-phone"
                type="tel"
                value={teacherPhone}
                onChange={(e) => setTeacherPhone(e.target.value)}
                placeholder="e.g. 9800000101"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
            </div>

            <div>
              <label htmlFor="tch-pwd" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  id="tch-pwd"
                  type={showTeacherPwd ? 'text' : 'password'}
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                <button
                  type="button"
                  onClick={() => setShowTeacherPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  aria-label="Toggle password visibility"
                >
                  {showTeacherPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing In...' : 'Login to Teacher Portal'}
            </button>
          </form>

          <div className="text-xs text-slate-500 border-t border-slate-100 pt-4 space-y-1">
            <div className="font-medium text-slate-700">Forgot password or phone not registered?</div>
            <p>Contact your school administrator to register your account or issue a temporary password reset.</p>
          </div>
        </div>
      )}

      {/* DEDICATED STUDENT PORTAL INTERFACE (LOGIN / REGISTRATION / STATUS) */}
      {view === 'student' && (
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <button
            type="button"
            onClick={() => selectRoleView('select')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to role selection</span>
          </button>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#2B548A]">Student Portal Access</div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {studentMode === 'login'
                ? 'Student Sign-In'
                : studentMode === 'register'
                ? 'Student Registration Request'
                : 'Check Registration Status'}
            </h1>
            <p className="text-sm text-slate-600">
              {studentMode === 'login'
                ? 'Approved students log in using their registered phone number and administrator-assigned password.'
                : studentMode === 'register'
                ? 'New students must submit a registration request and wait for administrator approval before logging in.'
                : 'Enter the phone number used during registration to check approval progress.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'login', label: 'Login' },
                { id: 'register', label: 'Register' },
                { id: 'status', label: 'Check Status' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStudentMode(tab.id);
                  setError('');
                }}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                  studentMode === tab.id
                    ? 'bg-white text-[#0F2544] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800 flex items-start gap-2.5"
            >
              <XCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Login Tab */}
          {studentMode === 'login' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label htmlFor="stu-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registered Phone Number *
                </label>
                <input
                  id="stu-phone"
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="e.g. 9800000301"
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
              </div>

              <div>
                <label htmlFor="stu-pwd" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="stu-pwd"
                    type={showStudentPwd ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                    aria-label="Toggle password visibility"
                  >
                    {showStudentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Login to Student Portal'}
              </button>

              <div className="text-xs text-slate-500 border-t border-slate-100 pt-4 space-y-1">
                <div className="font-medium text-slate-700">Need an account or password reset?</div>
                <p>
                  Submit a registration request under the <button type="button" onClick={() => setStudentMode('register')} className="text-[#0F2544] font-semibold underline">Register</button> tab or contact your school administrator for password assistance.
                </p>
              </div>
            </form>
          )}

          {/* Student Registration Request Tab */}
          {studentMode === 'register' && (
            <>
              {regSuccessMessage ? (
                <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Registration Pending Approval
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {regSuccessMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegSuccessMessage('');
                        setStudentMode('status');
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg"
                    >
                      Check Approval Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegSuccessMessage('')}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleStudentRegister} className="space-y-4">
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 9800000555"
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Submitting Request...' : 'Submit Registration Request'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Student Registration Status Tab */}
          {studentMode === 'status' && (
            <div className="space-y-4">
              <form onSubmit={handleCheckStatus} className="flex gap-2">
                <input
                  type="tel"
                  value={statusPhone}
                  onChange={(e) => setStatusPhone(e.target.value)}
                  placeholder="Enter registered phone number"
                  className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] whitespace-nowrap"
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
              </form>

              {statusResult && (
                <div className="p-4 rounded-xl border border-slate-200 bg-[#F6F7F9] space-y-2">
                  {statusResult.status === 'NOT_FOUND' && (
                    <p className="text-xs text-slate-600">
                      No registration request found for that phone number.
                    </p>
                  )}
                  {statusResult.status === 'PENDING' && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <div className="font-bold text-slate-900">
                          Status: PENDING ({statusResult.fullName})
                        </div>
                        <p className="mt-1">
                          Your registration request is awaiting administrator approval. Dashboard access remains locked until approved.
                        </p>
                      </div>
                    </div>
                  )}
                  {statusResult.status === 'APPROVED' && (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700 space-y-2">
                        <div className="font-bold text-emerald-900">
                          Status: APPROVED ({statusResult.fullName})
                        </div>
                        <p>
                          Your account is approved! Use your registered phone number and administrator-provided password to sign in.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setStudentPhone(statusPhone);
                            setStudentMode('login');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0F2544] rounded-md"
                        >
                          Proceed to Student Login
                        </button>
                      </div>
                    </div>
                  )}
                  {statusResult.status === 'REJECTED' && (
                    <div className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                      <div className="text-xs text-red-800">
                        <div className="font-bold">Status: REJECTED ({statusResult.fullName})</div>
                        <p className="mt-1">
                          Reason: {statusResult.rejectionReason || 'Declined by administrator.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
