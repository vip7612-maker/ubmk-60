import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300 mt-24 pt-16 pb-8">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">
          <div>
            <h4 className="text-white text-lg font-extrabold mb-4">크롬북 한 대, 공정한 교육기회</h4>
            <p className="text-sm leading-relaxed mb-3">
              🇲🇳 몽골 UBMK 학교 (Ulaanbaatar Mission School)<br />
              Bayanzurkh District, Ulaanbaatar, Mongolia
            </p>
            <p className="text-sm leading-relaxed">
              중·고등학생 70명과 함께하는<br />
              1:1 결연 후원 프로젝트
            </p>
          </div>
          <div>
            <h4 className="text-white text-base font-bold mb-4">둘러보기</h4>
            <Link href="/" className="block py-1 text-sm hover:text-white">홈</Link>
            <Link href="/students" className="block py-1 text-sm hover:text-white">학생 만나기</Link>
            <Link href="/school" className="block py-1 text-sm hover:text-white">학교 소개</Link>
            <Link href="/project" className="block py-1 text-sm hover:text-white">프로젝트 안내</Link>
          </div>
          <div>
            <h4 className="text-white text-base font-bold mb-4">운영</h4>
            <Link href="/admin/login" className="block py-1 text-sm hover:text-white">관리자 로그인</Link>
            <a href="#" className="block py-1 text-sm hover:text-white">개인정보 처리방침</a>
            <a href="#" className="block py-1 text-sm hover:text-white">기부금 영수증 안내</a>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs">
          <span>© 2026 크롬북 한 대, 공정한 교육기회 — UBMK 학교 후원 프로젝트</span>
          <span>Powered by Next.js · Turso · Vercel</span>
        </div>
      </div>
    </footer>
  );
}
