import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentDetailClient from '@/components/StudentDetailClient';
import { getPublicStudent, listPublicStudents } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getPublicStudent(Number(id));
  if (!student) notFound();

  const all = await listPublicStudents();
  const similar = all
    .filter(s => s.id !== student.id && s.career_interest.some(c => student.career_interest.includes(c)))
    .slice(0, 4);

  return (
    <>
      <Header />
      <StudentDetailClient student={student} similarStudents={similar} />
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getPublicStudent(Number(id));
  if (!student) return { title: '학생을 찾을 수 없습니다 — 크롬북 한 대, 공정한 교육기회' };
  return {
    title: `${student.alias_name}의 이야기 — 크롬북 한 대, 공정한 교육기회`,
    description: student.dream_summary || `${student.alias_name}의 손편지와 꿈을 만나보세요.`,
  };
}
