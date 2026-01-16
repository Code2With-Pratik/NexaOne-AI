"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LayoutDashboard, MessageSquare, Video, PenTool } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const DashboardPreview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 3D Tilt Animation: Starts tilted, flattens as you scroll
    gsap.fromTo(
      mockRef.current,
      {
        rotateX: 20,
        scale: 0.9,
        opacity: 0.5,
        y: 100,
      },
      {
        rotateX: 0,
        scale: 1,
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 80%",
          scrub: 1, // Smoothly links animation to scrollbar
        },
      }
    );
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="py-20 bg-transparent text-white relative perspective-[1000px] overflow-hidden"
    >
      {/* Glow Effect behind the dashboard */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          One Interface. <span className="text-pink-400">Infinite Possibilities.</span>
        </h2>
        <p className="text-lg text-white/60">
          Experience a unified workspace where communication meets creation.
        </p>
      </div>

      {/* THE MOCK DASHBOARD UI */}
      <div 
        ref={mockRef}
        className="relative max-w-6xl mx-auto bg-[#0a0a0a5a] border border-white/20 rounded-2xl shadow-2xl shadow-pink-500/20 overflow-hidden transform-style-3d"
      >
        {/* Mock Browser Header */}
        <div className="h-10 bg-white/5 border-b border-white/20 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="ml-4 px-3 py-1 rounded-md bg-transparent/40 text-xs text-white/80 font-mono flex-1 text-center">
            nexaone.ai/dashboard
          </div>
        </div>

        {/* Mock Dashboard Body */}
        <div className="flex h-[600px]">
          
          {/* Mock Sidebar */}
          <div className="w-20 md:w-64 border-r border-white/20 bg-transparent/40 p-4 hidden md:flex flex-col gap-4">
             <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
             <div className="space-y-2 mt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-6 h-6 rounded bg-white/10" />
                    <div className="h-4 w-24 bg-white/5 rounded" />
                  </div>
                ))}
             </div>
          </div>

          {/* Mock Main Content */}
          <div className="flex-1 p-8 grid grid-cols-3 gap-6">
            {/* Header Area */}
            <div className="col-span-3 h-32 rounded-2xl bg-linear-to-r from-indigo-900/20 to-pink-900/40 border border-white/10 p-6 flex items-end">
               <div className="space-y-2">
                 <div className="h-8 w-64 bg-white/10 rounded" />
                 <div className="h-4 w-48 bg-white/10 rounded" />
               </div>
            </div>

            {/* Tool Cards */}
            <div className="col-span-2 space-y-4">
              <div className="h-64 rounded-2xl bg-[#111]/40 border border-white/10 p-4 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-4 right-4"><MessageSquare className="text-white/20" /></div>
                <div className="flex-1 flex items-end gap-2">
                   <div className="w-3/4 h-12 rounded-t-xl rounded-br-xl bg-pink-600/20 border border-white/30" />
                   <div className="w-1/2 h-12 rounded-t-xl rounded-bl-xl bg-white/5 self-end ml-auto" />
                </div>
              </div>
            </div>

            <div className="col-span-1 space-y-4">
               <div className="h-64 rounded-2xl bg-[#111]/40 border border-white/10 p-4 relative">
                  <div className="absolute top-4 right-4"><PenTool className="text-white/20" /></div>
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-linear-to-tr from-pink-500/20 to-orange-500/20 blur-xl animate-pulse-slow" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Overlay Label (Optional) */}
        <div className="absolute inset-0 flex items-center justify-center bg-transparent/20 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500">
           <span className="px-6 py-3 rounded-full bg-white text-black font-bold shadow-xl">
             Live Preview
           </span>
        </div>
      </div>
    </section>
  );
};