import { io } from "socket.io-client";

let socket;

export const getSocket = (token) => {
  if (!socket) {
    socket = io({
      path: "/api/socket",
      // Force websocket only to stop the "Transport unknown" error
      transports: ["websocket"], 
      auth: { token },
      autoConnect: false,
      // Prevents the client from trying other methods if websocket fails initially
      upgrade: false, 
    });
  }
  return socket;
};