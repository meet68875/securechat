"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { apiClient } from "./apiClient";

export function useSocket(onNewMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (!token) return;

    const socket = io({
      path: "/api/socket",
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("new-message", onNewMessage);

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    socketRef.current = socket;

    return () => socket.disconnect();
  }, [onNewMessage]);

  const sendMessage = async (text) => {
    try {

      const res = apiClient("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Message send error:", data);
        return;
      }

      socketRef.current?.emit("send-message", data.message);
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  return { sendMessage };
}
