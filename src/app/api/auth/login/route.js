import bcrypt from "bcryptjs";
import connectDB from "../../../../../database/mongodb";
import User from "../../../../../database/models/User";
import { signAccessToken, signRefreshToken } from "../../../../../database/jwt";
import { setAuthCookies } from "../../../../../database/cookies";

export async function POST(request) {
  try {
    // 1. ✅ Fix: Destructure ALL needed fields
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
        responseData: {
          success: false,
          error: "Email and password are required",
        },
        status: 400,
      });
    }

    await connectDB();

    // 2. Select hidden fields so we can send them back to the user
    const user = await User.findOne({ email }).select(
      "+password +encryptedPrivateKey +keySalt +keyIv"
    );

    // 3. ✅ Fix: Check user existence BEFORE accessing properties
    if (!user) {
      return setAuthCookies({
        responseData: {
          success: false,
          error: "Invalid email or password",
        },
        status: 401,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return setAuthCookies({
        responseData: {
          success: false,
          error: "Invalid email or password",
        },
        status: 401,
      });
    }

    // 4. ✅ Logic Update: Handle Key Storage (Only if DB is empty)
    // We only save new keys if the user doesn't have them yet.
    const hasExistingKeys = user.encryptedPrivateKey && user.identityPublicKey;

    if (!hasExistingKeys && publicKey && encryptedPrivateKey && keySalt && keyIv) {
      console.log("Saving new key backup for user...");
      user.identityPublicKey = publicKey;
      user.encryptedPrivateKey = encryptedPrivateKey;
      user.keySalt = keySalt;
      user.keyIv = keyIv;
      await user.save();
    } 
    // ⚠️ REMOVED the dangerous "if (publicKey)" block at the bottom.
    // We do NOT want to overwrite the public key unless we are also 
    // saving the private key backup (handled in the block above).

    const accessToken = signAccessToken({
      userId: user._id.toString(),
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
    });

    // 5. ✅ Fix: Return the backup keys to the client
    return setAuthCookies({
      responseData: {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          identityPublicKey: user.identityPublicKey,
          // 👇 The client needs these to decrypt their chat history!
          encryptedPrivateKey: user.encryptedPrivateKey,
          keySalt: user.keySalt,
          keyIv: user.keyIv,
        },
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    return setAuthCookies({
      responseData: { error: "Login failed" },
      status: 500,
    });
  }
}