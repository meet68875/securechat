// src/app/api/keys/fetch/[userId]/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../../database/mongodb';
// Assuming you have a middleware or helper function to verify JWT tokens
// import { verifyAuth } from '@/lib/auth'; 

/**
 * Handles GET requests to fetch another user's public key.
 * This route must be protected by authentication middleware (JWT check).
 */
export async function GET(request, { params }) {
  try {
    // ⚠️ Step 1: Authentication Check (Crucial for a protected route)
    // You would typically use middleware here to verify the 'access_token' cookie 
    // or 'Authorization' header before proceeding.
    // const authResult = await verifyAuth(request); 
    // if (!authResult.success) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const targetUserId = params.userId;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing target user ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Step 2: Fetch only the necessary public key from the database
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(targetUserId) },
      { projection: { identityPublicKey: 1, email: 1 } } // Fetch only the public key
    );

    if (!user || !user.identityPublicKey) {
      return NextResponse.json({ error: 'User or public key not found' }, { status: 404 });
    }

    // Step 3: Return the public key
    return NextResponse.json({
      userId: targetUserId,
      email: user.email,
      identityPublicKey: user.identityPublicKey,
    });
  } catch (err) {
    console.error('Key fetch error:', err);
    return NextResponse.json({ error: 'Server error fetching key' }, { status: 500 });
  }
}