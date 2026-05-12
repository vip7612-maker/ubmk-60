import AdminShell from '@/components/AdminShell';
import NotificationsAdmin from './NotificationsAdmin';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata = { title: '발송 관리 · 크롬북 한 대, 공정한 교육기회' };

interface InstallmentSponsor {
  id: number;
  name_masked: string;
  phone: string;
  email: string;
  student_alias: string;
  installment_total: number;
  installment_paid: number;
  next_due_day: number | null;
  last_notified_at: string | null;
}

interface NotificationRow {
  id: number;
  sponsor_id: number;
  sponsor_name_masked: string;
  channel: 'SMS' | 'EMAIL';
  recipient: string;
  installment_number: number | null;
  status: 'SENT' | 'FAILED';
  error_message: string | null;
  sent_at: string;
}

function maskKoreanName(name: string): string {
  const len = name.length;
  if (len <= 1) return name;
  if (len === 2) return name[0] + '*';
  return name[0] + '*'.repeat(len - 2) + name[len - 1];
}

async function loadData() {
  const db = getDb();

  // 분할 후원자 목록 (한 사람이 여러 학생을 후원해도 모두 표시)
  const inst = await db.execute(`
    SELECT s.id, s.name, s.phone, s.email,
           s.installment_total, s.installment_paid, s.next_due_day, s.last_notified_at,
           st.alias_name
    FROM sponsors s
    JOIN students st ON st.id = s.student_id
    WHERE s.sponsorship_type = 'INSTALLMENT' AND s.status != 'CANCELED'
    ORDER BY s.next_due_day, s.created_at DESC
  `);

  const installmentSponsors: InstallmentSponsor[] = inst.rows.map(r => ({
    id: Number(r.id),
    name_masked: maskKoreanName(String(r.name)),
    phone: String(r.phone),
    email: String(r.email || ''),
    student_alias: String(r.alias_name),
    installment_total: Number(r.installment_total),
    installment_paid: Number(r.installment_paid),
    next_due_day: r.next_due_day == null ? null : Number(r.next_due_day),
    last_notified_at: r.last_notified_at as string | null,
  }));

  // 발송 이력 (최근 100건)
  const log = await db.execute(`
    SELECT n.id, n.sponsor_id, n.channel, n.recipient,
           n.installment_number, n.status, n.error_message, n.sent_at,
           s.name AS sponsor_name
    FROM notifications n
    LEFT JOIN sponsors s ON s.id = n.sponsor_id
    ORDER BY n.sent_at DESC
    LIMIT 100
  `);
  const notifications: NotificationRow[] = log.rows.map(r => ({
    id: Number(r.id),
    sponsor_id: Number(r.sponsor_id),
    sponsor_name_masked: r.sponsor_name ? maskKoreanName(String(r.sponsor_name)) : '(삭제됨)',
    channel: String(r.channel) as 'SMS' | 'EMAIL',
    recipient: String(r.recipient).replace(/(.{3}).+(.{4})/, '$1***$2'),
    installment_number: r.installment_number == null ? null : Number(r.installment_number),
    status: String(r.status) as 'SENT' | 'FAILED',
    error_message: r.error_message as string | null,
    sent_at: String(r.sent_at),
  }));

  // KPI 집계
  const totals = await db.execute(`
    SELECT
      SUM(CASE WHEN sponsorship_type = 'INSTALLMENT' THEN 1 ELSE 0 END) AS install_total,
      SUM(CASE WHEN sponsorship_type = 'INSTALLMENT' AND installment_paid >= installment_total THEN 1 ELSE 0 END) AS install_done
    FROM sponsors
  `);
  const sentSum = await db.execute(`
    SELECT COUNT(*) as c FROM notifications
    WHERE status='SENT' AND sent_at >= datetime('now', '-30 days')
  `);
  const failedSum = await db.execute(`
    SELECT COUNT(*) as c FROM notifications
    WHERE status='FAILED' AND sent_at >= datetime('now', '-30 days')
  `);

  return {
    installmentSponsors,
    notifications,
    kpi: {
      installmentTotal: Number(totals.rows[0]?.install_total ?? 0),
      installmentDone: Number(totals.rows[0]?.install_done ?? 0),
      sent30d: Number(sentSum.rows[0]?.c ?? 0),
      failed30d: Number(failedSum.rows[0]?.c ?? 0),
    },
  };
}

export default async function NotificationsPage() {
  const data = await loadData();
  return (
    <AdminShell>
      <NotificationsAdmin {...data} />
    </AdminShell>
  );
}
