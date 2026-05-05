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
            울란바토르 미션 스쿨,<br /><span className="gradient-text">UBMK</span>
          </h1>
          <p className="text-ink-500 text-lg max-w-[640px]">
            몽골 울란바토르 바양주르흐 구에 위치한 UBMK는<br />
            20년 넘게 아이들의 꿈을 키워온 선교 학교입니다.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Stat number="20+" label="설립 연도" />
          <Stat number="60" label="현재 중·고등학생" />
          <Stat number="1,200+" label="누적 졸업생" />
          <Stat number="15" label="교원 수" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">교육 철학</h2>
            <p className="text-ink-700 leading-relaxed mb-4">
              UBMK는 단순한 지식 전달을 넘어, 학생 한 명 한 명이 자신의 가능성을 발견하고
              세상에 기여할 수 있는 사람으로 성장하도록 돕습니다.
            </p>
            <p className="text-ink-700 leading-relaxed">
              한국과 몽골의 교육 자원을 연결하여, 글로벌 시대에 적합한
              실용적이고 인성 있는 교육을 제공합니다.
            </p>
          </div>
          <div className="rounded-[1.5rem] overflow-hidden shadow-lift">
            <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80" alt="UBMK 학교" className="w-full h-[360px] object-cover" />
          </div>
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

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 text-center border border-ink-100 shadow-soft">
      <div className="font-display text-4xl font-extrabold text-blue-700 mb-1">{number}</div>
      <div className="text-sm text-ink-500 font-semibold">{label}</div>
    </div>
  );
}

function categoryLabel(c: string): string {
  return ({ class: '📚 수업', event: '🎉 행사', facility: '🏛️ 시설', general: '📷 일반' } as Record<string, string>)[c] || c;
}
