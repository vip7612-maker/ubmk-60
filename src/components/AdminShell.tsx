'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin',           label: '대시보드',   icon: '📊' },
  { href: '/admin/sponsors',  label: '결연 신청',   icon: '💝' },
  { href: '/admin/students',  label: '학생 관리',   icon: '🎓' },
  { href: '/admin/gallery',   label: '갤러리',     icon: '📷' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-ink-50">
      <aside className="w-64 bg-white border-r border-ink-100 sticky top-0 h-screen flex flex-col">
        <div className="p-6 border-b border-ink-100">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="w-9 h-9 grid place-items-center rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="12" rx="1.5"/>
                <path d="M2 19h20"/>
              </svg>
            </span>
            <div className="leading-tight">
              <div className="font-extrabold text-[.95rem]">크롬북 한 대</div>
              <div className="text-[.7rem] font-normal text-ink-500">공정한 교육기회 · Admin</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      active ? 'bg-blue-50 text-blue-700' : 'text-ink-700 hover:bg-ink-50'
                    }`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink-100 space-y-2">
          <Link href="/" target="_blank" className="block text-center text-xs text-ink-500 hover:text-blue-700 py-2">
            🌐 사이트 보기 ↗
          </Link>
          <button onClick={logout}
                  className="w-full text-sm font-semibold text-ink-700 bg-ink-50 hover:bg-ink-100 py-2 rounded-lg transition-colors">
            로그아웃
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
