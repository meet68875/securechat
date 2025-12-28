import { NextResponse } from "next/server";
import User from "../../../../../database/models/User"; // Adjust path if needed
import connectDB from "../../../../../database/mongodb";
export const dynamic = 'force-dynamic';
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { userId } = await params; 
    const user = await User.findById(userId).select("identityPublicKey");
    if (!user || !user.identityPublicKey) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }
    return NextResponse.json({ publicKey: user.identityPublicKey });
  } catch (error) {
    console.error("Key Fetch Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}