"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. Handle Contact Form Submission (Landing Page)
export async function submitContactForm(formData: FormData) {
  // 🔒 CHECK: Is user logged in?
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  
  if (!email || !message) return { error: "Email and Message are required" };

  // Verify the user exists in our DB
  const existingUser = await db.user.findUnique({
    where: { clerkId: userId }
  });

  if (!existingUser) {
    return { error: "User account not found." };
  }

  // 1. Create the Ticket
  await db.supportTicket.create({
    data: {
      userId: existingUser.clerkId,
      subject: `Contact from ${firstName} ${lastName}`,
      message: message,
      status: "PENDING"
    }
  });

  // 🔔 2. NEW: Notify All Admins
  const admins = await db.user.findMany({ where: { role: "ADMIN" } });

  if (admins.length > 0) {
    await Promise.all(admins.map(admin => 
      db.notification.create({
        data: {
          userId: admin.clerkId,
          title: "New Support Ticket",
          message: `${firstName} ${lastName} submitted a query: "${message.substring(0, 30)}..."`,
          type: "INFO" // "INFO" matches your schema default
        }
      })
    ));
  }

  return { success: "Message sent successfully!" };
}

// 2. Handle Feedback/Testimonial Submission (User Dashboard)
export async function submitFeedback(rating: number, message: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });

  // 1. Create Testimonial
  await db.testimonial.create({
    data: {
      userId,
      name: user?.name || "User",
      avatar: user?.image,
      rating,
      message,
      isPublic: false 
    }
  });

  // 🔔 2. NEW: Notify All Admins
  const admins = await db.user.findMany({ where: { role: "ADMIN" } });

  if (admins.length > 0) {
    await Promise.all(admins.map(admin => 
      db.notification.create({
        data: {
          userId: admin.clerkId,
          title: "New Testimonial",
          message: `${user?.name || "A user"} rated us ${rating} stars! Review it in Settings.`,
          type: "SUCCESS" // Use SUCCESS for positive vibes
        }
      })
    ));
  }

  revalidatePath("/dashboard");
  return { success: true };
}