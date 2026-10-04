import { NextRequest, NextResponse } from 'next/server';
import { getStudents, getDashboardStats, updateStudent, deleteStudent, importStudentRecords } from '@/lib/data/studentStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'stats') {
      const stats = await getDashboardStats();
      return NextResponse.json(stats);
    }

    const students = await getStudents();
    return NextResponse.json(students);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch students.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Student ID required.' }, { status: 400 });
    const success = await updateStudent(id, updates);
    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Student ID required.' }, { status: 400 });
    const success = await deleteStudent(id);
    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rows } = body;
    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid rows array.' }, { status: 400 });
    }
    const result = await importStudentRecords(rows);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Import failed.' }, { status: 500 });
  }
}
