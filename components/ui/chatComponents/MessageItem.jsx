/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { decryptMessage } from "../../../lib/crypto";

export default function MessageItem({ message, otherUserPublicKey, isMe }) {
  const [decryptedContent, setDecryptedContent] = useState("");
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    // 1. Handle Plain Text (System messages or unencrypted fallback)
    if (message.text && !message.encryptedText) {
      setDecryptedContent(message.text);
      setStatus("success");
      return;
    }

    // 2. Validate Data Presence
    if (!message.encryptedText || !message.iv) {
      setDecryptedContent("⚠️ Corrupted Message Data");
      setStatus("error");
      return;
    }

    // 3. Wait for Key (Crucial for Receiver)
    // If the parent hasn't fetched the key yet, wait.
    if (!otherUserPublicKey) {
      setDecryptedContent("🔒 Waiting for key...");
      setStatus("loading");
      return;
    }

    // 4. Attempt Decryption
    try {
      const plainText = decryptMessage(
        message.encryptedText,
        message.iv,
        otherUserPublicKey
      );

      if (plainText && !plainText.startsWith("Error")) {
        setDecryptedContent(plainText);
        setStatus("success");
      } else {
        throw new Error("Decryption function returned null/error string");
      }
    } catch (err) {
      console.warn("Decryption Failed for Msg ID:", message._id);
      console.warn("Using Public Key:", otherUserPublicKey.substring(0, 10) + "...");
      setDecryptedContent("⚠️ Decryption Failed");
      setStatus("error");
    }
  }, [message, otherUserPublicKey]);

  // --- Styles ---
  const containerAlignment = isMe ? "justify-end" : "justify-start";
  
  const bubbleColor = isMe 
    ? "bg-[#d9fdd3] text-gray-800 rounded-tr-none" 
    : "bg-white text-gray-800 rounded-tl-none";

  const paddingLogic = isMe ? "pr-10 sm:pr-12" : "pl-10 sm:pl-12";
  const timePosition = isMe ? "right-2" : "left-2";

  return (
    <div className={`flex w-full px-1 sm:px-2 ${containerAlignment} mb-2`}>
      <div
        className={`
          relative w-fit max-w-[92%] sm:max-w-[85%] md:max-w-[70%]
          px-3 pt-2 pb-5 rounded-lg shadow-sm break-words
          ${bubbleColor}
        `}
      >
        {/* Message Content */}
        <div className={`
          text-[13.5px] sm:text-[14.5px] leading-relaxed 
          break-words whitespace-pre-wrap ${paddingLogic}
        `}>
          {status === "error" ? (
            <span className="text-red-500 italic flex items-center gap-1">
               {decryptedContent}
            </span>
          ) : status === "loading" ? (
            <span className="text-gray-400 italic flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {decryptedContent}
            </span>
          ) : (
            decryptedContent
          )}
        </div>

        {/* Timestamp & Status */}
        <div className={`absolute bottom-1 flex items-center gap-1 text-[9px] sm:text-[10px] ${timePosition}`}>
          <span className="text-gray-500 uppercase whitespace-nowrap">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>

          {isMe && (
            <span className="text-blue-500 leading-none ml-0.5">
              {/* Double Checkmark for Read, Single for Sent (Static for now) */}
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}