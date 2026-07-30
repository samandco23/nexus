import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SENSITIVE_PATHS = ['/dashboard', '/admin', '/portefeuille', '/investir', '/minage', '/parrainage', '/chat', '/profil'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SENSITIVE_PATHS.some((path) => pathname.startsWith(path))) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|theme-init.js|icons/).*)'],
};
