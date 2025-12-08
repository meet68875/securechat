import { getCachedMessages } from "../../../../database/models/chatCache";
import clientPromise from "../../../../database/mongodb";
import { redis } from "../../../../database/redis";
import { authMiddleware } from "../middleware";

export async function GET(request) {
  const pong = await redis.ping();
  const auth = await authMiddleware(request);
  if (!auth.ok) return auth;
  const userId = auth.userId;
  try {
    const cached = await getCachedMessages(userId);
    if (cached.length > 0) {
      return Response.json({ messages: cached, source: "redis" });
    }

    // MongoDB fallback
    const client = await clientPromise;
    const db = client.db();

    const messages = await db
      .collection("messages")
      .find({ userId })
      .sort({ timestamp: 1 })
      .limit(1000)
      .toArray();

    const formatted = messages.map((m) => ({
      id: m._id.toString(),
      text: m.text,
      sender: m.sender,
      timestamp: m.timestamp,
    }));

    return Response.json({ messages: formatted, source: "mongodb" });
  } catch (err) {
    console.error("Load messages error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
