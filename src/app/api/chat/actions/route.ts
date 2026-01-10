import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1. Check if user is logged in
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // 2. Get the action (pin, mute, delete) and the target
    const { action, targetId } = await req.json();

    const currentUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!currentUser) return new NextResponse("User not found", { status: 404 });

    // --- HANDLE PIN ---
    if (action === "pin") {
      const isPinned = currentUser.pinnedChatIds.includes(targetId);
      // Toggle: If pinned, remove it. If not pinned, add it.
      const newPinned = isPinned
        ? currentUser.pinnedChatIds.filter(id => id !== targetId) 
        : [...currentUser.pinnedChatIds, targetId];

      await db.user.update({
        where: { clerkId: userId },
        data: { pinnedChatIds: newPinned }
      });
      return NextResponse.json({ success: true, pinned: !isPinned });
    }

    // --- HANDLE MUTE ---
    if (action === "mute") {
      const isMuted = currentUser.mutedChatIds.includes(targetId);
      // Toggle logic
      const newMuted = isMuted
        ? currentUser.mutedChatIds.filter(id => id !== targetId) 
        : [...currentUser.mutedChatIds, targetId];

      await db.user.update({
        where: { clerkId: userId },
        data: { mutedChatIds: newMuted }
      });
      return NextResponse.json({ success: true, muted: !isMuted });
    }

    // --- HANDLE DELETE (SOFT DELETE) ---
    if (action === "delete") {
      // 1. Find all messages between you and the target
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: targetId },
            { senderId: targetId, receiverId: userId }
          ]
        }
      });

      // 2. Loop through and mark them as deleted ONLY for you
      for (const msg of messages) {
        // Only update if you haven't already deleted it
        if (!msg.deletedByIds.includes(userId)) {
          await db.message.update({
            where: { id: msg.id },
            data: {
              deletedByIds: { push: userId } // 👈 Adds your ID to the hidden list
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