"use client";

import { useEffect, useState } from "react";
import UserItem from "./UserItem";

export default function Sidebar({ currentUser, onSelect, activeId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;

    fetch("/api/sidebar")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((u) => u.user.id !== currentUser.id);
        setUsers(filtered);
      })
      .catch((err) => console.error("Sidebar fetch error:", err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Messages</h1>
        <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
          {currentUser?.username?.[0]?.toUpperCase() || "?"}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map((item) => (
              <UserItem
                key={item.user.id}
                data={item}
                isActive={activeId === item.user.id}
                onClick={() =>
                  onSelect({
                    id: `${currentUser.id}_${item.user.id}`,
                    userId: item.user.id,
                    conversationId: item.conversationId,
                    username: item.user.username || item.user.userusername,
                    email: item.user.email,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}