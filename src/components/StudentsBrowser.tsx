'use client';

import { useMemo, useState } from 'react';
import StudentCard from './StudentCard';
import { type PublicStudent, GRADE_OPTIONS, CAREER_OPTIONS } from '@/lib/types';

type StatusFilter = 'all' | 'WAITING' | 'COMPLETED';
type SortOption = 'id' | 'waiting' | 'recent' | 'grade';

export default function StudentsBrowser({ students, completed }: { students: PublicStudent[]; completed: number }) {
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState<string>('all');
  const [career, setCareer] = useState<string>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('waiting');

  const total = students.length;
  const waiting = total - completed;

  const counts = useMemo(() => {
    const byGrade: Record<string, number> = {};
    const byCareer: Record<string, number> = {};
    for (const s of students) {
      byGrade[s.grade] = (byGrade[s.grade] || 0) + 1;
      for (const c of s.career_interest) byCareer[c] = (byCareer[c] || 0) + 1;
    }
    return { byGrade, byCareer };
  }, [students]);

  const filtered = useMemo(() => {
    let list = students;
    if (grade !== 'all') list = list.filter(s => s.grade === grade);
    if (career !== 'all') list = list.filter(s => s.career_interest.includes(career));
    if (status !== 'all') list = list.filter(s => s.status === status);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        s.alias_name.toLowerCase().includes(q) ||
        s.dream_summary?.toLowerCase().includes(q) ||
        s.hobbies.some(h => h.toLowerCase().includes(q)) ||
        s.career_interest.some(c => CAREER_OPTIONS.find(co => co.key === c)?.label.toLowerCase().includes(q))
      );
    }
    const sorted = [...list];
    if (sort === 'id') sorted.sort((a, b) => a.id - b.id);
    if (sort === 'waiting') sorted.sort((a, b) => {
      const sa = a.status === 'COMPLETED' ? 1 : 0;
      const sb = b.status === 'COMPLETED' ? 1 : 0;
      return sa !== sb ? sa - sb : a.id - b.id;   // WAITING 먼저, 같은 status는 id 오름차순
    });
    if (sort === 'recent') sorted.sort((a, b) => b.id - a.id);
    if (sort === 'grade') sorted.sort((a, b) => GRADE_OPTIONS.indexOf(a.grade) - GRADE_OPTIONS.indexOf(b.grade));
    return sorted;
  }, [students, grade, career, status, search, sort]);

  const percent = Math.min(100, Math.round((completed / Math.max(70, total)) * 100));

  return (
    <>
      {/* TOOLBAR */}
      <div className="sticky top-[72px] z-40 glass border-b border-ink-100 py-5">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-[360px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                   className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="가명·진로·취미로 검색..."
                     className="w-full pl-11 pr-4 py-3 border border-ink-300 rounded-full text-sm bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none" />
            </div>
            <div className="flex-1 min-w-[240px] hidden md:flex bg-blue-50 px-4 py-3 rounded-full items-center gap-3 text-sm font-semibold text-ink-700">
              <span>📊 결연 현황</span>
              <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #2563eb, #f59e0b)' }} />
              </div>
              <span><strong className="text-blue-700">{completed}</strong> / {Math.max(70, total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border-b border-ink-100 py-4">
        <div className="max-w-[1240px] mx-auto px-6 space-y-3">
          <FilterRow label="학년">
            <Chip active={grade === 'all'} onClick={() => setGrade('all')}>전체 {total}</Chip>
            {GRADE_OPTIONS.map(g => (
              <Chip key={g} active={grade === g} onClick={() => setGrade(g)}>
                {g} {counts.byGrade[g] ? `(${counts.byGrade[g]})` : ''}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="진로">
            <Chip active={career === 'all'} onClick={() => setCareer('all')}>전체</Chip>
            {CAREER_OPTIONS.map(c => (
              <Chip key={c.key} active={career === c.key} onClick={() => setCareer(c.key)}>
                {c.emoji} {c.label} {counts.byCareer[c.key] ? `(${counts.byCareer[c.key]})` : ''}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="상태">
            <Chip active={status === 'all'} onClick={() => setStatus('all')}>전체</Chip>
            <Chip active={status === 'WAITING'} onClick={() => setStatus('WAITING')}>결연 대기 ({waiting})</Chip>
            <Chip active={status === 'COMPLETED'} onClick={() => setStatus('COMPLETED')}>결연 완료 ({completed})</Chip>
          </FilterRow>
        </div>
      </div>

      {/* RESULTS */}
      <div className="max-w-[1240px] mx-auto px-6 pb-20">
        <div className="py-8 flex justify-between items-center flex-wrap gap-4">
          <div className="font-bold text-ink-700">
            <strong className="text-blue-700 text-xl">{filtered.length}</strong>명의 학생이 표시되고 있어요
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
                  className="px-4 py-2 pr-10 border border-ink-300 rounded-full text-sm font-semibold bg-white appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                           backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}>
            <option value="id">학번 순</option>
            <option value="waiting">결연 대기 우선</option>
            <option value="recent">최근 등록 순</option>
            <option value="grade">학년 낮은 순</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-ink-500">
            조건에 해당하는 학생이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {filtered.map((s) => (
              <StudentCard key={s.id} student={s} index={s.id} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      <span className="text-xs font-bold text-ink-500 uppercase tracking-wider min-w-[40px]">{label}</span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              active
                ? 'bg-ink-900 text-white border-ink-900'
                : 'bg-white text-ink-700 border-ink-300 hover:border-ink-900'
            }`}>
      {children}
    </button>
  );
}
