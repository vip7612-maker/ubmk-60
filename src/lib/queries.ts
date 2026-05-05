import 'server-only';
import { getDb } from './db';
import type { PublicStudent, PublicStory, GalleryItem, Student } from './types';

function rowToPublicStudent(r: Record<string, unknown>): PublicStudent {
  return {
    id: Number(r.id),
    alias_name: String(r.alias_name),
    grade: r.grade as PublicStudent['grade'],
    age: r.age != null ? Number(r.age) : null,
    hobbies: JSON.parse(String(r.hobbies ?? '[]')),
    career_interest: JSON.parse(String(r.career_interest ?? '[]')),
    dream_summary: r.dream_summary as string | null,
    avatar_seed: String(r.avatar_seed),
    letter_image_url: r.letter_image_url as string | null,
    letter_text_ko: r.letter_text_ko as string | null,
    letter_text_mn: r.letter_text_mn as string | null,
    status: r.status as PublicStudent['status'],
  };
}

function rowToStudent(r: Record<string, unknown>): Student {
  return {
    ...rowToPublicStudent(r),
    real_name: r.real_name as string | null,
    sponsor_id: r.sponsor_id != null ? Number(r.sponsor_id) : null,
    created_at: String(r.created_at),
  };
}

export async function listPublicStudents(): Promise<PublicStudent[]> {
  const db = getDb();
  const res = await db.execute(`
    SELECT id, alias_name, grade, age, hobbies, career_interest, dream_summary,
           avatar_seed, letter_image_url, letter_text_ko, letter_text_mn, status
    FROM students
    ORDER BY id ASC
  `);
  return res.rows.map(r => rowToPublicStudent(r as Record<string, unknown>));
}

export async function getPublicStudent(id: number): Promise<PublicStudent | null> {
  const db = getDb();
  const res = await db.execute({
    sql: `SELECT id, alias_name, grade, age, hobbies, career_interest, dream_summary,
                 avatar_seed, letter_image_url, letter_text_ko, letter_text_mn, status
          FROM students WHERE id = ?`,
    args: [id],
  });
  if (res.rows.length === 0) return null;
  return rowToPublicStudent(res.rows[0] as Record<string, unknown>);
}

export async function getStats(): Promise<{ completed: number; total: number; waiting: number }> {
  const db = getDb();
  const res = await db.execute("SELECT status, COUNT(*) as c FROM students GROUP BY status");
  let completed = 0, waiting = 0;
  for (const r of res.rows) {
    const status = String(r.status);
    const c = Number(r.c);
    if (status === 'COMPLETED') completed = c;
    if (status === 'WAITING') waiting = c;
  }
  return { completed, waiting, total: completed + waiting };
}

export async function listPublicStories(limit = 8): Promise<PublicStory[]> {
  const db = getDb();
  const res = await db.execute({
    sql: `SELECT s.id, s.message, s.name, s.created_at, st.alias_name, st.grade
          FROM sponsors s
          JOIN students st ON st.id = s.student_id
          WHERE s.message_public = 1 AND s.message IS NOT NULL AND s.message != ''
            AND s.status IN ('PAID','PENDING')
          ORDER BY s.created_at DESC
          LIMIT ?`,
    args: [limit],
  });
  return res.rows.map(r => ({
    id: Number(r.id),
    message: String(r.message),
    sponsor_initial: String(r.name).slice(0, 1),
    student_alias: String(r.alias_name),
    student_grade: r.grade as PublicStory['student_grade'],
    created_at: String(r.created_at),
  }));
}

export async function listGallery(limit?: number): Promise<GalleryItem[]> {
  const db = getDb();
  const sql = limit
    ? 'SELECT * FROM gallery ORDER BY sort_order ASC, id ASC LIMIT ?'
    : 'SELECT * FROM gallery ORDER BY sort_order ASC, id ASC';
  const res = await db.execute({ sql, args: limit ? [limit] : [] });
  return res.rows.map(r => ({
    id: Number(r.id),
    title: String(r.title),
    description: r.description as string | null,
    image_url: String(r.image_url),
    category: r.category as GalleryItem['category'],
    sort_order: Number(r.sort_order),
    created_at: String(r.created_at),
  }));
}

export async function listAllStudents(): Promise<Student[]> {
  const db = getDb();
  const res = await db.execute('SELECT * FROM students ORDER BY id ASC');
  return res.rows.map(r => rowToStudent(r as Record<string, unknown>));
}
