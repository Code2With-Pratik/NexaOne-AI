import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// POST: Start a new call log
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { receiverId, type } = body;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const log = await db.callLog.create({
      data: {
        initiatorId: userId,
        receiverId,
        type,
        status: "MISSED", // Default to MISSED until answered
      }
    });

    return NextResponse.json(log);
  } catch (error) {
    console.log("[CALL_LOG_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH: Update log status (Answered/Ended)
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { logId, status } = body;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const updateData: any = { status };
    if (status === "COMPLETED") {
      updateData.endedAt = new Date(); // Set end time
    }

    const log = await db.callLog.update({
      where: { id: logId },
      data: updateData
    });

    return NextResponse.json(log);
  } catch (error) {
    console.log("[CALL_LOG_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}