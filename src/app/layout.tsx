import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UBMK 60 — 몽골 학생들에게 크롬북이라는 날개를',
  description: '몽골 울란바토르 UBMK 학교 중·고등학생 60명에게 크롬북을 선물하는 1:1 결연 후원 프로젝트',
  openGraph: {
    title: 'UBMK 60 — 60명의 학생, 60대의 크롬북',
    description: '몽골 UBMK 학교 학생과 1:1 결연하여 디지털 교육의 첫 걸음을 함께해 주세요.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-ink-50 text-ink-900">
        {children}
      </body>
    </html>
  );
}
