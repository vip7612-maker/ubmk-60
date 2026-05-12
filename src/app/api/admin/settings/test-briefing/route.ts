import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendAdminBriefing } from '@/lib/notifications';
import type { BriefingApplicant } from '@/lib/templates';
import { gradeToLabel, type Grade } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * POST /api/admin/settings/test-briefing
 *
 * 현재 등록된 수신자에게 즉시 테스트 브리핑을 전송한다.
 * (Cron과 동일한 로직, 인증만 관리자 세션으로 처리)
 */
export async function POST() {
  const db = getDb();
  const totalRes = await db.execute(`
    SELECT s.name, s.created_at, st.alias_name, st.grade
    FROM sponsors s
    JOIN students st ON st.id = s.student_id
    WHERE s.status IN ('PENDING','PAID')
    ORDER BY s.created_at ASC
  `);

  // KST today window
  const now = new Date();
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffsetMs);
  const kstY = kstNow.getUTCFullYear();
  const kstM = kstNow.getUTCMonth();
  const kstD = kstNow.getUTCDate();
  const startUtc = new Date(Date.UTC(kstY, kstM, kstD, 0, 0, 0) - kstOffsetMs);
  const endUtc   = new Date(Date.UTC(kstY, kstM, kstD, 23, 59, 59) - kstOffsetMs);
  const startIso = startUtc.toISOString().replace('T', ' ').slice(0, 19);
  const endIso   = endUtc.toISOString().replace('T', ' ').slice(0, 19);

  const todayRes = await db.execute({
    sql: `
      SELECT s.name, s.created_at, st.alias_name, st.grade
      FROM sponsors s
      JOIN students st ON st.id = s.student_id
      WHERE s.created_at BETWEEN ? AND ?
        AND s.status IN ('PENDING','PAID')
      ORDER BY s.created_at ASC
    `,
    args: [startIso, endIso],
  });

  const toApplicant = (r: Record<string, unknown>): BriefingApplicant => ({
    name: String(r.name),
    student_alias: String(r.alias_name),
    student_grade: gradeToLabel(r.grade as Grade),
    created_at: String(r.created_at),
  });

  const todayApplicants = todayRes.rows.map(r => toApplicant(r as Record<string, unknown>));
  const totalApplicants = totalRes.rows.map(r => toApplicant(r as Record<string, unknown>));

  const adminUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ubmk-60.vercel.app')) +
    '/admin/sponsors';

  try {
    const result = await sendAdminBriefing({ todayApplicants, totalApplicants, adminUrl });
    return NextResponse.json({ ok: true, ...result, todayCount: todayApplicants.length, totalCount: totalApplicants.length });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'send failed' },
      { status: 500 }
    );
  }
}
