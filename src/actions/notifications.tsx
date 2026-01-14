"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// 1. Fetch Notifications
export async function getNotifications() {
  const { userId } = await auth();
  if (!userId) return [];

  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10 // Limit to recent 10
  });
}

// 2. Mark Single as Read
export async function markAsRead(notificationId: string) {
  const { userId } = await auth();
  if (!userId) return;

  await db.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true }
  });
  
  revalidatePath("/admin");
}

// 3. Mark ALL as Read
export async function markAllAsRead() {
  const { userId } = await auth();
  if (!userId) return;

  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });

  revalidatePath("/admin");
}