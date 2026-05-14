import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendSponsorNotifications } from '@/lib/notifications';
import {
  gradeToLabel, type Grade, type SponsorshipType,
  ONETIME_AMOUNT, INSTALLMENT_AMOUNT_PER, INSTALLMENT_TOTAL_COUNT,
} from '@/lib/types';

export const runtime = 'nodejs';

interface SponsorBody {
  studentId?: number;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  messagePublic?: boolean;
  sponsorshipType?: SponsorshipType;     // 'ONETIME' | 'INSTALLMENT' (기본 ONETIME)
}

export async function POST(request: Request) {
  let body: SponsorBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: '잘못된 요청' }, { status: 400 }); }

  const { studentId, name, phone, email, message, messagePublic } = body;
  const sponsorshipType: SponsorshipType =
    body.sponsorshipType === 'INSTALLMENT' ? 'INSTALLMENT' : 'ONETIME';

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

  // 분할 후원: 신청 당일 = 매월 안내 날짜 (1~28만 안전; 29~31일은 그 달 말일에 발송되도록 cron에서 처리)
  const today = new Date();
  const todayDay = today.getDate();
  const isInstallment = sponsorshipType === 'INSTALLMENT';

  const totalAmount   = isInstallment ? INSTALLMENT_AMOUNT_PER * INSTALLMENT_TOTAL_COUNT : ONETIME_AMOUNT;
  const installTotal  = isInstallment ? INSTALLMENT_TOTAL_COUNT : 1;
  const nextDueDay    = isInstallment ? todayDay : null;

  const ins = await db.execute({
    sql: `INSERT INTO sponsors
          (name, phone, email, message, message_public, student_id, status,
           sponsorship_type, total_amount, installment_total, installment_paid, next_due_day)
          VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, 0, ?)`,
    args: [
      name.trim(), phone.trim(), email.trim(),
      message?.trim() || null, messagePublic ? 1 : 0, studentId,
      sponsorshipType, totalAmount, installTotal, nextDueDay,
    ],
  });

  // 입금 대기 중이라도 신청 즉시 학생을 매칭해 통계에 반영한다.
  // 중복 신청 차단 효과도 있다(다른 후원자가 같은 학생을 신청할 때 'COMPLETED' 체크에 걸림).
  // 운영자가 admin에서 CANCELED 처리하면 학생은 자동으로 WAITING으로 되돌려진다.
  const newSponsorId = Number(ins.lastInsertRowid);
  await db.execute({
    sql: "UPDATE students SET status = 'COMPLETED', sponsor_id = ? WHERE id = ?",
    args: [newSponsorId, studentId],
  });

  // 첫 회 안내 SMS + Email (분할이든 일시든 신청 즉시 입금 안내)
  const notify = await sendSponsorNotifications({
    sponsorName: name.trim(),
    studentAlias: String(student.alias_name),
    studentGrade: gradeToLabel(student.grade as Grade),
    studentDream: student.dream_summary as string | null,
    toPhone: phone.trim(),
    toEmail: email.trim(),
    sponsorshipType,
  });

  // 발송 결과를 notifications 테이블에 기록 → admin 발송 이력에서 일시·분할 모두 노출
  const firstInstallment = isInstallment ? 1 : null;   // 일시는 null, 분할은 1회차
  await db.execute({
    sql: `INSERT INTO notifications
          (sponsor_id, channel, recipient, subject, body, installment_number, status, error_message)
          VALUES (?, 'SMS', ?, ?, ?, ?, ?, ?)`,
    args: [
      newSponsorId, phone.trim(),
      notify.emailSubject || '결연 신청 안내',
      notify.smsBody || '',
      firstInstallment,
      notify.sms.sent ? 'SENT' : 'FAILED',
      notify.sms.error ?? null,
    ],
  });
  await db.execute({
    sql: `INSERT INTO notifications
          (sponsor_id, channel, recipient, subject, body, installment_number, status, error_message)
          VALUES (?, 'EMAIL', ?, ?, ?, ?, ?, ?)`,
    args: [
      newSponsorId, email.trim(),
      notify.emailSubject || '결연 신청 안내',
      notify.smsBody || '',
      firstInstallment,
      notify.email.sent ? 'SENT' : 'FAILED',
      notify.email.error ?? null,
    ],
  });
  // 분할 후원이면 last_notified_at 갱신 (오늘 cron이 같은 회차 중복 발송 안 하도록)
  if (isInstallment) {
    await db.execute({
      sql: "UPDATE sponsors SET last_notified_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [newSponsorId],
    });
  }

  return NextResponse.json({
    success: true,
    sponsorshipType,
    totalAmount,
    installmentTotal: installTotal,
    nextDueDay,
    notifications: { sms: notify.sms.sent, email: notify.email.sent },
  });
}
