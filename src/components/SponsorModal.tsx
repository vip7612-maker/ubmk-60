'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicStudent, SponsorshipType } from '@/lib/types';
import { gradeToLabel } from '@/lib/types';

const TODAY_DAY = new Date().getDate();

/** 휴대전화 자동 하이픈: 010-XXXX-XXXX 형식. 숫자만 추출해 길이별로 포맷. */
function formatPhone(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function SponsorModal({ student, onClose }: {
  student: PublicStudent;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sponsorshipType, setSponsorshipType] = useState<SponsorshipType>('ONETIME');
  const [form, setForm] = useState({
    name: '', phone: '', email: '', message: '',
    agreePrivacy: false, agreePublic: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.agreePrivacy) {
      setError('개인정보 수집에 동의해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
          messagePublic: form.agreePublic,
          sponsorshipType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '신청 실패');
      router.push(`/thank-you?student=${student.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up"
         onClick={onClose}>
      <div className="bg-white rounded-[1.5rem] w-full max-w-[520px] p-8 relative max-h-[90vh] overflow-y-auto shadow-hero"
           onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center text-ink-500 text-2xl bg-ink-50 hover:bg-ink-100 hover:text-ink-900 transition-colors">
          ×
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-[60px] h-[60px] rounded-full p-1"
               style={{ background: 'linear-gradient(135deg, #eff6ff, #fef3c7)' }}>
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(student.avatar_seed)}&backgroundColor=fef3c7`}
                 className="w-full h-full rounded-full bg-white"
                 alt="" />
          </div>
          <div>
            <h3 className="text-[1.4rem] font-extrabold m-0">{student.alias_name}와 결연하기</h3>
            <p className="text-sm text-ink-500 m-0">{gradeToLabel(student.grade)}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl text-[.82rem] text-amber-600 mb-4">
          ℹ️ 신청하시면 입력하신 연락처로<br />문자와 이메일로 후원 안내문이 자동 발송됩니다.
        </div>

        {/* 후원 유형 선택 */}
        <fieldset className="mb-5">
          <legend className="block text-sm font-bold text-ink-700 mb-2">후원 방식 선택 <span className="text-red-500">*</span></legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <PlanCard
              selected={sponsorshipType === 'ONETIME'}
              onClick={() => setSponsorshipType('ONETIME')}
              badge="추천"
              title="일시 후원"
              price="500,000원"
              hint="한 번에 결제 · 크롬북 1대"
            />
            <PlanCard
              selected={sponsorshipType === 'INSTALLMENT'}
              onClick={() => setSponsorshipType('INSTALLMENT')}
              badge="부담 ↓"
              title="분할 후원"
              price="50,000원 × 10회"
              hint={`매월 ${TODAY_DAY}일 자동 안내`}
            />
          </div>
          {sponsorshipType === 'INSTALLMENT' && (
            <p className="mt-2.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
              📅 신청하신 날(<strong>매월 {TODAY_DAY}일</strong>)에 다음 회차 입금 안내가 자동으로 발송됩니다. 총 10회분이 모이면 크롬북 1대가 학생에게 전달됩니다.
            </p>
          )}
        </fieldset>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field label="후원자 이름" required>
            <input type="text" required value={form.name}
                   onChange={e => setForm({ ...form, name: e.target.value })}
                   placeholder="홍길동" className="w-full px-4 py-3 border border-ink-300 rounded-xl text-[.95rem] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none transition-shadow" />
          </Field>

          <Field label="전화번호" required>
            <input type="tel" required value={form.phone} inputMode="numeric" maxLength={13}
                   onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })}
                   placeholder="010-0000-0000" className="w-full px-4 py-3 border border-ink-300 rounded-xl text-[.95rem] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none" />
          </Field>

          <Field label="이메일" required>
            <input type="email" required value={form.email}
                   onChange={e => setForm({ ...form, email: e.target.value })}
                   placeholder="example@email.com" className="w-full px-4 py-3 border border-ink-300 rounded-xl text-[.95rem] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none" />
          </Field>

          <Field label={`${student.alias_name}에게 전하고 싶은 응원 메시지 (선택)`}>
            <textarea rows={3} value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder={`${student.alias_name}의 꿈을 응원합니다.`}
                      className="w-full px-4 py-3 border border-ink-300 rounded-xl text-[.95rem] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none resize-y" />
          </Field>

          <label className="flex items-start gap-2 text-sm text-ink-700 py-2 cursor-pointer">
            <input type="checkbox" required checked={form.agreePrivacy}
                   onChange={e => setForm({ ...form, agreePrivacy: e.target.checked })}
                   className="mt-1" />
            <span><strong>(필수)</strong> 개인정보 수집·이용에 동의합니다.</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-ink-700 py-2 cursor-pointer">
            <input type="checkbox" checked={form.agreePublic}
                   onChange={e => setForm({ ...form, agreePublic: e.target.checked })}
                   className="mt-1" />
            <span>(선택) 후원자 이야기 페이지에 응원 메시지를 익명으로 공개합니다.</span>
          </label>

          <button type="submit" disabled={submitting}
                  className="w-full mt-4 bg-blue-700 hover:bg-blue-900 disabled:bg-ink-300 text-white py-4 rounded-full font-bold text-base transition-colors shadow-[0_8px_20px_-8px_rgba(29,78,216,.6)]">
            {submitting ? '신청 중...' : '결연 신청하기 →'}
          </button>

          <p className="text-center mt-4 text-xs text-ink-500">
            💳 {sponsorshipType === 'INSTALLMENT'
              ? <>분할 후원 1회분: <strong className="text-blue-700">50,000원</strong> × 10회</>
              : <>크롬북 1대 후원 금액: <strong className="text-blue-700">500,000원</strong></>}
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-ink-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function PlanCard({ selected, onClick, badge, title, price, hint }: {
  selected: boolean;
  onClick: () => void;
  badge?: string;
  title: string;
  price: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-blue-700 bg-blue-50 shadow-[0_4px_12px_-6px_rgba(29,78,216,.4)]'
          : 'border-ink-200 bg-white hover:border-ink-300'
      }`}
      aria-pressed={selected}
    >
      {badge && (
        <span className={`absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
          selected ? 'bg-blue-700 text-white' : 'bg-amber-100 text-amber-700'
        }`}>
          {badge}
        </span>
      )}
      <div className={`text-sm font-bold ${selected ? 'text-blue-700' : 'text-ink-900'}`}>{title}</div>
      <div className="text-base font-extrabold mt-1.5">{price}</div>
      <div className="text-xs text-ink-500 mt-1">{hint}</div>
    </button>
  );
}
