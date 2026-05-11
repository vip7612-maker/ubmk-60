import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ubmk-70.vercel.app'),
  title: '크롬북 한 대, 공정한 교육기회 — 몽골 UBMK 학교 70명 결연 후원',
  description: '몽골 울란바타르 UBMK 학교 중·고등학생 70명과 1:1 결연하여 크롬북 한 대로 공정한 교육기회를 만들어가는 후원 프로젝트',
  openGraph: {
    title: '크롬북 한 대, 공정한 교육기회',
    description: '몽골 UBMK 학교 학생 한 명에게 크롬북 한 대를 선물해 주세요. 한 대의 디지털 도구가 한 아이의 가능성을 엽니다.',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://ubmk-70.vercel.app',
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
