// src/app/api/auth/qr/generate/route.js
import { NextResponse } from "next/server";

import crypto from "crypto";
import connectDB from "../../../../../../database/mongodb";
import { requireAuth } from "@/app/api/middleware";

export async function POST(req) {
  const { userId } = await requireAuth(req);
  await connectDB();

  const token = crypto.randomBytes(32).toString("hex");

  await QrSession.create({
    token,
    userId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
  });

  return NextResponse.json({
    qrToken: token,
  });
}
