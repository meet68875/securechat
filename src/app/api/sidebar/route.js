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

    // 1. Manually check Auth (easier to debug than middleware for now)
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) {
        console.log("🔴 No Token Found");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
        console.log("🔴 Invalid Token Payload");
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const myId = payload.userId;
    console.log(`🟢 Authenticated User ID: ${myId}`);

    // 2. SIMPLE QUERY (No Aggregation yet)
    // Just try to get 5 users to see if DB has data
    const users = await User.find({ _id: { $ne: myId } }).lean();
    
    console.log(`🟢 Found ${users.length} other users`);

    if (users.length === 0) {
        return NextResponse.json([], { status: 200 });
    }

    // 3. Manual Loop (Slower but 100% reliable for testing)
    const sidebarData = await Promise.all(users.map(async (user) => {
        // Find a conversation where participants include BOTH IDs
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

    console.log("🟢 Sending Response");
    return NextResponse.json(sidebarData, { status: 200 });

  } catch (error) {
    console.error("🔴 SIDEBAR ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}