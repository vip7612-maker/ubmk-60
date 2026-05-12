import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentCard from '@/components/StudentCard';
import ProgressCard from '@/components/ProgressCard';
import { listPublicStudents, getStats, listPublicStories, listGallery } from '@/lib/queries';

const HERO_IMAGES = [
  // UBMK 학교 외관 (소개 영상에서 추출)
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/gallery/ubmk-campus-1778544350497.jpg',
  // UBMK 학교 일상 (사용자 제공 사진)
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/hero/ubmk-life-01-1778544736646.jpg',
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/hero/ubmk-life-02-1778544736646.jpg',
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/hero/ubmk-life-03-1778544736646.jpg',
  'https://uuok0m63gzmwa2xv.public.blob.vercel-storage.com/hero/ubmk-life-04-1778544736646.jpg',
];

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [students, stats, stories, gallery] = await Promise.all([
    listPublicStudents(),
    getStats(),
    listPublicStories(4),
    listGallery(5),
  ]);
  const previewStudents = students.slice(0, 6);

  return (
    <>
      <Header />

      {/* HERO with photo carousel */}
      <section className="relative bg-ink-900 overflow-hidden" style={{ height: 'calc(100vh - 72px)', minHeight: 620, maxHeight: 820 }}>
        <div className="absolute inset-0">
          {HERO_IMAGES.map((src, i) => (
            <div key={i} className="hero-slide" style={{ backgroundImage: `url(${src})` }} />
          ))}
        </div>
        <div className="relative z-10 h-full max-w-[1240px] mx-auto px-6 flex flex-col justify-end pb-20 text-white">
          <span className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6 w-fit animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-amber-400 pulse-dot" style={{ boxShadow: '0 0 12px #fbbf24' }} />
            몽골 울란바타르 · UBMK 학교
          </span>
          <h1 className="text-[clamp(1.6rem,6vw,5.5rem)] font-display font-extrabold mb-6 tracking-tighter animate-fade-up delay-1 text-white whitespace-nowrap">
            크롬북 한 대, <span className="text-amber-400">공정한 교육기회</span>
          </h1>
          <p className="text-xl text-white/85 max-w-[620px] mb-10 leading-relaxed animate-fade-up delay-2">
            몽골 UBMK 학교의 중·고등학생 70명에게<br />
            한 명의 후원자가 한 대의 크롬북을 — 1:1 결연 후원.
          </p>
          <div className="flex gap-4 flex-wrap animate-fade-up delay-3">
            <Link href="/students" className="bg-amber-500 hover:bg-amber-400 text-ink-900 font-bold px-8 py-4 rounded-full text-base shadow-[0_8px_20px_-8px_rgba(245,158,11,.55)] transition-all hover:-translate-y-0.5">
              한 명의 학생과 결연하기 →
            </Link>
            <Link href="/project" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold px-8 py-4 rounded-full text-base transition-all">
              프로젝트 알아보기
            </Link>
          </div>
        </div>
      </section>

      {/* PROGRESS */}
      <div className="relative z-20 -mt-16 max-w-[1240px] mx-auto px-6">
        <ProgressCard completed={stats.completed} total={Math.max(70, stats.total)} />
      </div>

      {/* STUDENTS PREVIEW */}
      <section className="py-20 max-w-[1240px] mx-auto px-6">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full">
            1:1 결연
          </span>
          <h2 className="text-4xl font-extrabold mt-4 mb-2">후원할 학생을 만나보세요</h2>
          <p className="text-ink-500 text-lg max-w-[640px]">학년·관심 진로로 검색해 마음 가는 학생과 결연하실 수 있습니다.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-10">
          {previewStudents.map((s, i) => (
            <StudentCard key={s.id} student={s} index={i + 1} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/students"
                className="inline-flex items-center bg-blue-700 hover:bg-blue-900 text-white font-bold px-8 py-4 rounded-full text-base shadow-[0_8px_20px_-8px_rgba(29,78,216,.6)] transition-all hover:-translate-y-0.5">
            70명 모두 만나보기 →
          </Link>
        </div>
      </section>

      {/* WHY CHROMEBOOK */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full">
              왜 크롬북인가요?
            </span>
            <h2 className="text-4xl font-extrabold mt-4 mb-2">한 대의 노트북이<br />아이의 세상을 바꿉니다</h2>
            <p className="text-ink-500 text-lg max-w-[640px] mx-auto">단순한 기기 전달이 아닌, 지속 가능한 디지털 교육 환경을 만듭니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <WhyCard emoji="🌐" title="세계와 연결"
                     desc="몽골 초원의 학생들이 인터넷으로 전 세계 교육 자원에 접근합니다. 코세라·칸아카데미·유튜브 강의로 한계 없는 학습이 가능해집니다." />
            <WhyCard emoji="💡" title="창작의 도구"
                     desc="코딩·디자인·영상 편집까지 — 학생들이 소비자에서 창작자로 성장합니다. 구글 워크스페이스 무료 라이선스로 평생 활용 가능합니다." />
            <WhyCard emoji="🤝" title="지속 가능한 동행"
                     desc="구글 공인 교육자가 직접 방문해 교사 연수를 진행합니다. 단발성 기부가 아닌 5년 이상의 교육 파트너십을 약속합니다." />
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="py-24 relative overflow-hidden text-white"
               style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}>
        <span className="absolute -top-32 -left-8 text-[30rem] text-white/[.04] leading-none font-display select-none">&ldquo;</span>
        <div className="max-w-[1240px] mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-amber-400 bg-white/10 px-3.5 py-1.5 rounded-full">
              후원자 이야기
            </span>
            <h2 className="text-4xl font-extrabold mt-4 mb-2 text-white">먼저 결연하신 분들의 메시지</h2>
            <p className="text-white/70 text-lg max-w-[640px] mx-auto">한 명의 학생, 한 통의 편지에서 시작된 따뜻한 이야기들</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {stories.length > 0 ? stories.map(s => (
              <article key={s.id} className="bg-white/[.06] backdrop-blur-md border border-white/10 rounded-[1.5rem] p-8">
                <p className="text-white/90 leading-relaxed mb-6">&ldquo;{s.message}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-11 h-11 rounded-full grid place-items-center font-extrabold text-ink-900"
                       style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                    {s.sponsor_initial}
                  </div>
                  <div className="text-sm">
                    <strong className="block text-white">{s.sponsor_name_masked} 후원자</strong>
                    <span className="text-white/60 text-xs">{s.student_alias} ({s.student_grade})와 결연</span>
                  </div>
                </div>
              </article>
            )) : (
              <p className="text-white/60 col-span-2 text-center py-8">아직 공개된 후원자 이야기가 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-24 max-w-[1240px] mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full">
            UBMK 학교
          </span>
          <h2 className="text-4xl font-extrabold mt-4 mb-2">1998년부터 이어진 교육의 현장</h2>
          <p className="text-ink-500 text-lg max-w-[640px] mx-auto">
            울란바타르 바양주르흐 구에 위치한 UBMK는 유치원부터 고등학교까지 70명의 재학생과 30명의 교직원이 함께하는 선교 학교입니다.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12" style={{ gridAutoRows: '200px' }}>
          {gallery.map((g, idx) => (
            <div key={g.id}
                 className={`relative rounded-2xl bg-cover bg-center cursor-pointer transition-transform hover:scale-[1.02] ${
                   idx === 0 ? 'col-span-2 row-span-2' : ''
                 }`}
                 style={{ backgroundImage: `url(${g.image_url})` }}>
              <span className="absolute bottom-4 left-4 bg-ink-900/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold">
                {g.title}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/school" className="inline-flex items-center bg-white border border-ink-300 hover:border-ink-900 text-ink-900 font-bold px-6 py-3 rounded-full transition-all">
            학교 소개 자세히 보기 →
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 text-center" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}>
        <div className="max-w-[680px] mx-auto px-6">
          <h2 className="text-5xl font-extrabold mb-4">당신의 50만원이<br />한 아이의 10년을 바꿉니다</h2>
          <p className="text-lg text-ink-700 mb-10">지금 바로 70명의 학생 중 한 명을 만나보세요.<br />당신의 결연을 기다리는 학생이 있습니다.</p>
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

function WhyCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-[1.5rem] p-10 border border-ink-100 hover:border-blue-500 hover:shadow-soft hover:-translate-y-1 transition-all">
      <div className="w-14 h-14 rounded-2xl grid place-items-center text-3xl mb-6"
           style={{ background: 'linear-gradient(135deg, #eff6ff, #fffbeb)' }}>
        {emoji}
      </div>
      <h3 className="text-xl font-extrabold mb-3">{title}</h3>
      <p className="text-ink-500 leading-relaxed">{desc}</p>
    </div>
  );
}
