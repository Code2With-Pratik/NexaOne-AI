import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    
    // Debug Log 1: Check Auth
    if (!user) {
        console.log("❌ Auth Failed: No user found");
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { rating, message } = await req.json();

    // Debug Log 2: Check Inputs
    console.log("📝 Received Feedback:", { rating, message, userId: user.id });

    if (!rating || !message) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Debug Log 3: Attempt Database Write
    console.log("⏳ Attempting to write to DB...");
    
    const testimonial = await db.testimonial.create({
      data: {
        userId: user.id,
        name: user.firstName ? `${user.firstName} ${user.lastName || ""}` : "User",
        avatar: user.imageUrl,
        rating: Number(rating),
        message: message,
        isPublic: true
      }
    });

    console.log("✅ Database Write Success:", testimonial.id);
    return NextResponse.json(testimonial);

  } catch (error: any) {
    // 👇 THIS IS THE IMPORTANT PART
    console.error("🔥 FEEDBACK API ERROR:", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("⏳ Fetching testimonials...");
    const testimonials = await db.testimonial.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 6
    });
    console.log(`✅ Fetched ${testimonials.length} testimonials`);
    return NextResponse.json(testimonials);
  } catch (error: any) {
    console.error("🔥 GET FEEDBACK ERROR:", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}