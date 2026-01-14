import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const isAdmin = async () => {
  // 👇 ADD 'await' HERE
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  return user?.role === "ADMIN";
};