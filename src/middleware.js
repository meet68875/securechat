import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('access_token')?.value;

  console.log('Requested Path:', pathname);

  // 1. AUTHENTICATED ROUTES: Redirect to /login if NO token
  const protectedPaths = ['/chat', '/'];
  if (protectedPaths.some(path => pathname === path || pathname.startsWith('/chat/'))) {
    if (!token) {
      console.log('No token, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  const guestPaths = ['/login', '/register'];
  if (guestPaths.includes(pathname)) {
    if (token) {
      console.log('Already logged in, redirecting to chat');
      return NextResponse.redirect(new URL('/chat', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/chat/:path*', '/login', '/register'],
};