"use client";

import { useState } from "react";
import { encryptMessage, decryptMessage } from "../../../lib/crypto"; 

export default function MessageInput({ 
  socket, 
  conversationId, 
  recipientId, 
  messages,
  recipientPublicKey,
  currentUser,  // 👈 New Prop
  recipientName // 👈 New Prop
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const sendMessage = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/keys/${recipientId}`, { cache: 'no-store' });
      const data = await res.json();
      
      if (!data.publicKey) {
        alert("User has no public key!");
        setLoading(false);
        return;
      }

      const { encryptedText, iv } = encryptMessage(text, data.publicKey);

      socket.emit("send-message", {
        recipientId,
        conversationId,
        encryptedText,
        iv,
      });

      setText("");
    } catch (error) {
      console.error("Encryption failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 UPDATED DOWNLOAD LOGIC
  const handleDownloadChat = () => {
    if (!messages || messages.length === 0) return;
    setIsDownloading(true);

    try {
      const exportData = messages.map((msg) => {
        let decryptedContent = "[Encrypted]";

        // 1. Decryption Logic
        if (msg.text && !msg.encryptedText) {
          decryptedContent = msg.text;
        } else if (recipientPublicKey && msg.encryptedText && msg.iv) {
          const result = decryptMessage(msg.encryptedText, msg.iv, recipientPublicKey);
          if (!result || result.startsWith("Error") || result.startsWith("⚠️")) {
             decryptedContent = "⛔ [Unavailable - Old Key]";
          } else {
             decryptedContent = result;
          }
        }

        // 2. Determine Sender Name
        // If the ID matches mine, use my name (or "Me"). Otherwise, use their name.
        const senderName = (msg.senderId === currentUser?.id) 
            ? (currentUser?.username || "Me") 
            : recipientName;

        // 3. Return Clean "Normal" Format
        return {
          Sender: senderName,
          Message: decryptedContent,
          Time: new Date(msg.createdAt).toLocaleString(), // e.g. "12/25/2025, 10:30:00 AM"
        };
      });

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Clean filename: "chat_Alice_TIMESTAMP.json"
      link.download = `chat_${recipientName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed:", err);
      alert("Could not export chat");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 border-t flex bg-white gap-2">
      <input
        className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a secure message..."
        disabled={loading}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      
      <button 
        onClick={sendMessage} 
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Send
      </button>

      <button
        onClick={handleDownloadChat}
        disabled={isDownloading || !messages || messages.length === 0}
        title="Download Chat History"
        className="px-3 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded hover:bg-gray-200 transition disabled:opacity-50"
      >
        {isDownloading ? (
          <span className="block w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        )}
      </button>
    </div>
  );
}