import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react';
import { AuthenticatedRole, useAuthStore } from '../../store/useAuthStore';

interface ProtectedPortalRouteProps {
  requiredRole: AuthenticatedRole;
  children: React.ReactNode;
}

export const ProtectedPortalRoute: React.FC<ProtectedPortalRouteProps> = ({
  requiredRole,
  children,
}) => {
  const { user, initialized, loading, fetchMe, setUser, logout } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialized) {
      void fetchMe();
    }
  }, [initialized, fetchMe]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 text-sm text-slate-600">
          Verifying authenticated session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?role=${requiredRole}`} replace />;
  }

  if (user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <h1 className="font-display text-lg font-bold text-slate-900">
                Access Denied
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Your active session belongs to the <span className="font-semibold capitalize">{user.role}</span> role and cannot open the <span className="font-semibold capitalize">{requiredRole}</span> portal.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => void logout()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E]"
            >
              Sign Out & Switch Role
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enforce changing temporary/initial password on first login
  if (
    (user.role === 'teacher' || user.role === 'student') &&
    user.mustChangePassword
  ) {
    const endpoint =
      user.role === 'teacher'
        ? '/api/v1/auth/teacher/change-password'
        : '/api/v1/auth/student/change-password';

    const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
      setSubmitting(true);
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error || 'Failed to update password.');
          return;
        }
        setUser({ ...user, mustChangePassword: false });
      } catch {
        setError('Network error while updating password.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-[#F6F7F9] border border-slate-200 text-[#0F2544]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#2B548A]">First-Login Security Step</div>
              <h1 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                Update Temporary Password
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Welcome, {user.fullName}. For security, please replace your administrator-assigned temporary password before entering your dashboard.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temporary / Current Password *
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min 6 characters) *
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F2544]"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => void logout()}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Sign Out
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E] disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Updating...' : 'Save Password & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
