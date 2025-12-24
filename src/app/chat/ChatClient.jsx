// src/app/chat/ChatClient.jsx
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "../../../lib/socket"; // Adjust path if needed
import ChatLayout from "../../../components/ui/chatComponents/ChatLayout";

export default function ChatClient({ token }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    // Initialize socket with the token passed from the server
    const s = getSocket(token);

    if (!s.connected) {
      s.connect();
    }

    setSocket(s);

    // Cleanup when user leaves the page
    return () => {
      if (s) s.disconnect();
    };
  }, [token]);

  if (!socket) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Connecting to secure chat...</p>
      </div>
    );
  }

  return <ChatLayout socket={socket} />;
}