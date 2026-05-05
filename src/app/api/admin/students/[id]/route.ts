import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { alias_name, real_name, grade, age, hobbies, career_interest, dream_summary, letter_image_url, letter_text_ko, letter_text_mn } = body;

  const db = getDb();
  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (alias_name !== undefined)      { updates.push('alias_name = ?');      args.push(alias_name); }
  if (real_name !== undefined)       { updates.push('real_name = ?');       args.push(real_name); }
  if (grade !== undefined)           { updates.push('grade = ?');           args.push(grade); }
  if (age !== undefined)             { updates.push('age = ?');             args.push(age); }
  if (hobbies !== undefined)         { updates.push('hobbies = ?');         args.push(JSON.stringify(hobbies)); }
  if (career_interest !== undefined) { updates.push('career_interest = ?'); args.push(JSON.stringify(career_interest)); }
  if (dream_summary !== undefined)   { updates.push('dream_summary = ?');   args.push(dream_summary); }
  if (letter_image_url !== undefined){ updates.push('letter_image_url = ?');args.push(letter_image_url); }
  if (letter_text_ko !== undefined)  { updates.push('letter_text_ko = ?');  args.push(letter_text_ko); }
  if (letter_text_mn !== undefined)  { updates.push('letter_text_mn = ?');  args.push(letter_text_mn); }

  if (updates.length === 0) return NextResponse.json({ error: 'NO_FIELDS' }, { status: 400 });

  args.push(id);
  await db.execute({ sql: `UPDATE students SET ${updates.join(', ')} WHERE id = ?`, args });
  return NextResponse.json({ success: true });
}
