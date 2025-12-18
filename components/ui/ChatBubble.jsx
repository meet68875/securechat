'use client';

import { Avatar } from 'primereact/avatar';
import { format } from 'date-fns';

export default function ChatBubble({ message }) {
  const isMe = message.sender === "me";

  return (
    // items-end ensures the avatar stays at the bottom level of the bubble
    <div className={`flex items-end gap-2 my-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      
      {/* Avatar Section */}
      <div className="flex-shrink-0 mb-6"> {/* Bottom margin accounts for the timestamp height */}
        <Avatar
          label={isMe ? "M" : "AI"}
          size="large"
          shape="circle"
          style={{ 
            backgroundColor: isMe ? '#4F46E5' : '#E5E7EB', 
            color: isMe ? '#ffffff' : '#374151',
            border: isMe ? '2px solid #C7D2FE' : 'none',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        />
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
        
        {/* Bubble */}
        <div
          className={`
            px-4 py-2.5 shadow-md transition-all 
            ${isMe
              ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl rounded-br-none"
              : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-none"
            }
          `}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium">
            {message.text}
          </p>
        </div>

        {/* Timestamp */}
        <span
          className={`text-[10px] uppercase tracking-wide mt-1 font-semibold ${
            isMe ? "text-indigo-600 pr-1" : "text-gray-400 pl-1"
          }`}
        >
          {message.timestamp
            ? format(new Date(message.timestamp), "HH:mm")
            : "Sending..."}
        </span>
      </div>
    </div>
  );
}