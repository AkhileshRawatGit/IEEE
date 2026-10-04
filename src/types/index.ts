export type JoinStatus = 'not_joined' | 'joined';

export interface Student {
  id: string;
  name: string;
  dd_no: string;
  course: string;
  year: string;
  section?: string;
  join_status: JoinStatus;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerifyStudentInput {
  name: string;
  dd_no: string;
  course: string;
  year: string;
  section?: string;
}

export type VerifyStatus = 'success' | 'already_registered' | 'not_found' | 'error';

export interface VerifyResult {
  status: VerifyStatus;
  student?: Student;
  message?: string;
}

export interface OCRStudentRow {
  id?: string;
  name: string;
  dd_no: string;
  course: string;
  year: string;
  section?: string;
  isDuplicate?: boolean;
  status?: 'new' | 'duplicate' | 'invalid';
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface DashboardStats {
  totalStudents: number;
  joinedStudents: number;
  notJoinedStudents: number;
  registrationRate: number;
}
