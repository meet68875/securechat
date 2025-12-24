"use client";

import { useEffect, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ socket, conversation }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!conversation) return;

    if (conversation.conversationId) {
      socket.emit("join-conversation", conversation.conversationId);

      fetch(`/api/messages/${conversation.conversationId}`)
        .then((res) => {
          if (!res.ok) return [];
          return res.json();
        })
        .then(setMessages)
        .catch(err => console.error("Failed to load messages:", err));
    } else {
   
      setMessages([]);
    }
  }, [conversation, socket]); // Added socket to dependency array

  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", (msg) => {
      const isCurrentChat = 
        msg.conversationId === conversation?.conversationId || 
        msg.senderId === conversation?.user?.id;

      if (isCurrentChat) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("new-message");
  }, [conversation, socket]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <MessageList messages={messages} currentUser={socket?.userId} />
      
      <MessageInput 
         socket={socket}
         conversationId={conversation.conversationId}
         recipientId={conversation.user.id} 
      />
    </div>
  );
}