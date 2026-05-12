'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Recipient {
  id: number;
  name: string;
  phone: string;
  role: string | null;
  enabled: boolean;
}

export default function BriefingRecipientsAdmin({ initial }: { initial: Recipient[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [list, setList] = useState<Recipient[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  function refresh() { startTransition(() => router.refresh()); }

  async function reload() {
    const res = await fetch('/api/admin/settings/briefing-recipients');
    const data = await res.json();
    if (res.ok) setList(data.recipients);
  }

  async function toggle(id: number, current: boolean) {
    setError(null);
    const res = await fetch(`/api/admin/settings/briefing-recipients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !current }),
    });
    if (!res.ok) { setError('변경 실패'); return; }
    await reload();
    refresh();
  }

  async function remove(id: number, name: string) {
    if (!confirm(`'${name}'을(를) 수신자 목록에서 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/settings/briefing-recipients/${id}`, { method: 'DELETE' });
    if (!res.ok) { setError('삭제 실패'); return; }
    await reload();
    refresh();
  }

  async function sendTest() {
    if (!confirm('현재 활성화된 모든 수신자에게 즉시 테스트 브리핑을 발송하시겠습니까?')) return;
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch('/api/admin/settings/test-briefing', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '발송 실패');
      setTestResult(
        `✅ ${data.sent}건 발송 완료 (실패 ${data.failed}건) — 금일 ${data.todayCount}명 / 누적 ${data.totalCount}명`
      );
    } catch (err) {
      setTestResult(`❌ ${err instanceof Error ? err.message : '발송 실패'}`);
    } finally {
      setTesting(false);
    }
  }

  const enabledCount = list.filter(r => r.enabled).length;

  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-soft">
      <div className="p-7 border-b border-ink-100">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold mb-1">📨 일일 브리핑 SMS 수신자</h2>
            <p className="text-sm text-ink-500">
              매일 저녁 6시(KST), 등록된 수신자에게 신청자 일일 브리핑이 자동 발송됩니다.<br />
              현재 <strong className="text-blue-700">{enabledCount}</strong>명 활성화 / 총 {list.length}명 등록.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={sendTest} disabled={testing || enabledCount === 0}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-ink-300 text-ink-900 px-4 py-2 rounded-full font-bold text-sm transition-colors">
              {testing ? '발송 중...' : '📤 지금 테스트 발송'}
            </button>
            <button onClick={() => setAdding(true)}
                    className="bg-blue-700 hover:bg-blue-900 text-white px-4 py-2 rounded-full font-bold text-sm transition-colors">
              + 수신자 추가
            </button>
          </div>
        </div>
        {testResult && (
          <div className={`mt-4 px-4 py-3 rounded-xl text-sm ${
            testResult.startsWith('✅') ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult}
          </div>
        )}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs text-ink-500">
            <tr>
              <th className="px-5 py-3 text-left font-semibold w-12">활성</th>
              <th className="px-5 py-3 text-left font-semibold">이름</th>
              <th className="px-5 py-3 text-left font-semibold">역할</th>
              <th className="px-5 py-3 text-left font-semibold">전화번호</th>
              <th className="px-5 py-3 text-center font-semibold w-32">관리</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && !adding && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-ink-500">
                  등록된 수신자가 없습니다. &quot;수신자 추가&quot; 버튼을 눌러 추가해 주세요.
                </td>
              </tr>
            )}
            {list.map(r => editing === r.id ? (
              <EditRow key={r.id} recipient={r}
                       onCancel={() => setEditing(null)}
                       onSaved={async () => { setEditing(null); await reload(); refresh(); }} />
            ) : (
              <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50/40">
                <td className="px-5 py-3">
                  <button onClick={() => toggle(r.id, r.enabled)}
                          className={`relative w-10 h-6 rounded-full transition-colors ${r.enabled ? 'bg-blue-700' : 'bg-ink-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      r.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`} />
                  </button>
                </td>
                <td className="px-5 py-3 font-bold">{r.name}</td>
                <td className="px-5 py-3 text-ink-700">{r.role || <span className="text-ink-300">—</span>}</td>
                <td className="px-5 py-3 font-mono text-xs">{r.phone}</td>
                <td className="px-5 py-3 text-center space-x-1">
                  <button onClick={() => setEditing(r.id)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700">
                    수정
                  </button>
                  <button onClick={() => remove(r.id, r.name)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {adding && (
              <AddRow onCancel={() => setAdding(false)}
                      onSaved={async () => { setAdding(false); await reload(); refresh(); }} />
            )}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t border-ink-100 text-xs text-ink-500">
        💡 <strong>발신번호</strong>는 <code className="bg-ink-100 px-1.5 py-0.5 rounded">01095888761</code> (Solapi 등록 번호)로 고정됩니다.
        수신자 활성화 토글로 일시 정지/재개할 수 있어요.
      </div>
    </div>
  );
}

/* ============================================
 *  Add row (inline form)
 * ============================================ */
function AddRow({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (!name.trim() || !phone.trim()) { setErr('이름과 전화번호를 입력해 주세요.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/briefing-recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, role, enabled: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '등록 실패');
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : '등록 실패');
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-t border-ink-100 bg-blue-50/30">
      <td className="px-5 py-3">
        <div className="relative w-10 h-6 rounded-full bg-blue-700">
          <span className="absolute top-0.5 translate-x-[18px] w-5 h-5 bg-white rounded-full" />
        </div>
      </td>
      <td className="px-5 py-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동"
               className="w-full px-2 py-1.5 border border-ink-300 rounded-lg text-sm" />
      </td>
      <td className="px-5 py-3">
        <input value={role} onChange={e => setRole(e.target.value)} placeholder="교장 / 운영팀 (선택)"
               className="w-full px-2 py-1.5 border border-ink-300 rounded-lg text-sm" />
      </td>
      <td className="px-5 py-3">
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678"
               className="w-full px-2 py-1.5 border border-ink-300 rounded-lg text-sm font-mono" />
        {err && <div className="text-xs text-red-700 mt-1">{err}</div>}
      </td>
      <td className="px-5 py-3 text-center space-x-1">
        <button onClick={submit} disabled={saving}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-900 text-white disabled:bg-ink-300">
          {saving ? '저장 중' : '저장'}
        </button>
        <button onClick={onCancel}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700">
          취소
        </button>
      </td>
    </tr>
  );
}

/* ============================================
 *  Edit row (inline form)
 * ============================================ */
function EditRow({ recipient, onCancel, onSaved }: {
  recipient: Recipient; onCancel: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(recipient.name);
  const [phone, setPhone] = useState(recipient.phone);
  const [role, setRole] = useState(recipient.role || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (!name.trim() || !phone.trim()) { setErr('이름과 전화번호 필수'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/briefing-recipients/${recipient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, role: role || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '저장 실패');
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-t border-ink-100 bg-amber-50/30">
      <td className="px-5 py-3 text-center">
        <span className="text-xs text-amber-600 font-bold">편집 중</span>
      </td>
      <td className="px-5 py-3">
        <input value={name} onChange={e => setName(e.target.value)}
               className="w-full px-2 py-1.5 border border-ink-300 rounded-lg text-sm" />
      </td>
      <td className="px-5 py-3">
        <input value={role} onChange={e => setRole(e.target.value)} placeholder="역할 (선택)"
               className="w-full px-2 py-1.5 border border-ink-300 rounded-lg text-sm" />
      </td>
      <td className="px-5 py-3">
        <input value={phone} onChange={e => setPhone(e.target.value)}
               className="w-full px-2 py-1.5 border border-ink-300 rounded-lg text-sm font-mono" />
        {err && <div className="text-xs text-red-700 mt-1">{err}</div>}
      </td>
      <td className="px-5 py-3 text-center space-x-1">
        <button onClick={submit} disabled={saving}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-900 text-white disabled:bg-ink-300">
          {saving ? '저장 중' : '저장'}
        </button>
        <button onClick={onCancel}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700">
          취소
        </button>
      </td>
    </tr>
  );
}
