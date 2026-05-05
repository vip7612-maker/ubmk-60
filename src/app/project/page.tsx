import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressCard from '@/components/ProgressCard';
import { getStats } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata = { title: '프로젝트 안내 — 크롬북 한 대, 공정한 교육기회' };

export default async function ProjectPage() {
  const stats = await getStats();

  return (
    <>
      <Header />

      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, white 100%)' }}>
        <div className="max-w-[1240px] mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-full">
            🎯 프로젝트 안내
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-3">
            <span className="gradient-text">크롬북 한 대</span>로 만드는<br />
            공정한 교육기회
          </h1>
          <p className="text-ink-500 text-lg max-w-[640px]">
            60명의 학생, 60대의 크롬북, 1:1 결연으로 시작하는<br />
            5년간의 디지털 교육 동행 프로젝트.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-[1240px] mx-auto px-6">
        <ProgressCard completed={stats.completed} total={Math.max(60, stats.total)} variant="amber" />
      </section>

      <section className="py-16 max-w-[1000px] mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-8">💡 프로젝트 개요</h2>
        <div className="space-y-6 text-ink-700 leading-relaxed">
          <p>
            <strong>몽골 UBMK 학교의 중·고등학생 60명에게 크롬북을 1:1 결연 방식으로 후원하는 프로젝트</strong>입니다.
            한 명의 후원자가 한 명의 학생과 매칭되어, 5년간의 디지털 학습 여정을 함께합니다.
          </p>
          <p>
            크롬북은 단순한 노트북이 아닙니다. 인터넷 연결만으로 전 세계의 교육 자원에 접근할 수 있는 창이며,
            구글 워크스페이스 무료 라이선스로 글쓰기·발표·협업을 평생 할 수 있는 도구입니다.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-[1000px] mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-8">💰 예산 사용 안내</h2>
        <div className="bg-white rounded-2xl p-8 border border-ink-100 shadow-soft">
          <div className="space-y-4">
            <BudgetRow item="크롬북 1대 (학생용)" amount="240,000원" pct={80} />
            <BudgetRow item="배송·관세·현지 셋업" amount="30,000원" pct={10} />
            <BudgetRow item="교사 연수·기술 지원 (5년)" amount="20,000원" pct={6.7} />
            <BudgetRow item="운영비·결제 수수료" amount="10,000원" pct={3.3} />
          </div>
          <div className="mt-6 pt-6 border-t border-ink-100 flex justify-between font-extrabold text-lg">
            <span>총 후원 금액</span>
            <span className="text-blue-700">300,000원</span>
          </div>
        </div>
        <p className="text-xs text-ink-500 mt-4">
          * 모든 영수증과 사용 내역은 분기별 보고서로 후원자님께 공개됩니다.
        </p>
      </section>

      <section className="py-16 max-w-[1000px] mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-8">📅 진행 일정</h2>
        <div className="space-y-4">
          <Timeline phase="1단계" date="2026.04 ~ 2026.07" title="결연 모집"
                    desc="후원자 모집 및 1:1 매칭 진행. 결연 완료 시 학생 정보·손편지 공유." />
          <Timeline phase="2단계" date="2026.08" title="크롬북 발송"
                    desc="60대 일괄 구매 및 통관·배송. 학생별 셋업 및 ID 발급." />
          <Timeline phase="3단계" date="2026.09" title="교육 시작"
                    desc="구글 공인 교육자 현지 방문, 교사 연수 및 학생 워크숍 진행." />
          <Timeline phase="4단계" date="2026.10 ~" title="분기별 진행 보고"
                    desc="후원자에게 결연 학생의 학습 진행 상황·성장 스토리를 분기별 안내." />
        </div>
      </section>

      <section className="py-24 text-center" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, white 100%)' }}>
        <div className="max-w-[680px] mx-auto px-6">
          <h2 className="text-4xl font-extrabold mb-4">함께 시작해 주세요</h2>
          <p className="text-lg text-ink-700 mb-10">
            지금 바로 60명의 학생 중 한 명을 선택해<br />
            그의 5년 동안의 멘토가 되어주세요.
          </p>
          <Link href="/students"
                className="inline-flex items-center bg-blue-700 hover:bg-blue-900 text-white font-bold px-8 py-4 rounded-full text-base shadow-[0_8px_20px_-8px_rgba(29,78,216,.6)] transition-all hover:-translate-y-0.5">
            학생과 결연하기 →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

function BudgetRow({ item, amount, pct }: { item: string; amount: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="font-semibold text-ink-700">{item}</span>
        <span className="font-bold text-ink-900">{amount}</span>
      </div>
      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2563eb, #f59e0b)' }} />
      </div>
    </div>
  );
}

function Timeline({ phase, date, title, desc }: { phase: string; date: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-ink-100 shadow-soft flex gap-5 items-start">
      <div className="bg-blue-50 text-blue-700 font-bold px-3 py-2 rounded-lg text-sm whitespace-nowrap">{phase}</div>
      <div className="flex-1">
        <div className="text-xs text-ink-500 font-semibold mb-1">{date}</div>
        <h3 className="text-lg font-extrabold mb-1">{title}</h3>
        <p className="text-sm text-ink-700">{desc}</p>
      </div>
    </div>
  );
}
