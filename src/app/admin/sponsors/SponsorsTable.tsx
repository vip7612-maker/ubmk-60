'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface SponsorRow {
  id: number; name: string; phone: string; email: string;
  message: string | null; message_public: number; status: string;
  created_at: string; paid_at: string | null;
  student_id: number; student_alias: string; student_grade: string;
}

type FilterTab = 'all' | 'PENDING' | 'PAID' | 'CANCELED';

export default function SponsorsTable({ sponsors }: { sponsors: SponsorRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const filtered = sponsors.filter(s => {
    if (tab !== 'all' && s.status !== tab) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return s.name.toLowerCase().includes(q) ||
             s.phone.includes(q) ||
             s.email.toLowerCase().includes(q) ||
             s.student_alias.toLowerCase().includes(q);
    }
    return true;
  });

  async function updateStatus(id: number, status: string) {
    if (!confirm(`상태를 "${statusLabel(status)}"로 변경하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/sponsors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { alert('상태 변경 실패'); return; }
    startTransition(() => router.refresh());
  }

  async function togglePublic(id: number, current: boolean) {
    const res = await fetch(`/api/admin/sponsors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messagePublic: !current }),
    });
    if (!res.ok) { alert('변경 실패'); return; }
    startTransition(() => router.refresh());
  }

  function exportCSV() {
    const headers = ['ID','이름','전화','이메일','학생','학년','상태','신청일','메시지'];
    const rows = filtered.map(s => [s.id, s.name, s.phone, s.email, s.student_alias, s.student_grade, s.status, s.created_at, s.message || '']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sponsors-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-ink-100 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100 flex items-center gap-4 flex-wrap">
          <div className="flex gap-1 bg-ink-50 p-1 rounded-full">
            {(['all','PENDING','PAID','CANCELED'] as FilterTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                        tab === t ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500'
                      }`}>
                {t === 'all' ? `전체 (${sponsors.length})` :
                 `${statusLabel(t)} (${sponsors.filter(s => s.status === t).length})`}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="이름·전화·이메일·학생명 검색"
                 className="flex-1 min-w-[200px] px-4 py-2 border border-ink-300 rounded-full text-sm" />
          <button onClick={exportCSV}
                  className="bg-ink-900 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors">
            📥 CSV 내보내기
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">신청일</th>
                <th className="px-4 py-3 text-left font-semibold">후원자</th>
                <th className="px-4 py-3 text-left font-semibold">연락처</th>
                <th className="px-4 py-3 text-left font-semibold">결연 학생</th>
                <th className="px-4 py-3 text-left font-semibold">메시지</th>
                <th className="px-4 py-3 text-center font-semibold">공개</th>
                <th className="px-4 py-3 text-center font-semibold">상태</th>
                <th className="px-4 py-3 text-center font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-ink-500">결과가 없습니다.</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50/40">
                  <td className="px-4 py-3 text-ink-500 text-xs whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString('ko-KR')}<br />
                    {new Date(s.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-bold">{s.name}</td>
                  <td className="px-4 py-3 text-xs">
                    📞 {s.phone}<br />
                    ✉️ {s.email}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/students/${s.student_id}`} target="_blank" className="text-blue-700 hover:underline font-semibold">
                      {s.student_alias}
                    </a>
                    <div className="text-xs text-ink-500">{s.student_grade}</div>
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[260px] text-ink-700">
                    {s.message ? (s.message.length > 60 ? s.message.slice(0, 60) + '…' : s.message) : <span className="text-ink-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublic(s.id, !!s.message_public)} disabled={pending}
                            className={`text-xl ${s.message_public ? '' : 'opacity-30'}`}
                            title={s.message_public ? '공개 중' : '비공개'}>
                      {s.message_public ? '👁️' : '🔒'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)} disabled={pending}
                            className="px-3 py-1.5 border border-ink-300 rounded-lg text-xs font-bold cursor-pointer">
                      <option value="PENDING">입금 대기</option>
                      <option value="PAID">입금 완료</option>
                      <option value="CANCELED">취소</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
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

function statusLabel(s: string): string {
  return ({ PENDING: '입금 대기', PAID: '입금 완료', CANCELED: '취소' } as Record<string, string>)[s] || s;
}
