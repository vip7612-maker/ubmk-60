import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300 mt-24 pt-16 pb-8">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">
          <div>
            <h4 className="text-white text-base font-bold mb-4">🇲🇳 UBMK 학교</h4>
            <p className="text-sm leading-relaxed">
              Ulaanbaatar Mission School<br />
              Bayanzurkh District, Ulaanbaatar, Mongolia
            </p>
            <p className="text-sm mt-4 leading-relaxed">
              중·고등학생 60명을 위한<br />
              크롬북 1:1 결연 프로젝트
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
          <span>© 2026 UBMK Digital Transformation Project. All rights reserved.</span>
          <span>Powered by Next.js · Turso · Vercel</span>
        </div>
      </div>
    </footer>
  );
}
