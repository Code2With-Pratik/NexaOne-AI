import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Reuse the client we just created in step 5!

export async function GET() {
  try {
    // 1. Create "You"
    await db.user.upsert({
      where: { clerkId: "99" },
      update: {},
      create: {
        clerkId: "99",
        name: "Me (Demo User)",
        email: "me@demo.com",
        image: "https://github.com/shadcn.png"
      }
    });
    // ... (rest of the logic uses 'db' instead of 'prisma')
    
    // 2. Create Alice
    await db.user.upsert({
        where: { clerkId: "1" },
        update: {},
        create: { clerkId: "1", name: "Alice Freeman", email: "alice@demo.com", image: "A" }
    });

    // 3. Create Team Rocket
    await db.user.upsert({
        where: { clerkId: "2" },
        update: {},
        create: { clerkId: "2", name: "Team Rocket", email: "team@rocket.com", image: "T" }
    });

    return new NextResponse("Database Seeded Successfully!", { status: 200 });
  } catch (error) {
    return new NextResponse("Error seeding database", { status: 500 });
  }
}