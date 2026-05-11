export default function ProgressCard({ completed, total = 70, variant = 'default' }: {
  completed: number;
  total?: number;
  variant?: 'default' | 'amber';
}) {
  const percent = Math.min(100, Math.round((completed / total) * 100));
  const isAmber = variant === 'amber';

  return (
    <div className={`rounded-[1.5rem] p-7 shadow-soft border ${
      isAmber ? 'border-amber-100' : 'border-ink-100 bg-white'
    }`}
         style={isAmber ? { background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)' } : undefined}>
      <div className="flex justify-between items-baseline flex-wrap gap-2 mb-4">
        <div>
          <div className="font-display font-extrabold text-[1.5rem]">
            <strong className="text-blue-700 text-[2rem] mr-1">{completed}</strong>
            / {total}대 결연 완료
          </div>
          <div className="text-ink-500 text-sm mt-1">
            크롬북 한 대 = 50만원 · 한 학생의 미래
          </div>
        </div>
        <div className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-bold">
          {percent}% 달성
        </div>
      </div>
      <div className="h-3.5 bg-white/80 rounded-full overflow-hidden shadow-inner">
        <div className="h-full rounded-full transition-all duration-1000 shimmer-bar"
             style={{
               width: `${percent}%`,
               background: 'linear-gradient(90deg, #2563eb, #3b82f6, #f59e0b)',
             }} />
      </div>
    </div>
  );
}
