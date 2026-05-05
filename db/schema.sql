-- UBMK 60 Fundraising — Database Schema (Turso / SQLite)

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alias_name      TEXT NOT NULL,           -- 가명 (공개)
  real_name       TEXT,                    -- 실명 (관리자 전용)
  grade           TEXT NOT NULL,           -- '중1' | '중2' | '중3' | '고1' | '고2' | '고3'
  age             INTEGER,
  hobbies         TEXT NOT NULL DEFAULT '[]',         -- JSON array
  career_interest TEXT NOT NULL DEFAULT '[]',         -- JSON array (검색 필터용)
  dream_summary   TEXT,                    -- 카드용 한 줄
  avatar_seed     TEXT NOT NULL,           -- DiceBear seed
  letter_image_url TEXT,                   -- 손편지 스캔 (Vercel Blob)
  letter_text_ko  TEXT,                    -- 한국어 번역
  letter_text_mn  TEXT,                    -- 몽골어 원문
  status          TEXT NOT NULL DEFAULT 'WAITING',    -- 'WAITING' | 'COMPLETED'
  sponsor_id      INTEGER,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sponsor_id) REFERENCES sponsors(id)
);

CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_grade  ON students(grade);

CREATE TABLE IF NOT EXISTS sponsors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT NOT NULL,
  message        TEXT,
  message_public INTEGER NOT NULL DEFAULT 0,         -- 0/1 boolean
  student_id     INTEGER NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING',    -- 'PENDING' | 'PAID' | 'CANCELED'
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at        DATETIME,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX IF NOT EXISTS idx_sponsors_status     ON sponsors(status);
CREATE INDEX IF NOT EXISTS idx_sponsors_student_id ON sponsors(student_id);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',  -- 'class' | 'event' | 'facility' | 'general'
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_category   ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery(sort_order);
