import AdminShell from '@/components/AdminShell';
import SponsorsTable from './SponsorsTable';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface SponsorRow {
  id: number; name: string; phone: string; email: string;
  message: string | null; message_public: number; status: string;
  created_at: string; paid_at: string | null;
  student_id: number; student_alias: string; student_grade: string;
}

async function listSponsors(): Promise<SponsorRow[]> {
  const db = getDb();
  const res = await db.execute(`
    SELECT s.id, s.name, s.phone, s.email, s.message, s.message_public,
           s.status, s.created_at, s.paid_at, s.student_id,
           st.alias_name as student_alias, st.grade as student_grade
    FROM sponsors s
    JOIN students st ON st.id = s.student_id
    ORDER BY s.created_at DESC
  `);
  return res.rows.map(r => ({
    id: Number(r.id),
    name: String(r.name),
    phone: String(r.phone),
    email: String(r.email),
    message: r.message as string | null,
    message_public: Number(r.message_public),
    status: String(r.status),
    created_at: String(r.created_at),
    paid_at: r.paid_at as string | null,
    student_id: Number(r.student_id),
    student_alias: String(r.student_alias),
    student_grade: String(r.student_grade),
  }));
}

export default async function AdminSponsorsPage() {
  const sponsors = await listSponsors();
  return (
    <AdminShell>
      <div className="p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">결연 신청 관리</h1>
          <p className="text-ink-500">전체 {sponsors.length}건 · 입금 확인 후 상태를 변경하세요.</p>
        </div>
        <SponsorsTable sponsors={sponsors} />
      </div>
    </AdminShell>
  );
}
