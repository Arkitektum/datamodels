'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  /** True når bruker må sette nytt passord (admin-opprettet, ikke byttet ennå). */
  mustChangePassword: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase er ikke konfigurert.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const updatePassword = async (newPassword: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase er ikke konfigurert.' };
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
  };

  const user = session?.user ?? null;
  // Tvang som standard: admin-opprettede brukere har ikke flagget satt → må velge
  // eget passord ved første login. Etter bytte settes must_change_password: false.
  const mustChangePassword = !!user && user.user_metadata?.must_change_password !== false;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        configured: isSupabaseConfigured,
        mustChangePassword,
        signInWithPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth må brukes inni <AuthProvider>');
  return ctx;
}
