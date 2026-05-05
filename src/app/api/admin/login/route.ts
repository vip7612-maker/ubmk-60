import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: '잘못된 요청' }, { status: 400 }); }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: '아이디와 비밀번호를 입력해 주세요.' }, { status: 400 });
  }

  const ok = await verifyAdminCredentials(username, password);
  if (!ok) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const token = await createSession(username);
  await setSessionCookie(token);
  return NextResponse.json({ success: true });
}
