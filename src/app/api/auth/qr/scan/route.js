// src/app/api/auth/qr/scan/route.js
import { NextResponse } from "next/server";
import QrSession from "../../../../../../database/models/QrSession";
import connectDB from "../../../../../../database/mongodb";
import Conversation from "../../../../../../database/models/Conversation";
import Message from "../../../../../../database/models/Messages";


export async function GET(req) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  await connectDB();

  const session = await QrSession.findOne({ token });
  if (!session) {
    return NextResponse.json({ error: "Invalid or expired QR" }, { status: 410 });
  }

  const userId = session.userId;

  // Fetch conversations
  const conversations = await Conversation.find({
    participants: userId,
  }).lean();

  // Fetch messages per conversation
  const data = await Promise.all(
    conversations.map(async (conv) => {
      const messages = await Message.find({
        conversationId: conv._id,
      })
        .sort({ createdAt: 1 })
        .lean();

      return {
        conversationId: conv._id,
        participants: conv.participants,
        messages,
      };
    })
  );

  // Optional: one-time use
  await QrSession.deleteOne({ _id: session._id });

  return NextResponse.json({
    success: true,
    userId,
    conversations: data,
  });
}
