/**
 * 55명의 손편지 이미지(Blob letters/)를 Claude Vision으로 OCR해
 * students.letter_text_ko 컬럼에 저장한다.
 *
 * 사용: ANTHROPIC_API_KEY를 .env.local에 추가한 뒤 실행:
 *   npx tsx scripts/ocr-letters.ts
 *
 * - 이미 letter_text_ko가 비어있지 않은 학생도 OVERWRITE한다 (시드의 더미 텍스트를 실제 OCR 결과로 교체).
 * - 부분 실패는 건너뛰고 마지막에 실패 목록을 출력.
 * - 관리자는 /admin/students에서 자유롭게 수정 가능.
 *
 * 비용: 55장 × 약 $0.02 ≈ $1 (Sonnet 4.6 Vision, 이미지 ~500KB 기준)
 */
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env.local', override: true });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY가 .env.local에 없습니다.');
  console.error('   console.anthropic.com에서 키를 발급받아 추가해 주세요.');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });
const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SYSTEM_PROMPT = `당신은 한국어 손글씨 편지를 OCR하는 전문가입니다.
첨부된 이미지는 몽골 UBMK 학교 학생이 직접 쓴 손편지입니다.
다음 규칙을 엄격히 따르세요:

1. 손글씨를 한 글자도 빠짐없이 정확하게 받아 적으세요.
2. 줄바꿈과 문단 구분을 원본 그대로 유지하세요.
3. 맞춤법이 틀리거나 어색한 표현도 학생이 쓴 그대로 옮기세요. 수정하지 마세요.
4. 글씨가 흐릿하거나 알아볼 수 없는 부분은 [?]로 표시하세요.
5. 출력은 OCR된 본문 텍스트만 — 설명·인사·메타 코멘트 없이.
6. 마크다운, 코드블록, 따옴표로 감싸지 마세요. 순수 텍스트만.`;

interface Target {
  id: number;
  alias_name: string;
  letter_image_url: string;
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mediaType: 'image/jpeg' | 'image/png' }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') || '';
  const mediaType: 'image/jpeg' | 'image/png' = ct.includes('png') ? 'image/png' : 'image/jpeg';
  return { data: buf.toString('base64'), mediaType };
}

async function ocrOne(target: Target): Promise<string> {
  const { data, mediaType } = await fetchImageAsBase64(target.letter_image_url);
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
        { type: 'text', text: '위 손편지를 OCR해 한국어 본문만 출력해 주세요.' },
      ],
    }],
  });
  const block = msg.content.find(b => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('빈 응답');
  return block.text.trim();
}

(async () => {
  const res = await db.execute(`
    SELECT id, alias_name, letter_image_url
    FROM students
    WHERE letter_image_url IS NOT NULL AND letter_image_url != ''
    ORDER BY id
  `);
  const targets: Target[] = res.rows.map(r => ({
    id: Number(r.id),
    alias_name: String(r.alias_name),
    letter_image_url: String(r.letter_image_url),
  }));
  console.log(`▶ OCR 대상: ${targets.length}명`);

  const failed: { id: number; alias: string; error: string }[] = [];
  let done = 0;

  for (const t of targets) {
    try {
      const text = await ocrOne(t);
      await db.execute({
        sql: 'UPDATE students SET letter_text_ko = ? WHERE id = ?',
        args: [text, t.id],
      });
      done++;
      const preview = text.replace(/\s+/g, ' ').slice(0, 40);
      console.log(`✅ [${String(t.id).padStart(2, '0')}] ${t.alias_name}: ${preview}…`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      failed.push({ id: t.id, alias: t.alias_name, error: msg });
      console.error(`❌ [${String(t.id).padStart(2, '0')}] ${t.alias_name}: ${msg}`);
    }
    // Rate limit 완화 (Anthropic은 동시성 제한 있음)
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n=== Evidence ===`);
  console.log(`성공: ${done}건 / 실패: ${failed.length}건`);
  if (failed.length > 0) {
    console.log('실패 목록:');
    failed.forEach(f => console.log(`  #${f.id} ${f.alias}: ${f.error}`));
  }
  process.exit(0);
})().catch(e => { console.error('💥', e); process.exit(1); });
