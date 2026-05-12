import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { name, phone, role, enabled } = body as {
    name?: string; phone?: string; role?: string | null; enabled?: boolean;
  };

  const updates: string[] = [];
  const args: (string | number | null)[] = [];
  if (name !== undefined)    { updates.push('name = ?');    args.push(name); }
  if (phone !== undefined)   { updates.push('phone = ?');   args.push(phone); }
  if (role !== undefined)    { updates.push('role = ?');    args.push(role); }
  if (enabled !== undefined) { updates.push('enabled = ?'); args.push(enabled ? 1 : 0); }
  if (updates.length === 0) return NextResponse.json({ error: 'NO_FIELDS' }, { status: 400 });

  args.push(id);
  const db = getDb();
  await db.execute({ sql: `UPDATE briefing_recipients SET ${updates.join(', ')} WHERE id = ?`, args });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM briefing_recipients WHERE id = ?', args: [id] });
  return NextResponse.json({ success: true });
}
