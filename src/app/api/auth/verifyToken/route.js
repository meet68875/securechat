import { NextResponse } from "next/server";
import { verifyAccessToken } from "../../../../../database/jwt";

export async function POST(req) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "No token provided" },
      { status: 401 }
    );
  }

  try {
    const decoded = verifyAccessToken(token);
    return NextResponse.json({
      success: true,
      user: decoded,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
