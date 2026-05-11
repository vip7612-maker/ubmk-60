# 크롬북 한 대, 공정한 교육기회

몽골 울란바타르 UBMK 학교 중·고등학생 70명과 1:1 결연하여 크롬북 한 대로 공정한 교육기회를 만들어가는 후원 프로젝트.

> **프로젝트명**: 크롬북 한 대, 공정한 교육기회
> **배포 주소**: <https://ubmk-70.vercel.app/>
> **저장소 슬러그**: `ubmk-60` (기존 URL/리소스 안정성을 위해 유지)

## 🛠 기술 스택

- **Next.js 16** (App Router · Turbopack · React 19)
- **TypeScript · Tailwind CSS v4**
- **Turso** (libsql) — DB
- **Vercel Blob** — 이미지 스토리지 (손편지 / 갤러리)
- **JWT (jose) + bcrypt** — 관리자 인증

## 📁 페이지

### 공개
- `/` — 메인 (학교 사진 자동 롤링 히어로 · 진행률 · 학생 미리보기 · 후원자 이야기 · 갤러리)
- `/students` — 70명 학생 그리드 (학년·진로·상태 필터 + 검색)
- `/students/[id]` — 학생 상세 (꿈 · 손편지 한/몽 · 결연 모달)
- `/school` — 학교 소개 + 갤러리
- `/project` — 프로젝트 안내 + 예산
- `/thank-you` — 결연 신청 완료

### 관리자 (`/admin/*` — 로그인 필수, JWT 쿠키)
- `/admin/login` — ID/비밀번호 로그인
- `/admin` — 대시보드 (결연 현황 · 입금 대기 · 최근 신청)
- `/admin/sponsors` — 후원 신청 관리 (상태 변경 · CSV 내보내기 · 메시지 공개 토글)
- `/admin/students` — 학생 정보 편집 (가명/실명/꿈/손편지 이미지·번역)
- `/admin/gallery` — 갤러리 관리 (이미지 업로드 · 카테고리 분류)

## 🚀 시작하기

### 1) 의존성 설치
```bash
npm install
```

### 2) Turso DB 생성
```bash
brew install tursodatabase/tap/turso
turso auth login
turso db create ubmk-60
turso db show ubmk-60 --url        # → TURSO_DATABASE_URL
turso db tokens create ubmk-60     # → TURSO_AUTH_TOKEN
```

### 3) Vercel Blob 스토어 생성
Vercel 대시보드 → Storage → Blob → Create → 토큰 복사 → `BLOB_READ_WRITE_TOKEN`

### 4) 관리자 비밀번호 해시 생성
```bash
npm run hash:password -- yourSecretPassword
# 출력된 $2a$10$... 해시를 ADMIN_PASSWORD_HASH에 저장
```

### 5) 환경변수 설정 (`.env.local`)
```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=...

BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...
AUTH_SECRET=random-32-char-or-longer-secret-string
```
> `AUTH_SECRET`은 `openssl rand -hex 32`로 생성

### 6) DB 시드 (70명 학생 + 5개 갤러리 + 8개 샘플 후원)
```bash
npm run db:seed
```

### 7) 개발 서버
```bash
npm run dev
# http://localhost:3000
# 관리자: http://localhost:3000/admin/login
```

## 🌐 배포 (Vercel)

```bash
vercel link
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD_HASH
vercel env add AUTH_SECRET
vercel deploy --prod
```

## 🎨 디자인 시스템

| 토큰 | 값 | 용도 |
|---|---|---|
| `blue-700` | `#1d4ed8` | Primary CTA · 강조 |
| `amber-500` | `#f59e0b` | Secondary CTA · 따뜻한 강조 |
| `amber-100` | `#fef3c7` | Cream 배경 |
| `ink-900` | `#0f172a` | 본문 / 다크 배경 |
| `Outfit` | 영문 헤드라인 | h1, h2, 통계 숫자 |
| `Pretendard` | 한글 본문 | 모든 한글 텍스트 |

컨셉: 몽골 초원/일몰 (Blue + Amber + Cream) · charity:water / Kiva 스타일

## 📊 DB 스키마

```
students    → 70명 학생 (가명·꿈·손편지·아바타 시드)
sponsors    → 후원 신청 (PENDING / PAID / CANCELED)
gallery     → 학교 활동 사진
```

## 🔐 보안 주요 사항

- 관리자 페이지(`/admin/*`)는 `proxy.ts`(구 middleware)에서 JWT 검증
- 후원 신청 시 status는 항상 `PENDING` — 입금 확인 후 관리자만 `PAID`로 변경
- 학생 status는 `PAID` 처리 시점에만 `COMPLETED`로 자동 전환
- 파일 업로드: PNG/JPEG/WebP, 10MB 상한, MIME 검증
- bcrypt 해시 + 32자 이상 JWT 시크릿 강제

## 📦 주요 npm 스크립트

```
npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버
npm run db:seed          # 70명 학생 시드
npm run hash:password    # 비밀번호 해시 생성
```
