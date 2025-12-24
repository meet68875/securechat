import { NextResponse } from "next/server";
import { signAccessToken, verifyRefreshToken } from "../../../../../database/jwt";
import { setAuthCookies } from "../../../../../database/cookies";


export async function POST(req) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token found" },
      { status: 401 }
    );
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const newAccessToken = signAccessToken({
      userId: decoded.userId,
      deviceId: decoded.deviceId,
    });

    return setAuthCookies({
      responseData: { success: true },
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}
