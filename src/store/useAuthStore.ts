import { create } from 'zustand';
import { signOutFirebase } from '../lib/firebaseAuth';

export type AuthenticatedRole = 'admin' | 'teacher' | 'student';

export interface AuthenticatedUser {
  id: string;
  role: AuthenticatedRole;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  subjects?: string[];
  classes?: string[];
  classId?: string;
  section?: string;
  rollNumber?: number;
  mustChangePassword?: boolean;
}

interface AuthStoreState {
  user: AuthenticatedUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: AuthenticatedUser | null) => void;
  fetchMe: () => Promise<AuthenticatedUser | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user, initialized: true, loading: false }),

  fetchMe: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/v1/auth/me', {
        credentials: 'include',
      });
      if (!res.ok) {
        set({ user: null, loading: false, initialized: true });
        return null;
      }
      const data = (await res.json()) as { user?: AuthenticatedUser };
      const nextUser = data.user ?? null;
      set({ user: nextUser, loading: false, initialized: true });
      return nextUser;
    } catch {
      set({ user: null, loading: false, initialized: true });
      return null;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      await signOutFirebase();
      set({ user: null, initialized: true, loading: false });
    }
  },
}));
