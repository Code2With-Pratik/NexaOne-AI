import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { action, targetId } = await req.json();

    const currentUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!currentUser) return new NextResponse("User not found", { status: 404 });

    // --- HANDLE PIN ---
    if (action === "pin") {
      const isPinned = currentUser.pinnedChatIds.includes(targetId);
      const newPinned = isPinned
        ? currentUser.pinnedChatIds.filter(id => id !== targetId) // Unpin
        : [...currentUser.pinnedChatIds, targetId]; // Pin

      await db.user.update({
        where: { clerkId: userId },
        data: { pinnedChatIds: newPinned }
      });
      return NextResponse.json({ success: true, pinned: !isPinned });
    }

    // --- HANDLE MUTE ---
    if (action === "mute") {
      const isMuted = currentUser.mutedChatIds.includes(targetId);
      const newMuted = isMuted
        ? currentUser.mutedChatIds.filter(id => id !== targetId) // Unmute
        : [...currentUser.mutedChatIds, targetId]; // Mute

      await db.user.update({
        where: { clerkId: userId },
        data: { mutedChatIds: newMuted }
      });
      return NextResponse.json({ success: true, muted: !isMuted });
    }

    // --- HANDLE DELETE ---
    if (action === "delete") {
      // Deletes ALL messages between you and the target
      await db.message.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: targetId },
            { senderId: targetId, receiverId: userId }
          ]
        }
      });
      return NextResponse.json({ success: true, deleted: true });
    }

    return new NextResponse("Invalid Action", { status: 400 });

  } catch (error) {
    console.error("[CHAT_ACTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}