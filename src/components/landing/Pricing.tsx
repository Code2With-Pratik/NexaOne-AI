"use client";

import React from "react";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/forever",
    credits: "50 Credits",
    desc: "Perfect for testing the waters.",
    features: ["Access to Chat System", "Basic AI Image Gen", "1-on-1 Video Calls", "Standard Support"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Creator",
    price: "$29",
    period: "/month",
    credits: "1,500 Credits",
    desc: "For power users and content creators.",
    features: ["Everything in Starter", "Priority AI Processing", "Group Video Calls (HQ)", "4K Image Downloads", "AI Article Writer"],
    cta: "Get Creator",
    popular: true, // Highlights this card
  },
  {
    name: "Agency",
    price: "$99",
    period: "/month",
    credits: "10,000 Credits",
    desc: "Scale your production limits.",
    features: ["Everything in Creator", "Unlimited Chat History", "Dedicated Support", "Custom AI Models", "API Access"],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-32 px-6 bg-transparent text-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-sm font-mono text-indigo-400 tracking-widest uppercase">
            Flexible Pricing
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold">
            Pay for Impact. <br />
            <span className="text-white/40">Not for seats.</span>
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={cn(
                "relative p-8 rounded-3xl border transition-all duration-300",
                plan.popular 
                  ? "bg-white/5 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 scale-105 z-10" 
                  : "bg-transparent border-white/10 hover:border-white/20"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3 h-3 fill-white" /> Most Popular
                </div>
              )}

              <div className="mb-8">
                <h4 className="text-lg font-medium text-white/60 mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-sm text-white/40">{plan.period}</span>
                </div>
                <div className="mt-4 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 inline-block">
                  <span className="text-indigo-300 font-bold text-sm">{plan.credits}</span>
                </div>
                <p className="mt-4 text-sm text-white/50">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-sm text-white/80">{feat}</span>
                  </div>
                ))}
              </div>

              <button
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-sm transition-all",
                  plan.popular
                    ? "bg-white text-black hover:bg-indigo-50 hover:scale-105"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};