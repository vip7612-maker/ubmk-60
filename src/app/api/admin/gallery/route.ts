import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { title, description, image_url, category, sort_order } = body;
  if (!title || !image_url) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });

  const db = getDb();
  await db.execute({
    sql: 'INSERT INTO gallery (title, description, image_url, category, sort_order) VALUES (?, ?, ?, ?, ?)',
    args: [title, description ?? null, image_url, category || 'general', sort_order || 0],
  });
  return NextResponse.json({ success: true });
}
