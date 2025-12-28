import { NextResponse } from "next/server";
import { requireAuth } from "../../middleware";
import connectDB from "../../../../../database/mongodb";
import Conversation from "../../../../../database/models/Conversation";
import Messages from "../../../../../database/models/Messages";
import mongoose from "mongoose"; // Import mongoose to validate IDs

export async function GET(req, { params }) {
  try {
    const { userId } = await requireAuth(req);
    const resolvedParams = await params;
    const { conversationId } = resolvedParams;
    if (!conversationId || conversationId === "null" || conversationId === "undefined") {
      return NextResponse.json([]);
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: "Invalid Conversation ID" }, { status: 400 });
    }

    const limit = Number(req.nextUrl.searchParams.get("limit")) || 20;
    const cursor = req.nextUrl.searchParams.get("cursor");

    await connectDB();

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query = { conversationId };
    if (cursor) query._id = { $lt: cursor };

    const messages = await Messages.find(query)
      .sort({ _id: -1 })
      .limit(limit);

    return NextResponse.json(messages.reverse());
  } catch (err) {
    console.error("GET Messages Error:", err);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}