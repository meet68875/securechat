import { NextResponse } from "next/server";
// import { requireAuth } from "../middleware"; // Comment this out temporarily if unsure
import { cookies } from "next/headers";
import { verifyAccessToken } from "../../../../database/jwt"; // Verify this path
import connectDB from "../../../../database/mongodb";
import User from "../../../../database/models/User";
import Conversation from "../../../../database/Conversation";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    console.log("🟢 API: /api/users/sidebar HIT");

    await connectDB();
    console.log("🟢 DB Connected");

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const myId = payload.userId;

    const users = await User.find({ _id: { $ne: myId } }).lean();
    

    if (users.length === 0) {
        return NextResponse.json([], { status: 200 });
    }

    const sidebarData = await Promise.all(users.map(async (user) => {
        const conversation = await Conversation.findOne({
            participants: { $all: [myId, user._id] }
        }).sort({ updatedAt: -1 }); // Get latest

        return {
            user: {
                id: user._id,
                email: user.email,
                username: user.username || "User",
            },
            conversationId: conversation ? conversation._id : null,
            lastMessage: conversation ? conversation.lastMessage : null
        };
    }));

    return NextResponse.json(sidebarData, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}