'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Student, JoinStatus } from '@/types';
import Link from 'next/link';
import {
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  X
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters & Search (no section)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | JoinStatus>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'dd_no' | 'joined_at'>('dd_no');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    dd_no: '',
    course: 'B.Tech',
    year: '1st Year',
  });
  const [modalError, setModalError] = useState('');

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/students');
      if (res.ok) setStudents(await res.json());
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Dynamic filter option lists
  const availableCourses = useMemo(() => Array.from(new Set(students.map(s => s.course))).filter(Boolean).sort(), [students]);
  const availableYears = useMemo(() => Array.from(new Set(students.map(s => s.year))).filter(Boolean).sort(), [students]);

  // Filtered and sorted data
  const filtered = useMemo(() => {
    return students
      .filter(s => {
        const q = searchQuery.toLowerCase().trim();
        if (q && !s.name.toLowerCase().includes(q) && !s.dd_no.toLowerCase().includes(q)) return false;
        if (filterCourse !== 'ALL' && s.course !== filterCourse) return false;
        if (filterYear !== 'ALL' && s.year !== filterYear) return false;
        if (filterStatus !== 'ALL' && s.join_status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        let va = '';
        let vb = '';
        if (sortField === 'name') { va = a.name; vb = b.name; }
        else if (sortField === 'dd_no') { va = a.dd_no; vb = b.dd_no; }
        else if (sortField === 'joined_at') { va = a.joined_at || ''; vb = b.joined_at || ''; }
        return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [students, searchQuery, filterCourse, filterYear, filterStatus, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleToggleStatus = async (s: Student) => {
    const next: JoinStatus = s.join_status === 'joined' ? 'not_joined' : 'joined';
    await fetch('/api/admin/students', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: s.id,
        join_status: next,
        joined_at: next === 'joined' ? new Date().toISOString() : null,
      }),
    });
    loadStudents();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSaving(true);
    await fetch('/api/admin/students', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editingStudent }),
    });
    setEditingStudent(null);
    setIsSaving(false);
    loadStudents();
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    await fetch(`/api/admin/students?id=${deletingStudent.id}`, { method: 'DELETE' });
    setDeletingStudent(null);
    loadStudents();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.dd_no.trim()) {
      setModalError('Full name and DD number are required.');
      return;
    }
    const exists = students.some(s => s.dd_no.toUpperCase() === newForm.dd_no.toUpperCase().trim());
    if (exists) {
      setModalError(`DD No. ${newForm.dd_no.toUpperCase()} already exists in roster.`);
      return;
    }
    setIsSaving(true);
    await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: [{ ...newForm, dd_no: newForm.dd_no.toUpperCase().trim() }] }),
    });
    setAddModalOpen(false);
    setNewForm({ name: '', dd_no: '', course: 'B.Tech', year: '1st Year' });
    setModalError('');
    setIsSaving(false);
    loadStudents();
  };

  const handleExport = () => {
    const header = ['NAME', 'REGISTRATION NUMBER', 'PROGRAM', 'YEAR', 'STATUS', 'JOINED'];
    const rows = filtered.map(s => [
      `"${s.name}"`,
      `"${s.dd_no}"`,
      `"${s.course}"`,
      `"${s.year}"`,
      `"${s.join_status === 'joined' ? 'Joined' : 'Not Joined'}"`,
      `"${s.joined_at ? new Date(s.joined_at).toLocaleDateString('en-GB') : '—'}"`,
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `srhu_ieee_students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold text-[#111827] tracking-tight">
              Students
            </h1>
            <p className="text-sm text-[#667085] mt-1">
              Manage and monitor official student registration status.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExport}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4B5563] bg-white border border-[#E5E7EB] hover:border-[#BAE6FD] hover:bg-[#F9FAFB] rounded-md transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#0055A5]" />
              Export
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4B5563] bg-white border border-[#E5E7EB] hover:border-[#BAE6FD] hover:bg-[#F9FAFB] rounded-md transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#0055A5]" />
              Add Student
            </button>
            <Link
              href="/admin/upload"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#0055A5] hover:bg-[#004587] rounded-md transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            >
              Upload List
            </Link>
          </div>
        </div>

        {/* Toolbar: Search + Compact Filters (No Section) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input: 44px height */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-[14px]" />
              <input
                type="text"
                placeholder="Search by name or registration number..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full h-[44px] pl-10 pr-3 text-sm bg-white border border-[#E5E7EB] rounded-md text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15 transition-all duration-150 shadow-2xs"
              />
            </div>

            {/* Compact enterprise filter selects */}
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2">
              <select
                value={filterCourse}
                onChange={e => { setFilterCourse(e.target.value); setCurrentPage(1); }}
                className="h-[44px] px-3 text-xs bg-white border border-[#E5E7EB] rounded-md text-[#4B5563] focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15 transition-all"
              >
                <option value="ALL">Program: All</option>
                {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={filterYear}
                onChange={e => { setFilterYear(e.target.value); setCurrentPage(1); }}
                className="h-[44px] px-3 text-xs bg-white border border-[#E5E7EB] rounded-md text-[#4B5563] focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15 transition-all"
              >
                <option value="ALL">Year: All</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
                className="h-[44px] px-3 text-xs bg-white border border-[#E5E7EB] rounded-md text-[#4B5563] focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15 transition-all"
              >
                <option value="ALL">Status: All</option>
                <option value="joined">Joined</option>
                <option value="not_joined">Not Joined</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enterprise Table without Section */}
        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9FAFB] text-[#667085] text-xs font-semibold uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th
                    className="px-5 py-3 cursor-pointer select-none hover:text-[#111827] transition-colors"
                    onClick={() => toggleSort('name')}
                  >
                    STUDENT NAME {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    className="px-5 py-3 cursor-pointer select-none hover:text-[#111827] transition-colors"
                    onClick={() => toggleSort('dd_no')}
                  >
                    REGISTRATION NUMBER {sortField === 'dd_no' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-5 py-3">PROGRAM</th>
                  <th className="px-5 py-3">YEAR</th>
                  <th className="px-5 py-3">STATUS</th>
                  <th
                    className="px-5 py-3 cursor-pointer select-none hover:text-[#111827] transition-colors"
                    onClick={() => toggleSort('joined_at')}
                  >
                    JOINED {sortField === 'joined_at' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-5 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-xs text-[#667085]">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-[#0055A5]" />
                      Loading student roster...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-xs text-[#667085]">
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map(s => (
                    <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors duration-150">
                      <td className="px-5 py-3.5 font-medium text-[#111827]">
                        {s.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#0055A5] font-medium">
                        {s.dd_no}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#667085]">
                        {s.course}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#667085]">
                        {s.year}
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                        {s.join_status === 'joined' ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-[#047857] px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            Joined
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[#667085] px-2 py-0.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                            Not joined
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#667085] whitespace-nowrap">
                        {s.joined_at
                          ? new Date(s.joined_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(s)}
                            title={s.join_status === 'joined' ? 'Mark as Not Joined' : 'Mark as Joined'}
                            className="p-1 text-[#667085] hover:text-[#111827] rounded transition-colors"
                          >
                            {s.join_status === 'joined' ? (
                              <XCircle className="w-4 h-4 text-[#9CA3AF] hover:text-[#DC2626] transition-colors" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-[#9CA3AF] hover:text-[#10B981] transition-colors" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingStudent({ ...s })}
                            title="Edit Record"
                            className="p-1 text-[#667085] hover:text-[#0055A5] rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingStudent(s)}
                            title="Delete Record"
                            className="p-1 text-[#667085] hover:text-[#DC2626] rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Minimal Pagination */}
          <div className="px-5 py-3.5 border-t border-[#E5E7EB] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
            <span>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 border border-[#E5E7EB] rounded text-xs text-[#4B5563] hover:bg-[#F9FAFB] disabled:opacity-40 transition-colors"
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 text-xs rounded transition-colors ${
                    currentPage === pageNum
                      ? 'bg-[#0055A5] text-white font-medium shadow-2xs'
                      : 'border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 border border-[#E5E7EB] rounded text-xs text-[#4B5563] hover:bg-[#F9FAFB] disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Student Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-lg border border-[#E5E7EB] max-w-sm w-full p-6 space-y-4 shadow-md">
            <div>
              <h3 className="text-base font-semibold text-[#111827]">
                Delete student?
              </h3>
              <p className="text-sm text-[#667085] mt-1 leading-relaxed">
                This will permanently remove the student record for{' '}
                <strong className="text-[#111827]">{deletingStudent.name}</strong> ({deletingStudent.dd_no}).
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-md text-xs font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-[#DC2626] text-white rounded-md text-xs font-medium hover:bg-[#B91C1C] transition-colors shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal (No Section) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-lg border border-[#E5E7EB] max-w-md w-full p-6 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-base font-semibold text-[#111827]">Edit Student</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="pt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Registration Number</label>
                <input
                  type="text"
                  required
                  value={editingStudent.dd_no}
                  onChange={e => setEditingStudent({ ...editingStudent, dd_no: e.target.value.toUpperCase() })}
                  className="w-full h-10 px-3 text-xs font-mono uppercase bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Program</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.course}
                    onChange={e => setEditingStudent({ ...editingStudent, course: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Year</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.year}
                    onChange={e => setEditingStudent({ ...editingStudent, year: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3.5 py-2 border border-[#E5E7EB] rounded-md text-xs font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0055A5] text-white rounded-md text-xs font-medium hover:bg-[#004587] transition-all shadow-xs"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal (No Section) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-lg border border-[#E5E7EB] max-w-md w-full p-6 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-base font-semibold text-[#111827]">Add Student Record</h3>
              <button
                onClick={() => { setAddModalOpen(false); setModalError(''); }}
                className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="my-3 p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#991B1B]">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAdd} className="pt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meenakshi Rawat"
                  value={newForm.name}
                  onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DD2611043090099"
                  value={newForm.dd_no}
                  onChange={e => setNewForm({ ...newForm, dd_no: e.target.value.toUpperCase() })}
                  className="w-full h-10 px-3 text-xs font-mono uppercase bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Program *</label>
                  <select
                    value={newForm.course}
                    onChange={e => setNewForm({ ...newForm, course: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                  >
                    {['B.Tech','BCA','B.Sc. DS','MCA','BBA','MBA','B.Sc','M.Sc','B.Pharm','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Year *</label>
                  <select
                    value={newForm.year}
                    onChange={e => setNewForm({ ...newForm, year: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/15"
                  >
                    {['1st Year','2nd Year','3rd Year','4th Year'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => { setAddModalOpen(false); setModalError(''); }}
                  className="px-3.5 py-2 border border-[#E5E7EB] rounded-md text-xs font-medium text-[#4B5563] hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0055A5] text-white rounded-md text-xs font-medium hover:bg-[#004587] transition-all shadow-xs"
                >
                  {isSaving ? 'Adding...' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
