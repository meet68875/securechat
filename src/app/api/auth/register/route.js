// src/app/api/auth/register/route.js (REVERTED to standard registration)
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '../../../../../database/mongodb';
import { signAccessToken, signRefreshToken } from '../../../../../database/jwt';
import { setCookie } from '../../../../../database/cookies';

export async function POST(request) {
 try {
  const { email, password } = await request.json();

  if (!email || !password) {
   return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  // Check if user already exists
  const existing = await db.collection('users').findOne({ email });
  if (existing) {
   return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  // 🛑 

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.collection('users').insertOne({
   email,
   password: hashedPassword,
   createdAt: new Date(),
  });

  const userId = result.insertedId.toString();
  const deviceId = uuidv4();

  const accessToken = signAccessToken({ userId, deviceId });
  const refreshToken = signRefreshToken({ userId, deviceId });

  const response = NextResponse.json({
   success: true,
   user: { id: userId, email },
   deviceId,
   
  });

  // Set cookies
  response.headers.append(
   'Set-Cookie',
   setCookie('access_token', accessToken, { maxAge: 15 * 60 })
  );
  response.headers.append(
   'Set-Cookie',
   setCookie('refresh_token', refreshToken, { maxAge: 30 * 24 * 60 * 60 })
  );

  return response;
 } catch (err) {
  console.error('Register error:', err);
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}