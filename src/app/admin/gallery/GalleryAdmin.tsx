'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { GalleryItem, GalleryCategory } from '@/lib/types';

const CATEGORIES: { key: GalleryCategory; label: string }[] = [
  { key: 'class',    label: '📚 수업' },
  { key: 'event',    label: '🎉 행사' },
  { key: 'facility', label: '🏛️ 시설' },
  { key: 'general',  label: '📷 일반' },
];

export default function GalleryAdmin({ initial }: { initial: GalleryItem[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState({ title: '', description: '', category: 'general' as GalleryCategory, image_url: '' });
  const [error, setError] = useState<string | null>(null);

  function refresh() { startTransition(() => router.refresh()); }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'gallery');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '업로드 실패');
      setDraft(d => ({ ...d, image_url: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setUploading(false);
    }
  }

  async function create() {
    if (!draft.title || !draft.image_url) {
      setError('제목과 이미지가 필요합니다.');
      return;
    }
    setError(null);
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...draft, sort_order: initial.length }),
    });
    if (!res.ok) { setError('등록 실패'); return; }
    setAdding(false);
    setDraft({ title: '', description: '', category: 'general', image_url: '' });
    refresh();
  }

  async function remove(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('삭제 실패'); return; }
    refresh();
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="text-ink-500">전체 {initial.length}개</div>
        <button onClick={() => setAdding(true)}
                className="bg-blue-700 hover:bg-blue-900 text-white px-5 py-2.5 rounded-full font-bold text-sm">
          + 사진 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initial.map(g => (
          <div key={g.id} className="bg-white rounded-2xl overflow-hidden border border-ink-100 shadow-soft group">
            <div className="aspect-[4/3] bg-ink-50 relative overflow-hidden">
              <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
              <button onClick={() => remove(g.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                ×
              </button>
            </div>
            <div className="p-4">
              <span className="text-xs font-bold text-blue-700 uppercase">
                {CATEGORIES.find(c => c.key === g.category)?.label || g.category}
              </span>
              <h3 className="font-bold mt-1">{g.title}</h3>
              {g.description && <p className="text-sm text-ink-500 mt-1">{g.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAdding(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px] p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold mb-6">사진 추가</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase mb-2">이미지</label>
                {draft.image_url && <img src={draft.image_url} className="max-h-48 rounded-lg mb-2" alt="" />}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} disabled={uploading} />
                {uploading && <div className="text-xs text-ink-500 mt-1">업로드 중...</div>}
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase mb-2">제목</label>
                <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}
                       className="w-full px-3 py-2 border border-ink-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase mb-2">설명 (선택)</label>
                <textarea rows={2} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}
                          className="w-full px-3 py-2 border border-ink-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase mb-2">카테고리</label>
                <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as GalleryCategory })}
                        className="w-full px-3 py-2 border border-ink-300 rounded-lg">
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={create} className="flex-1 bg-blue-700 hover:bg-blue-900 text-white py-3 rounded-full font-bold">
                  등록
                </button>
                <button onClick={() => setAdding(false)} className="px-6 bg-ink-100 hover:bg-ink-200 text-ink-700 py-3 rounded-full font-bold">
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
