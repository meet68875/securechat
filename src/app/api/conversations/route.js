// src/app/api/conversations/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../../database/mongodb";
import Conversation from "../../../../database/Conversation";
import { requireAuth } from "../middleware";


export async function POST(req) {
  try {
    const { targetUserId } = await req.json();
   const { userId } = await requireAuth(req);

    await connectDB();

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, targetUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, targetUserId],
      });
    }

    return NextResponse.json({ conversationId: conversation._id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
