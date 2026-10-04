import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentRecord, confirmStudentRegistration } from '@/lib/data/studentStore';
import { normalizeDdNo } from '@/lib/utils/normalization';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dd_no, course, year, action } = body;

    // Input sanitization (Name, DD Number, Course, Year)
    if (!name?.trim() || !dd_no?.trim() || !course || !year) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (normalizeDdNo(dd_no).length < 3) {
      return NextResponse.json(
        { error: 'Invalid DD number format.' },
        { status: 400 }
      );
    }

    // Verify action: match student record
    if (action === 'verify') {
      const result = await verifyStudentRecord({ name, dd_no, course, year });
      return NextResponse.json(result);
    }

    // Confirm action: mark as joined
    if (action === 'confirm') {
      const { student_id } = body;
      if (!student_id) {
        return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
      }
      const success = await confirmStudentRegistration(student_id);
      if (success) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Registration could not be completed.' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
