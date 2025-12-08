'use client';

import { Avatar } from 'primereact/avatar';
import { format } from 'date-fns';

export default function ChatBubble({ message }) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex items-end gap-3 my-3 ${isMe ? "flex-row-reverse" : ""}`}>
      
      {/* Avatar */}
      <Avatar
        label={isMe ? "ME" : "AI"}
        size="large"
        shape="circle"
        className={
          isMe
            ? "bg-primary text-white ring-2 ring-primary-400"
            : "bg-gray-200 text-gray-800"
        }
      />

      {/* Message */}
      <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
        
        {/* Bubble */}
        <div
          className={`
            px-4 py-3 text-[15px] leading-relaxed  
            shadow-sm transition-all 
            ${isMe
              ? "bg-primary text-white rounded-xl rounded-br-none"
              : "bg-white text-gray-900 border border-gray-300 rounded-xl rounded-bl-none"
            }
          `}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.text}
          </p>
        </div>

        {/* Timestamp */}
        <span
          className={`text-xs mt-1 ${isMe ? "text-primary-300 pr-1" : "text-gray-500 pl-1"}`}
        >
          {message.timestamp
            ? format(new Date(message.timestamp), "HH:mm")
            : "Sending..."}
        </span>
      </div>
    </div>
  );
}
