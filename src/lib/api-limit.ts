import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const getCreditBalance = async () => {
  // 👇 FIX: Add 'await' here
  const { userId } = await auth();

  if (!userId) {
    console.log("🔴 [getCreditBalance] No User ID found in session.");
    return 0;
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      console.log(`🔴 [getCreditBalance] User found in Clerk (${userId}) but NOT in Database.`);
      return 0;
    }

    console.log(`🟢 [getCreditBalance] Success! User: ${user.email}, Credits: ${user.creditBalance}`);
    return user.creditBalance;
    
  } catch (error) {
    console.log("🔴 [getCreditBalance] Database Error:", error);
    return 0;
  }
};

export const checkApiLimit = async () => {
  // 👇 FIX: Add 'await' here
  const { userId } = await auth();
  if (!userId) return false;

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  });

  return !!user && !user.isBlocked && user.creditBalance > 0;
};

export const deductCredits = async (amount = 1) => {
  // 👇 FIX: Add 'await' here
  const { userId } = await auth();
  if (!userId) return;

  const user = await db.user.findUnique({
    where: { clerkId: userId }
  });

  if (user && user.creditBalance >= amount) {
    await db.user.update({
      where: { clerkId: userId },
      data: { creditBalance: user.creditBalance - amount },
    });
  }
};