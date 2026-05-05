import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendSponsorNotifications } from '@/lib/notifications';
import { gradeToLabel, type Grade } from '@/lib/types';

export const runtime = 'nodejs';

interface SponsorBody {
  studentId?: number;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  messagePublic?: boolean;
}

export async function POST(request: Request) {
  let body: SponsorBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: '잘못된 요청' }, { status: 400 }); }

  const { studentId, name, phone, email, message, messagePublic } = body;

  if (!studentId || !name?.trim() || !phone?.trim() || !email?.trim()) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '올바른 이메일 주소를 입력해 주세요.' }, { status: 400 });
  }
  if (name.length > 50 || phone.length > 30 || email.length > 100 || (message?.length ?? 0) > 1000) {
    return NextResponse.json({ error: '입력값이 너무 깁니다.' }, { status: 400 });
  }

  const db = getDb();
  const studentRes = await db.execute({
    sql: 'SELECT id, status, alias_name, grade, dream_summary FROM students WHERE id = ?',
    args: [studentId],
  });
  if (studentRes.rows.length === 0) {
    return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (String(studentRes.rows[0].status) === 'COMPLETED') {
    return NextResponse.json({ error: '이미 결연이 완료된 학생입니다.' }, { status: 409 });
  }
  const student = studentRes.rows[0];

  // Insert sponsor with PENDING status (admin will mark PAID after deposit confirmation)
  await db.execute({
    sql: `INSERT INTO sponsors (name, phone, email, message, message_public, student_id, status)
          VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
    args: [name.trim(), phone.trim(), email.trim(), message?.trim() || null, messagePublic ? 1 : 0, studentId],
  });

  // Fire-and-forget notifications (don't block response on notification failures)
  const notify = await sendSponsorNotifications({
    sponsorName: name.trim(),
    studentAlias: String(student.alias_name),
    studentGrade: gradeToLabel(student.grade as Grade),
    studentDream: student.dream_summary as string | null,
    toPhone: phone.trim(),
    toEmail: email.trim(),
  });

  return NextResponse.json({
    success: true,
    notifications: { sms: notify.sms.sent, email: notify.email.sent },
  });
}
