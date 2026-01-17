"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. USER: Create a new ticket (Contact Form)
export async function createTicket(formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) throw new Error("Must be logged in");

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  await db.supportTicket.create({
    data: {
      userId: userId, 
      subject,
      message,
      status: "PENDING"
    }
  });

  revalidatePath("/dashboard"); 
  return { success: true };
}

// 2. ADMIN: Reply and Update Status
// ✅ FIX: Renamed function to 'resolveTicket' to match your client-side import
export async function resolveTicket(
  ticketId: string, 
  reply: string, 
  status: "RESOLVED" | "REJECTED" | "IN_PROGRESS"
) {
  const { userId } = await auth();
  
  if (!userId) throw new Error("Unauthorized");
  
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  
  // Security Check: Ensure only Admin can resolve
  if (!user || user.role !== "ADMIN") throw new Error("Admin only");

  // Update the ticket
  await db.supportTicket.update({
    where: { id: ticketId },
    data: {
      adminReply: reply,
      status: status
    }
  });

  revalidatePath("/admin/support");
  return { success: true };
}