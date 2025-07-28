import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  // const protectedRoutes = ['/dashboard', '/uploads', '/profile', '/print-jobs'];
  const protectedRoutes = ['/dashboard'];
  
  // Public routes that should redirect to dashboard if already authenticated
  const publicRoutes = ['/auth'];
  
  const userId = request.cookies.get('userId')?.value;
  
  // If trying to access protected route without authentication
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !userId) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // If trying to access auth pages while already authenticated
  if (publicRoutes.some(route => pathname.startsWith(route)) && userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};