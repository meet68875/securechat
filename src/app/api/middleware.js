// src/lib/auth.js

import { verifyAccessToken } from "../../../database/jwt";
import User from "../../../database/models/User";
import connectDB from "../../../database/mongodb";

/**
 * Validate user from request cookies
 * @throws Error("UNAUTHORIZED")
 */
export async function requireAuth(req) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new Error("UNAUTHORIZED");
  }

  await connectDB();

  const user = await User.findById(payload.userId)

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    user,
    userId: user._id.toString(),
    deviceId: payload.deviceId,
  };
}
