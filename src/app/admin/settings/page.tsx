import AdminShell from '@/components/AdminShell';
import BriefingRecipientsAdmin from './BriefingRecipientsAdmin';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RecipientRow {
  id: number;
  name: string;
  phone: string;
  role: string | null;
  enabled: boolean;
}

async function listRecipients(): Promise<RecipientRow[]> {
  const db = getDb();
  const res = await db.execute(
    'SELECT id, name, phone, role, enabled FROM briefing_recipients ORDER BY id ASC'
  );
  return res.rows.map(r => ({
    id: Number(r.id),
    name: String(r.name),
    phone: String(r.phone),
    role: r.role as string | null,
    enabled: Number(r.enabled) === 1,
  }));
}

export default async function AdminSettingsPage() {
  const recipients = await listRecipients();

  return (
    <AdminShell>
      <div className="p-10 max-w-[1000px]">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">⚙️ 설정</h1>
          <p className="text-ink-500">알림 발송 및 시스템 운영 설정을 관리합니다.</p>
        </div>

        <BriefingRecipientsAdmin initial={recipients} />

        <div className="mt-12 bg-white rounded-2xl border border-ink-100 shadow-soft p-7">
          <h2 className="text-xl font-extrabold mb-3">📅 자동 발송 일정</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-ink-100">
                <td className="py-3 text-ink-500 font-semibold w-1/3">일일 신청자 브리핑</td>
                <td className="py-3"><strong>매일 18:00 KST</strong> · <span className="text-ink-500">Vercel Cron 자동 실행</span></td>
              </tr>
              <tr>
                <td className="py-3 text-ink-500 font-semibold">분할 후원 회차 안내</td>
                <td className="py-3"><strong>매일 09:00 KST</strong> · <span className="text-ink-500">해당 날짜 회차자에게만 발송</span></td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-ink-500 mt-4">
            * 스케줄은 <code className="bg-ink-100 px-1.5 py-0.5 rounded">vercel.json</code>의 cron 설정으로 관리됩니다.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
