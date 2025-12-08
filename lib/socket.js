import { Server } from "socket.io";
import { verifyAccessToken } from "@/lib/jwt";

let io;

export function initSocket(server) {
  io = new Server(server, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.deviceId = payload.deviceId;

      console.log(`Socket connected → User ${payload.userId}`);
    } catch (err) {
      console.log("Token invalid");
      socket.disconnect();
      return;
    }

    // When frontend sends a new message
    socket.on("send-message", (message) => {
      console.log("Broadcast:", message);

      // Broadcast to all other users
      socket.broadcast.emit("new-message", message);
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  global.io = io;
  return io;
}
