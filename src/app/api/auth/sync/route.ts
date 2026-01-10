import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clerkId, email, name, image } = body;

    if (!clerkId || !email) {
      return new NextResponse("Missing Data", { status: 400 });
    }

    console.log(`🔄 [SYNC] Processing: ${email}`);

    // 1. Check if a user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      // 2. If user exists, UPDATE them to use the new Clerk ID
      // This fixes the "Unique Constraint" error by merging the old demo account with the real one
      console.log(`✨ [SYNC] Linking existing account for ${email}`);
      await db.user.update({
        where: { email: email },
        data: {
          clerkId: clerkId, // <--- IMPORTANT: Overwrite the old ID (e.g. "99") with the real Clerk ID
          name: name,
          image: image,
        },
      });
    } else {
      // 3. If user does NOT exist, CREATE a new one
      console.log(`🆕 [SYNC] Creating new user for ${email}`);
      await db.user.create({
        data: {
          clerkId: clerkId,
          email: email,
          name: name || "Anonymous",
          image: image,
        },
      });
    }

    return new NextResponse("Synced Successfully", { status: 200 });

  } catch (error) {
    console.error("💥 [AUTH_SYNC_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}