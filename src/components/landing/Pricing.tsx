"use client";

import React, { useState } from "react";
import { Check, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useAuth, useUser } from "@clerk/nextjs"; // 👈 Added useUser to get email

const plans = [
  {
    name: "Starter",
    price: "₹0",
    credits: "50 Credits",
    desc: "Perfect for testing.",
    features: ["Access to Chat System", "Basic AI Image Gen", "Standard Support"],
    cta: "Start Free",
    popular: false,
    type: "FREE"
  },
  {
    name: "Creator",
    price: "₹29",
    credits: "1,500 Credits",
    desc: "For power users.",
    features: ["Priority Processing", "4K Image Downloads", "AI Article Writer"],
    cta: "Get Creator",
    popular: true,
    type: "PRO"
  },
  {
    name: "Agency",
    price: "₹99",
    credits: "10,000 Credits",
    desc: "Scale your production.",
    features: ["Unlimited Chat History", "Dedicated Support", "API Access"],
    cta: "Get Agency",
    popular: false,
    type: "ULTRA"
  },
];

export const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser(); // 👈 Get user details for prefill

  const handlePayment = async (planType: string) => {
    if (!isSignedIn) {
        toast.error("Please sign in to upgrade");
        router.push("/sign-in");
        return;
    }

    setLoading(planType);

    if (planType === "FREE") {
        router.push("/dashboard");
        return;
    }

    try {
        // Safety Check: Ensure Razorpay Script is loaded
        if (typeof window === "undefined" || !(window as any).Razorpay) {
             toast.error("Payment SDK not loaded yet. Please refresh.");
             setLoading(null);
             return;
        }

        const response = await fetch("/api/razorpay/create-order", {
            method: "POST",
            body: JSON.stringify({ planType }),
        });
        
        if (response.status === 401) {
            toast.error("Session expired. Please login again.");
            router.push("/sign-in");
            setLoading(null);
            return;
        }

        const data = await response.json();
        if (!response.ok) throw new Error("Failed to create order");

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.amount,
            currency: "INR",
            name: "AI SuperApp",
            description: `Upgrade to ${planType} Plan`,
            order_id: data.orderId,
            handler: async function (response: any) {
                const verifyRes = await fetch("/api/razorpay/verify", {
                    method: "POST",
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        planType,
                    }),
                });

                if (verifyRes.ok) {
                    toast.success("Payment Successful! Plan activated.");
                    router.push("/dashboard/settings");
                } else {
                    toast.error("Payment verification failed.");
                }
            },
            // 👇 ADDED PREFILL: Better User Experience
            prefill: {
                name: user?.fullName || "",
                email: user?.primaryEmailAddress?.emailAddress || "",
            },
            theme: { color: "#6366f1" },
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();

    } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
    } finally {
        setLoading(null);
    }
  };

  return (
    <>
    {/* Script loads in background */}
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    
    <section id="pricing" className="py-32 px-6 bg-transparent text-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-sm font-mono text-indigo-400 tracking-widest uppercase">Flexible Pricing</h2>
          <h3 className="text-4xl md:text-5xl font-bold">Simple Plans. <span className="text-white/40">No Hidden Fees.</span></h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, idx) => (
            <div key={idx} className={cn("relative p-8 rounded-3xl border transition-all duration-300", plan.popular ? "bg-white/5 border-indigo-500/50 scale-105 z-10" : "bg-transparent border-white/10")}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Zap className="w-3 h-3 fill-white" /> Most Popular</div>}
              
              <div className="mb-8">
                <h4 className="text-lg font-medium text-white/60 mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                </div>
                <div className="mt-4 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 inline-block">
                    <span className="text-indigo-300 font-bold text-sm">{plan.credits}</span>
                </div>
                <p className="mt-4 text-sm text-white/50">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                   <div key={i} className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center"><Check className="w-3 h-3 text-green-400" /></div><span className="text-sm text-white/80">{feat}</span></div>
                ))}
              </div>

              <button
                onClick={() => handlePayment(plan.type)}
                disabled={loading !== null}
                className={cn("w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2", plan.popular ? "bg-white text-black hover:bg-indigo-50" : "bg-white/10 text-white hover:bg-white/20")}
              >
                {loading === plan.type ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};