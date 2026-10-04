import React from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { ArrowRight, Cpu, Lightbulb, Users2, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#111827]">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-20 sm:pt-24 lg:pt-[110px] pb-16 sm:pb-20 lg:pb-[90px] border-b border-[#E5E7EB] bg-white relative overflow-hidden">
          {/* Subtle architectural background grid line */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5E7EB_1px,transparent_1px),linear-gradient(to_bottom,#E5E7EB_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Institutional Copy */}
              <div className="lg:col-span-7 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4FC] border border-[#BAE6FD] text-[11px] font-semibold text-[#0055A5] uppercase tracking-wider mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0055A5] live-dot" />
                  IEEE Student Branch · SRHU STB60226050
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#111827] tracking-tight leading-[1.15]">
                  Student Registration Portal
                </h1>

                <p className="mt-3 text-lg font-medium text-[#0055A5] tracking-tight">
                  Connect. Learn. Build.
                </p>

                <p className="mt-4 text-[15px] sm:text-base text-[#4B5563] leading-relaxed max-w-xl">
                  Register with the IEEE Student Branch at Swami Rama Himalayan University and
                  become part of a worldwide community dedicated to technology, innovation, and professional growth.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link
                    href="/student/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0055A5] hover:bg-[#004587] text-white text-sm font-medium rounded-md transition-all duration-200 shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Begin Registration
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/admin/login"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#4B5563] hover:text-[#111827] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-md transition-all duration-150"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#667085]" />
                    Admin Access
                  </Link>
                </div>
              </div>

              {/* Right Column: Editorial / Academic Visual Composition */}
              <div className="lg:col-span-5 animate-fade-in">
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#BAE6FD] rounded-lg p-6 sm:p-7 relative transition-all duration-300 shadow-xs hover:shadow-sm">
                  {/* Subtle top indicator bar */}
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-5 text-[11px] font-mono text-[#667085]">
                    <span className="font-semibold text-[#111827]">DOC REF: SRHU-IEEE-2026</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] live-dot" />
                      ACTIVE SESSION
                    </span>
                  </div>

                  {/* Clean Typography Composition */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">
                        INSTITUTION
                      </div>
                      <div className="text-sm font-semibold text-[#111827] mt-0.5">
                        Swami Rama Himalayan University
                      </div>
                      <div className="text-xs text-[#667085]">
                        Himalayan School of Science &amp; Technology
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#F3F4F6]">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">
                          BRANCH CODE
                        </div>
                        <div className="text-sm font-mono font-semibold text-[#0055A5] mt-0.5">
                          STB60226050
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">
                          AFFILIATION
                        </div>
                        <div className="text-xs text-[#111827] mt-0.5 font-medium">
                          IEEE Region 10
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#F3F4F6]">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">
                          SECTION
                        </div>
                        <div className="text-xs text-[#111827] mt-0.5 font-medium">
                          Uttar Pradesh (UP)
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">
                          ACADEMIC YEAR
                        </div>
                        <div className="text-xs font-mono font-medium text-[#111827] mt-0.5">
                          2026–2027
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB] text-[11px] text-[#667085] flex items-center justify-between">
                      <span className="font-medium text-[#4B5563]">Dehradun, Uttarakhand</span>
                      <span className="font-mono text-[10px] text-[#9CA3AF]">30.19° N, 78.18° E</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* INFORMATION SECTION: Why IEEE? */}
        <section className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-[#0055A5] font-semibold">
              ADVANTAGES &amp; OPPORTUNITIES
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#111827] tracking-tight mt-1">
              Why Join IEEE SRHU?
            </h2>
          </div>

          {/* Horizontal editorial layout with smooth interactive hover */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB] border-y border-[#E5E7EB]">
            <div className="py-8 md:py-6 md:pr-8 group hover:bg-[#F9FAFB]/60 transition-colors p-4 rounded-l-md">
              <div className="w-8 h-8 rounded-md bg-[#EBF4FC] text-[#0055A5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5 group-hover:text-[#0055A5] transition-colors">
                Technology
              </h3>
              <p className="text-sm text-[#667085] leading-relaxed">
                Access IEEE technical publications, participate in hands-on workshops, and learn directly from industry and research communities.
              </p>
            </div>

            <div className="py-8 md:py-6 md:px-8 group hover:bg-[#F9FAFB]/60 transition-colors p-4">
              <div className="w-8 h-8 rounded-md bg-[#EBF4FC] text-[#0055A5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5 group-hover:text-[#0055A5] transition-colors">
                Innovation
              </h3>
              <p className="text-sm text-[#667085] leading-relaxed">
                Build real engineering projects, compete in global hackathons such as IEEEXtreme, and explore emerging technologies.
              </p>
            </div>

            <div className="py-8 md:py-6 md:pl-8 group hover:bg-[#F9FAFB]/60 transition-colors p-4 rounded-r-md">
              <div className="w-8 h-8 rounded-md bg-[#EBF4FC] text-[#0055A5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5 group-hover:text-[#0055A5] transition-colors">
                Community
              </h3>
              <p className="text-sm text-[#667085] leading-relaxed">
                Network with fellow students, faculty counselors, and global engineering leaders across IEEE Region 10 and UP Section.
              </p>
            </div>
          </div>
        </section>

        {/* HOW REGISTRATION WORKS */}
        <section className="py-16 sm:py-20 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-12">
              <span className="text-xs font-mono uppercase tracking-wider text-[#0055A5] font-semibold">
                STEP-BY-STEP PROCESS
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#111827] tracking-tight mt-1">
                How Registration Works
              </h2>
              <p className="text-sm text-[#667085] mt-1">
                A seamless verification process synchronized with official university student records.
              </p>
            </div>

            {/* Clean timeline: 01, 02, 03 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-5 border border-[#E5E7EB] hover:border-[#BAE6FD] hover:bg-[#F0F7FF]/20 rounded-lg transition-all duration-200">
                <div className="text-2xl font-semibold font-mono text-[#0055A5] mb-2">
                  01
                </div>
                <h3 className="text-base font-semibold text-[#111827] mb-1">
                  Enter Details
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Provide your university enrollment information including your official university DD number.
                </p>
              </div>

              <div className="p-5 border border-[#E5E7EB] hover:border-[#BAE6FD] hover:bg-[#F0F7FF]/20 rounded-lg transition-all duration-200">
                <div className="text-2xl font-semibold font-mono text-[#0055A5] mb-2">
                  02
                </div>
                <h3 className="text-base font-semibold text-[#111827] mb-1">
                  Verify Student Record
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Your credentials are automatically matched against the official SRHU student database.
                </p>
              </div>

              <div className="p-5 border border-[#E5E7EB] hover:border-[#BAE6FD] hover:bg-[#F0F7FF]/20 rounded-lg transition-all duration-200">
                <div className="text-2xl font-semibold font-mono text-[#0055A5] mb-2">
                  03
                </div>
                <h3 className="text-base font-semibold text-[#111827] mb-1">
                  Complete Registration
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Confirm your details to activate your IEEE Student Branch membership record.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-xs text-[#667085]">
                Official verification active for Academic Session 2026–2027.
              </span>
              <Link
                href="/student/register"
                className="text-sm font-medium text-[#0055A5] hover:text-[#004587] inline-flex items-center gap-1.5 transition-colors"
              >
                Go to Registration <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
