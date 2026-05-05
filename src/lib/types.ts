export type StudentStatus = 'WAITING' | 'COMPLETED';
export type Grade = '중1' | '중2' | '중3' | '고1' | '고2' | '고3';
export type SponsorStatus = 'PENDING' | 'PAID' | 'CANCELED';
export type GalleryCategory = 'class' | 'event' | 'facility' | 'general';

export interface Student {
  id: number;
  alias_name: string;
  real_name: string | null;
  grade: Grade;
  age: number | null;
  hobbies: string[];
  career_interest: string[];
  dream_summary: string | null;
  avatar_seed: string;
  letter_image_url: string | null;
  letter_text_ko: string | null;
  letter_text_mn: string | null;
  status: StudentStatus;
  sponsor_id: number | null;
  created_at: string;
}

export interface PublicStudent {
  id: number;
  alias_name: string;
  grade: Grade;
  age: number | null;
  hobbies: string[];
  career_interest: string[];
  dream_summary: string | null;
  avatar_seed: string;
  letter_image_url: string | null;
  letter_text_ko: string | null;
  letter_text_mn: string | null;
  status: StudentStatus;
}

export interface Sponsor {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  message_public: boolean;
  student_id: number;
  status: SponsorStatus;
  created_at: string;
  paid_at: string | null;
}

export interface PublicStory {
  id: number;
  message: string;
  sponsor_initial: string;
  student_alias: string;
  student_grade: Grade;
  created_at: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  category: GalleryCategory;
  sort_order: number;
  created_at: string;
}

export const CAREER_OPTIONS = [
  { key: 'IT',      emoji: '💻', label: 'IT·코딩' },
  { key: 'ART',     emoji: '🎨', label: '예술·디자인' },
  { key: 'MED',     emoji: '⚕️', label: '의학·간호' },
  { key: 'EDU',     emoji: '📚', label: '교육' },
  { key: 'MEDIA',   emoji: '🎬', label: '미디어' },
  { key: 'ENG',     emoji: '⚙️', label: '공학' },
  { key: 'SCI',     emoji: '🌱', label: '환경·과학' },
  { key: 'BIZ',     emoji: '💼', label: '경영·창업' },
] as const;

export const GRADE_OPTIONS: Grade[] = ['중1', '중2', '중3', '고1', '고2', '고3'];

export function gradeToLabel(g: Grade): string {
  const map: Record<Grade, string> = {
    '중1': '중학교 1학년',
    '중2': '중학교 2학년',
    '중3': '중학교 3학년',
    '고1': '고등학교 1학년',
    '고2': '고등학교 2학년',
    '고3': '고등학교 3학년',
  };
  return map[g];
}

export function careerLabel(key: string): string {
  const found = CAREER_OPTIONS.find(c => c.key === key);
  return found ? `${found.emoji} ${found.label}` : key;
}
