'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isCurrent = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand on left */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#0055A5] group-hover:text-[#004587] transition-colors">
                IEEE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0055A5] group-hover:scale-125 transition-transform" />
            </div>
            <span className="h-4 w-[1px] bg-[#E5E7EB]" />
            <span className="text-sm font-medium text-[#111827] tracking-tight group-hover:text-[#0055A5] transition-colors">
              SRHU Student Branch
            </span>
          </Link>

          {/* Desktop Navigation on right */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/student/register"
              className={`px-3.5 py-1.5 text-sm rounded-md transition-all duration-150 ${
                isCurrent('/student')
                  ? 'text-[#0055A5] bg-[#EBF4FC] font-semibold'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
            >
              Registration
            </Link>

            <Link
              href="/admin/login"
              className={`px-3.5 py-1.5 text-sm rounded-md transition-all duration-150 ${
                isCurrent('/admin')
                  ? 'text-[#0055A5] bg-[#EBF4FC] font-semibold'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
            >
              Admin Portal
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 text-[#667085] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-1 animate-fade-in shadow-sm">
          <Link
            href="/student/register"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-[#111827] font-medium hover:text-[#0055A5] hover:bg-[#F9FAFB] rounded-md transition-colors"
          >
            Registration
          </Link>
          <Link
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-md transition-colors"
          >
            Admin Portal
          </Link>
        </div>
      )}
    </header>
  );
}
