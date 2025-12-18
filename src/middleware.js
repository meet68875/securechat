// src/middleware.js
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Get the token from the cookies
  const token = req.cookies.get('access_token')?.value;

  console.log('Requested Path:', pathname);
  console.log('Token:', token);

  // Protect the chat page and root page
  if (pathname === '/chat' || pathname === '/') {
    if (!token) {
      console.log('No token, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Token exists, let the request proceed to the next stage
    return NextResponse.next();
  }

  // If the path is not protected, let the request pass through
  return NextResponse.next();
}

// Optional: Add matcher to apply only on specific routes
export const config = {
  matcher: ['/', '/chat/:path*'],
};
