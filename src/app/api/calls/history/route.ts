import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Fetch calls where I am initiator OR receiver
    const logs = await db.callLog.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        initiator: { select: { fullName: true, imageUrl: true } },
        receiver: { select: { fullName: true, imageUrl: true } }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.log("[CALL_HISTORY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}