'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '로그인 실패');
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'radial-gradient(circle at 10% 20%, rgba(37,99,235,.08) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(245,158,11,.08) 0%, transparent 50%), #f8fafc' }}>
      <main className="flex-1 grid place-items-center p-6">
        <div className="bg-white rounded-[1.5rem] p-12 w-full max-w-[420px] shadow-hero border border-ink-100">
          <div className="flex justify-center items-center gap-2.5 mb-8 font-display font-extrabold text-xl">
            <span className="w-11 h-11 grid place-items-center rounded-xl text-white font-extrabold text-base"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>UB</span>
            <span>UBMK 60</span>
          </div>

          <h1 className="text-center text-2xl font-extrabold mb-1">관리자 로그인</h1>
          <p className="text-center text-ink-500 text-sm mb-8">후원 신청 · 학생 정보 · 갤러리 관리</p>

          <div className="bg-blue-50 border border-blue-700/15 px-4 py-3 rounded-xl text-xs text-blue-700 flex items-start gap-2 mb-6">
            <span>🔒</span>
            <span>이 페이지는 등록된 관리자만 접근 가능합니다. 로그인 시도는 모두 기록됩니다.</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-ink-700 mb-2">아이디</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                     placeholder="관리자 아이디" autoComplete="username"
                     className="w-full px-4 py-3 border border-ink-300 rounded-xl text-[.95rem] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-ink-700 mb-2">비밀번호</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                     placeholder="비밀번호" autoComplete="current-password"
                     className="w-full px-4 py-3 border border-ink-300 rounded-xl text-[.95rem] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none" />
            </div>

            <button type="submit" disabled={submitting}
                    className="w-full bg-blue-700 hover:bg-blue-900 disabled:bg-ink-300 text-white py-4 rounded-full font-bold text-base shadow-[0_8px_20px_-8px_rgba(29,78,216,.6)] transition-colors">
              {submitting ? '로그인 중...' : '로그인 →'}
            </button>
          </form>

          <div className="text-center mt-8 pt-8 border-t border-ink-100 text-sm">
            <Link href="/" className="text-ink-500 hover:text-blue-700">← 메인으로 돌아가기</Link>
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-xs text-ink-500">
        © 2026 UBMK Digital Transformation Project · Admin Console
      </footer>
    </div>
  );
}
