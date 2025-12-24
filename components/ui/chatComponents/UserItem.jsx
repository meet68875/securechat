// src/components/chat/UserItem.jsx
"use client";

export default function UserItem({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-4 border-b cursor-pointer hover:bg-gray-100"
    >
      <div className="font-medium">
        {data.user?.email || "User"}
      </div>
      <div className="text-sm text-gray-500 truncate">
        {data.lastMessage?.encryptedText || "No messages"}
      </div>
    </div>
  );
}
