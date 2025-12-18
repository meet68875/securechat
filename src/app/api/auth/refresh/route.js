import { NextResponse } from 'next/server';
import { signAccessToken, verifyRefreshToken } from '../../../../../database/jwt';
import { setCookie } from '../../../../../database/cookies';


export async function POST(req) {
  const cookies = req.cookies;
  const refreshToken = cookies.refresh_token;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token found' }, { status: 401 });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const newAccessToken = signAccessToken({ userId: decoded.userId, deviceId: decoded.deviceId });

    const response = NextResponse.json({ success: true });
    response.headers.append('Set-Cookie', setCookie('access_token', newAccessToken, { maxAge: 15 * 60 }));

    return response;
  } catch (err) {
    console.error('Refresh token error:', err);
    return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
  }
}
