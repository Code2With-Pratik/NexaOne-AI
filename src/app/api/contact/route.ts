import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { subject, message } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!subject || !message) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Save to Database
    const ticket = await db.supportTicket.create({
      data: {
        userId: userId, // Clerk ID
        subject,
        message,
        status: "PENDING",
      },
    });

    return NextResponse.json(ticket);

  } catch (error) {
    console.log("[CONTACT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}