import Link from 'next/link';
import { type PublicStudent, gradeToLabel, careerLabel } from '@/lib/types';

export default function StudentCard({ student, index }: { student: PublicStudent; index?: number }) {
  const isCompleted = student.status === 'COMPLETED';
  const bgColor = isCompleted ? 'dbeafe' : 'fef3c7';
  const careerKey = student.career_interest[0];
  const hobby = student.hobbies[0];

  return (
    <article className="relative bg-white rounded-[1.5rem] p-5 pt-6 border border-ink-100 shadow-sm hover:shadow-[0_18px_40px_-12px_rgba(15,23,42,.18)] hover:border-blue-500 hover:-translate-y-1.5 transition-all duration-200 flex flex-col">
      {typeof index === 'number' && (
        <span className="absolute top-3 left-3 text-[.7rem] font-bold text-ink-500 bg-ink-50 px-2 py-0.5 rounded-full font-display">
          #{String(index).padStart(2, '0')}
        </span>
      )}
      <span className={`absolute top-3 right-3 text-[.7rem] font-bold px-2.5 py-1 rounded-full ${
        isCompleted ? 'bg-blue-50 text-blue-700' : 'bg-amber-100 text-amber-600'
      }`}>
        {isCompleted ? '결연 완료' : '결연 대기'}
      </span>

      <div className="w-[92px] h-[92px] mx-auto mt-6 mb-3 rounded-full p-1"
           style={{ background: 'linear-gradient(135deg, #eff6ff, #fef3c7)' }}>
        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(student.avatar_seed)}&backgroundColor=${bgColor}`}
             alt={`${student.alias_name} 아바타`}
             className="w-full h-full rounded-full bg-white object-cover" />
      </div>

      <h3 className="text-center text-[1.05rem] font-extrabold mb-0.5">{student.alias_name}</h3>
      <p className="text-center text-xs text-ink-500 mb-3">{gradeToLabel(student.grade)}</p>

      <div className="flex flex-wrap gap-1 justify-center mb-4 min-h-[1.85rem]">
        {careerKey && (
          <span className="text-[.72rem] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
            {careerLabel(careerKey)}
          </span>
        )}
        {hobby && (
          <span className="text-[.72rem] font-semibold px-2 py-1 rounded-full bg-ink-50 text-ink-700">
            {hobby}
          </span>
        )}
      </div>

      <div className="flex gap-1.5 mt-auto">
        {isCompleted ? (
          <Link href={`/students/${student.id}`}
                className="flex-1 text-center py-2 rounded-lg text-[.8rem] font-bold border border-ink-300 text-ink-700 hover:border-ink-900 hover:text-ink-900 transition-colors">
            편지 읽기
          </Link>
        ) : (
          <>
            <Link href={`/students/${student.id}`}
                  className="flex-1 text-center py-2 rounded-lg text-[.8rem] font-bold border border-ink-300 text-ink-700 hover:border-ink-900 transition-colors">
              편지 읽기
            </Link>
            <Link href={`/students/${student.id}#sponsor`}
                  className="flex-1 text-center py-2 rounded-lg text-[.8rem] font-bold bg-blue-700 hover:bg-blue-900 text-white transition-colors">
              결연하기
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
