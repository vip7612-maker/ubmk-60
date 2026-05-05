import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPublicStudent } from '@/lib/queries';
import { gradeToLabel } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '결연 신청 완료 — UBMK 60',
};

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  const params = await searchParams;
  const student = params.student ? await getPublicStudent(Number(params.student)) : null;

  return (
    <>
      <Header />
      <section className="py-24 min-h-[80vh] flex items-center">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <div className="inline-block text-7xl mb-6">💝</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">감사합니다.</h1>
          <p className="text-xl text-ink-700 mb-2">
            결연 신청이 정상적으로 접수되었습니다.
          </p>
          <p className="text-ink-500 mb-12">
            <strong>24시간 내</strong> 담당자가 직접 전화드려 입금 계좌·세부 절차를 안내드립니다.
          </p>

          {student && (
            <div className="bg-white rounded-[1.5rem] p-8 border border-ink-100 shadow-soft mb-10">
              <div className="text-sm text-ink-500 mb-4">결연 신청 학생</div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full p-1"
                     style={{ background: 'linear-gradient(135deg, #eff6ff, #fef3c7)' }}>
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(student.avatar_seed)}&backgroundColor=fef3c7`}
                       className="w-full h-full rounded-full bg-white" alt="" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold">{student.alias_name}</div>
                  <div className="text-ink-500 text-sm">{gradeToLabel(student.grade)}</div>
                </div>
              </div>
              {student.dream_summary && (
                <p className="mt-6 text-ink-700 italic">&ldquo;{student.dream_summary}&rdquo;</p>
              )}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-left mb-10 text-sm">
            <h3 className="font-bold text-amber-600 mb-3">📋 다음 안내</h3>
            <ul className="space-y-2 text-ink-700">
              <li>• 24시간 내 담당자가 신청해주신 전화번호로 연락드립니다.</li>
              <li>• 입금 계좌 및 세부 절차를 친절히 안내드립니다.</li>
              <li>• 입금이 확인되면 결연 학생의 학습 진행 상황을 분기별로 안내드립니다.</li>
              <li>• 기부금 영수증은 등록해주신 이메일로 발송됩니다.</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/" className="bg-ink-900 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full transition-colors">
              홈으로 돌아가기
            </Link>
            <Link href="/students" className="bg-white border border-ink-300 hover:border-ink-900 text-ink-900 font-bold px-6 py-3 rounded-full transition-colors">
              다른 학생 둘러보기
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
