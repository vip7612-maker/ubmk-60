import AdminShell from '@/components/AdminShell';
import GalleryAdmin from './GalleryAdmin';
import { listGallery } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const items = await listGallery();
  return (
    <AdminShell>
      <div className="p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">갤러리 관리</h1>
          <p className="text-ink-500">학교 활동 사진을 등록·관리합니다.</p>
        </div>
        <GalleryAdmin initial={items} />
      </div>
    </AdminShell>
  );
}
