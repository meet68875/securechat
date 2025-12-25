"use client";

import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

export default function MessageList({
  messages,
  currentUser,
  otherUserPublicKey,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5] custom-scrollbar">
      {messages.map((msg, idx) => {
        const isMe = msg.senderId === currentUser.id;

        return (
          <MessageItem
            key={msg._id || idx}
            message={msg}
            isMe={isMe}
            otherUserPublicKey={otherUserPublicKey} 
          />
        );
      })}
      <div ref={scrollRef} />
    </div>
  );
}
