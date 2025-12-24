// src/components/chat/Sidebar.jsx
"use client";

import { useEffect, useState } from "react";
import UserItem from "./UserItem";

export default function Sidebar({ onSelect }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/sidebar")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <div className="w-1/4 border-r overflow-y-auto">
      {users.map((item) => (
        <UserItem
          key={item.user.id}
          data={item}
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
