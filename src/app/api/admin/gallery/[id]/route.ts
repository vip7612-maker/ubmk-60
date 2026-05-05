import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { title, description, category, sort_order } = body;
  const db = getDb();

  const updates: string[] = [];
  const args: (string | number | null)[] = [];
  if (title !== undefined)       { updates.push('title = ?');       args.push(title); }
  if (description !== undefined) { updates.push('description = ?'); args.push(description); }
  if (category !== undefined)    { updates.push('category = ?');    args.push(category); }
  if (sort_order !== undefined)  { updates.push('sort_order = ?');  args.push(sort_order); }

  if (updates.length === 0) return NextResponse.json({ error: 'NO_FIELDS' }, { status: 400 });
  args.push(id);
  await db.execute({ sql: `UPDATE gallery SET ${updates.join(', ')} WHERE id = ?`, args });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM gallery WHERE id = ?', args: [id] });
  return NextResponse.json({ success: true });
}
