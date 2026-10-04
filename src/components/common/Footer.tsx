import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FFFFFF] mt-auto text-sm text-[#667085]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-semibold text-[#111827] text-sm">
              IEEE Student Branch
            </p>
            <p className="text-sm text-[#4B5563] mt-0.5">
              Swami Rama Himalayan University
            </p>
            <p className="text-xs text-[#667085] mt-2">
              Dehradun, Uttarakhand
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-sm">
            <Link
              href="/student/register"
              className="text-[#667085] hover:text-[#111827] transition-colors"
            >
              Registration
            </Link>
            <Link
              href="/admin/login"
              className="text-[#667085] hover:text-[#111827] transition-colors"
            >
              Admin Portal
            </Link>
            <a
              href="mailto:ieee.sb@srhu.edu.in"
              className="text-[#667085] hover:text-[#111827] transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#9CA3AF]">
          <p>© 2026 IEEE Student Branch, SRHU</p>
          <p className="font-mono text-[11px]">Branch Code: STB60226050 · Region 10</p>
        </div>
      </div>
    </footer>
  );
}
