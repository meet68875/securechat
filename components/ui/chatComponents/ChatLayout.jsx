// src/components/chat/ChatLayout.jsx
"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

export default function ChatLayout({ socket }) {
  const [activeConversation, setActiveConversation] = useState(null);

  return (
    <div className="flex h-screen">
      <Sidebar onSelect={setActiveConversation} />
      <ChatWindow
        socket={socket}
        conversation={activeConversation}
      />
    </div>
  );
}
