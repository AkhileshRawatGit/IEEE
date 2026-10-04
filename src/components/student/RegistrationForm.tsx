'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Student, VerifyStatus } from '@/types';
import {
  ArrowRight,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Printer,
  ShieldCheck
} from 'lucide-react';

const COURSES = [
  'B.Tech', 'BCA', 'B.Sc. DS', 'MCA', 'BBA', 'MBA',
  'B.Sc', 'M.Sc', 'B.Pharm', 'Other',
];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'];

type FormState = {
  name: string;
  dd_no: string;
  course: string;
  year: string;
};

const INITIAL_FORM: FormState = {
  name: '',
  dd_no: '',
  course: 'B.Tech',
  year: '1st Year',
};

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<VerifyStatus | null>(null);
  const [verifiedStudent, setVerifiedStudent] = useState<Student | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [apiError, setApiError] = useState('');

  const update = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    setApiError('');
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Full name is required as per university ID.';
    }
    if (!form.dd_no.trim() || form.dd_no.trim().length < 3) {
      errs.dd_no = 'Valid DD number is required (e.g. DD2611043090001).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');
    setStatus(null);

    try {
      const res = await fetch('/api/student/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, action: 'verify' }),
      });
      const json = await res.json();

      if (!res.ok) {
        setApiError(json.error || 'Verification failed. Please try again.');
        return;
      }

      setStatus(json.status);
      if (json.student) setVerifiedStudent(json.student);
    } catch {
      setApiError('Network connection issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!verifiedStudent) return;
    setIsConfirming(true);
    try {
      const res = await fetch('/api/student/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          action: 'confirm',
          student_id: verifiedStudent.id,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsComplete(true);
      } else {
        setApiError(json.error || 'Could not complete registration. Please try again.');
      }
    } catch {
      setApiError('Network error. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setStatus(null);
    setVerifiedStudent(null);
    setIsComplete(false);
    setApiError('');
    setForm(INITIAL_FORM);
    setErrors({});
  };

  /* ─── State 1: Final Registration Complete ─── */
  if (isComplete && verifiedStudent) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 sm:p-10 shadow-xs animate-fade-in">
        <div className="text-center pb-6 border-b border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#047857] font-semibold">
            MEMBERSHIP ENROLLED
          </div>
          <h2 className="text-xl font-semibold text-[#111827] mt-1">
            IEEE Registration Confirmed
          </h2>
          <p className="text-sm text-[#667085] mt-1">
            Your IEEE Student Branch membership is successfully recorded for Session 2026–2027.
          </p>
        </div>

        <div className="py-6 space-y-3.5 text-sm">
          <div className="flex justify-between py-1.5 border-b border-[#F3F4F6]">
            <span className="text-[#667085]">Student Name</span>
            <span className="font-semibold text-[#111827]">{verifiedStudent.name}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#F3F4F6]">
            <span className="text-[#667085]">Registration Number</span>
            <span className="font-mono font-semibold text-[#0055A5]">{verifiedStudent.dd_no}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#F3F4F6]">
            <span className="text-[#667085]">Program &amp; Year</span>
            <span className="text-[#111827]">{verifiedStudent.course} · {verifiedStudent.year}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-[#667085]">Branch Code</span>
            <span className="font-mono text-[#111827]">STB60226050 (SRHU HSST)</span>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.print()}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 border border-[#E5E7EB] rounded-md text-sm font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] transition-all"
          >
            <Printer className="w-4 h-4 text-[#667085]" />
            Print Confirmation
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center h-11 bg-[#111827] text-white rounded-md text-sm font-medium hover:bg-[#1F2937] transition-all shadow-xs"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  /* ─── State 2: Verified, Ready to Confirm ─── */
  if (status === 'success' && verifiedStudent) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 sm:p-10 shadow-xs animate-fade-in">
        <div className="text-center pb-6 border-b border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#047857] font-semibold">
            STUDENT RECORD VERIFIED
          </div>
          <p className="text-sm text-[#667085] mt-1.5 max-w-sm mx-auto">
            Your university details have been verified successfully against the official SRHU student roster.
          </p>
        </div>

        <div className="py-6 text-center space-y-1.5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] my-6">
          <div className="text-lg font-semibold text-[#111827]">
            {verifiedStudent.name}
          </div>
          <div className="text-sm font-mono font-medium text-[#0055A5]">
            {verifiedStudent.dd_no}
          </div>
          <div className="text-sm text-[#667085]">
            {verifiedStudent.course} · {verifiedStudent.year}
          </div>
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#991B1B]">
            {apiError}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="h-11 px-4 border border-[#E5E7EB] rounded-md text-sm font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 bg-[#0055A5] text-white rounded-md text-sm font-medium hover:bg-[#004587] disabled:opacity-60 transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enrolling Student...
              </>
            ) : (
              <>
                Continue Registration
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ─── State 3: Already Registered ─── */
  if (status === 'already_registered') {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 sm:p-10 shadow-xs animate-fade-in">
        <div className="text-center pb-6 border-b border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-full bg-[#EBF4FC] border border-[#BAE6FD] text-[#0055A5] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#0055A5] font-semibold">
            ALREADY REGISTERED
          </div>
          <p className="text-sm text-[#667085] mt-1.5 max-w-sm mx-auto">
            This student record has already completed registration for the IEEE Student Branch.
          </p>
        </div>

        {verifiedStudent && (
          <div className="py-6 text-center space-y-1 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] my-6">
            <div className="text-base font-semibold text-[#111827]">
              {verifiedStudent.name}
            </div>
            <div className="text-sm font-mono text-[#0055A5]">
              {verifiedStudent.dd_no} · {verifiedStudent.course}
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 border border-[#E5E7EB] rounded-md text-sm font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Check Another Record
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center h-11 bg-[#111827] text-white rounded-md text-sm font-medium hover:bg-[#1F2937] transition-all shadow-xs"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  /* ─── State 4: Error / Record Not Found ─── */
  if (status === 'not_found') {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 sm:p-10 shadow-xs animate-fade-in">
        <div className="text-center pb-6 border-b border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-[#111827]">
            Student record could not be verified
          </h2>
          <p className="text-sm text-[#667085] mt-2 max-w-md mx-auto leading-relaxed">
            We couldn&apos;t match the information you entered with the official SRHU student list.
            Please verify your details and try again.
          </p>
        </div>

        <div className="py-6 text-xs text-[#667085] space-y-2">
          <p className="font-semibold text-[#374151]">Important checks:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Ensure your Registration Number matches your university ID card exactly.</li>
            <li>Confirm spelling of your full name as registered in university admission records.</li>
            <li>Confirm your selected Program and Year match your current academic session.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={handleReset}
            className="w-full inline-flex items-center justify-center gap-2 h-11 bg-[#0055A5] text-white rounded-md text-sm font-medium hover:bg-[#004587] transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ─── Default State: Pure Verification Form (No Section Field) ─── */
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 sm:p-10 shadow-xs animate-fade-in">
      {/* Header section */}
      <div className="pb-6 border-b border-[#E5E7EB]">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#0055A5] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0055A5]" />
          IEEE STUDENT REGISTRATION
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111827] mt-1.5 tracking-tight">
          Verify your university information
        </h1>
        <p className="text-sm text-[#667085] mt-1.5 leading-relaxed">
          Your details will be matched against the official SRHU student database.
        </p>
      </div>

      {/* The Form */}
      <form onSubmit={handleVerify} className="pt-6 space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="As per university records"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            className={`w-full h-11 px-3.5 text-sm bg-white border rounded-md transition-all duration-150 focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15 ${
              errors.name ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Registration Number (DD Number) */}
        <div>
          <label
            htmlFor="dd_no"
            className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5"
          >
            Registration Number (DD Number)
          </label>
          <input
            id="dd_no"
            type="text"
            placeholder="e.g. DD2611043090001"
            value={form.dd_no}
            onChange={e => update('dd_no', e.target.value.toUpperCase())}
            className={`w-full h-11 px-3.5 text-sm font-mono uppercase bg-white border rounded-md transition-all duration-150 focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15 ${
              errors.dd_no ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
            }`}
          />
          {errors.dd_no && (
            <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.dd_no}
            </p>
          )}
        </div>

        {/* Program (Course) and Year (Side-by-side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="course"
              className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5"
            >
              Program
            </label>
            <select
              id="course"
              value={form.course}
              onChange={e => update('course', e.target.value)}
              className="w-full h-11 px-3.5 text-sm bg-white border border-[#E5E7EB] rounded-md transition-all duration-150 focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
            >
              {COURSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="year"
              className="block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5"
            >
              Year
            </label>
            <select
              id="year"
              value={form.year}
              onChange={e => update('year', e.target.value)}
              className="w-full h-11 px-3.5 text-sm bg-white border border-[#E5E7EB] rounded-md transition-all duration-150 focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#991B1B] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#0055A5] hover:bg-[#004587] text-white text-sm font-medium rounded-md disabled:opacity-60 transition-all duration-150 shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0055A5]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying student record...
              </>
            ) : (
              <>
                Verify Details
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
