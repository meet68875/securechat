// src/components/chat/MessageList.jsx
"use client";

export default function MessageList({ messages }) {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg._id} className="mb-2">
          <div className="inline-block p-2 bg-gray-200 rounded">
            {msg.encryptedText}
          </div>
        </div>
      ))}
    </div>
  );
}
