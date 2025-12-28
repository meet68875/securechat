/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ socket, conversation, currentUser }) {
  const [messages, setMessages] = useState([]);
  // Store the other person's public key here
  const [recipientPublicKey, setRecipientPublicKey] = useState(null);

  // 1. Fetch History AND Public Key
  useEffect(() => {
    if (!conversation || !socket) return;

    if (conversation.conversationId) {
      socket.emit("join-conversation", conversation.conversationId);

      // A. Fetch Messages
      fetch(`/api/messages/${conversation.conversationId}`)
        .then((res) => (res.ok ? res.json() : []))
        .then(setMessages)
        .catch((err) => console.error("Failed to load messages:", err));

      if (conversation.userId) {
        fetch(`/api/keys/${conversation.userId}`, {
          cache: "no-store",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.publicKey) setRecipientPublicKey(data.publicKey);
          })
          .catch((err) => console.error("Key fetch failed:", err));
      }
    } else {
      setMessages([]);
      if (conversation.userId) {
        fetch(`/api/keys/${conversation.userId}`, {
          cache: "no-store",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.publicKey) setRecipientPublicKey(data.publicKey);
          });
      }
    }
   
  }, [conversation?.conversationId, conversation?.userId, socket]);

  // 2. Real-time Listener
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg) => {
      const isCurrentChat =
        msg.conversationId === conversation?.conversationId ||
        msg.senderId === conversation?.userId ||
        msg.recipientId === conversation?.userId;

      if (isCurrentChat) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    };
    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, conversation]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-slate-50">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5]">
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center">
        <span className="font-bold text-slate-700">
          {conversation.username || "Chat"}
        </span>
      </div>

      <MessageList
        messages={messages}
        currentUser={currentUser}
        otherUserPublicKey={recipientPublicKey}
      />

      <div className="p-4 bg-white border-t border-slate-200">
        {/* 👇 UPDATED: Passing messages and key down for download logic */}
        <MessageInput
          socket={socket}
          conversationId={conversation.conversationId}
          recipientId={conversation.userId}
          messages={messages}
          recipientPublicKey={recipientPublicKey}
        />
      </div>
    </div>
  );
}