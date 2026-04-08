import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('admin_token')?.value;

    const isAdminUrl = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
    const isApiAdminUrl = pathname.startsWith('/api/admin');

    if (isAdminUrl || isApiAdminUrl) {
        if (!token) {
            if (isApiAdminUrl) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            } else {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
