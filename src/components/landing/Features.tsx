"use client";

import React, { useRef } from "react";
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
    // Fallback included: bg-white/5
    bg: "bg-linear-to-br from-green-500/10 to-emerald-900/10 bg-white/5", 
  },
  {
    title: "HD Video Calls",
    desc: "Crystal clear multi-user video conferencing via LiveKit.",
    icon: <Video className="w-8 h-8 text-blue-400" />,
    colSpan: "md:col-span-1",
    bg: "bg-linear-to-bl from-blue-500/10 to-indigo-900/10 bg-white/5",
  },
  {
    title: "AI Image Engine",
    desc: "Generate stunning 4K visuals using Stable Diffusion XL & Flux.",
    icon: <ImageIcon className="w-8 h-8 text-purple-400" />,
    colSpan: "md:col-span-1",
    bg: "bg-linear-to-tr from-purple-500/10 to-pink-900/10 bg-white/5",
  },
  {
    title: "Smart Assistant",
    desc: "RAG-powered AI that learns from your documents and history.",
    icon: <Bot className="w-8 h-8 text-yellow-400" />,
    colSpan: "md:col-span-2",
    bg: "bg-linear-to-tl from-yellow-500/10 to-orange-900/10 bg-white/5",
  },
];

export const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Select cards safely
    const cards = gsap.utils.toArray(".feature-card");
    
    // Set initial state (Clear any previous GSAP states)
    gsap.set(cards, { autoAlpha: 0, y: 50 });

    // Animate to visible
    gsap.to(cards, {
      autoAlpha: 1, // This handles opacity + visibility
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom", // Starts as soon as the top of section hits bottom of viewport
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  return (
    <section id="features" ref={containerRef} className="py-32 px-6 bg-black text-white relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-sm font-mono text-indigo-400 tracking-widest uppercase">
            Powerhouse Tools
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold">
            Everything You Need. <br />
            <span className="text-white/40">In One Dashboard.</span>
          </h3>
        </div>

        {/* Bento Grid Layout - Ensure height is explicit if empty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-100">
          {features.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "feature-card group relative overflow-hidden rounded-3xl border border-white/10 p-8 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between",
                item.colSpan,
                item.bg
              )}
            >
              {/* Hover Glow Effect */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none" />
              
              <div className="relative z-10 space-y-8">
                <div className="p-3 bg-white/10 w-fit rounded-xl border border-white/10 backdrop-blur-md">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-2 text-white">{item.title}</h4>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};