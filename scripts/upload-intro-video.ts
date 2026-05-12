import { config } from 'dotenv';
import { put } from '@vercel/blob';
import { readFileSync } from 'node:fs';

config({ path: '.env.local' });

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
if (!blobToken) { console.error('❌ BLOB_READ_WRITE_TOKEN missing'); process.exit(1); }

const SRC = '/Users/kj.lee/Desktop/ UBMK소개영상.mp4';

(async () => {
  console.log(`📤 영상 업로드 시작: ${SRC}`);
  const buf = readFileSync(SRC);
  console.log(`   파일 크기: ${(buf.byteLength / 1024 / 1024).toFixed(1)} MB`);
  const blob = await put(
    `video/ubmk-intro-${Date.now()}.mp4`,
    buf,
    {
      access: 'public',
      token: blobToken,
      contentType: 'video/mp4',
      cacheControlMaxAge: 60 * 60 * 24 * 365, // 1년 캐시
    }
  );
  console.log(`✅ 업로드 완료\n   URL: ${blob.url}`);
})();
