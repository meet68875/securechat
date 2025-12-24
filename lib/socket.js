import { io } from "socket.io-client";

let socket;

export function getSocket(token) {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", {
      path: "/api/socket",
      autoConnect: false,
      addTrailingSlash: false, // consistency with backend
      auth: {
        token: token, // Pass the token here!
      },
    });
  }
  return socket;
}