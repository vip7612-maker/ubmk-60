import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressCard from '@/components/ProgressCard';
import { getStats } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata = { title: '프로젝트 안내 — 크롬북 한 대, 공정한 교육기회' };

const FIELD_PHOTOS = [
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/field/teacher-training-01-1777988130593.jpg',
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/field/teacher-training-02-1777988131171.jpg',
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/field/teacher-training-03-1777988131740.jpg',
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/field/teacher-training-04-1777988132507.jpg',
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/field/teacher-training-05-1777988132805.jpg',
];

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
            70명의 학생, 70대의 크롬북, 1:1 결연으로 시작하는<br />
            5년간의 디지털 교육 동행 프로젝트.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-[1240px] mx-auto px-6">
        <ProgressCard completed={stats.completed} total={Math.max(70, stats.total)} variant="amber" />
      </section>

      <section className="py-16 max-w-[1000px] mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-8">💡 프로젝트 개요</h2>
        <div className="space-y-6 text-ink-700 leading-relaxed">
          <p>
            <strong>몽골 UBMK 학교의 중·고등학생 70명에게 크롬북을 1:1 결연 방식으로 후원하는 프로젝트</strong>입니다.
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

      {/* === FIELD STORY: full-width photo + content === */}
      <section className="py-20 bg-white">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full">
              📸 현장 이야기
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-3">
              UBMK 학교에 불어온<br />
              <span className="gradient-text">구글 교육 바람</span>
            </h2>
            <p className="text-ink-500 text-lg max-w-[680px] mx-auto">
              몽골 현지에서는 이미 선생님들이 먼저 변화하고 있습니다.<br />
              그 뜨거운 현장의 표정을 사진으로 만나보세요.
            </p>
          </div>

          {/* Hero photo + lead caption */}
          <div className="relative rounded-[2rem] overflow-hidden mb-6 shadow-lift">
            <img src={FIELD_PHOTOS[0]} alt="UBMK 교사 연수 — 함께 웃으며 배우는 시간"
                 className="w-full h-[480px] object-cover" />
            <div className="absolute inset-0"
                 style={{ background: 'linear-gradient(0deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 50%, transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
              <div className="text-amber-400 text-xs font-bold tracking-[0.15em] uppercase mb-3">
                Moments from Ulaanbaatar
              </div>
              <div className="font-display text-2xl md:text-3xl font-extrabold leading-snug max-w-[720px]">
                &ldquo;새로운 세계가 열렸어요&rdquo;<br />
                <span className="text-amber-300">선생님들이 먼저 변화하고 있습니다.</span>
              </div>
            </div>
          </div>

          {/* 4-photo grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {FIELD_PHOTOS.slice(1).map((src, i) => (
              <div key={i} className="relative aspect-[4/5] rounded-2xl overflow-hidden group shadow-soft border border-ink-100">
                <img src={src} alt={`UBMK 교사 연수 현장 ${i + 2}`}
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Story body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-amber-50 border border-amber-100 rounded-[1.5rem] p-7">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="text-xl font-extrabold mb-3 text-amber-600">자발적으로 시작된 보충 수업</h3>
              <p className="text-ink-700 leading-relaxed">
                월·화·목 정규 수업(오후 3~4시)만으로 부족하다며
                <strong> 선생님들이 먼저 보충 수업을 요청</strong>했습니다.
                지금은 오전 9~11시·오후 1시 30분~3시까지 1:1 또는 소그룹 30분씩
                밀착 수업이 추가로 진행됩니다.
              </p>
              <p className="text-sm text-amber-600 font-semibold mt-3">
                — 쉬는 시간까지 반납하며 하나라도 더 배우려는 모습입니다.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-[1.5rem] p-7">
              <div className="text-2xl mb-3">🌱</div>
              <h3 className="text-xl font-extrabold mb-3 text-blue-700">&ldquo;새로운 세계&rdquo;라며 흡수하는 학구열</h3>
              <p className="text-ink-700 leading-relaxed">
                수년간 익숙했던 오피스 도구를 내려놓고 구글 워크스페이스·AI 도구로
                전환하는 일은 결코 쉽지 않습니다. 그럼에도 선생님들은
                <strong> &ldquo;새로운 세계가 열렸다&rdquo;</strong>며
                스펀지처럼 흡수하고 있습니다.
              </p>
              <p className="text-sm text-blue-700 font-semibold mt-3">
                — 현지 교육팀도 모르는 기능까지 함께 공부하며 성장 중입니다.
              </p>
            </div>
          </div>

          {/* Bridge to CTA */}
          <div className="bg-gradient-to-br from-ink-900 to-blue-900 text-white rounded-[1.5rem] p-8 md:p-10 text-center">
            <p className="font-display text-xl md:text-2xl font-bold leading-snug mb-3">
              지금 부족한 것은 단 하나,<br />
              <span className="text-amber-400">학생들 손에 쥐어줄 도구입니다.</span>
            </p>
            <p className="text-white/70 text-sm">
              교사들의 열정이 학생들에게 닿으려면,<br />
              70명의 학생 한 명 한 명에게 크롬북이 필요합니다.
            </p>
          </div>

          <div className="text-xs text-ink-500 mt-6 text-center">
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
            지금 바로 70명의 학생 중 한 명을 선택해<br />
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

