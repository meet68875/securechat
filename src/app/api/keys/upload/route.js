// app/api/keys/upload/route.js

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "../../../../../database/jwt";
import connectDB from "../../../../../database/mongodb";
import User from "../../../../../database/models/User"; // Ensure User model is imported

export async function POST(req) {
  try {
    // 1. Accept new fields
    const { publicKey, encryptedPrivateKey, keySalt, keyIv } = await req.json();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

    await connectDB();

    // 2. Update all key fields
    await User.findByIdAndUpdate(payload.userId, { 
      identityPublicKey: publicKey,
      encryptedPrivateKey: encryptedPrivateKey,
      keySalt: keySalt,
      keyIv: keyIv
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Key upload failed:", error);
    return NextResponse.json({ error: "Key upload failed" }, { status: 500 });
  }
}