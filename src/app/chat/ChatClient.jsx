  "use client";

  import { useEffect, useState, useRef } from "react";
  import { getSocket } from "../../../lib/socket";
  import ChatLayout from "../../../components/ui/chatComponents/ChatLayout";

  export default function ChatClient({ token }) {
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    // Use a ref to prevent double-firing in Strict Mode, 
    // but ensure we reset it properly on unmount if needed.
    const didInit = useRef(false);

    useEffect(() => {
      if (!token) return;
      
      // 1. Decode User (moved outside the async function for immediate availability)
      try {
        // Decode the payload (Part 2 of JWT)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        setCurrentUser({ id: payload.userId, email: payload.email });
      } catch (err) {
        console.error("JWT Decode Error:", err);
        return; // Stop if token is invalid
      }

      if (didInit.current) return;
      didInit.current = true;

      let socketInstance = null;

      const startSocket = async () => {
        try {
          // 2. Wake up the server
          await fetch("/api/socket");
        } catch (err) {
          console.warn("Socket API ping failed, but attempting connection anyway:", err);
        }

        // 3. Get the Singleton Socket
        socketInstance = getSocket(token);

        // 4. Define Listeners
        const onConnect = () => {
          console.log("✅ Socket Connected via Event");
          setIsConnected(true);
        };

        const onDisconnect = () => {
          console.log("❌ Socket Disconnected via Event");
          setIsConnected(false);
        };

        // 5. Attach Listeners
        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);

        // 6. 🚀 CRITICAL FIX: Handle "Already Connected" State
        if (socketInstance.connected) {
          console.log("⚡ Socket was already connected");
          onConnect(); // Manually trigger state update
        } else {
          socketInstance.connect();
        }

        setSocket(socketInstance);
      };

      startSocket();

      // Cleanup
      return () => {
        if (socketInstance) {
          socketInstance.off("connect");
          socketInstance.off("disconnect");
          // We do NOT disconnect here to keep the connection alive on navigation
          // connectionStarted/didInit ref reset handled by React unmount logic implicitly
        }
        // Reset ref so if they leave and come back, we re-init listeners
        didInit.current = false; 
      };
    }, [token]);

    if (!isConnected || !currentUser) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-gray-600 font-medium animate-pulse">
              {currentUser ? "Connecting to chat..." : "Verifying identity..."}
            </p>
          </div>
        </div>
      );
    }

    return <ChatLayout socket={socket} currentUser={currentUser} />;
  }