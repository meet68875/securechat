// app/api/auth/register/route.js

import { v4 as uuidv4 } from "uuid";
import connectDB from "../../../../../database/mongodb";
import User from "../../../../../database/models/User";
import { setAuthCookies } from "../../../../../database/cookies";
import { signAccessToken, signRefreshToken } from "../../../../../database/jwt";

export async function POST(request) {
  try {
    // 1. Accept new fields
    const { 
        email, 
        password, 
        publicKey, 
        encryptedPrivateKey, 
        keySalt, 
        keyIv 
    } = await request.json();

    if (!email || !password) {
      return setAuthCookies({
        responseData: { error: "Missing credentials" },
        status: 400,
      });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return setAuthCookies({
        responseData: { error: "User already exists" },
        status: 409,
      });
    }

    // 2. Save Encrypted Key Blob to DB
    const user = await User.create({
      email,
      password: password,
      identityPublicKey: publicKey || null,
      encryptedPrivateKey: encryptedPrivateKey || null,
      keySalt: keySalt || null,
      keyIv: keyIv || null
    });

    const deviceId = uuidv4();

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      deviceId,
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      deviceId,
    });

    return setAuthCookies({
      responseData: {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          publicKey: user.identityPublicKey,
          // We don't need to return the private key here; the client already has it in memory
        },
        deviceId,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    return setAuthCookies({
      responseData: { error: "Server error" },
      status: 500,
    });
  }
}