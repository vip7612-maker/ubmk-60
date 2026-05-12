/**
 * 일회성 마이그레이션:
 * - sponsors 테이블에 sponsorship_type / total_amount / installment_* / next_due_day / last_notified_at 컬럼 추가
 * - notifications 테이블 신규 생성
 * - 기존 39건은 ONETIME으로 default 처리됨 (column DEFAULT)
 *
 * idempotent: 이미 컬럼이 있으면 ALTER가 실패해도 무시.
 */
import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env.local' });

const c = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function safeExec(label: string, sql: string) {
  try {
    await c.execute(sql);
    console.log(`✓ ${label}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/duplicate column|already exists/i.test(msg)) {
      console.log(`· ${label} (이미 적용됨)`);
    } else {
      console.error(`❌ ${label}:`, msg);
      throw e;
    }
  }
}

(async () => {
  console.log('▶ sponsors 컬럼 확장 시작');
  await safeExec(
    "ADD sponsorship_type",
    "ALTER TABLE sponsors ADD COLUMN sponsorship_type TEXT NOT NULL DEFAULT 'ONETIME'",
  );
  await safeExec(
    "ADD total_amount",
    "ALTER TABLE sponsors ADD COLUMN total_amount INTEGER NOT NULL DEFAULT 500000",
  );
  await safeExec(
    "ADD installment_total",
    "ALTER TABLE sponsors ADD COLUMN installment_total INTEGER NOT NULL DEFAULT 1",
  );
  await safeExec(
    "ADD installment_paid",
    "ALTER TABLE sponsors ADD COLUMN installment_paid INTEGER NOT NULL DEFAULT 0",
  );
  await safeExec(
    "ADD next_due_day",
    "ALTER TABLE sponsors ADD COLUMN next_due_day INTEGER",
  );
  await safeExec(
    "ADD last_notified_at",
    "ALTER TABLE sponsors ADD COLUMN last_notified_at DATETIME",
  );

  await safeExec(
    "INDEX idx_sponsors_type_due",
    "CREATE INDEX IF NOT EXISTS idx_sponsors_type_due ON sponsors(sponsorship_type, next_due_day)",
  );

  console.log('\n▶ notifications 테이블 생성');
  await safeExec(
    "CREATE notifications",
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sponsor_id         INTEGER NOT NULL,
      channel            TEXT NOT NULL,
      recipient          TEXT NOT NULL,
      subject            TEXT,
      body               TEXT NOT NULL,
      installment_number INTEGER,
      status             TEXT NOT NULL,
      error_message      TEXT,
      sent_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sponsor_id) REFERENCES sponsors(id)
    )`,
  );
  await safeExec(
    "INDEX idx_notifications_sponsor",
    "CREATE INDEX IF NOT EXISTS idx_notifications_sponsor ON notifications(sponsor_id)",
  );
  await safeExec(
    "INDEX idx_notifications_sent_at",
    "CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at)",
  );

  console.log('\n=== Evidence ===');
  const cols = await c.execute("PRAGMA table_info(sponsors)");
  console.log('sponsors 컬럼 수:', cols.rows.length);
  const ncols = await c.execute("PRAGMA table_info(notifications)");
  console.log('notifications 컬럼 수:', ncols.rows.length);
  const cnt = await c.execute(
    "SELECT COUNT(*) as c, COUNT(CASE WHEN sponsorship_type='ONETIME' THEN 1 END) as onetime FROM sponsors"
  );
  console.log('sponsors 총:', cnt.rows[0].c, '/ ONETIME:', cnt.rows[0].onetime);
  process.exit(0);
})().catch(e => { console.error('💥', e); process.exit(1); });
