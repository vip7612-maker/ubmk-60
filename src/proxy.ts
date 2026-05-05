import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'ubmk_admin';

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow login route + the API endpoint that creates the session
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const ok = await isAuthed(req);
    if (!ok) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
