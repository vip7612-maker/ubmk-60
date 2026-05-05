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
        <h2 className="text-3xl font-extrabold mb-8">💰 후원 안내</h2>
        <div className="bg-white rounded-2xl p-8 border border-ink-100 shadow-soft text-center">
          <div className="text-sm font-semibold text-ink-500 mb-2">학생 1명 결연 후원 금액</div>
          <div className="font-display text-5xl font-extrabold text-blue-700 mb-3">500,000원</div>
          <p className="text-ink-700">
            크롬북 1대와 5년간의 학습 동행을 위한 모든 비용이 포함되어 있습니다.
          </p>
        </div>
        <p className="text-xs text-ink-500 mt-4">
          * 사용 내역은 분기별 보고서로 후원자님께 공개됩니다.
        </p>
      </section>

      <section className="py-16 max-w-[1000px] mx-auto px-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold tracking-[0.1em] uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            현장 이야기
          </span>
        </div>
        <h2 className="text-3xl font-extrabold mb-3">
          UBMK 학교에 불어온 <span className="gradient-text">구글 교육 바람</span>
        </h2>
        <p className="text-ink-500 mb-8">
          몽골 현지에서는 이미 선생님들이 먼저 변화하고 있습니다.
        </p>

        <div className="bg-white rounded-[1.5rem] p-8 border border-ink-100 shadow-soft space-y-6 text-ink-700 leading-relaxed">
          <p>
            UBMK 학교 선생님들은 지금 <strong>구글 워크스페이스 · 에듀테크 · 인공지능 도구</strong>를 학생 교육에 적용하기 위해
            누구보다 뜨거운 열정으로 준비하고 있습니다.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <div className="text-sm font-bold text-amber-600 mb-2">📚 자발적으로 시작된 보충 수업</div>
            <p className="text-sm text-ink-700">
              월·화·목 정규 수업(오후 3~4시)만으로 부족하다며 <strong>선생님들이 먼저 보충 수업을 요청</strong>했습니다.
              지금은 같은 요일 오전 9~11시 · 오후 1시 30분~3시까지, 1:1 또는 소그룹으로 30분씩
              밀착 수업이 추가로 진행되고 있습니다. 쉬는 시간까지 반납하며 하나라도 더 배우려는 모습입니다.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="text-sm font-bold text-blue-700 mb-2">🌱 "새로운 세계"라며 흡수하는 학구열</div>
            <p className="text-sm text-ink-700">
              수년간 사용해온 익숙한 오피스 도구를 내려놓고 구글 도구로 전환하는 일은 결코 쉽지 않습니다.
              그럼에도 선생님들은 <strong>"새로운 세계가 열렸다"</strong>며 스펀지처럼 흡수하고 있고,
              현지 교육 봉사팀도 모르는 기능까지 미리 공부해 함께 성장하는 중입니다.
            </p>
          </div>

          <p className="text-sm text-ink-500 pt-2">
            👉 <strong>지금 부족한 것은 단 하나, 학생들 손에 쥐어줄 도구입니다.</strong><br />
            교사들의 열정이 학생들에게 닿으려면, 학생 한 명 한 명에게 크롬북이 필요합니다.
          </p>

          <div className="text-xs text-ink-500 pt-2 border-t border-ink-100">
            출처: <a href="https://blog.naver.com/monglemongle2" target="_blank" rel="noopener" className="text-blue-700 hover:underline">
              몽글몽글 현장 블로그 — UBMK 학교에 불어온 구글 교육 바람
            </a>
          </div>
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

