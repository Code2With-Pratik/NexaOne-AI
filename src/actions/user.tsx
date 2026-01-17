"use server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitTicket(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.supportTicket.create({
        data: {
            userId,
            subject: formData.get("subject") as string,
            message: formData.get("message") as string,
            status: "PENDING"
        }
    });
    revalidatePath("/dashboard/support");
}

export async function submitTestimonial(rating: number, message: string) {
    const { userId } = await auth();

    // ✅ FIX: We strictly check if userId exists. 
    // This tells TypeScript "userId is definitely a string from this point on".
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Now userId is safe to use here
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    
    await db.testimonial.create({
        data: {
            userId: userId, 
            name: user?.name || "User",
            avatar: user?.image,
            rating,
            message,
            isPublic: false 
        }
    });
    revalidatePath("/dashboard/settings"); 
}