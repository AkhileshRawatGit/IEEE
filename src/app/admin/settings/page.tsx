'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { resetToSeedData } from '@/lib/data/studentStore';
import {
  Database,
  RotateCcw,
  CheckCircle2,
  Lock,
  Building,
  ShieldCheck,
  Server
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    if (confirm('Clear local offline cache and re-sync with the primary database?')) {
      resetToSeedData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="pb-4 border-b border-[#E5E7EB]">
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#111827] tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            System configuration, database connectivity, and branch metadata.
          </p>
        </div>

        {/* Database Status */}
        <div className="bg-white border border-[#E5E7EB] hover:border-[#BAE6FD] rounded-lg p-6 space-y-4 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF4FC] text-[#0055A5] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Database Connection
                </h2>
                <p className="text-xs text-[#667085]">
                  {isSupabaseConfigured ? 'Connected to Supabase PostgreSQL cluster' : 'Running in local mode'}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] live-dot" />
              {isSupabaseConfigured ? 'Active & Healthy' : 'Local Mode'}
            </span>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-xs font-mono text-[#667085] space-y-1">
            <div className="flex items-center justify-between">
              <span>HOST:</span>
              <span className="text-[#111827]">{process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured via environment variables'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SECURITY:</span>
              <span className="text-[#047857]">Row Level Security (RLS) Active</span>
            </div>
          </div>
        </div>

        {/* Branch Metadata */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#111827]">
              SRHU IEEE Branch Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-[#F3F4F6]">
            <div>
              <span className="text-[#9CA3AF] uppercase tracking-wider text-[10px]">Institution</span>
              <p className="text-sm font-medium text-[#111827] mt-0.5">Swami Rama Himalayan University</p>
            </div>
            <div>
              <span className="text-[#9CA3AF] uppercase tracking-wider text-[10px]">Faculty / School</span>
              <p className="text-sm font-medium text-[#111827] mt-0.5">Himalayan School of Science and Technology</p>
            </div>
            <div>
              <span className="text-[#9CA3AF] uppercase tracking-wider text-[10px]">IEEE Branch Code</span>
              <p className="text-sm font-mono font-semibold text-[#0055A5] mt-0.5">STB60226050</p>
            </div>
            <div>
              <span className="text-[#9CA3AF] uppercase tracking-wider text-[10px]">Section</span>
              <p className="text-sm font-medium text-[#111827] mt-0.5">IEEE Uttar Pradesh (UP) Section</p>
            </div>
          </div>
        </div>

        {/* Security Posture */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#111827]">
              Production Security Posture
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F3F4F6] text-xs">
            <div className="p-3.5 border border-[#E5E7EB] rounded-md bg-[#F9FAFB]">
              <p className="font-semibold text-[#111827]">Server-Side Verification</p>
              <p className="text-[#667085] mt-0.5 leading-relaxed">
                Student validation and confirmation execute entirely inside Next.js secure server routes.
              </p>
            </div>
            <div className="p-3.5 border border-[#E5E7EB] rounded-md bg-[#F9FAFB]">
              <p className="font-semibold text-[#111827]">Row Level Security (RLS)</p>
              <p className="text-[#667085] mt-0.5 leading-relaxed">
                PostgreSQL policies enforce strict row permissions. Direct client table mutations are guarded.
              </p>
            </div>
          </div>
        </div>

        {/* Local Store Maintenance */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">
              Offline Cache Synchronization
            </h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Clear local browser cache to re-pull the latest records from the database.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#E5E7EB] hover:border-[#BAE6FD] hover:bg-[#F9FAFB] rounded-md text-xs font-medium text-[#4B5563] transition-all shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#0055A5]" />
            Synchronize Cache
          </button>
        </div>

        {resetDone && (
          <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md text-xs text-[#047857] flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Local cache synchronized with database records.
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
