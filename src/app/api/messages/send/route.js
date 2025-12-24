// src/app/api/messages/send/route.js
import { NextResponse } from "next/server";
import { requireAuth } from "../../middleware";
import Conversation from "../../../../../database/Conversation";
import Messages from "../../../../../database/models/Messages";


export async function POST(req) {
  try {
    const { conversationId, encryptedText, iv } = await req.json();
       const { userId } = await requireAuth(req);

    await connectDB();

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await Messages.create({
      conversationId,
      senderId: userId,
      encryptedText,
      iv,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    return NextResponse.json({ success: true, message });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
