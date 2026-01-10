import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server"; // Commented out for Demo Mode

export async function GET(req: Request) {
  try {
    // --- DEMO MODE FIX ---
    // Instead of getting the real Clerk ID, we use "99" to match your frontend
    const { userId } = await auth(); 
    // ---------------------

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("partnerId");

    if (!userId || !otherUserId) {
      return new NextResponse("Missing IDs", { status: 400 });
    }

    // Fetch conversation between Current User (99) AND Partner (1 or 2)
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: "asc" // Oldest first
      }
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.log("[CHAT_HISTORY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}