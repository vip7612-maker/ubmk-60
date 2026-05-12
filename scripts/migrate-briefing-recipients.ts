import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) { console.error('❌ TURSO_DATABASE_URL missing'); process.exit(1); }

const db = createClient({ url, authToken });

(async () => {
  console.log('🔧 briefing_recipients 테이블 생성/검증...');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS briefing_recipients (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL,
      role        TEXT,
      enabled     INTEGER NOT NULL DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.execute('CREATE INDEX IF NOT EXISTS idx_briefing_recipients_enabled ON briefing_recipients(enabled)');

  const exists = await db.execute("SELECT COUNT(*) AS c FROM briefing_recipients");
  const count = Number(exists.rows[0].c);
  console.log(`   현재 ${count}명 등록됨`);

  if (count === 0) {
    console.log('🌱 기본 수신자 시드: 이경진 교장 010-9588-8761');
    await db.execute({
      sql: 'INSERT INTO briefing_recipients (name, phone, role, enabled) VALUES (?, ?, ?, 1)',
      args: ['이경진 교장', '010-9588-8761', '교장'],
    });
  }

  const all = await db.execute('SELECT id, name, phone, role, enabled FROM briefing_recipients ORDER BY id ASC');
  console.log('\n📋 현재 수신자 목록:');
  all.rows.forEach(r => console.log(`   #${r.id} ${r.enabled ? '✅' : '⬜'} ${r.name} (${r.role || '-'}) ${r.phone}`));

  console.log('\n🎉 완료');
  process.exit(0);
})().catch(e => { console.error('💥', e); process.exit(1); });
