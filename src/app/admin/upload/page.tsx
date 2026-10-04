'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { OCRStudentRow, Student } from '@/types';
import { normalizeDdNo } from '@/lib/utils/normalization';
import {
  Upload,
  Check,
  AlertCircle,
  Loader2,
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUploadPage() {
  const [existingStudents, setExistingStudents] = useState<Student[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [rows, setRows] = useState<OCRStudentRow[]>([]);
  const [importResult, setImportResult] = useState<{ added: number; updated: number } | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/students')
      .then(r => r.json())
      .then(setExistingStudents)
      .catch(() => {});
  }, []);

  const markDuplicates = (input: Omit<OCRStudentRow, 'isDuplicate'>[]): OCRStudentRow[] => {
    const existing = new Set(existingStudents.map(s => normalizeDdNo(s.dd_no)));
    return input.map((r, i) => ({
      ...r,
      id: `row-${i}`,
      isDuplicate: existing.has(normalizeDdNo(r.dd_no)),
    }));
  };

  const parseText = (text: string): OCRStudentRow[] => {
    const results: OCRStudentRow[] = [];
    for (const line of text.split('\n')) {
      const parts = line.includes('|') ? line.split('|') :
        line.includes(',') ? line.split(',') :
        line.includes('\t') ? line.split('\t') : [];
      if (parts.length >= 2) {
        const [name, dd_no, course, year] = parts.map(p => p.trim());
        if (dd_no && dd_no.length >= 3) {
          results.push({
            name: name || 'Unknown',
            dd_no,
            course: course || 'B.Tech',
            year: year || '1st Year',
          });
        }
      }
    }
    return markDuplicates(results);
  };

  const processFile = async (file: File) => {
    setImportResult(null);
    setUploadError('');

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      setIsProcessing(true);
      setOcrStatus('Reading roster file...');
      const text = await file.text();
      const parsed = parseText(text);
      setRows(parsed);
      if (parsed.length === 0) {
        setUploadError('No valid student rows found. Expected format: Name, Registration Number, Program, Year');
      }
      setIsProcessing(false);
      return;
    }

    // OCR via Tesseract
    setIsProcessing(true);
    setOcrStatus('Initializing OCR engine...');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      setOcrStatus('Scanning and extracting student rows...');
      const { data } = await worker.recognize(file);
      await worker.terminate();

      setOcrStatus('Validating extracted records...');
      const parsed = parseText(data.text);

      if (parsed.length === 0) {
        const fallback: Omit<OCRStudentRow, 'isDuplicate'>[] = [];
        for (const line of data.text.split('\n')) {
          const m = line.match(/\b(DD)?\d{2}[A-Z0-9]{4,14}\b/i);
          if (m) {
            fallback.push({
              name: line.replace(m[0], '').replace(/[|,\t]/g, '').trim() || 'Student',
              dd_no: m[0].toUpperCase(),
              course: 'B.Tech',
              year: '1st Year',
            });
          }
        }
        if (fallback.length > 0) {
          setRows(markDuplicates(fallback));
        } else {
          setUploadError('Could not detect structured rows. Please upload a CSV file or a higher resolution document scan.');
        }
      } else {
        setRows(parsed);
      }
    } catch {
      setUploadError('OCR processing failed. Please upload a standard CSV or TXT file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDownloadTemplate = () => {
    const templateContent = [
      'Name,Registration Number,Program,Year',
      'Abhay Chauhan,DD2611043090001,B.Tech,1st Year',
      'Akshat Dobhal,DD2611043030002,B.Tech,1st Year',
      'Kapish Rawat,DD2611043010058,BCA,1st Year',
      'Aditya Joshi,DD2611043100001,B.Sc. DS,1st Year',
      'Aryan Rawat,DD2611045010003,MCA,1st Year'
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'srhu_student_roster_template.csv';
    a.click();
  };

  const updateRow = (i: number, field: keyof OCRStudentRow, val: string) => {
    setRows(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      if (field === 'dd_no') {
        const existing = new Set(existingStudents.map(s => normalizeDdNo(s.dd_no)));
        next[i].isDuplicate = existing.has(normalizeDdNo(val));
      }
      return next;
    });
  };

  const removeRow = (i: number) => {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const result = await res.json();
      if (res.ok) {
        setImportResult(result);
        setRows([]);
        const fresh = await fetch('/api/admin/students').then(r => r.json());
        setExistingStudents(fresh);
      } else {
        setUploadError(result.error || 'Import failed. Please try again.');
      }
    } catch {
      setUploadError('Network error occurred during roster import.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setRows([]);
    setUploadError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const duplicateCount = rows.filter(r => r.isDuplicate).length;
  const incompleteCount = rows.filter(r => !r.name.trim() || !r.dd_no.trim()).length;
  const validCount = rows.length - incompleteCount;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E5E7EB] gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold text-[#111827] tracking-tight">
              Upload Student List
            </h1>
            <p className="text-sm text-[#667085] mt-1">
              Import the official SRHU student roster into the portal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] hover:border-[#BAE6FD] hover:bg-[#F9FAFB] rounded-md text-xs font-medium text-[#4B5563] transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#0055A5]" />
            Download CSV Template
          </button>
        </div>

        {/* Success confirmation */}
        {importResult && (
          <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md text-xs text-[#047857] flex items-center justify-between animate-fade-in shadow-2xs">
            <div>
              <p className="font-semibold text-sm">Import completed successfully</p>
              <p className="mt-0.5">
                Added {importResult.added} new records · Updated {importResult.updated} existing records.
              </p>
            </div>
            <Link
              href="/admin/students"
              className="px-3.5 py-1.5 bg-[#047857] text-white rounded font-medium hover:bg-[#065F46] transition-colors shadow-2xs"
            >
              View Students
            </Link>
          </div>
        )}

        {/* State A: Upload Zone (when no rows extracted) */}
        {rows.length === 0 && !isProcessing && (
          <div className="space-y-6 animate-fade-in">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`bg-white border-2 border-dashed rounded-lg p-14 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#0055A5] bg-[#EBF4FC]/40 scale-[1.005]'
                  : 'border-[#E5E7EB] hover:border-[#0055A5]/60 hover:bg-[#F9FAFB]/50'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />

              <div className="space-y-3">
                <div className="w-12 h-12 border border-[#E5E7EB] rounded-full flex items-center justify-center mx-auto text-[#0055A5] bg-[#EBF4FC] shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#111827]">
                    Upload official student roster
                  </h3>
                  <p className="text-xs text-[#667085] mt-1">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 font-mono">
                    CSV, TXT, PDF, JPG, PNG · Max 10MB
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0055A5] hover:bg-[#004587] text-white rounded-md text-xs font-medium transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Choose File
                  </button>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#991B1B] flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Production Guidelines */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#374151] mb-2">
                Supported File Formats &amp; Structure
              </h4>
              <p className="text-xs text-[#667085] leading-relaxed mb-3">
                The portal supports direct CSV roster uploads as well as scanned document processing via local OCR.
                Expected column format matching official university documentation:
              </p>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-md p-3 font-mono text-xs text-[#111827] flex items-center justify-between">
                <span>Name, Registration Number, Program, Year</span>
                <span className="text-[11px] text-[#667085] font-sans">e.g. DD2611043090001</span>
              </div>
            </div>
          </div>
        )}

        {/* State B: Processing State */}
        {isProcessing && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-16 text-center space-y-3 animate-fade-in">
            <Loader2 className="w-7 h-7 text-[#0055A5] animate-spin mx-auto" />
            <h3 className="text-base font-semibold text-[#111827]">
              Processing student list
            </h3>
            <p className="text-xs text-[#667085]">
              {ocrStatus || 'Extracting student information...'}
            </p>
          </div>
        )}

        {/* State C: Review Extracted Records (No Section) */}
        {rows.length > 0 && !isProcessing && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden animate-fade-in shadow-xs">
            <div className="p-6 border-b border-[#E5E7EB]">
              <h2 className="text-base font-semibold text-[#111827]">
                Review extracted records
              </h2>
              <p className="text-xs text-[#667085] mt-1 font-mono">
                {rows.length} records detected from document
              </p>
            </div>

            {/* Editable Preview Table without Section */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] text-[#667085] font-semibold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">REGISTRATION NUMBER</th>
                    <th className="px-4 py-3">PROGRAM</th>
                    <th className="px-4 py-3">YEAR</th>
                    <th className="px-4 py-3 text-right">REMOVE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {rows.map((row, i) => (
                    <tr key={i} className={row.isDuplicate ? 'bg-[#FFFBEB]/50' : 'hover:bg-[#F9FAFB] transition-colors'}>
                      <td className="px-4 py-2">
                        <input
                          value={row.name}
                          onChange={e => updateRow(i, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5]"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            value={row.dd_no}
                            onChange={e => updateRow(i, 'dd_no', e.target.value.toUpperCase())}
                            className="w-full font-mono uppercase px-2 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5]"
                          />
                          {row.isDuplicate && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-semibold whitespace-nowrap">
                              dup
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={row.course}
                          onChange={e => updateRow(i, 'course', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5]"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={row.year}
                          onChange={e => updateRow(i, 'year', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5]"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => removeRow(i)}
                          className="p-1 text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom summary and action buttons */}
            <div className="p-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-[#667085] space-x-3">
                <span className="font-semibold text-[#111827]">{validCount} valid</span>
                <span>·</span>
                <span className="text-[#D97706] font-medium">{duplicateCount} duplicates</span>
                <span>·</span>
                <span>{incompleteCount} incomplete</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-[#E5E7EB] rounded-md text-xs font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={validCount === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0055A5] text-white rounded-md text-xs font-medium hover:bg-[#004587] disabled:opacity-50 transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  Import {validCount} Students
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
