import { config } from 'dotenv';
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

if (!url || !blobToken) {
  console.error('❌ TURSO_DATABASE_URL / BLOB_READ_WRITE_TOKEN 미설정');
  process.exit(1);
}

const client = createClient({ url, authToken });

const FOLDERS = [
  '/Users/kj.lee/Desktop/손편지_이미지/손편지1',
  '/Users/kj.lee/Desktop/손편지_이미지/손편지2',
  '/Users/kj.lee/Desktop/손편지_이미지/손편지3',
];

function pageNumOf(name: string): number {
  const m = name.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function main() {
  const allFiles: string[] = [];
  for (const folder of FOLDERS) {
    const files = readdirSync(folder)
      .filter(f => /^page-\d+\.(jpg|jpeg|png)$/i.test(f))
      .sort((a, b) => pageNumOf(a) - pageNumOf(b));
    files.forEach(f => allFiles.push(join(folder, f)));
  }

  console.log(`📁 손편지 파일 ${allFiles.length}장 발견 (학생 1번부터 순차 매칭)`);
  if (allFiles.length === 0) {
    console.error('❌ 이미지가 없습니다');
    process.exit(1);
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const studentId = i + 1;
    const filePath = allFiles[i];
    const fname = basename(filePath);

    try {
      const buffer = readFileSync(filePath);
      const blob = await put(
        `letters/student-${String(studentId).padStart(2, '0')}-${Date.now()}.jpg`,
        buffer,
        { access: 'public', token: blobToken, contentType: 'image/jpeg' }
      );

      await client.execute({
        sql: 'UPDATE students SET letter_image_url = ? WHERE id = ?',
        args: [blob.url, studentId],
      });

      success++;
      console.log(`✅ [${String(studentId).padStart(2, '0')}/${allFiles.length}] ${fname}`);
    } catch (err) {
      failed++;
      console.error(`❌ [${studentId}] ${fname} 실패:`, err instanceof Error ? err.message : err);
    }
  }

  console.log('\n=========================================');
  console.log(`🎉 완료 — 성공 ${success}건 / 실패 ${failed}건`);
  console.log('=========================================');

  // Show students still without letters
  const noLetter = await client.execute(
    "SELECT id, alias_name FROM students WHERE letter_image_url IS NULL ORDER BY id"
  );
  if (noLetter.rows.length > 0) {
    console.log(`\n⚠️ 손편지 미등록 학생 (${noLetter.rows.length}명):`);
    noLetter.rows.forEach(r => console.log(`   #${r.id} ${r.alias_name}`));
  }

  process.exit(0);
}

main().catch(err => { console.error('💥', err); process.exit(1); });
