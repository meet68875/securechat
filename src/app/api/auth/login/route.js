import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../../../database/mongodb';
import { setCookie } from '../../../../../database/cookies';
import { signAccessToken, signRefreshToken } from '../../../../../database/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const deviceId = uuidv4();
    const accessToken = signAccessToken({ userId: user._id.toString(), deviceId });
    const refreshToken = signRefreshToken({ userId: user._id.toString(), deviceId });

    const response = NextResponse.json({
      success: true,
      user: { id: user._id.toString(), email: user.email },
    });

    response.headers.append('Set-Cookie', setCookie('access_token', accessToken, { maxAge: 15 * 60 }));
    response.headers.append('Set-Cookie', setCookie('refresh_token', refreshToken, { maxAge: 30 * 24 * 60 * 60 }));

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
