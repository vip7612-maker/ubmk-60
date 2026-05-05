'use client';

import { useState } from 'react';
import Link from 'next/link';
import SponsorModal from './SponsorModal';
import { type PublicStudent, careerLabel, gradeToLabel } from '@/lib/types';

export default function StudentDetailClient({ student, similarStudents }: {
  student: PublicStudent;
  similarStudents: PublicStudent[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [lang, setLang] = useState<'ko' | 'mn'>('ko');
  const [imageOpen, setImageOpen] = useState(false);

  const isCompleted = student.status === 'COMPLETED';
  const letterText = lang === 'ko' ? student.letter_text_ko : student.letter_text_mn;
  const careerKey = student.career_interest[0];

  return (
    <>
      <div className="max-w-[1240px] mx-auto px-6 pt-6 text-sm text-ink-500">
        <Link href="/" className="hover:text-blue-700">홈</Link>
        {' · '}
        <Link href="/students" className="hover:text-blue-700">학생 만나기</Link>
        {' · '}
        <span className="text-ink-900 font-semibold">{student.alias_name} (#{String(student.id).padStart(2, '0')})</span>
      </div>

      <section className="py-8 pb-24 max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 items-start">

          {/* LEFT: Profile */}
          <aside className="bg-white rounded-[1.5rem] p-10 shadow-soft border border-ink-100 lg:sticky lg:top-[92px] text-center">
            <div className="relative w-[180px] h-[180px] mx-auto mb-6 rounded-full p-1.5"
                 style={{ background: 'linear-gradient(135deg, #eff6ff, #fef3c7)' }}>
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(student.avatar_seed)}&backgroundColor=fef3c7`}
                   className="w-full h-full rounded-full bg-white object-cover" alt={`${student.alias_name} 아바타`} />
              <span className="absolute top-0 right-0 bg-ink-900 text-white w-11 h-11 rounded-full grid place-items-center font-extrabold text-sm font-display shadow-soft">
                {String(student.id).padStart(2, '0')}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold mb-1">{student.alias_name}</h1>
            <p className="text-ink-500 mb-6">{gradeToLabel(student.grade)}{student.age && ` · ${student.age}세`}</p>

            <div className={`p-4 rounded-2xl mb-6 text-sm font-semibold ${
              isCompleted ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'bg-amber-50 border border-amber-100 text-amber-600'
            }`}>
              {isCompleted ? '💝 결연이 완료된 학생이에요' : '❤️ 결연을 기다리고 있어요'}
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center mb-7">
              {student.career_interest.map(c => (
                <span key={c} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {careerLabel(c)}
                </span>
              ))}
              {student.hobbies.map((h, i) => (
                <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ink-50 text-ink-700">
                  {h}
                </span>
              ))}
            </div>

            <div className="text-left bg-ink-50 p-5 rounded-2xl mb-6 text-sm">
              <InfoRow k="학년" v={gradeToLabel(student.grade)} />
              {careerKey && <InfoRow k="희망 진로" v={careerLabel(careerKey)} />}
              {student.age && <InfoRow k="나이" v={`${student.age}세`} />}
            </div>

            <div className="rounded-2xl p-5 mb-4 text-white"
                 style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)' }}>
              <div className="text-xs text-white/75">크롬북 1대 후원 금액</div>
              <div className="font-display text-4xl font-extrabold leading-none my-1">₩500,000</div>
              <div className="text-xs text-white/75">한 학생의 5년을 함께합니다</div>
            </div>

            {!isCompleted && (
              <button onClick={() => setModalOpen(true)}
                      id="sponsor"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-ink-900 font-bold py-4 rounded-full text-base shadow-[0_8px_20px_-8px_rgba(245,158,11,.55)] transition-all">
                {student.alias_name}와 결연하기 →
              </button>
            )}
          </aside>

          {/* RIGHT: Letter */}
          <main>
            {student.dream_summary && (
              <div className="rounded-[1.5rem] p-10 mb-8 border border-amber-100"
                   style={{ background: 'linear-gradient(135deg, #fffbeb, #eff6ff)' }}>
                <div className="text-xs font-extrabold text-amber-600 uppercase tracking-[0.15em] mb-3">
                  🌱 {student.alias_name}의 꿈
                </div>
                <div className="font-display text-2xl md:text-3xl font-semibold leading-snug tracking-tight">
                  &ldquo;{student.dream_summary}&rdquo;
                </div>
              </div>
            )}

            <div className="bg-white rounded-[1.5rem] p-10 shadow-soft border border-ink-100 mb-8">
              <div className="flex justify-between items-center mb-6 pb-5 border-b border-ink-100 flex-wrap gap-3">
                <h2 className="text-2xl font-extrabold flex items-center gap-2">📜 {student.alias_name}의 손편지</h2>
                <div className="flex gap-1 bg-ink-50 p-1 rounded-full">
                  <button onClick={() => setLang('ko')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            lang === 'ko' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
                          }`}>
                    🇰🇷 한국어
                  </button>
                  <button onClick={() => setLang('mn')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            lang === 'mn' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
                          }`}>
                    🇲🇳 몽골어
                  </button>
                </div>
              </div>

              {student.letter_image_url && (
                <div onClick={() => setImageOpen(true)}
                     className="bg-amber-50 rounded-2xl p-6 mb-8 text-center border border-dashed border-amber-100 cursor-zoom-in hover:scale-[1.01] transition-transform">
                  <img src={student.letter_image_url}
                       alt="손편지 원본"
                       className="max-h-[500px] w-auto mx-auto rounded-lg shadow-soft" />
                  <div className="mt-4 text-amber-600 text-sm font-semibold">🔍 클릭하면 원본 크기로 볼 수 있어요</div>
                </div>
              )}

              <div className="letter-text bg-ink-50 p-6 rounded-2xl border-l-4 border-blue-600">
                {letterText || '편지가 아직 등록되지 않았습니다.'}
              </div>
            </div>

            {!isCompleted && (
              <div className="bg-white border border-ink-100 rounded-[1.5rem] p-10 text-center shadow-soft">
                <h3 className="text-2xl font-extrabold mb-2">{student.alias_name}의 첫 멘토가 되어주세요</h3>
                <p className="text-ink-500 mb-7">
                  당신의 50만원이 {student.alias_name}의 5년 동안의 학습 도구가 됩니다.<br />
                  결연 후 학습 진행 상황을 분기별로 안내드립니다.
                </p>
                <button onClick={() => setModalOpen(true)}
                        className="inline-flex bg-blue-700 hover:bg-blue-900 text-white font-bold px-8 py-4 rounded-full text-base shadow-[0_8px_20px_-8px_rgba(29,78,216,.6)] transition-all">
                  {student.alias_name}와 결연하기 →
                </button>
              </div>
            )}

            {similarStudents.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-extrabold mb-6">👥 비슷한 진로의 다른 학생들</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarStudents.map(s => (
                    <Link href={`/students/${s.id}`} key={s.id}
                          className="block bg-white rounded-2xl p-4 border border-ink-100 hover:border-blue-500 hover:-translate-y-1 transition-all">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full p-1"
                           style={{ background: 'linear-gradient(135deg, #eff6ff, #fef3c7)' }}>
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(s.avatar_seed)}&backgroundColor=fef3c7`}
                             className="w-full h-full rounded-full bg-white" alt="" />
                      </div>
                      <div className="text-center text-sm font-bold">{s.alias_name}</div>
                      <div className="text-center text-xs text-ink-500">{gradeToLabel(s.grade)}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </section>

      {modalOpen && <SponsorModal student={student} onClose={() => setModalOpen(false)} />}

      {imageOpen && student.letter_image_url && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
             onClick={() => setImageOpen(false)}>
          <img src={student.letter_image_url} className="max-w-full max-h-[90vh] rounded-lg" alt="손편지 확대" />
          <button className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white text-2xl text-black grid place-items-center"
                  onClick={() => setImageOpen(false)}>×</button>
        </div>
      )}
    </>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-ink-100 last:border-b-0">
      <span className="text-ink-500 font-semibold">{k}</span>
      <span className="text-ink-900 font-bold">{v}</span>
    </div>
  );
}
