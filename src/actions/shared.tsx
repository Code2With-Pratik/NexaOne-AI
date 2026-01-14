"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; // 👈 Import this

// 1. Handle Contact Form Submission (Landing Page)
export async function submitContactForm(formData: FormData) {
  // 🔒 CHECK: Is user logged in?
  const { userId } = await auth();
  
  if (!userId) {
    // 🚫 If not, redirect immediately to Sign In
    // This throws a NEXT_REDIRECT error which is handled automatically
    redirect("/sign-in");
  }

  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  
  if (!email || !message) return { error: "Email and Message are required" };

  // Verify the user exists in our DB (Double check)
  const existingUser = await db.user.findUnique({
    where: { clerkId: userId } // Use clerkId since we know they are logged in
  });

  if (!existingUser) {
    return { error: "User account not found." };
  }

  await db.supportTicket.create({
    data: {
      userId: existingUser.clerkId,
      subject: `Contact from ${firstName} ${lastName}`,
      message: message,
      status: "PENDING"
    }
  });

  return { success: "Message sent successfully!" };
}

// 2. Handle Feedback/Testimonial Submission (User Dashboard)
export async function submitFeedback(rating: number, message: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in"); // 👈 Added security here too

  const user = await db.user.findUnique({ where: { clerkId: userId } });

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

  revalidatePath("/dashboard");
  return { success: true };
}