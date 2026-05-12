import { config } from 'dotenv';
import { put } from '@vercel/blob';
import { readFileSync } from 'node:fs';

config({ path: '.env.local' });

const blobToken = process.env.BLOB_READ_WRITE_TOKEN!;
if (!blobToken) { console.error('❌ BLOB_READ_WRITE_TOKEN missing'); process.exit(1); }

const FILES = [
  '/Users/kj.lee/Desktop/1.jpg',
  '/Users/kj.lee/Desktop/2.jpg',
  '/Users/kj.lee/Desktop/3.jpg',
  '/Users/kj.lee/Desktop/4.jpg',
];

(async () => {
  console.log('📤 메인 hero 사진 업로드 시작...');
  const urls: string[] = [];
  const stamp = Date.now();
  for (let i = 0; i < FILES.length; i++) {
    const buf = readFileSync(FILES[i]);
    const blob = await put(
      `hero/ubmk-life-${String(i + 1).padStart(2, '0')}-${stamp}.jpg`,
      buf,
      { access: 'public', token: blobToken, contentType: 'image/jpeg',
        cacheControlMaxAge: 60 * 60 * 24 * 365 },
    );
    urls.push(blob.url);
    console.log(`✅ [${i + 1}/${FILES.length}] ${(buf.byteLength / 1024).toFixed(0)}KB → ${blob.url}`);
  }
  console.log('\n=== JSON ARRAY (paste into HERO_IMAGES) ===');
  console.log(JSON.stringify(urls, null, 2));
})();
