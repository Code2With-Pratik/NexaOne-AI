import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all users EXCEPT the current logged-in user
    const users = await db.user.findMany({
      where: {
        NOT: {
          clerkId: userId,
        },
      },
      select: {
        clerkId: true,
        name: true,
        image: true,
        // We can add 'lastSeen' logic later
      },
    });

    // Format them to match your frontend Contact type
    const formattedUsers = users.map((u) => ({
      id: u.clerkId,
      name: u.name || "Unknown",
      avatar: u.image || "", // Will use their real avatar
      color: "from-blue-500 to-indigo-500", // Default gradient
      status: "Offline", // You can hook this up to Socket.io later
      lastSeen: "",
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.log("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}