import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import cryptoNode from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Get the Clerk User ID
    const { userId } = getAuth(req);

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = body;

    // 2. Verify Razorpay Signature
    const shasum = cryptoNode.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
        return new NextResponse("Invalid Signature", { status: 400 });
    }

    // 3. Determine Plan Benefits
    let creditsToAdd = 0;
    if (planType === "PRO") creditsToAdd = 1500;
    if (planType === "ULTRA") creditsToAdd = 10000;

    // 4. Update the User in Database
    // 👇 THIS IS WHERE THE ERROR WAS. NOW FIXED TO MATCH YOUR SCHEMA.
    await db.user.update({
        where: { 
            clerkId: userId // 👈 Schema uses 'clerkId' as the unique key for lookup
        }, 
        data: {
            creditBalance: { increment: creditsToAdd }, // 👈 Schema uses 'creditBalance'
            planName: planType,       // 👈 Schema uses 'planName'
            planActive: true          // 👈 Schema uses 'planActive'
        }
    });

    // 5. Create Transaction Record
    await db.transaction.create({
        data: {
            userId: userId, 
            // 👇 FIXED: Updated to match the real prices (29900 and 99900)
            amount: planType === "PRO" ? 29900 : 99900, 
            credits: creditsToAdd, 
            planName: planType,
            status: "SUCCESS",
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}