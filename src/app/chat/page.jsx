// src/app/chat/page.jsx

'use client'; 

import { useEffect, useRef } from "react"; 
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (message) => {
    dispatch(addMessage(message));
  };

  const { sendMessage } = useSocket(handleNewMessage);

  const handleSend = (text) => {
    if (text.trim()) {
      const optimisticMessage = {
        id: uuidv4(),
        text: text.trim(),
        sender: "me",
        userId: userId,
        timestamp: new Date().toISOString(),
        isOptimistic: true,
      };

      dispatch(addMessage(optimisticMessage));
      sendMessage(text);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center w-full p-2 md:p-4 overflow-hidden">
          <Card className="flex-1 max-w-6xl w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
              {messages.length === 0 ? (
                <EmptyChatState />
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <MessageInput onSend={handleSend} />
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
