import { Server } from "socket.io";
import { verifyAccessToken } from "../../../database/jwt";
import connectDB from "../../../database/mongodb";
import Conversation from "../../../database/Conversation";
import Message from "../../../database/models/Messages";

let io;

export default async function handler(req, res) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server, { path: "/api/socket" });

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Unauthorized"));
        const payload = verifyAccessToken(token);
        socket.userId = payload.userId;
        next();
      } catch {
        next(new Error("Authentication failed"));
      }
    });

    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.userId}`);
      socket.join(socket.userId);

      socket.on("send-message", async ({ recipientId, text }) => {
        if (!recipientId || !text) return;

        await connectDB();

        // 1️⃣ Find or create conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [socket.userId, recipientId] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [socket.userId, recipientId],
          });
        }

        // 2️⃣ Save message
        const message = await Message.create({
          conversationId: conversation._id,
          senderId: socket.userId,
          text,
        });

        conversation.lastMessage = message._id;
        await conversation.save();

        // 3️⃣ Emit to both participants
        io.to(socket.userId).to(recipientId).emit("new-message", {
          _id: message._id,
          conversationId: conversation._id,
          senderId: socket.userId,
          text,
          createdAt: message.createdAt,
        });
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
