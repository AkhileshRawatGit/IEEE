'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Student, DashboardStats } from '@/types';
import Link from 'next/link';
import { RefreshCw, ArrowRight, UploadCloud, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    joinedStudents: 0,
    notJoinedStudents: 0,
    registrationRate: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, studentsRes] = await Promise.all([
        fetch('/api/admin/students?type=stats'),
        fetch('/api/admin/students'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (studentsRes.ok) setStudents(await studentsRes.json());
    } catch {
      // silent failover
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recentRegistrations = [...students]
    .filter(s => s.join_status === 'joined' && s.joined_at)
    .sort((a, b) => new Date(b.joined_at!).getTime() - new Date(a.joined_at!).getTime())
    .slice(0, 10);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold text-[#111827] tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-[#667085] mt-1">
              Student registration overview for Academic Session 2026–2027
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB] rounded-md bg-white hover:bg-[#F9FAFB] transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/admin/upload"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#0055A5] hover:bg-[#004587] rounded-md transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload List
            </Link>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB]" />

        {/* Compact Statistics Row with subtle color accents */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="p-4 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#BAE6FD] transition-all">
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#111827]">
              {isLoading ? '—' : stats.totalStudents}
            </div>
            <div className="text-xs text-[#667085] mt-1 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64748B]" />
              Total Students
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#A7F3D0] transition-all">
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#047857]">
              {isLoading ? '—' : stats.joinedStudents}
            </div>
            <div className="text-xs text-[#667085] mt-1 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Joined
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#CBD5E1] transition-all">
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#4B5563]">
              {isLoading ? '—' : stats.notJoinedStudents}
            </div>
            <div className="text-xs text-[#667085] mt-1 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
              Not Joined
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#BAE6FD] transition-all">
            <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#0055A5]">
              {isLoading ? '—' : `${stats.registrationRate}%`}
            </div>
            <div className="text-xs text-[#667085] mt-1 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0055A5]" />
              Registration Rate
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB]" />

        {/* Registration Progress with smooth animation */}
        <div className="p-5 bg-white border border-[#E5E7EB] rounded-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#111827]">Branch Registration Progress</span>
            <span className="font-mono text-[#0055A5] font-medium">
              {stats.registrationRate}% registered ({stats.joinedStudents} of {stats.totalStudents} students)
            </span>
          </div>

          {/* Smooth animated progress bar */}
          <div className="h-2.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden border border-[#E5E7EB]">
            <div
              className="h-full bg-[#0055A5] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(stats.registrationRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="border-t border-[#E5E7EB]" />

        {/* Recent Registrations Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#111827]">
              Recent Verified Registrations
            </h2>
            <Link
              href="/admin/students"
              className="text-xs font-medium text-[#0055A5] hover:underline inline-flex items-center gap-1 transition-colors"
            >
              View directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F9FAFB] text-[#667085] text-xs font-semibold uppercase tracking-wider border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">DD No.</th>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#111827]">
                  {recentRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-xs text-[#667085]">
                        {isLoading ? 'Loading records...' : 'No registrations verified yet.'}
                      </td>
                    </tr>
                  ) : (
                    recentRegistrations.map(s => (
                      <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-5 py-3.5 font-medium">{s.name}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-[#0055A5]">{s.dd_no}</td>
                        <td className="px-5 py-3.5 text-xs text-[#667085]">{s.course} ({s.year})</td>
                        <td className="px-5 py-3.5 text-xs font-mono text-[#667085]">
                          {s.joined_at
                            ? new Date(s.joined_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
