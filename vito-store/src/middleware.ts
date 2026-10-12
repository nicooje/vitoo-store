import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminUrl = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
    const isApiAdminUrl = pathname.startsWith('/api/admin');
    if (!isAdminUrl && !isApiAdminUrl) return NextResponse.next();

    const ok = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
    if (ok) {
        const res = NextResponse.next();
        res.headers.set('Cache-Control', 'no-store');
        res.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return res;
    }

    if (isApiAdminUrl) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const url = new URL('/admin/login', request.url);
    if (pathname !== '/admin') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
