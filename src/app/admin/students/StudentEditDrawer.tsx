'use client';

import { useState } from 'react';
import { type Student, CAREER_OPTIONS, GRADE_OPTIONS } from '@/lib/types';

export default function StudentEditDrawer({ student, onClose, onSaved }: {
  student: Student; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    alias_name: student.alias_name,
    real_name: student.real_name || '',
    grade: student.grade,
    age: student.age || 0,
    hobbies: student.hobbies.join(', '),
    career_interest: [...student.career_interest],
    dream_summary: student.dream_summary || '',
    letter_image_url: student.letter_image_url || '',
    letter_text_ko: student.letter_text_ko || '',
    letter_text_mn: student.letter_text_mn || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCareer(key: string) {
    setForm(f => ({
      ...f,
      career_interest: f.career_interest.includes(key)
        ? f.career_interest.filter(c => c !== key)
        : [...f.career_interest, key],
    }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'letters');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '업로드 실패');
      setForm(f => ({ ...f, letter_image_url: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias_name: form.alias_name,
          real_name: form.real_name || null,
          grade: form.grade,
          age: Number(form.age) || null,
          hobbies: form.hobbies.split(',').map(h => h.trim()).filter(Boolean),
          career_interest: form.career_interest,
          dream_summary: form.dream_summary || null,
          letter_image_url: form.letter_image_url || null,
          letter_text_ko: form.letter_text_ko || null,
          letter_text_mn: form.letter_text_mn || null,
        }),
      });
      if (!res.ok) throw new Error('저장 실패');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-[640px] h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-ink-100 px-8 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-extrabold">학생 #{String(student.id).padStart(2, '0')} 편집</h2>
            <div className="text-sm text-ink-500">{student.alias_name}</div>
          </div>
          <button onClick={onClose} className="text-2xl text-ink-500 hover:text-ink-900">×</button>
        </div>

        <div className="p-8 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <Field label="가명">
              <input value={form.alias_name} onChange={e => setForm({ ...form, alias_name: e.target.value })}
                     className="input" />
            </Field>
            <Field label="실명 (관리자 전용)">
              <input value={form.real_name} onChange={e => setForm({ ...form, real_name: e.target.value })}
                     className="input" />
            </Field>
            <Field label="학년">
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value as Student['grade'] })}
                      className="input">
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="나이">
              <input type="number" value={form.age} onChange={e => setForm({ ...form, age: Number(e.target.value) })}
                     className="input" />
            </Field>
          </div>

          <Field label="취미 (쉼표로 구분)">
            <input value={form.hobbies} onChange={e => setForm({ ...form, hobbies: e.target.value })}
                   placeholder="🎵 음악, ⚽ 축구"
                   className="input" />
          </Field>

          <Field label="관심 진로">
            <div className="flex flex-wrap gap-2">
              {CAREER_OPTIONS.map(c => (
                <button type="button" key={c.key} onClick={() => toggleCareer(c.key)}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                          form.career_interest.includes(c.key)
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-ink-700 border-ink-300 hover:border-ink-900'
                        }`}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="꿈 한 줄 요약">
            <input value={form.dream_summary} onChange={e => setForm({ ...form, dream_summary: e.target.value })}
                   placeholder="세계 사람들이 함께 즐길 수 있는 게임을 만들고 싶어요."
                   className="input" />
          </Field>

          <Field label="손편지 이미지">
            <div className="space-y-3">
              {form.letter_image_url && (
                <img src={form.letter_image_url} alt="손편지" className="max-h-[240px] rounded-lg border border-ink-200" />
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} disabled={uploading}
                     className="block text-sm" />
              {uploading && <div className="text-xs text-ink-500">업로드 중...</div>}
            </div>
          </Field>

          <Field label="손편지 (한국어)">
            <textarea rows={6} value={form.letter_text_ko} onChange={e => setForm({ ...form, letter_text_ko: e.target.value })}
                      className="input resize-y" />
          </Field>

          <Field label="손편지 (몽골어 원문)">
            <textarea rows={4} value={form.letter_text_mn} onChange={e => setForm({ ...form, letter_text_mn: e.target.value })}
                      className="input resize-y" />
          </Field>

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button onClick={save} disabled={saving}
                    className="flex-1 bg-blue-700 hover:bg-blue-900 disabled:bg-ink-300 text-white py-3 rounded-full font-bold">
              {saving ? '저장 중...' : '저장'}
            </button>
            <button onClick={onClose}
                    className="px-6 bg-ink-100 hover:bg-ink-200 text-ink-700 py-3 rounded-full font-bold">
              취소
            </button>
          </div>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            padding: 0.6rem 0.875rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.5rem;
            font-size: 0.9rem;
            font-family: inherit;
          }
          .input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37,99,235,.1);
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}
