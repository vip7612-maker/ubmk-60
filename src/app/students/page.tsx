import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentsBrowser from '@/components/StudentsBrowser';
import { listPublicStudents, getStats } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '학생 만나기 — 크롬북 한 대, 공정한 교육기회',
};

export default async function StudentsPage() {
  const [students, stats] = await Promise.all([listPublicStudents(), getStats()]);

  return (
    <>
      <Header />

      <section className="py-16 px-6" style={{ background: 'linear-gradient(180deg, #eff6ff 0%, white 100%)' }}>
        <div className="max-w-[1240px] mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full">
            70명의 꿈
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-3">한 명의 학생을 선택해<br />그의 첫 후원자가 되어주세요</h1>
          <p className="text-ink-500 text-lg max-w-[640px]">
            학년·관심 진로로 검색해 마음에 닿는 학생과 1:1 결연하실 수 있습니다.<br />
            각 학생을 클릭하면 그의 손편지와 꿈을 만나실 수 있어요.
          </p>
          <div className="mt-6 inline-flex items-start gap-2.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl max-w-[640px]">
            <span aria-hidden className="text-base leading-none mt-0.5">🔒</span>
            <span>
              학생 개인정보 보호를 위해 표시되는 모든 이름은 <strong>가명</strong>이에요.
            </span>
          </div>
        </div>
      </section>

      <StudentsBrowser students={students} completed={stats.completed} />

      <Footer />
    </>
  );
}
