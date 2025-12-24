import bcrypt from "bcryptjs";
import connectDB from "../../../../../database/mongodb";
import User from "../../../../../database/models/User";
import { signAccessToken, signRefreshToken } from "../../../../../database/jwt";
import { setAuthCookies } from "../../../../../database/cookies";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return setAuthCookies({
        responseData: { error: "Missing credentials" },
        status: 400,
      });
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+password");
    console.log(user)
    if (!user) {
      return setAuthCookies({
        responseData: { error: "Invalid email or password" },
        status: 401,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return setAuthCookies({
        responseData: { error: "Invalid email or password" },
        status: 401,
      });
    }

    // ✅ Include deviceId later if you want token rotation
    const accessToken = signAccessToken({
      userId: user._id.toString(),
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
    });

    return setAuthCookies({
      responseData: {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
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
