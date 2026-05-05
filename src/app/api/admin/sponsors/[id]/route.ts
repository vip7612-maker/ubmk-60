import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { status, messagePublic } = body as { status?: string; messagePublic?: boolean };

  const db = getDb();

  if (status) {
    if (!['PENDING', 'PAID', 'CANCELED'].includes(status)) {
      return NextResponse.json({ error: 'INVALID_STATUS' }, { status: 400 });
    }
    const sponsor = await db.execute({ sql: 'SELECT student_id FROM sponsors WHERE id = ?', args: [id] });
    if (sponsor.rows.length === 0) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    const studentId = Number(sponsor.rows[0].student_id);

    if (status === 'PAID') {
      await db.execute({
        sql: "UPDATE sponsors SET status = 'PAID', paid_at = CURRENT_TIMESTAMP WHERE id = ?",
        args: [id],
      });
      await db.execute({
        sql: "UPDATE students SET status = 'COMPLETED', sponsor_id = ? WHERE id = ?",
        args: [id, studentId],
      });
    } else if (status === 'CANCELED') {
      await db.execute({
        sql: "UPDATE sponsors SET status = 'CANCELED' WHERE id = ?",
        args: [id],
      });
      // Free the student if this was the linked sponsor
      await db.execute({
        sql: "UPDATE students SET status = 'WAITING', sponsor_id = NULL WHERE sponsor_id = ?",
        args: [id],
      });
    } else {
      await db.execute({
        sql: "UPDATE sponsors SET status = 'PENDING', paid_at = NULL WHERE id = ?",
        args: [id],
      });
    }
  }

  if (typeof messagePublic === 'boolean') {
    await db.execute({
      sql: 'UPDATE sponsors SET message_public = ? WHERE id = ?',
      args: [messagePublic ? 1 : 0, id],
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  await db.execute({
    sql: "UPDATE students SET status = 'WAITING', sponsor_id = NULL WHERE sponsor_id = ?",
    args: [id],
  });
  await db.execute({ sql: 'DELETE FROM sponsors WHERE id = ?', args: [id] });
  return NextResponse.json({ success: true });
}
