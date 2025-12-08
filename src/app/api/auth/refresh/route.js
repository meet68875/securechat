// src/app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import { signAccessToken, verifyRefreshToken } from '../../../../../database/jwt';
import clientPromise from '../../../../../database/mongodb';

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;
    if (!refreshToken) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const payload = verifyRefreshToken(refreshToken);

    // Optional: verify device/session from DB if you want
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const newAccessToken = signAccessToken({ userId: payload.userId, deviceId: payload.deviceId });

    const response = NextResponse.json({ success: true });
    response.headers.append('Set-Cookie', setCookie('access_token', newAccessToken, { maxAge: 15 * 60 }));
    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
