import AdminShell from '@/components/AdminShell';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const db = getDb();
  const [studentStats, sponsorStats, recent] = await Promise.all([
    db.execute('SELECT status, COUNT(*) as c FROM students GROUP BY status'),
    db.execute('SELECT status, COUNT(*) as c FROM sponsors GROUP BY status'),
    db.execute(`SELECT s.id, s.name, s.status, s.created_at, st.alias_name, st.grade
                FROM sponsors s JOIN students st ON st.id = s.student_id
                ORDER BY s.created_at DESC LIMIT 8`),
  ]);

  const studentByStatus: Record<string, number> = {};
  studentStats.rows.forEach(r => { studentByStatus[String(r.status)] = Number(r.c); });
  const sponsorByStatus: Record<string, number> = {};
  sponsorStats.rows.forEach(r => { sponsorByStatus[String(r.status)] = Number(r.c); });

  return {
    totalStudents: (studentByStatus.WAITING || 0) + (studentByStatus.COMPLETED || 0),
    completed: studentByStatus.COMPLETED || 0,
    waiting: studentByStatus.WAITING || 0,
    pendingSponsors: sponsorByStatus.PENDING || 0,
    paidSponsors: sponsorByStatus.PAID || 0,
    canceledSponsors: sponsorByStatus.CANCELED || 0,
    recentSponsors: recent.rows.map(r => ({
      id: Number(r.id),
      name: String(r.name),
      status: String(r.status),
      created_at: String(r.created_at),
      alias_name: String(r.alias_name),
      grade: String(r.grade),
    })),
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const percent = Math.round((stats.completed / Math.max(60, stats.totalStudents)) * 100);

  return (
    <AdminShell>
      <div className="p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">대시보드</h1>
          <p className="text-ink-500">UBMK 60 결연 후원 프로젝트 현황</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-7 border border-ink-100 shadow-soft mb-8">
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <div className="font-display font-extrabold text-2xl">
                <strong className="text-blue-700 text-3xl mr-1">{stats.completed}</strong>
                / {Math.max(60, stats.totalStudents)}대 결연 완료
              </div>
              <div className="text-ink-500 text-sm mt-1">목표 60대 / 학생당 30만원</div>
            </div>
            <div className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-bold">{percent}%</div>
          </div>
          <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #2563eb, #f59e0b)' }} />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="결연 대기 학생" value={stats.waiting} accent="amber" />
          <StatCard label="결연 완료 학생" value={stats.completed} accent="blue" />
          <StatCard label="입금 대기" value={stats.pendingSponsors} accent="amber" hint="후원자 전화 필요" />
          <StatCard label="입금 완료" value={stats.paidSponsors} accent="blue" />
        </div>

        {/* Recent applications */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-soft">
          <div className="px-6 py-4 border-b border-ink-100 flex justify-between items-center">
            <h2 className="font-extrabold text-lg">최근 결연 신청</h2>
            <a href="/admin/sponsors" className="text-sm font-bold text-blue-700">전체 보기 →</a>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-left text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">후원자</th>
                <th className="px-6 py-3 font-semibold">결연 학생</th>
                <th className="px-6 py-3 font-semibold">상태</th>
                <th className="px-6 py-3 font-semibold">신청일</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSponsors.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-ink-500">아직 결연 신청이 없습니다.</td></tr>
              ) : stats.recentSponsors.map(r => (
                <tr key={r.id} className="border-t border-ink-100">
                  <td className="px-6 py-3 font-semibold">{r.name}</td>
                  <td className="px-6 py-3">{r.alias_name} <span className="text-ink-500">({r.grade})</span></td>
                  <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-3 text-ink-500">{new Date(r.created_at).toLocaleString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, accent, hint }: { label: string; value: number; accent: 'blue' | 'amber'; hint?: string }) {
  const colorClass = accent === 'blue' ? 'text-blue-700' : 'text-amber-600';
  return (
    <div className="bg-white rounded-2xl p-6 border border-ink-100 shadow-soft">
      <div className="text-xs text-ink-500 font-semibold mb-2">{label}</div>
      <div className={`font-display text-4xl font-extrabold ${colorClass}`}>{value}</div>
      {hint && <div className="text-xs text-ink-500 mt-2">{hint}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:  { label: '입금 대기',  cls: 'bg-amber-100 text-amber-600' },
    PAID:     { label: '입금 완료',  cls: 'bg-blue-50 text-blue-700' },
    CANCELED: { label: '취소',       cls: 'bg-ink-100 text-ink-500' },
  };
  const m = map[status] || { label: status, cls: 'bg-ink-100' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${m.cls}`}>{m.label}</span>;
}
