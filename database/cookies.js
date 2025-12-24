import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies({
  responseData = {},
  accessToken,
  refreshToken,
  status = 200,
}) {
  const response = NextResponse.json(responseData, { status });

  if (accessToken) {
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: isProd,          // 🔐 true in prod
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,         // 15 minutes
    });
  }

  if (refreshToken) {
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,          // 🔐 true in prod
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  return response;
}

export function clearAuthCookies() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("access_token", "", {
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("refresh_token", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}
