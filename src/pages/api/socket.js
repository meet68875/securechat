// src/pages/api/socket.js
import { Server } from "socket.io";
import { verifyAccessToken } from "../../../database/jwt";
import connectDB from "../../../database/mongodb";
import Conversation from "../../../database/models/Conversation";
import Message from "../../../database/models/Messages";

export default async function handler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  await connectDB();

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Unauthorized"));

      const payload = verifyAccessToken(token);
      if (!payload?.userId) return next(new Error("Invalid token"));

      socket.userId = payload.userId;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId);
    console.log(`✅ Socket Active: ${socket.userId}`);

    socket.on(
      "send-message",
      // 👇 CHANGED: Destructuring 'iv' instead of 'nonce'
      async ({ recipientId, encryptedText, iv, conversationId }) => {
        // 👇 CHANGED: validating 'iv'
        console.log("recipientId,encryptedText,iv",recipientId,encryptedText,iv)
        if (!recipientId || !encryptedText || !iv) {
          console.log("❌ Missing encryption fields (recipient, text, or iv)");
          return;
        }

        try {
          let conversation;
          if (conversationId) {
            conversation = await Conversation.findById(conversationId);
          } else {
            conversation = await Conversation.findOne({
              participants: { $all: [socket.userId, recipientId] },
            });
          }

          if (!conversation) {
            conversation = await Conversation.create({
              participants: [socket.userId, recipientId],
            });
          }

          // 👇 CHANGED: Saving 'iv' to database
          const message = await Message.create({
            conversationId: conversation._id,
            senderId: socket.userId,
            encryptedText: encryptedText,
            iv: iv, 
          });

          conversation.lastMessage = message._id;
          conversation.updatedAt = new Date();
          await conversation.save();

          const payload = {
            _id: message._id.toString(),
            conversationId: conversation._id.toString(),
            senderId: socket.userId.toString(),
            encryptedText: message.encryptedText,
            iv: message.iv, // 👇 CHANGED: Sending 'iv' back to clients
            createdAt: message.createdAt,
          };

          io.to(socket.userId).emit("new-message", payload);
          io.to(recipientId).emit("new-message", payload);
        } catch (error) {
          console.error("❌ Message Error:", error);
        }
      }
    );

    socket.on("disconnect", (reason) => {
      console.log(`❌ Disconnect: ${socket.userId} (${reason})`);
    });
  });

  res.socket.server.io = io;
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};