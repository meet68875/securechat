import bcrypt from "bcryptjs";
import connectDB from "../../../../../database/mongodb";
import User from "../../../../../database/models/User";
import { signAccessToken, signRefreshToken } from "../../../../../database/jwt";
import { setAuthCookies } from "../../../../../database/cookies";

export async function POST(request) {
  try {
    const { email, password, publicKey } = await request.json();

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

    const user = await User.findOne({ email }).select("+password");
    
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
    if (publicKey) {
      user.identityPublicKey = publicKey;
      await user.save();
    }

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