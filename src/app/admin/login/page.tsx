'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdmin, getAdminSession } from '@/lib/auth/adminAuth';
import { ArrowRight, AlertCircle, Loader2, ShieldCheck, Lock, Mail } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide administrator email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        router.push('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid credentials. Please verify your administrative email and password.');
      }
    } catch {
      setError('Unable to authenticate. Please check network connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#111827]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4 sm:px-6">
        <div className="w-full max-w-[420px] animate-fade-in">
          
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 sm:p-9 shadow-xs space-y-6">
            {/* Header */}
            <div className="pb-5 border-b border-[#E5E7EB] text-center">
              <div className="w-11 h-11 rounded-full bg-[#EBF4FC] border border-[#BAE6FD] text-[#0055A5] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#0055A5] font-semibold">
                SRHU IEEE ADMINISTRATION
              </div>
              <h1 className="text-xl font-semibold text-[#111827] mt-1 tracking-tight">
                Sign in to Admin Portal
              </h1>
              <p className="text-xs text-[#667085] mt-1">
                Authorized IEEE Student Branch Officers &amp; Counselors
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#991B1B] flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5"
                >
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-[14px]" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    placeholder="officer@srhu.edu.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 text-sm bg-white border border-[#E5E7EB] rounded-md transition-all duration-150 focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-[14px]" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 text-sm bg-white border border-[#E5E7EB] rounded-md transition-all duration-150 focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#0055A5] hover:bg-[#004587] text-white text-sm font-medium rounded-md disabled:opacity-60 transition-all duration-150 shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0055A5]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-[#F3F4F6]">
              <Link
                href="/"
                className="text-xs text-[#667085] hover:text-[#0055A5] transition-colors"
              >
                ← Return to Student Portal
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
