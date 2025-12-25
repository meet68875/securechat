import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { verifyAccessToken } from "../../../../../database/jwt";
import connectDB from "../../../../../database/mongodb";

export async function POST(req) {
  try {
    const { publicKey } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

    await connectDB();

    await User.findByIdAndUpdate(payload.userId, { 
      identityPublicKey: publicKey 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Key upload failed" }, { status: 500 });
  }
}