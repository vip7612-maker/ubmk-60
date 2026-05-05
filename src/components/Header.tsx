'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: '홈' },
  { href: '/students', label: '학생 만나기' },
  { href: '/school', label: '학교 소개' },
  { href: '/project', label: '프로젝트' },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 glass border-b border-ink-100">
      <div className="max-w-[1240px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 tracking-tight">
          <span className="w-9 h-9 grid place-items-center rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 4px 10px -2px rgba(37,99,235,.5)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="12" rx="1.5"/>
              <path d="M2 19h20"/>
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-sans font-extrabold text-[1rem]">크롬북 한 대</span>
            <span className="font-sans text-[.7rem] text-ink-500 font-semibold tracking-normal">공정한 교육기회</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                    className={`text-[.95rem] font-semibold transition-colors ${active ? 'text-blue-700' : 'text-ink-700 hover:text-blue-700'}`}>
                {item.label}
              </Link>
            );
          })}
          <Link href="/students"
                className="bg-ink-900 hover:bg-blue-700 text-white px-[1.1rem] py-[.55rem] rounded-full text-[.9rem] font-semibold transition-colors">
            결연하기
          </Link>
        </nav>
        <Link href="/students" className="md:hidden bg-ink-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
          결연하기
        </Link>
      </div>
    </header>
  );
}
