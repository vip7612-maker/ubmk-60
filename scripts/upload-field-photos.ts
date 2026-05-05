import { config } from 'dotenv';
import { put } from '@vercel/blob';
import { readFileSync } from 'node:fs';

config({ path: '.env.local' });

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
if (!blobToken) { console.error('❌ BLOB_READ_WRITE_TOKEN missing'); process.exit(1); }

const FILES = [
  '/Users/kj.lee/Desktop/1.jpeg',
  '/Users/kj.lee/Desktop/2.jpeg',
  '/Users/kj.lee/Desktop/3.jpeg',
  '/Users/kj.lee/Desktop/5.jpeg',
  '/Users/kj.lee/Desktop/6.jpeg',
];

(async () => {
  console.log('📤 현장 사진 업로드 시작...');
  const urls: string[] = [];
  for (let i = 0; i < FILES.length; i++) {
    const buf = readFileSync(FILES[i]);
    const blob = await put(
      `field/teacher-training-${String(i + 1).padStart(2, '0')}-${Date.now()}.jpg`,
      buf,
      { access: 'public', token: blobToken, contentType: 'image/jpeg' }
    );
    urls.push(blob.url);
    console.log(`✅ [${i + 1}/${FILES.length}] ${blob.url}`);
  }
  console.log('\n=== JSON ARRAY (paste into project page) ===');
  console.log(JSON.stringify(urls, null, 2));
})();
