/**
 * 일회성: 시드 재실행으로 끊긴 letter_image_url을 Blob의 letters/student-XX-* 파일로 복원.
 *
 * - Blob의 letters/ prefix에서 student-(id)-... 패턴을 파싱
 * - 학생 id별 가장 최신 파일을 선택 (timestamp 가장 큰 것)
 * - UPDATE students SET letter_image_url = ? WHERE id = ?
 * - 학생 id 1~55만 영향 (Blob에 55장)
 */
import { config } from 'dotenv';
import { createClient } from '@libsql/client';
import { list } from '@vercel/blob';

config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const blobToken = process.env.BLOB_READ_WRITE_TOKEN!;

(async () => {
  console.log('🔍 Blob letters/ 목록 조회...');
  const { blobs } = await list({ prefix: 'letters/', token: blobToken });
  console.log(`   파일 ${blobs.length}장 발견`);

  // 학생 id별로 (timestamp, url) 페어를 모아 가장 최신 파일 선택
  const latestByStudent = new Map<number, { ts: number; url: string }>();
  for (const b of blobs) {
    const m = b.pathname.match(/letters\/student-(\d+)-(\d+)\./);
    if (!m) continue;
    const sid = parseInt(m[1], 10);
    const ts = parseInt(m[2], 10);
    const cur = latestByStudent.get(sid);
    if (!cur || ts > cur.ts) latestByStudent.set(sid, { ts, url: b.url });
  }
  console.log(`   유효한 학생 id 매핑: ${latestByStudent.size}건`);

  // 작업 전 상태
  const before = await client.execute(
    "SELECT COUNT(*) as filled FROM students WHERE letter_image_url IS NOT NULL"
  );
  console.log(`▶ 작업 전 letter_image_url 채워진 학생: ${before.rows[0].filled}명`);

  let updated = 0;
  for (const [sid, { url }] of [...latestByStudent.entries()].sort((a, b) => a[0] - b[0])) {
    const r = await client.execute({
      sql: 'UPDATE students SET letter_image_url = ? WHERE id = ?',
      args: [url, sid],
    });
    if (r.rowsAffected > 0) updated++;
  }

  // 검증
  const after = await client.execute(
    "SELECT COUNT(*) as filled FROM students WHERE letter_image_url IS NOT NULL"
  );
  const noLetter = await client.execute(
    "SELECT id FROM students WHERE letter_image_url IS NULL ORDER BY id"
  );
  console.log(`✓ UPDATE 적용: ${updated}건`);
  console.log(`✓ 작업 후 letter_image_url 채워진 학생: ${after.rows[0].filled}명`);
  console.log(`⚠ 손편지 미등록 학생 id: ${noLetter.rows.map(r => r.id).join(',')}`);

  process.exit(0);
})().catch(e => { console.error('❌', e); process.exit(1); });
