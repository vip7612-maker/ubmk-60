import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_TOKEN_MISSING' }, { status: 500 });
  }
  const formData = await request.formData();
  const file = formData.get('file');
  const folder = (formData.get('folder') as string | null) || 'uploads';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'NO_FILE' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'BAD_MIME', message: 'PNG, JPEG, WebP만 업로드할 수 있습니다.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'TOO_LARGE', message: '10MB 이하 파일만 업로드 가능합니다.' }, { status: 400 });
  }

  const safeFolder = folder.replace(/[^a-z0-9-_/]/gi, '');
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const filename = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const blob = await put(filename, file, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN });

  return NextResponse.json({ url: blob.url });
}
