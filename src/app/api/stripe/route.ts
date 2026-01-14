import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe"; // Create this helper: import Stripe from "stripe"; export const stripe = new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: "2023-10-16", typescript: true });
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/dashboard/settings");

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return new NextResponse("Unauthorized", { status: 401 });

    const userSubscription = await db.transaction.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });

    if (userSubscription && userSubscription.stripeId) {
        // Manage existing subscription
        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: userSubscription.stripeId,
            return_url: settingsUrl,
        });
        return NextResponse.json({ url: stripeSession.url });
    }

    // Create New Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "payment", // or "subscription"
        billing_address_collection: "auto",
        customer_email: user.emailAddresses[0].emailAddress,
        line_items: [
            {
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: "NexaOne Pro (1000 Credits)",
                        description: "Unlock AI Power",
                    },
                    unit_amount: 2000, // $20.00
                },
                quantity: 1,
            }
        ],
        metadata: {
            userId,
        },
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}