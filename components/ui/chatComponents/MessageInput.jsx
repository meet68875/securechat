"use client";

import { useState } from "react";

// Add recipientId to props so we know who we are talking to
export default function MessageInput({ socket, conversationId, recipientId }) {
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim()) return;

    // ✅ Match the backend logic exactly
    socket.emit("send-message", {
      recipientId,      // REQUIRED for backend to find/create chat
      text: text,       // The message content
      conversationId,   // Optional, but good for reference
    });

    setText("");
  };

  return (
    <div className="p-4 border-t flex">
      <input
        className="flex-1 border p-2 rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button
        onClick={sendMessage}
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
}