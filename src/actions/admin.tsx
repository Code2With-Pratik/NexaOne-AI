"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 🔒 Helper to ensure only Admin performs these actions
async function checkAdmin() {
  const { userId } = await auth(); // ⚠️ Ensure 'await' is used here
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
}

// --- 1. USER MANAGEMENT ---

export async function toggleBlockUser(userId: string, shouldBlock: boolean) {
  await checkAdmin();
  await db.user.update({
    where: { id: userId }, 
    data: { isBlocked: shouldBlock },
  });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function giftCredits(userId: string, amount: number) {
  await checkAdmin();
  await db.user.update({
    where: { id: userId },
    data: { creditBalance: { increment: amount } }, 
  });
  revalidatePath("/admin/users");
  return { success: true };
}

// 👇 NEW: Delete User Function
export async function deleteUser(userId: string) {
  await checkAdmin();
  await db.user.delete({
    where: { id: userId },
  });
  revalidatePath("/admin/users");
  return { success: true };
}

// --- 2. SUPPORT / QUERIES ---

export async function resolveTicket(ticketId: string, replyMessage: string) {
  await checkAdmin();
  
  // 1. Update the Ticket
  const ticket = await db.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "RESOLVED",
      adminReply: replyMessage,
    },
    include: { user: true } 
  });

  // 2. Send Notification to User
  await db.notification.create({
    data: {
      userId: ticket.user.clerkId, // Using ClerkId for the relation
      title: "Support Ticket Resolved",
      message: `Admin replied: "${replyMessage.substring(0, 50)}..."`,
    },
  });

  revalidatePath("/admin"); 
  return { success: true };
}

// --- 3. SETTINGS / TESTIMONIALS ---

export async function approveTestimonial(testimonialId: string) {
  await checkAdmin();
  await db.testimonial.update({
    where: { id: testimonialId },
    data: { isPublic: true },
  });
  revalidatePath("/admin/settings");
}

export async function toggleMaintenance(currentState: boolean) {
  await checkAdmin();
  
  // Upsert ensures the row exists if it's the first time
  await db.systemSettings.upsert({
    where: { id: "settings" },
    update: { maintenanceMode: !currentState },
    create: { id: "settings", maintenanceMode: !currentState }
  });
  
  revalidatePath("/");
}