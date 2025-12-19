// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../../../../../database/jwt';
import clientPromise from '../../../../../database/mongodb';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Fetch user from database
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create tokens (access and refresh)
    const accessToken = signAccessToken({ userId: user._id.toString() });
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    const response = NextResponse.json({
      success: true,
      user: { id: user._id.toString(), email: user.email },
      token: accessToken, // Send the access token
    });

    // Set cookies for tokens
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
