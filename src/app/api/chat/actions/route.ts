import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Ensure this path is correct
import { currentUser } from "@clerk/nextjs/server"; // Use currentUser for cleaner auth

export async function POST(req: Request) {
  try {
    // 1. Check Auth
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // 2. Parse Body
    const body = await req.json();
    const { action, targetId } = body;

    if (!action || !targetId) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    // 3. Get Current User Data
    const dbUser = await db.user.findUnique({ 
        where: { clerkId: user.id },
        select: { pinnedChatIds: true, mutedChatIds: true } // Select only what we need
    });

    if (!dbUser) return new NextResponse("User not found in database", { status: 404 });

    // --- HANDLE PIN ---
    if (action === "pin") {
      const isPinned = dbUser.pinnedChatIds.includes(targetId);
      const newPinned = isPinned
        ? dbUser.pinnedChatIds.filter(id => id !== targetId) 
        : [...dbUser.pinnedChatIds, targetId];

      await db.user.update({
        where: { clerkId: user.id },
        data: { pinnedChatIds: newPinned }
      });
      
      return NextResponse.json({ success: true, pinned: !isPinned });
    }

    // --- HANDLE MUTE ---
    if (action === "mute") {
      const isMuted = dbUser.mutedChatIds.includes(targetId);
      const newMuted = isMuted
        ? dbUser.mutedChatIds.filter(id => id !== targetId) 
        : [...dbUser.mutedChatIds, targetId];

      await db.user.update({
        where: { clerkId: user.id },
        data: { mutedChatIds: newMuted }
      });
      
      return NextResponse.json({ success: true, muted: !isMuted });
    }

    // --- HANDLE DELETE ---
    if (action === "delete") {
      // Find messages involved
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: targetId },
            { senderId: targetId, receiverId: user.id }
          ]
        },
        select: { id: true, deletedByIds: true } // Optimize fetch
      });

      // Bulk update is tricky with array push in Prisma + Postgres, so we loop safely
      // A better approach for scale is raw SQL, but this is fine for now.
      for (const msg of messages) {
        if (!msg.deletedByIds.includes(user.id)) {
          await db.message.update({
            where: { id: msg.id },
            data: {
              deletedByIds: { push: user.id }
            }
          });
        }
      }

      return NextResponse.json({ success: true, deleted: true });
    }

    return new NextResponse("Invalid Action", { status: 400 });

  } catch (error) {
    console.error("[CHAT_ACTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}