import React from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import RegistrationForm from '@/components/student/RegistrationForm';
import Link from 'next/link';

export const metadata = {
  title: 'Student Registration — IEEE SRHU Student Branch',
  description: 'Verify your university student information to enroll with the IEEE Student Branch at Swami Rama Himalayan University.',
};

export default function StudentRegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#111827]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4 sm:px-6">
        <div className="w-full max-w-[560px]">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center text-xs text-[#667085] mb-6 gap-2">
            <Link href="/" className="hover:text-[#111827] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#111827] font-medium">Registration</span>
          </nav>

          {/* Registration Form Component */}
          <RegistrationForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
