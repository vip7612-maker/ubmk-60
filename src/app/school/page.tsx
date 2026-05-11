import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { listGallery } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata = { title: '학교 소개 — 크롬북 한 대, 공정한 교육기회' };

export default async function SchoolPage() {
  const gallery = await listGallery();

  return (
    <>
      <Header />

      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #eff6ff 0%, white 100%)' }}>
        <div className="max-w-[1240px] mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full">
            🏫 UBMK School
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-3">
            울란바타르 미션 스쿨,<br /><span className="gradient-text">UBMK</span>
          </h1>
          <p className="text-ink-500 text-lg max-w-[640px]">
            몽골 울란바타르 바양주르흐 구에 위치한 UBMK는<br />
            1998년 개교 이래 유치원부터 고등학교까지 아이들의 꿈을 키워온 선교 학교입니다.
          </p>
        </div>
      </section>

      {/* === 설립 배경 === */}
      <section id="설립배경" className="py-20 max-w-[1000px] mx-auto px-6 scroll-mt-24">
        <div className="border-l-4 border-blue-700 pl-5 mb-8">
          <h2 className="text-3xl font-extrabold text-blue-700">설립 배경</h2>
        </div>
        <div className="space-y-5 text-ink-700 leading-relaxed text-[1.02rem]">
          <p>
            1990년 개방과 함께 몽골에 들어간 한인 선교사들은 자녀들을 현지학교 또는 국제학교에 보냈다.
            선교사 자녀(MK)들은 큰 문화적 차이와 언어 적응의 문제, 높은 교육비로 적지 않은 어려움을 겪었다.
          </p>
          <p>
            그러던 중 1997년 IMF가 터지면서 많은 선교사들은 재정적 어려움을 겪게 되었다.
            몽골한인선교사회에서는 우리의 자녀들을 <strong>&lsquo;우리의 언어로&rsquo;</strong>,
            <strong> &lsquo;우리의 신앙과 국가적 정체성을 형성하도록 하는 학교&rsquo;</strong>를 세우기로 마음을 모았다.
          </p>
          <p>
            이후 <strong className="text-blue-700">1998년 5월 MK학교 설립을 결의</strong>하고,
            7명으로 이뤄진 설립추진위원회를 구성하여
            동년 <strong className="text-blue-700">9월 9일에 UBMK SCHOOL을 개교</strong>하게 되었다.
          </p>
        </div>
      </section>

      {/* === 학교 현황 (통계) === */}
      <section id="학교현황" className="py-16 px-6 scroll-mt-24" style={{ background: 'linear-gradient(180deg, #eff6ff 0%, white 100%)' }}>
        <div className="max-w-[1240px] mx-auto">
          <div className="border-l-4 border-blue-700 pl-5 mb-8">
            <h2 className="text-3xl font-extrabold text-blue-700">학교 현황</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat icon="👥" number="15" label="학급수 (유치원~고3)" />
            <Stat icon="🧒" number="70" label="재학생" />
            <Stat icon="🎓" number="90" label="졸업생" />
            <Stat icon="🧑‍🏫" number="30" label="교직원" />
          </div>
        </div>
      </section>

      {/* === 학교 사진 === */}
      <section className="py-20 max-w-[1240px] mx-auto px-6">
        <div className="rounded-[1.5rem] overflow-hidden shadow-lift mb-16">
          <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80" alt="UBMK 학교" className="w-full h-[360px] object-cover" />
        </div>

        <h2 className="text-3xl font-extrabold mb-2 text-center">📸 학교 갤러리</h2>
        <p className="text-ink-500 text-center mb-12">UBMK의 일상과 교육 활동을 확인하실 수 있습니다.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gallery.map(g => (
            <article key={g.id} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-ink-100">
              <img src={g.image_url} alt={g.title} className="w-full h-56 object-cover" />
              <div className="p-5">
                <span className="text-xs font-bold text-blue-700 uppercase">{categoryLabel(g.category)}</span>
                <h3 className="font-extrabold text-lg mt-1">{g.title}</h3>
                {g.description && <p className="text-ink-500 text-sm mt-2">{g.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

function Stat({ icon, number, label }: { icon?: string; number: string; label: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 text-center border border-ink-100 shadow-soft">
      {icon && (
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-700 text-white grid place-items-center text-xl">
          {icon}
        </div>
      )}
      <div className="font-display text-4xl font-extrabold text-blue-700 mb-1">{number}</div>
      <div className="text-sm text-ink-500 font-semibold">{label}</div>
    </div>
  );
}

function categoryLabel(c: string): string {
  return ({ class: '📚 수업', event: '🎉 행사', facility: '🏛️ 시설', general: '📷 일반' } as Record<string, string>)[c] || c;
}
