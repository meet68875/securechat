// src/app/api/middleware/auth.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../database/jwt';
import clientPromise from '../../../database/mongodb';
import { setCookie } from '../../../database/cookies';
import { ObjectId } from 'mongodb';

export async function authMiddleware(request) {
  try {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return logoutResponse();
    }

    const payload = verifyAccessToken(token);

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.userId) });

    if (!user) {
      // User not found → force logout
      return logoutResponse();
    }

    // ✅ Auth success
    return {
      ok: true,
      user,
      userId: payload.userId,
      deviceId: payload.deviceId,
    };
  } catch (err) {
    console.error('AUTH ERROR', err);
    return logoutResponse();
  }
}

// Clears cookies and returns 401
function logoutResponse() {
  const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    response.headers.set('Set-Cookie', clearCookie('access_token'));
  response.headers.append('Set-Cookie', clearCookie('refresh_token'));

  return response;
}


 function clearCookie(name) {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;
}