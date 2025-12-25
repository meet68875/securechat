"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import Navbar from "../Navbar";

export default function ChatLayout({ socket, currentUser }) {
  const [activeConversation, setActiveConversation] = useState(null);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        
        <div 
          className={`${
            activeConversation ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-white shadow-sm z-10`}
        >
          <Sidebar
            onSelect={setActiveConversation}
            currentUser={currentUser}
            activeId={activeConversation?.userId}
          />
        </div>

        <div 
          className={`${
            !activeConversation ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-[#f0f2f5] relative`}
        >
          {activeConversation ? (
            <ChatWindow
              socket={socket}
              conversation={activeConversation}
              currentUser={currentUser}
              onBack={() => setActiveConversation(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
              <div className="w-24 h-24 bg-white rounded-full mb-4 flex items-center justify-center shadow-sm">
                <svg className="w-12 h-12 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-slate-600 font-semibold text-lg">Your Secure Space</h3>
              <p className="text-slate-400 text-sm max-w-xs text-center mt-2">
                Select a contact from the sidebar to start a secure, end-to-end encrypted conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}