import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const res = await db.execute(
    'SELECT id, name, phone, role, enabled, created_at FROM briefing_recipients ORDER BY id ASC'
  );
  return NextResponse.json({
    recipients: res.rows.map(r => ({
      id: Number(r.id),
      name: String(r.name),
      phone: String(r.phone),
      role: r.role as string | null,
      enabled: Number(r.enabled) === 1,
      created_at: String(r.created_at),
    })),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, phone, role, enabled } = body as {
    name?: string; phone?: string; role?: string; enabled?: boolean;
  };

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: '이름과 전화번호는 필수입니다.' }, { status: 400 });
  }
  if (name.length > 50 || phone.length > 30) {
    return NextResponse.json({ error: '입력값이 너무 깁니다.' }, { status: 400 });
  }

  const db = getDb();
  const ins = await db.execute({
    sql: 'INSERT INTO briefing_recipients (name, phone, role, enabled) VALUES (?, ?, ?, ?)',
    args: [name.trim(), phone.trim(), role?.trim() || null, enabled === false ? 0 : 1],
  });

  return NextResponse.json({ success: true, id: Number(ins.lastInsertRowid) });
}
