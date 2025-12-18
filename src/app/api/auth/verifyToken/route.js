// src/app/api/auth/verifyToken/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../database/jwt';

export async function POST(req) {
  const token = req.cookies.get('access_token')?.value; // Retrieve token from cookies

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }

  try {
    const decoded = await verifyAccessToken(token); // Verify the token
    return NextResponse.json({ success: true, decoded }); // Return success if token is valid
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); // Token invalid or expired
  }
}
