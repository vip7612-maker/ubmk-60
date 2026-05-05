'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type Student, gradeToLabel, careerLabel } from '@/lib/types';
import StudentEditDrawer from './StudentEditDrawer';

export default function StudentsAdmin({ students }: { students: Student[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Student | null>(null);
  const [search, setSearch] = useState('');

  const filtered = students.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.alias_name.toLowerCase().includes(q) ||
           s.real_name?.toLowerCase().includes(q) ||
           s.grade.includes(q);
  });

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-ink-100 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100">
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="가명·실명·학년 검색"
                 className="w-full max-w-[360px] px-4 py-2 border border-ink-300 rounded-full text-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">아바타</th>
                <th className="px-4 py-3 text-left font-semibold">가명 / 실명</th>
                <th className="px-4 py-3 text-left font-semibold">학년</th>
                <th className="px-4 py-3 text-left font-semibold">진로</th>
                <th className="px-4 py-3 text-left font-semibold">손편지</th>
                <th className="px-4 py-3 text-center font-semibold">상태</th>
                <th className="px-4 py-3 text-center font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50/40">
                  <td className="px-4 py-3 font-bold text-ink-500">#{String(s.id).padStart(2, '0')}</td>
                  <td className="px-4 py-3">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(s.avatar_seed)}&backgroundColor=fef3c7`}
                         alt="" className="w-10 h-10 rounded-full bg-ink-50" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold">{s.alias_name}</div>
                    {s.real_name && <div className="text-xs text-ink-500">{s.real_name}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs">{gradeToLabel(s.grade)}</td>
                  <td className="px-4 py-3 text-xs">
                    {s.career_interest.slice(0, 2).map(c => (
                      <span key={c} className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mr-1 mb-1">
                        {careerLabel(c)}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {s.letter_image_url ? '✅ 이미지' : '⬜ 미등록'} · {s.letter_text_ko ? '✅ 한글' : '⬜'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {s.status === 'COMPLETED' ? '결연 완료' : '결연 대기'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setEditing(s)}
                            className="bg-blue-700 hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                      편집
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <StudentEditDrawer student={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />
      )}
    </>
  );
}
