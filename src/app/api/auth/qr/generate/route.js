// New POST /api/auth/qr/generate (Simplified)

import { NextResponse } from 'next/server'; // Assume you are in app router
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../../../../../../database/redis';

export async function POST(req) {
  // ... authMiddleware check is fine ...
  // This is the unique session ID that the web browser is polling/listening for.
  const sessionToken = uuidv4();
  
  // Store the session token and the user's ID (or simply 'pending')
  await redis.setex(`qr:session:${sessionToken}`, 90, JSON.stringify({ userId: req.userId }));

  // The QR code data needs to be the token AND the server URL for the mobile app to know where to send the POST request.
  // The mobile app will post the sessionToken and its own authentication proof to your confirm endpoint.
  const qrCodeData = JSON.stringify({
    url: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g., https://yourapp.com
    token: sessionToken,
  });

  // The web browser receives the token string encoded with the app identifier
  return NextResponse.json({ qrToken: `SECURECHAT_QR:${qrCodeData}` }); 
}