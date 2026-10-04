'use client';

import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface AdminSession {
  email: string;
  role: 'admin';
  name: string;
  token: string;
}

const STORAGE_KEY = 'srhu_ieee_admin_session';

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export async function loginAdmin(emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  const validAdminEmail = 'admin@srhu.edu.in';
  const validPass = 'ieeesrhu2026';

  // 1. Check official IEEE SRHU branch counselor default credentials
  if (email === validAdminEmail && password === validPass) {
    const session: AdminSession = {
      email: validAdminEmail,
      role: 'admin',
      name: 'Dr. IEEE Branch Counselor',
      token: 'srhu-admin-auth-token-valid',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }

    // If Supabase is active, optionally sync/register in background if not already there
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr && signInErr.message.includes('Invalid login credentials')) {
          // Attempt sign up once
          await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: 'Dr. IEEE Branch Counselor', role: 'admin' } }
          });
        }
      } catch {
        // Safe to ignore background sync errors
      }
    }

    return { success: true };
  }

  // 2. Check general SRHU institutional faculty emails
  if (email.endsWith('@srhu.edu.in') && password.length >= 6) {
    const session: AdminSession = {
      email,
      role: 'admin',
      name: 'SRHU Faculty Officer',
      token: 'srhu-admin-auth-token-valid',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    return { success: true };
  }

  // 3. If custom external credentials were entered, attempt Supabase Auth
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const session: AdminSession = {
          email: data.user.email || email,
          role: 'admin',
          name: (data.user.user_metadata?.full_name as string) || 'SRHU IEEE Branch Officer',
          token: data.session?.access_token || 'sb-token',
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        }
        return { success: true };
      }

      if (error) {
        return { success: false, error: 'Invalid administrator credentials. Please check your email and password.' };
      }
    } catch {
      // Fallback below
    }
  }

  return {
    success: false,
    error: 'Invalid credentials. Use email: admin@srhu.edu.in and password: ieeesrhu2026'
  };
}

export async function logoutAdmin(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
