import { NextResponse } from 'next/server';
import cookie from 'cookie';

export async function POST() {
  // Delete the cookies (both access and refresh tokens)
  const response = NextResponse.json({ message: 'Logged out' });

  response.headers.append('Set-Cookie', cookie.serialize('access_token', '', { path: '/', expires: new Date(0) }));
  response.headers.append('Set-Cookie', cookie.serialize('refresh_token', '', { path: '/', expires: new Date(0) }));

  return response;
}
