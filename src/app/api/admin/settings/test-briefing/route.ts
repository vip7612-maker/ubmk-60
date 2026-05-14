import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendAdminBriefing } from '@/lib/notifications';
import type { BriefingApplicantGroup } from '@/lib/templates';

export const runtime = 'nodejs';

/**
 * POST /api/admin/settings/test-briefing
 *
 * 현재 등록된 수신자에게 즉시 테스트 브리핑을 전송한다.
 * (Cron과 동일한 로직, 인증만 관리자 세션으로 처리)
 */
export async function POST() {
  const db = getDb();

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

  // 후원자별(name+phone) 그룹화 — cron과 동일 로직
  const groupSql = (where: string) => `
    SELECT name, phone,
           COUNT(*) AS cnt,
           SUM(CASE WHEN sponsorship_type='ONETIME'     THEN 1 ELSE 0 END) AS ot,
           SUM(CASE WHEN sponsorship_type='INSTALLMENT' THEN 1 ELSE 0 END) AS inst,
           MIN(created_at) AS first_at
    FROM sponsors
    WHERE status IN ('PENDING','PAID') ${where}
    GROUP BY name, phone
    ORDER BY first_at ASC
  `;
  const [todayRes, totalRes] = await Promise.all([
    db.execute({ sql: groupSql('AND created_at BETWEEN ? AND ?'), args: [startIso, endIso] }),
    db.execute(groupSql('')),
  ]);

  const toGroup = (r: Record<string, unknown>): BriefingApplicantGroup => {
    const ot = Number(r.ot), inst = Number(r.inst);
    return {
      name: String(r.name),
      count: Number(r.cnt),
      type_label: ot && inst ? '혼합' : (ot ? '일시' : '분할'),
      first_created_at: String(r.first_at),
    };
  };
  const todayGroups = todayRes.rows.map(r => toGroup(r as Record<string, unknown>));
  const totalGroups = totalRes.rows.map(r => toGroup(r as Record<string, unknown>));

  const adminUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ubmk-70.vercel.app')) +
    '/admin/sponsors';

  try {
    const result = await sendAdminBriefing({ todayGroups, totalGroups, adminUrl });
    return NextResponse.json({
      ok: true,
      ...result,
      todayCount: todayGroups.length,
      totalCount: totalGroups.length,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'send failed' },
      { status: 500 }
    );
  }
}
