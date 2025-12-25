/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { decryptMessage } from "../../../lib/crypto";

export default function MessageItem({ message, otherUserPublicKey, isMe }) {
  const [decryptedContent, setDecryptedContent] = useState("");

  useEffect(() => {
    if (message.text && !message.encryptedText) {
      setDecryptedContent(message.text);
      return;
    }

    if (!otherUserPublicKey || !message.encryptedText || !message.iv) {
      setDecryptedContent("🔒 Decrypting...");
      return;
    }

    try {
      const plainText = decryptMessage(
        message.encryptedText,
        message.iv,
        otherUserPublicKey
      );

      setDecryptedContent(plainText || "⚠️ Decryption Failed");
    } catch (err) {
      console.error("Decryption Error:", err);
      setDecryptedContent("❌ Error");
    }
  }, [message, otherUserPublicKey]);

  return (
    <div
      className={`flex w-full px-1 sm:px-2 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          relative
          w-fit
          max-w-[92%]
          sm:max-w-[85%]
          md:max-w-[70%]
          px-3
          pt-2
          pb-5
          rounded-lg
          shadow-sm
          break-words
          ${
            isMe
              ? "bg-[#d9fdd3] text-gray-800 rounded-tr-none"
              : "bg-white text-gray-800 rounded-tl-none"
          }
        `}
      >
        {/* Message Text */}
        <div
          className={`
            text-[13.5px]
            sm:text-[14.5px]
            leading-relaxed
            break-words
            whitespace-pre-wrap
            ${
              isMe
                ? "pr-10 sm:pr-12"
                : "pl-10 sm:pl-12"
            }
          `}
        >
          {decryptedContent}
        </div>

        {/* Timestamp */}
        <div
          className={`
            absolute
            bottom-1
            flex
            items-center
            gap-1
            text-[9px]
            sm:text-[10px]
            ${
              isMe ? "right-2" : "left-2"
            }
          `}
        >
          <span className="text-gray-500 uppercase whitespace-nowrap">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>

          {isMe && (
            <span className="text-blue-500 leading-none">✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
