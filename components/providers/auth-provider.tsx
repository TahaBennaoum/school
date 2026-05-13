'use client';

import { useEffect } from 'react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useAuthStore } from '@/store/auth-store';
import { getSupabaseClient } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setLoading, refreshUser, setUser } = useAuthStore();

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Check initial session
    const initAuth = async () => {
      setLoading(true);
      try {
        await refreshUser();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Ensure loading is set to false even if refreshUser throws
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      try {
        if (event === 'SIGNED_IN' && session) {
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          await refreshUser();
        }
      } catch (error) {
        console.error(`Auth state change error (${event}):`, error);
        // Ensure we're not stuck loading on any auth state change
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setLoading, refreshUser, setUser]);

  return <>{children}</>;
}
