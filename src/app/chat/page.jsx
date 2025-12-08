// src/app/chat/page.jsx
"use client";

import { useEffect, useRef } from "react"; // Import useRef for auto-scrolling
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Card } from "primereact/card";
import Navbar from "../../../components/ui/Navbar";
import EmptyChatState from "../../../components/ui/EmptyChatState";
import ChatBubble from "../../../components/ui/ChatBubble";
import MessageInput from "../../../components/ui/MessageInput";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { addMessage, setMessages } from "../../../store/slices/messageSlice";
import { useSocket } from "../../../lib/useSoket";
import { apiClient } from "../../../lib/apiClient";
import AuthGuard from "../../../components/AuthGuard";

export default function ChatPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const messages = useAppSelector((state) => state.messages.list);
  const messagesEndRef = useRef(null);
  const userId = useAppSelector((state) => state.auth.userId);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadMessages = async () => {
      try {
        const res = await apiClient("/api/messages", { method: "GET" });

        if (res.ok) {
          const data = await res.json();
          dispatch(setMessages(data.messages || []));
        } else {
          console.error("Load messages failed with status:", res.status);
        }
      } catch (err) {
        if (err.message !== "UNAUTHORIZED_ACCESS_LOGOUT") {
          console.error("Load messages failed:", err);
        }
      }
    };

    loadMessages();
  }, [isLoggedIn, dispatch, router]);
  // Scroll down when new messages are loaded or received
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time messages via Socket.IO
  const handleNewMessage = (message) => {
    console.log("New Message Received:", message);
    dispatch(addMessage(message));
  };

  const { sendMessage } = useSocket(handleNewMessage);

  const handleSend = (text) => {
    if (text.trim()) {
      console.log("handletext", text);

      // 🎯 STEP 1: Create an Optimistic Message Object
      const optimisticMessage = {
        // Temporary ID to display immediately
        id: uuidv4(),
        text: text.trim(),
        sender: "me", // Display as "me" immediately
        userId: userId, // Current user's ID
        timestamp: new Date().toISOString(),
        isOptimistic: true, // Marker for temporary state (optional but useful)
      };

      // 🎯 STEP 2: Dispatch the optimistic message to display it
      dispatch(addMessage(optimisticMessage));

      // 🎯 STEP 3: Send the message to the server
      sendMessage(text);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <AuthGuard>
    <div className="flex flex-col h-screen bg-surface-100">
      <Navbar />

      <div className="flex-1 flex justify-center w-full p-4">
        <Card className="flex-1 max-w-6xl w-full rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {messages.length === 0 ? (
            <EmptyChatState />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          <MessageInput onSend={handleSend} />
        </Card>
      </div>
    </div>
    </AuthGuard>
  );
}
