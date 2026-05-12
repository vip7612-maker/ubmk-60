import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendAdminBriefing } from '@/lib/notifications';
import type { BriefingApplicant } from '@/lib/templates';
import { gradeToLabel, type Grade } from '@/lib/types';

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

  // ---- Determine "today" window in KST (UTC+9) ----
  // We compute the KST calendar date based on the current UTC instant,
  // then find the UTC instants for 00:00 and 24:00 KST.
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

  // ---- Query DB ----
  const db = getDb();

  const [todayRes, totalRes] = await Promise.all([
    db.execute({
      sql: `
        SELECT s.name, s.created_at, st.alias_name, st.grade
        FROM sponsors s
        JOIN students st ON st.id = s.student_id
        WHERE s.created_at BETWEEN ? AND ?
          AND s.status IN ('PENDING','PAID')
        ORDER BY s.created_at ASC
      `,
      args: [startIso, endIso],
    }),
    db.execute(`
      SELECT s.name, s.created_at, st.alias_name, st.grade
      FROM sponsors s
      JOIN students st ON st.id = s.student_id
      WHERE s.status IN ('PENDING','PAID')
      ORDER BY s.created_at ASC
    `),
  ]);

  const toApplicant = (r: Record<string, unknown>): BriefingApplicant => ({
    name: String(r.name),
    student_alias: String(r.alias_name),
    student_grade: gradeToLabel(r.grade as Grade),
    created_at: String(r.created_at),
  });

  const todayApplicants = todayRes.rows.map(r => toApplicant(r as Record<string, unknown>));
  const totalApplicants = totalRes.rows.map(r => toApplicant(r as Record<string, unknown>));

  // ---- Build admin URL ----
  const adminUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ubmk-60.vercel.app') +
    '/admin/sponsors';

  // ---- Send SMS ----
  try {
    const result = await sendAdminBriefing({
      todayApplicants,
      totalApplicants,
      adminUrl,
    });
    return NextResponse.json({
      ok: true,
      kstDate: `${kstY}-${String(kstM + 1).padStart(2, '0')}-${String(kstD).padStart(2, '0')}`,
      todayCount: todayApplicants.length,
      totalCount: totalApplicants.length,
      ...result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'briefing send failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
