import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const adminToken = request.cookies.get('admin_auth')?.value;

  if (isAdminRoute) {
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  } else {
    // Don't kill the session on background prefetches
    const isPrefetch = request.headers.get('next-router-prefetch') === '1' || request.headers.get('purpose') === 'prefetch';
    if (adminToken && !isPrefetch) {
      const response = NextResponse.next();
      response.cookies.delete('admin_auth');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
