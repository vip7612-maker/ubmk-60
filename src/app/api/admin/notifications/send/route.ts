import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendInstallmentReminder } from '@/lib/notifications';
import { gradeToLabel, type Grade } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * 관리자 수동 발송: 특정 sponsor에게 분할 안내 즉시 발송.
 * - sponsorshipType이 INSTALLMENT인 경우만 허용
 * - last_notified_at 가드 무시 (관리자가 의도한 재발송이라 강제 진행)
 * - notifications 테이블에 SMS·Email 발송 결과 기록
 *
 * 인증: proxy.ts에서 /api/admin/* JWT 검증
 */
export async function POST(req: Request) {
  const { sponsorId } = await req.json().catch(() => ({}));
  if (!sponsorId || typeof sponsorId !== 'number') {
    return NextResponse.json({ error: 'sponsorId 누락' }, { status: 400 });
  }

  const db = getDb();
  const res = await db.execute({
    sql: `SELECT s.id, s.name, s.phone, s.email,
                 s.sponsorship_type, s.installment_total, s.installment_paid,
                 st.alias_name, st.grade, st.dream_summary
          FROM sponsors s
          JOIN students st ON st.id = s.student_id
          WHERE s.id = ?`,
    args: [sponsorId],
  });
  if (res.rows.length === 0) {
    return NextResponse.json({ error: '후원자를 찾을 수 없습니다' }, { status: 404 });
  }
  const r = res.rows[0];
  if (String(r.sponsorship_type) !== 'INSTALLMENT') {
    return NextResponse.json({ error: '분할 후원자만 발송 가능합니다' }, { status: 400 });
  }
  const paid = Number(r.installment_paid);
  const total = Number(r.installment_total);
  if (paid >= total) {
    return NextResponse.json({ error: '이미 모든 회차가 완료된 후원자입니다' }, { status: 400 });
  }
  const upcoming = paid + 1;

  const notify = await sendInstallmentReminder({
    sponsorName: String(r.name),
    studentAlias: String(r.alias_name),
    studentGrade: gradeToLabel(r.grade as Grade),
    studentDream: r.dream_summary as string | null,
    sponsorshipType: 'INSTALLMENT',
    installmentNumber: upcoming,
    installmentTotal: total,
    toPhone: String(r.phone),
    toEmail: String(r.email || ''),
  });

  await db.execute({
    sql: `INSERT INTO notifications
          (sponsor_id, channel, recipient, subject, body, installment_number, status, error_message)
          VALUES (?, 'SMS', ?, ?, ?, ?, ?, ?)`,
    args: [
      sponsorId, String(r.phone),
      notify.emailSubject || '분할 입금 안내 (수동)',
      notify.smsBody || '',
      upcoming,
      notify.sms.sent ? 'SENT' : 'FAILED',
      notify.sms.error ?? null,
    ],
  });
  if (r.email) {
    await db.execute({
      sql: `INSERT INTO notifications
            (sponsor_id, channel, recipient, subject, body, installment_number, status, error_message)
            VALUES (?, 'EMAIL', ?, ?, ?, ?, ?, ?)`,
      args: [
        sponsorId, String(r.email),
        notify.emailSubject || '분할 입금 안내 (수동)',
        notify.smsBody || '',
        upcoming,
        notify.email.sent ? 'SENT' : 'FAILED',
        notify.email.error ?? null,
      ],
    });
  }

  await db.execute({
    sql: "UPDATE sponsors SET last_notified_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [sponsorId],
  });

  return NextResponse.json({
    success: true,
    upcomingInstallment: upcoming,
    sms: notify.sms.sent,
    email: notify.email.sent,
  });
}
