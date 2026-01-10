import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth(); 
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("partnerId");

    if (!userId || !otherUserId) {
      return new NextResponse("Missing IDs", { status: 400 });
    }

    // Fetch conversation between Current User AND Partner
    // AND ensure the message is NOT deleted by the current user
    const messages = await db.message.findMany({
      where: {
        AND: [
          {
            // Condition 1: Must be between these two users
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId }
            ]
          },
          {
            // Condition 2: Must NOT be deleted by me
            NOT: {
              deletedByIds: { has: userId }
            }
          }
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