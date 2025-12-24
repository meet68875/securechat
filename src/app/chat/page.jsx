// src/app/chat/page.jsx
import { cookies } from "next/headers";
import ChatClient from "./ChatClient";

export default async function ChatPage() {
  // 1. Get cookies (await is required in newer Next.js versions)
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // 2. Pass the token to the Client Component
  // If no token exists, the middleware should have already redirected them,
  // but we pass null just in case.
  return <ChatClient token={token} />;
}