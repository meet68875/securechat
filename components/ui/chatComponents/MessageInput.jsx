"use client";

import { useState } from "react";
import { encryptMessage, decryptMessage } from "../../../lib/crypto";

export default function MessageInput({
  socket,
  conversationId,
  recipientId,
  messages,
  recipientPublicKey,
  currentUser,   // object { id, username, ... }
  recipientName  // string "Alice"
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- 1. SEND MESSAGE LOGIC (Standard) ---
  const sendMessage = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);

    try {
      // Fetch fresh key to avoid stale data
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

  // --- 2. DOWNLOAD LOGIC (Customized for Names & Timezone) ---
  const handleDownloadChat = () => {
    if (!messages || messages.length === 0) return;
    setIsDownloading(true);

    try {
      // Map messages to the clean format you requested
      const exportData = messages.map((msg) => {
        
        // A. Resolve the Name
        const isMe = msg.senderId === currentUser?.id;
        const senderName = isMe 
          ? (currentUser?.username || "Me") 
          : (recipientName || "Recipient");

        // B. Decrypt the Content
        let content = "[Encrypted]";
        
        if (msg.text && !msg.encryptedText) {
          // System message or plain text
          content = msg.text;
        } else if (recipientPublicKey && msg.encryptedText && msg.iv) {
          try {
            // Decrypt using the stored public key logic
            const result = decryptMessage(msg.encryptedText, msg.iv, recipientPublicKey);
            if (result && !result.startsWith("Error")) {
              content = result;
            } else {
              content = "⚠️ [Decryption Failed]";
            }
          } catch (e) {
            content = "⚠️ [Error]";
          }
        }

        // C. Format Time with TimeZone
        // Example: "12/28/2025, 6:30:00 PM GMT+5:30"
        const timeWithZone = new Date(msg.createdAt).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short' // This adds 'IST', 'EST', or 'GMT+5:30'
        });

        // D. Return the Clean Object
        return {
          Sender: senderName,
          Message: content,
          Time: timeWithZone
        };
      });

      // Create the file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      
      // Filename: "chat_Alice_2025-12-28.json"
      const safeName = (recipientName || "chat").replace(/[^a-z0-9]/gi, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `chat_${safeName}_${dateStr}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to export chat history");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 border-t flex bg-white gap-2 items-center">
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
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send"}
      </button>

      {/* Download Button */}
      <button
        onClick={handleDownloadChat}
        disabled={isDownloading || !messages || messages.length === 0}
        title="Download Chat JSON"
        className="px-3 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center min-w-[44px]"
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