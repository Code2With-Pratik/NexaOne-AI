"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageSquare, Video, Image as ImageIcon, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Real-Time Chat",
    desc: "WhatsApp-style messaging with instant file sharing and voice notes.",
    icon: <MessageSquare className="w-8 h-8 text-green-400" />,
    colSpan: "md:col-span-2",
    bg: "bg-gradient-to-br from-green-500/10 to-emerald-900/10",
  },
  {
    title: "HD Video Calls",
    desc: "Crystal clear multi-user video conferencing via LiveKit.",
    icon: <Video className="w-8 h-8 text-blue-400" />,
    colSpan: "md:col-span-1",
    bg: "bg-gradient-to-bl from-blue-500/10 to-indigo-900/10",
  },
  {
    title: "AI Image Engine",
    desc: "Generate stunning 4K visuals using Stable Diffusion XL & Flux.",
    icon: <ImageIcon className="w-8 h-8 text-purple-400" />,
    colSpan: "md:col-span-1",
    bg: "bg-gradient-to-tr from-purple-500/10 to-pink-900/10",
  },
  {
    title: "Smart Assistant",
    desc: "RAG-powered AI that learns from your documents and history.",
    icon: <Bot className="w-8 h-8 text-yellow-400" />,
    colSpan: "md:col-span-2",
    bg: "bg-gradient-to-tl from-yellow-500/10 to-orange-900/10",
  },
];

// --- 1. NEW: Individual Feature Card Component ---
const FeatureCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // Base styles for every card
        "feature-card group relative overflow-hidden rounded-3xl border border-white/10 p-8 transition-all duration-500 hover:border-white/20 flex flex-col justify-between bg-white/5",
        className
      )}
    >
      {/* The Spotlight Overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />
      {/* Content wrapper to keep it above the spotlight */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray(".feature-card");
    gsap.set(cards, { autoAlpha: 0, y: 50 });

    gsap.to(cards, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-32 px-6 text-white relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-pink-400 tracking-widest uppercase">
            Powerhouse Tools
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold">
            Everything You Need. <br />
            <span className="text-white/40">In One Dashboard.</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
          {features.map((item, idx) => (
            // --- 2. Use the new FeatureCard component ---
            <FeatureCard
              key={idx}
              className={cn(item.colSpan, item.bg)}
            >
              <div className="space-y-8 h-full flex flex-col justify-between">
                <div className="p-3 bg-white/10 w-fit rounded-xl border border-white/10 backdrop-blur-md shadow-inner shadow-white/10">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-2 text-white tracking-wide">
                    {item.title}
                  </h4>
                  <p className="text-white/60 leading-relaxed text-sm md:text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
};