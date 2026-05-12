import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendInstallmentReminder } from '@/lib/notifications';
import { gradeToLabel, type Grade } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 매일 KST 09:00 (UTC 00:00) Vercel cron에서 호출.
 * 분할 후원자 중 next_due_day == today.getDate() && installment_paid < installment_total
 * 인 모든 sponsorship에 대해 다음 회차 입금 안내 SMS + Email 발송.
 *
 * - 같은 sponsor가 N명의 학생을 후원하면 N건의 sponsorship 행이 각각 발송됨.
 * - last_notified_at 으로 같은 회차가 같은 날 두 번 발송되지 않도록 가드.
 * - 모든 발송 결과는 notifications 테이블에 SENT/FAILED로 기록.
 *
 * 보안: Vercel Cron은 자동으로 인증 헤더(x-vercel-cron-signature) 또는
 *       CRON_SECRET 환경변수 기반 Bearer를 붙임. 둘 다 없으면 외부 호출 차단.
 */
export async function GET(request: Request) {
  // ---- Auth: Vercel Cron 호출만 허용 ----
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const vercelCron = request.headers.get('x-vercel-cron');
  const isLocalDev = process.env.NODE_ENV !== 'production';
  const authed =
    isLocalDev ||
    vercelCron === '1' ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  // KST 기준 오늘 날짜 (UTC + 9)
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 3600 * 1000);
  const todayDay = kstNow.getUTCDate();
  const todayKstISO = kstNow.toISOString().slice(0, 10); // 'YYYY-MM-DD'

  // 분할 후원자 중 오늘이 due day인 후원 + 미완료 회차 + 오늘 아직 발송 안 함
  const due = await db.execute({
    sql: `SELECT s.id, s.name, s.phone, s.email,
                 s.installment_total, s.installment_paid, s.last_notified_at,
                 st.alias_name, st.grade, st.dream_summary
          FROM sponsors s
          JOIN students st ON st.id = s.student_id
          WHERE s.sponsorship_type = 'INSTALLMENT'
            AND s.next_due_day = ?
            AND s.installment_paid < s.installment_total
            AND s.status != 'CANCELED'
            AND (s.last_notified_at IS NULL
                 OR substr(s.last_notified_at, 1, 10) < ?)`,
    args: [todayDay, todayKstISO],
  });

  const summary = { total: due.rows.length, sent_sms: 0, sent_email: 0, failed: 0 };

  for (const r of due.rows) {
    const sponsorId = Number(r.id);
    const upcomingInstallment = Number(r.installment_paid) + 1;

    const notify = await sendInstallmentReminder({
      sponsorName: String(r.name),
      studentAlias: String(r.alias_name),
      studentGrade: gradeToLabel(r.grade as Grade),
      studentDream: r.dream_summary as string | null,
      sponsorshipType: 'INSTALLMENT',
      installmentNumber: upcomingInstallment,
      installmentTotal: Number(r.installment_total),
      toPhone: String(r.phone),
      toEmail: String(r.email || ''),
    });

    // notifications 로그 기록 (SMS + Email 각각)
    await db.execute({
      sql: `INSERT INTO notifications
            (sponsor_id, channel, recipient, subject, body, installment_number, status, error_message)
            VALUES (?, 'SMS', ?, ?, ?, ?, ?, ?)`,
      args: [
        sponsorId,
        String(r.phone),
        notify.emailSubject || '분할 입금 안내',
        notify.smsBody || '',
        upcomingInstallment,
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
          sponsorId,
          String(r.email),
          notify.emailSubject || '분할 입금 안내',
          notify.smsBody || '',
          upcomingInstallment,
          notify.email.sent ? 'SENT' : 'FAILED',
          notify.email.error ?? null,
        ],
      });
    }

    // last_notified_at 갱신 (오늘 KST)
    await db.execute({
      sql: "UPDATE sponsors SET last_notified_at = ? WHERE id = ?",
      args: [kstNow.toISOString(), sponsorId],
    });

    if (notify.sms.sent) summary.sent_sms++;
    if (notify.email.sent) summary.sent_email++;
    if (!notify.sms.sent && !notify.email.sent) summary.failed++;
  }

  return NextResponse.json({
    success: true,
    date_kst: todayKstISO,
    due_day: todayDay,
    ...summary,
  });
}
