import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseClient } from '@/lib/supabase';

export type Role = 'ADMIN' | 'DIRECTOR' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const supabase = getSupabaseClient();
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Fetch user data from our API
            await get().refreshUser();
          }

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Une erreur est survenue' };
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          const supabase = getSupabaseClient();

          // Register with Supabase
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                first_name: data.firstName,
                last_name: data.lastName,
              },
            },
          });

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          // Note: In a real app, you would call your backend to create the user record
          // with the role and other data. For now, we'll just refresh the user.
          if (authData.user) {
            await get().refreshUser();
          }

          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Une erreur est survenue' };
        }
      },

      logout: async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      resetPassword: async (email) => {
        try {
          const supabase = getSupabaseClient();
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error) {
          return { success: false, error: 'Une erreur est survenue' };
        }
      },

      updatePassword: async (password) => {
        try {
          const supabase = getSupabaseClient();
          
          const { error } = await supabase.auth.updateUser({ password });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error) {
          return { success: false, error: 'Une erreur est survenue' };
        }
      },

      refreshUser: async () => {
        try {
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          // Fetch user data from API with 10-second timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          try {
            const response = await fetch(`/api/auth/me`, {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const { data } = await response.json();
              set({ user: data, isAuthenticated: true, isLoading: false });
            } else {
              // User doesn't exist in our DB yet - create a temporary user object
              const tempUser: User = {
                id: session.user.id,
                supabaseId: session.user.id,
                email: session.user.email || '',
                firstName: session.user.user_metadata?.first_name || 'Utilisateur',
                lastName: session.user.user_metadata?.last_name || '',
                role: 'TEACHER',
                isActive: true,
              };
              set({ user: tempUser, isAuthenticated: true, isLoading: false });
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            // API call failed (timeout, network error, or abort) - use temporary user
            const tempUser: User = {
              id: session.user.id,
              supabaseId: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.first_name || 'Utilisateur',
              lastName: session.user.user_metadata?.last_name || '',
              role: 'TEACHER',
              isActive: true,
            };
            set({ user: tempUser, isAuthenticated: true, isLoading: false });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Helper hooks for role checks
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'ADMIN';
};

export const useIsDirector = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'ADMIN' || user?.role === 'DIRECTOR';
};

export const useIsStaff = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'ADMIN' || user?.role === 'DIRECTOR' || user?.role === 'TEACHER';
};

export const useHasRole = (roles: Role[]) => {
  const user = useAuthStore((state) => state.user);
  return user ? roles.includes(user.role) : false;
};
