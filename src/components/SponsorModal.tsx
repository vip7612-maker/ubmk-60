'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicStudent } from '@/lib/types';
import { gradeToLabel } from '@/lib/types';

export default function SponsorModal({ student, onClose }: {
  student: PublicStudent;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          ℹ️ 신청 후 24시간 내 담당자가 직접 전화드려<br />입금 계좌·세부 절차를 친절히 안내드립니다.
        </div>

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
            <input type="tel" required value={form.phone}
                   onChange={e => setForm({ ...form, phone: e.target.value })}
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
            💳 크롬북 1대 후원 금액: <strong className="text-blue-700">300,000원</strong>
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
