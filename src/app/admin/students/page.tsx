import AdminShell from '@/components/AdminShell';
import StudentsAdmin from './StudentsAdmin';
import { listAllStudents } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const students = await listAllStudents();
  return (
    <AdminShell>
      <div className="p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">학생 관리</h1>
          <p className="text-ink-500">전체 {students.length}명 · 손편지 이미지·번역·꿈 등을 편집할 수 있습니다.</p>
        </div>
        <StudentsAdmin students={students} />
      </div>
    </AdminShell>
  );
}
