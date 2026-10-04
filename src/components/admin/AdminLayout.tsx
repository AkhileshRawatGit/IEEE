'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ExternalLink 
} from 'lucide-react';
import { getAdminSession, logoutAdmin, AdminSession } from '@/lib/auth/adminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const currentSession = getAdminSession();
    if (!currentSession) {
      router.push('/admin/login');
    } else {
      setSession(currentSession);
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/admin/login');
  };

  const navItems = [
    {
      label: 'Overview',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Students',
      href: '/admin/students',
      icon: Users,
    },
    {
      label: 'Upload List',
      href: '/admin/upload',
      icon: UploadCloud,
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-xs text-[#667085] font-mono">
          Verifying session...
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB]">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-[#E5E7EB]">
        <Link href="/admin/dashboard" className="block">
          <div className="font-bold text-sm tracking-tight text-[#0055A5]">
            IEEE
          </div>
          <div className="text-xs font-medium text-[#111827]">
            SRHU Student Branch
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-colors duration-150 ${
                isActive
                  ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                  : 'text-[#667085] hover:text-[#111827] hover:bg-[#F9FAFB]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#111827]' : 'text-[#667085]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* View Public Portal */}
      <div className="px-3 py-2 border-t border-[#E5E7EB]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-[#667085] hover:text-[#111827] rounded hover:bg-[#F9FAFB] transition-colors"
        >
          <span>Student Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#FFFFFF]">
        <div className="mb-2">
          <p className="text-xs font-semibold text-[#111827]">Admin</p>
          <p className="text-[11px] text-[#667085] truncate font-mono">
            {session?.email || 'admin@srhu.edu.in'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          type="button"
          className="flex items-center gap-2 text-xs text-[#667085] hover:text-[#111827] transition-colors mt-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F8FA]">
      {/* Desktop Sidebar: ~230px, White, Thin right border */}
      <aside className="hidden lg:flex lg:flex-col w-[230px] shrink-0 fixed inset-y-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-[#111827]/30 transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-[230px] max-w-xs flex-1 flex flex-col bg-white">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[230px]">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-[#E5E7EB] h-14 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              type="button"
              className="p-1.5 text-[#667085] hover:text-[#111827]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-xs text-[#111827]">
              IEEE SRHU Admin
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-[#667085] hover:text-[#111827]"
          >
            Logout
          </button>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
