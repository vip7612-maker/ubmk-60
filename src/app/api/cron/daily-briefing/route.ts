import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendAdminBriefing } from '@/lib/notifications';
import type { BriefingApplicantGroup } from '@/lib/templates';

export const runtime = 'nodejs';
// Cron only — no caching
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/daily-briefing
 *
 * Vercel Cron triggers this endpoint daily at 09:00 UTC (= 18:00 KST).
 * Schedule defined in /vercel.json.
 *
 * Auth (in production):
 *   - Vercel sends `Authorization: Bearer <CRON_SECRET>` header.
 *   - The middleware ALSO exempts /api/cron/* but we double-check here.
 *
 * To trigger manually (e.g. for testing):
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *        https://your-app.vercel.app/api/cron/daily-briefing
 */
export async function GET(req: Request) {
  // ---- Auth ----
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const isVercelCron = req.headers.get('x-vercel-cron') !== null;
  if (cronSecret) {
    const ok = isVercelCron || auth === `Bearer ${cronSecret}`;
    if (!ok) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  // ---- Determine briefing window (KST) ----
  // 브리핑은 매일 KST 18:00에 발송되며, 직전 마감(어제 18:00) ~ 현재 마감(오늘 18:00)
  // 신청자를 '금일 신청자'로 본다. 이렇게 해야 KST 18:00 이후에 신청한 사람도
  // 다음날 브리핑에 누락 없이 잡힌다.
  const now = new Date();
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffsetMs);
  const kstY = kstNow.getUTCFullYear();
  const kstM = kstNow.getUTCMonth();
  const kstD = kstNow.getUTCDate();
  // 오늘 KST 18:00 의 UTC 인스턴트 (마감)
  const endUtc   = new Date(Date.UTC(kstY, kstM, kstD, 18, 0, 0) - kstOffsetMs);
  // 어제 KST 18:00 의 UTC 인스턴트 (직전 마감)
  const startUtc = new Date(endUtc.getTime() - 24 * 60 * 60 * 1000);
  const startIso = startUtc.toISOString().replace('T', ' ').slice(0, 19);
  const endIso   = endUtc.toISOString().replace('T', ' ').slice(0, 19);

  // ---- Query DB ----
  const db = getDb();

  // 후원자별(name+phone) 그룹화 — 한 사람이 N명 후원하면 1줄 (N명, 일시/분할/혼합)
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
  const [todayRes, totalRes, completedRes] = await Promise.all([
    db.execute({ sql: groupSql('AND created_at BETWEEN ? AND ?'), args: [startIso, endIso] }),
    db.execute(groupSql('')),
    db.execute("SELECT COUNT(*) AS c FROM students WHERE status = 'COMPLETED'"),
  ]);
  const completedStudents = Number(completedRes.rows[0]?.c ?? 0);

  const toGroup = (r: Record<string, unknown>): BriefingApplicantGroup => {
    const ot = Number(r.ot), inst = Number(r.inst);
    return {
      name: String(r.name),
      phone: String(r.phone),
      count: Number(r.cnt),
      type_label: ot && inst ? '혼합' : (ot ? '일시' : '분할'),
      first_created_at: String(r.first_at),
    };
  };

  const todayGroups = todayRes.rows.map(r => toGroup(r as Record<string, unknown>));
  const totalGroups = totalRes.rows.map(r => toGroup(r as Record<string, unknown>));

  // ---- Build admin URL ----
  const adminUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ubmk-60.vercel.app') +
    '/admin/sponsors';

  // ---- Send SMS ----
  try {
    const result = await sendAdminBriefing({
      todayGroups,
      totalGroups,
      completedStudents,
      adminUrl,
    });
    return NextResponse.json({
      ok: true,
      kstDate: `${kstY}-${String(kstM + 1).padStart(2, '0')}-${String(kstD).padStart(2, '0')}`,
      todayCount: todayGroups.length,
      totalCount: totalGroups.length,
      completedStudents,
      ...result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'briefing send failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
