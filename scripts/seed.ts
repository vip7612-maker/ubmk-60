import { config } from 'dotenv';
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

config({ path: '.env.local' });
config({ path: '.env' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error('❌ TURSO_DATABASE_URL is not set. Configure .env.local first.');
  process.exit(1);
}

const client = createClient({ url, authToken });

const NAMES = [
  '바트','사라','어덴','아리오나','투야','나랑','보로','촐몬','오윤','자야',
  '터무르','바양','뭉크','수렌','얼지','달라이','시네','배기','한드','오트',
  '게렐','솔롱고','너밍','앙흐','바이갈','체첵','우진','오노흐','아마라','자르갈',
  '에르덴','뭉크졸','자가르','바트졸','오드','한단','테무진','촉투','숩드','만달',
  '바이라','너르마','체렝','우야가','다바','보양트','졸자야','초이주','뭉흐','바트가',
  '버르드','아노','체첵마','시농','난당','후렐','어트','바트벌','초그','서론',
  // ── 추가 10명 (기존 60명 유지) ──
  '오르길','강가','갈바','돌고르','치메드','하스','잠바','오슬','벌도','나란투',
];

const CAREERS = ['IT','ART','MED','EDU','MEDIA','ENG','SCI','BIZ'];

const HOBBIES_POOL = [
  '🎵 음악','⚽ 축구','🐎 승마','📖 독서','🎮 게임','🏀 농구','🎤 노래',
  '✏️ 그림','🧩 퍼즐','🏃 달리기','🍳 요리','🎻 악기','📷 사진','🏐 배구',
  '🎯 양궁','🎬 영화','🌍 여행','💃 댄스','🐺 동물','🌌 천문',
];

const DREAMS = [
  '세계 사람들이 함께 즐길 수 있는 게임을 만들고 싶어요.',
  '아픈 사람들을 돌보는 훌륭한 간호사가 되고 싶어요.',
  '몽골의 아름다운 자연을 영상으로 세계에 알리고 싶어요.',
  '아이들에게 꿈을 심어주는 선생님이 되는 것이 꿈이에요.',
  '몽골 최초의 우주 비행사가 되고 싶어요.',
  '환경을 지키는 과학자가 되고 싶어요.',
  '많은 사람을 도울 수 있는 의사가 되고 싶어요.',
  '몽골 전통과 현대를 잇는 디자이너가 되고 싶어요.',
  '직접 회사를 차려서 친구들과 함께 일하고 싶어요.',
  '음악으로 사람들에게 위로를 주는 사람이 되고 싶어요.',
];

const LETTER_KO_TEMPLATES = [
  (name: string, dream: string) => `안녕하세요. 저는 몽골 울란바토르 UBMK 학교에 다니는 ${name}입니다.

저의 꿈은 ${dream}

선생님께서 컴퓨터로 정말 많은 것을 할 수 있다고 알려주셨을 때 신기했어요. 하지만 우리 학교에는 컴퓨터가 많지 않아서, 한 학기에 몇 번 정도밖에 직접 만져볼 수 없어요.

크롬북이 생긴다면 매일 공부할 수 있을 거예요. 작은 것부터 시작해서 큰 꿈을 향해 한 걸음씩 나아가고 싶어요.

저를 응원해주신다면, 그 마음 잊지 않고 열심히 공부하겠습니다. 정말 감사합니다.

— ${name} 올림`,
  (name: string, dream: string) => `반갑습니다. 저는 ${name}이에요.

오늘은 한국에 계신 후원자님께 제 이야기를 해드리고 싶어요. ${dream}

지금은 어렵지만, 좋은 도구가 있다면 더 빨리 배울 수 있을 거예요. 선생님과 친구들과 함께 노력하고 있어요.

크롬북은 저에게 새로운 세상으로 향하는 문이 될 거예요. 그 문을 열어주신다면, 부끄럽지 않은 사람으로 자라나겠습니다.

따뜻한 마음 정말 감사드려요.

— ${name} 드림`,
];

const LETTER_MN_TEMPLATES = [
  (name: string) => `Сайн байна уу. Намайг ${name} гэдэг.

Би UBMK сургуулийн сурагч бөгөөд ирээдүйн мөрөөдөл маань тодорхой бий. Хромбук миний боломжуудыг олон дахин нээх хэрэгсэл болно гэдэгт итгэдэг.

Танд их баярлалаа.

— ${name}`,
];

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('📦 Loading schema...');
  const schemaPath = join(process.cwd(), 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  const statements = schema.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await client.execute(stmt);
  }
  console.log('✅ Schema applied');

  // Wipe existing students/sponsors for clean re-seed.
  // students.sponsor_id ↔ sponsors.student_id 양방향 FK 때문에
  // sponsor_id를 먼저 NULL로 끊은 뒤 sponsors → students 순으로 삭제해야 한다.
  // (gallery는 admin UI에서 추가된 데이터가 있을 수 있어 보존.)
  console.log('🧹 Clearing previous data...');
  await client.execute('UPDATE students SET sponsor_id = NULL');
  await client.execute('DELETE FROM sponsors');
  await client.execute('DELETE FROM students');
  await client.execute("DELETE FROM sqlite_sequence WHERE name IN ('students','sponsors')");

  console.log('🌱 Seeding 70 students...');
  const grades = ['중1', '중2', '중3', '고1', '고2', '고3'];
  const ages: Record<string, number[]> = {
    '중1': [13], '중2': [14], '중3': [15], '고1': [16], '고2': [17], '고3': [18],
  };
  // 기존 1~60은 grades[floor((i-1)/10)] — 학년당 10명씩 그대로 유지.
  // 추가 61~70은 6학년에 골고루 분배 (중1·중2·중3·고1·고2·고3·중2·중3·고1·고2).
  const extraGrades = ['중1', '중2', '중3', '고1', '고2', '고3', '중2', '중3', '고1', '고2'];

  for (let i = 1; i <= 70; i++) {
    const grade = i <= 60 ? grades[Math.floor((i - 1) / 10)] : extraGrades[i - 61];
    const name = NAMES[i - 1];
    const age = ages[grade][0];
    const careers = pickN(CAREERS, Math.floor(Math.random() * 2) + 1);
    const hobbies = pickN(HOBBIES_POOL, 2);
    const dream = pickOne(DREAMS);
    const letterKo = pickOne(LETTER_KO_TEMPLATES)(name, dream);
    const letterMn = pickOne(LETTER_MN_TEMPLATES)(name);

    await client.execute({
      sql: `INSERT INTO students
            (alias_name, real_name, grade, age, hobbies, career_interest, dream_summary, avatar_seed, letter_text_ko, letter_text_mn, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'WAITING')`,
      args: [
        name,
        null,
        grade,
        age,
        JSON.stringify(hobbies),
        JSON.stringify(careers),
        dream,
        `${name}${i}`,
        letterKo,
        letterMn,
      ],
    });
  }

  console.log('🖼️  Seeding sample gallery items...');
  const galleryItems = [
    { title: '컴퓨터실 수업', category: 'class', image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80' },
    { title: '미술 활동', category: 'class', image_url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80' },
    { title: '도서관', category: 'facility', image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80' },
    { title: '합창대회', category: 'event', image_url: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1200&q=80' },
    { title: '캠퍼스 전경', category: 'facility', image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80' },
  ];
  for (let i = 0; i < galleryItems.length; i++) {
    const g = galleryItems[i];
    await client.execute({
      sql: 'INSERT INTO gallery (title, image_url, category, sort_order) VALUES (?, ?, ?, ?)',
      args: [g.title, g.image_url, g.category, i],
    });
  }

  console.log('💝 Seeding 8 sample sponsorships (PAID)...');
  const sponsorSamples = [
    { name: '김지영', message: '바트의 손편지를 읽고 눈물이 났습니다. 첫 코드를 응원합니다.', studentId: 1 },
    { name: '이수민', message: '같은 하늘 아래 같은 도구를 쓴다고 생각하니 마음이 따뜻해집니다.', studentId: 2 },
    { name: '박정훈', message: '꿈이 이루어지길. 작은 도구가 큰 미래로 이어지길 기도합니다.', studentId: 5 },
    { name: '최영호', message: '한 번 갔던 단기선교의 기억이 다시 떠올랐습니다.', studentId: 8 },
    { name: '정현주', message: '몽골의 미래를 응원합니다.', studentId: 11 },
    { name: '강민수', message: '한 걸음씩 나아가는 모습을 멀리서 지켜볼게요.', studentId: 14 },
    { name: '윤서연', message: '꿈을 향해 멈추지 말고 도전하세요.', studentId: 17 },
    { name: '한지호', message: '당신의 가능성을 믿습니다.', studentId: 21 },
  ];
  for (const s of sponsorSamples) {
    await client.execute({
      sql: `INSERT INTO sponsors (name, phone, email, message, message_public, student_id, status, paid_at)
            VALUES (?, ?, ?, ?, 1, ?, 'PAID', CURRENT_TIMESTAMP)`,
      args: [s.name, '010-0000-0000', 'sample@email.com', s.message, s.studentId],
    });
    const sponsorId = (await client.execute('SELECT last_insert_rowid() as id')).rows[0].id;
    await client.execute({
      sql: "UPDATE students SET status = 'COMPLETED', sponsor_id = ? WHERE id = ?",
      args: [sponsorId, s.studentId],
    });
  }

  console.log('🎉 Seed complete!');
  console.log('   • 70 students');
  console.log('   • 8 sample sponsorships (PAID)');
  console.log('   • 5 gallery items');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
