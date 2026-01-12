import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server"; // ✅ FIXED: Import from '/server'
import { db } from "@/lib/db"; // ✅ FIXED: Import singleton 'db' instead of 'new PrismaClient()'

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Use 'db' instead of 'prisma'
    const logs = await db.callLog.findMany({
      where: {
        OR: [
          { initiatorId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        initiator: {
          select: { name: true, image: true, clerkId: true }
        },
        receiver: {
          select: { name: true, image: true, clerkId: true }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[CALL_LOGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}