// src/app/api/auth/qr/claim/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
// Assuming the following are correctly resolved from your project structure
import { signAccessToken, signRefreshToken } from '../../../../../../database/jwt'; 
import { redis } from '../../../../../../database/redis';
// import clientPromise from '../../../../../../database/mongodb'; // Not strictly needed here

// --- PLACEHOLDER FUNCTIONS ---
// You MUST implement these based on your server setup.

/**
 * ⚠️ Placeholder: Verifies the mobileAuthToken against your user store.
 * @param {string} token - The JWT or session token from the mobile client.
 * @returns {Promise<object | null>} The user object (e.g., { _id, email }) or null if invalid.
 */
async function verifyMobileAuth(token) {
  // In a real app, you would verify the JWT, check session in DB, etc.
  console.log(`Verifying mobile token: ${token}`);
  if (token === 'VALID_MOBILE_JWT_123') {
    return { 
      _id: new ObjectId("60c72b12f9e72f0015b81f1e"), // Example MongoDB ObjectId
      email: 'mobile.user@example.com' 
    };
  }
  return null;
}

/**
 * ⚠️ Placeholder: Pushes the login success payload to the waiting web client.
 * This should use a dedicated WebSocket server's broadcast mechanism (e.g., Redis Pub/Sub, Socket.IO, or similar).
 * @param {string} sessionId - The unique token used as the channel ID for the web client.
 * @param {object} payload - The tokens/user info to send to the web client.
 */
async function triggerWebSocketLogin(sessionId, payload) {
    console.log(`\n--- WEBSOCKET BROADCAST TRIGGERED ---\n`);
    console.log(`Channel: qr:session:${sessionId}`);
    console.log('Payload:', payload);
    // Real implementation: Publish a message to a Redis Pub/Sub channel 
    // that your WebSocket server is subscribed to.
    // await redis.publish(`qr:login-channel:${sessionId}`, JSON.stringify(payload)); 
    console.log(`\n-------------------------------------\n`);
}
// ---------------------------------

/**
 * Handles POST requests when the mobile app scans the QR code and sends the claim.
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} Status of the login trigger.
 */
export async function POST(req) {
  const { qrToken, mobileAuthToken } = await req.json();

  if (!qrToken || !mobileAuthToken) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
  }

  // Expecting a format like: SECURECHAT_QR:{"token":"..."}
  if (!qrToken?.startsWith('SECURECHAT_QR:')) {
    return NextResponse.json({ error: 'Invalid QR token format' }, { status: 400 });
  }

  // 1. Extract the raw session token from the QR code value
  let token;
  try {
    token = JSON.parse(qrToken.split(':')[1]).token;
  } catch (e) {
    return NextResponse.json({ error: 'Malformed QR code value' }, { status: 400 });
  }
  
  // 2. Validate the session token and delete it (Ensures single use)
  const data = await redis.getdel(`qr:session:${token}`);
  if (!data) {
    // 410 Gone: token existed but has expired or was already used/deleted
    return NextResponse.json({ error: 'Expired, used, or invalid session' }, { status: 410 });
  }
  const sessionData = JSON.parse(data); // Can retrieve original status if needed

  // 3. Use mobileAuthToken to verify the mobile user identity
  const mobileUser = await verifyMobileAuth(mobileAuthToken); 
  if (!mobileUser) {
    return NextResponse.json({ error: 'Mobile authentication failed' }, { status: 401 });
  }
  const userId = mobileUser._id.toString(); 

  // 4. Generate the final access/refresh tokens for the web browser session
  const deviceId = uuidv4();
  const access = signAccessToken({ userId, deviceId });
  const refresh = signRefreshToken({ userId, deviceId }); // Ensure you store refresh tokens securely

  // 5. 🎯 CRITICAL STEP: PUSH LOGIN TO WEB BROWSER VIA WEBSOCKET
  const wsLoginPayload = {
    type: 'qr-login-success',
    accessToken: access, 
    refreshToken: refresh, 
    user: { email: mobileUser.email, id: userId },
    deviceId,
  };
  
  // Broadcast this payload to the unique channel associated with the 'token'
  await triggerWebSocketLogin(token, wsLoginPayload);

  // 6. Return success to the mobile app
  return NextResponse.json({ success: true, message: "Login success pushed to web client" });
}