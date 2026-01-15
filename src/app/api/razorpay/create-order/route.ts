import { NextResponse, NextRequest } from "next/server"; // 👈 Import NextRequest
import { razorpay, PLANS } from "@/lib/razorpay";
import { getAuth } from "@clerk/nextjs/server"; // 👈 CHANGE THIS IMPORT

export async function POST(req: NextRequest) { // 👈 Change type to NextRequest
  try {
    // 👇 FIX: Use getAuth(req) instead of auth()
    // This explicitly checks the request for the session, bypassing the context issue.
    const { userId } = getAuth(req);

    console.log("--------------------------------");
    console.log("DEBUG: Checking User ID with getAuth()");
    console.log("User ID:", userId); 
    console.log("--------------------------------");

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { planType } = body; 

    const plan = PLANS[planType as keyof typeof PLANS];
    if (!plan) return new NextResponse("Invalid Plan", { status: 400 });

    const order = await razorpay.orders.create({
      amount: plan.price,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({ orderId: order.id, amount: plan.price });
  } catch (error) {
    console.error("Razorpay Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}