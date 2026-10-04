import { Student, VerifyStudentInput, VerifyResult, DashboardStats, OCRStudentRow } from '@/types';
import { INITIAL_STUDENTS } from './seedStudents';
import {
  normalizeDdNo,
  normalizeCourse,
  normalizeYear,
  normalizeSection,
  namesMatch,
} from '../utils/normalization';
import { supabase, isSupabaseConfigured } from '../supabase/client';

/* ─── Local fallback store (used only when Supabase is not configured) ─── */

let _localStudents: Student[] = [...INITIAL_STUDENTS];

function getLocalStudents(): Student[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('srhu_ieee_students');
      if (saved) return JSON.parse(saved) as Student[];
    } catch { /* ignore */ }
  }
  return _localStudents;
}

function saveLocalStudents(list: Student[]) {
  _localStudents = list;
  if (typeof window !== 'undefined') {
    localStorage.setItem('srhu_ieee_students', JSON.stringify(list));
  }
}

/* ─── Public API ─── */

export async function getStudents(): Promise<Student[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('dd_no', { ascending: true });
    if (!error && data) return data as Student[];
  }
  return getLocalStudents();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const students = await getStudents();
  const total = students.length;
  const joined = students.filter(s => s.join_status === 'joined').length;
  return {
    totalStudents: total,
    joinedStudents: joined,
    notJoinedStudents: total - joined,
    registrationRate: total > 0 ? Number(((joined / total) * 100).toFixed(1)) : 0,
  };
}

/** Server-safe matching — DD Number is primary key, then cross-checks other fields */
export async function verifyStudentRecord(input: VerifyStudentInput): Promise<VerifyResult> {
  const normDd = normalizeDdNo(input.dd_no);
  if (!normDd) return { status: 'not_found' };

  let candidate: Student | undefined;

  if (isSupabaseConfigured && supabase) {
    // Use Supabase ilike for case-insensitive DD match
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .ilike('dd_no', normDd)
      .maybeSingle();
    if (!error && data) candidate = data as Student;
  } else {
    candidate = getLocalStudents().find(s => normalizeDdNo(s.dd_no) === normDd);
  }

  if (!candidate) return { status: 'not_found' };

  if (candidate.join_status === 'joined') {
    return { status: 'already_registered', student: candidate };
  }

  // Cross-check academic details (generic failure message prevents enumeration)
  const matches =
    namesMatch(candidate.name, input.name) &&
    normalizeCourse(candidate.course) === normalizeCourse(input.course) &&
    normalizeYear(candidate.year) === normalizeYear(input.year);

  if (!matches) return { status: 'not_found' };

  return { status: 'success', student: candidate };
}

export async function confirmStudentRegistration(studentId: string): Promise<boolean> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('students')
      .update({ join_status: 'joined', joined_at: now, updated_at: now })
      .eq('id', studentId);
    return !error;
  }

  // Local fallback
  const list = getLocalStudents();
  saveLocalStudents(list.map(s =>
    s.id === studentId ? { ...s, join_status: 'joined' as const, joined_at: now, updated_at: now } : s
  ));
  return true;
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<boolean> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('students')
      .update({ ...updates, updated_at: now })
      .eq('id', id);
    return !error;
  }
  saveLocalStudents(getLocalStudents().map(s => s.id === id ? { ...s, ...updates, updated_at: now } : s));
  return true;
}

export async function deleteStudent(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    return !error;
  }
  saveLocalStudents(getLocalStudents().filter(s => s.id !== id));
  return true;
}

export async function importStudentRecords(
  rows: OCRStudentRow[]
): Promise<{ added: number; updated: number }> {
  const now = new Date().toISOString();
  let added = 0;
  let updated = 0;

  if (isSupabaseConfigured && supabase) {
    for (const row of rows) {
      const normDd = normalizeDdNo(row.dd_no);
      if (!normDd) continue;

      // Check if exists
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .ilike('dd_no', normDd)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('students')
          .update({
            name: row.name,
            course: row.course,
            year: row.year,
            section: row.section,
            updated_at: now,
          })
          .eq('id', existing.id);
        updated++;
      } else {
        await supabase.from('students').insert({
          name: row.name,
          dd_no: normDd,
          course: row.course,
          year: row.year,
          section: row.section,
          join_status: 'not_joined',
          joined_at: null,
          created_at: now,
          updated_at: now,
        });
        added++;
      }
    }
    return { added, updated };
  }

  // Local fallback
  const map = new Map<string, Student>();
  getLocalStudents().forEach(s => map.set(normalizeDdNo(s.dd_no), s));

  for (const row of rows) {
    const normDd = normalizeDdNo(row.dd_no);
    if (!normDd) continue;
    if (map.has(normDd)) {
      const ex = map.get(normDd)!;
      map.set(normDd, { ...ex, name: row.name, course: row.course, year: row.year, section: row.section, updated_at: now });
      updated++;
    } else {
      map.set(normDd, {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: row.name,
        dd_no: normDd,
        course: row.course,
        year: row.year,
        section: row.section,
        join_status: 'not_joined',
        joined_at: null,
        created_at: now,
        updated_at: now,
      });
      added++;
    }
  }

  saveLocalStudents(Array.from(map.values()));
  return { added, updated };
}

export function resetToSeedData() {
  saveLocalStudents([...INITIAL_STUDENTS]);
}
