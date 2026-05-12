'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

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

interface KPI {
  installmentTotal: number;
  installmentDone: number;
  sent30d: number;
  failed30d: number;
}

export default function NotificationsAdmin({
  installmentSponsors,
  notifications,
  kpi,
}: {
  installmentSponsors: InstallmentSponsor[];
  notifications: NotificationRow[];
  kpi: KPI;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function sendNow(sponsorId: number, label: string) {
    if (!confirm(`${label}님에게 지금 즉시 분할 안내를 다시 발송할까요?`)) return;
    setBusyId(sponsorId);
    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '발송 실패');
      setFlash(`✓ ${label} — SMS:${data.sms ? '성공' : '실패'} / 이메일:${data.email ? '성공' : '실패'}`);
      startTransition(() => router.refresh());
    } catch (e) {
      setFlash(`❌ ${e instanceof Error ? e.message : '발송 실패'}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold mb-1">발송 관리</h1>
        <p className="text-ink-500">분할 후원자 자동 안내 + 발송 이력 관리</p>
      </div>

      {flash && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
          {flash}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Kpi label="분할 후원 sponsorship" value={kpi.installmentTotal} accent="blue" />
        <Kpi label="10회 완납 완료" value={kpi.installmentDone} accent="blue" />
        <Kpi label="최근 30일 발송 성공" value={kpi.sent30d} accent="amber" />
        <Kpi label="최근 30일 발송 실패" value={kpi.failed30d} accent="red" />
      </div>

      {/* 분할 후원자 목록 */}
      <section className="bg-white rounded-2xl border border-ink-100 shadow-soft mb-8">
        <div className="px-6 py-4 border-b border-ink-100 flex justify-between items-center">
          <h2 className="font-extrabold text-lg">분할 후원자 ({installmentSponsors.length}명)</h2>
          <span className="text-xs text-ink-500">Cron: 매일 09:00 KST, 신청한 날짜에 자동 발송</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-left text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">후원자</th>
                <th className="px-6 py-3 font-semibold">결연 학생</th>
                <th className="px-6 py-3 font-semibold">진행 회차</th>
                <th className="px-6 py-3 font-semibold">매월 안내일</th>
                <th className="px-6 py-3 font-semibold">최근 발송</th>
                <th className="px-6 py-3 font-semibold text-right">동작</th>
              </tr>
            </thead>
            <tbody>
              {installmentSponsors.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-ink-500">
                  아직 분할 후원 신청자가 없습니다.
                </td></tr>
              ) : installmentSponsors.map(s => {
                const pct = Math.round((s.installment_paid / s.installment_total) * 100);
                const done = s.installment_paid >= s.installment_total;
                return (
                  <tr key={s.id} className="border-t border-ink-100">
                    <td className="px-6 py-3 font-semibold">{s.name_masked}</td>
                    <td className="px-6 py-3">{s.student_alias}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className={done ? 'text-blue-700 font-bold' : 'font-semibold'}>
                          {s.installment_paid} / {s.installment_total}회
                        </span>
                        <div className="flex-1 max-w-[120px] h-1.5 bg-ink-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-ink-700">
                      {s.next_due_day == null ? '—' : `매월 ${s.next_due_day}일`}
                    </td>
                    <td className="px-6 py-3 text-ink-500 text-xs">
                      {s.last_notified_at
                        ? new Date(s.last_notified_at).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
                        : '없음'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => sendNow(s.id, s.name_masked)}
                        disabled={busyId === s.id || done || pending}
                        className="text-xs font-bold bg-blue-700 hover:bg-blue-900 disabled:bg-ink-200 disabled:text-ink-500 text-white px-3 py-1.5 rounded-full transition-colors">
                        {busyId === s.id ? '발송 중…' : done ? '완료' : '지금 발송'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 발송 이력 */}
      <section className="bg-white rounded-2xl border border-ink-100 shadow-soft">
        <div className="px-6 py-4 border-b border-ink-100">
          <h2 className="font-extrabold text-lg">발송 이력 (최근 100건)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-left text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">시각 (KST)</th>
                <th className="px-6 py-3 font-semibold">후원자</th>
                <th className="px-6 py-3 font-semibold">채널</th>
                <th className="px-6 py-3 font-semibold">회차</th>
                <th className="px-6 py-3 font-semibold">수신자</th>
                <th className="px-6 py-3 font-semibold">결과</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-ink-500">
                  아직 발송된 안내가 없습니다.
                </td></tr>
              ) : notifications.map(n => (
                <tr key={n.id} className="border-t border-ink-100">
                  <td className="px-6 py-3 text-ink-500 text-xs whitespace-nowrap">
                    {new Date(n.sent_at).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-3 font-semibold">{n.sponsor_name_masked}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      n.channel === 'SMS' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}>{n.channel}</span>
                  </td>
                  <td className="px-6 py-3 text-ink-700">
                    {n.installment_number != null ? `${n.installment_number}회차` : '—'}
                  </td>
                  <td className="px-6 py-3 text-ink-500 text-xs">{n.recipient}</td>
                  <td className="px-6 py-3">
                    {n.status === 'SENT' ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">✓ 성공</span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700" title={n.error_message ?? ''}>
                        ✗ 실패
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent: 'blue' | 'amber' | 'red' }) {
  const color = accent === 'blue' ? 'text-blue-700' : accent === 'amber' ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="bg-white rounded-2xl p-6 border border-ink-100 shadow-soft">
      <div className="text-xs text-ink-500 font-semibold mb-2">{label}</div>
      <div className={`font-display text-3xl font-extrabold ${color}`}>{value}</div>
    </div>
  );
}
