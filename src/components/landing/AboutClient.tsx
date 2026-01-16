"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Globe, Zap, Cpu, AlertTriangle, CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface AboutClientProps {
  isMaintenance: boolean;
  activityCount: number;
}

export const AboutClient = ({ isMaintenance, activityCount }: AboutClientProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%", // Triggers animation earlier for better sync
        toggleActions: "play none none reverse",
      },
    });

    // Animate Text Elements
    tl.fromTo(
      ".about-text",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" }
    );

    // Animate the Visual Card (Pop Effect)
    tl.fromTo(
      ".about-visual",
      { x: 50, opacity: 0, scale: 0.9 },
      { x: 0, opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)" },
      "-=0.6"
    );
  }, []);

  // Dynamic Colors based on Maintenance Status
  const statusColor = isMaintenance ? "text-red-400" : "text-emerald-400";
  const statusBg = isMaintenance ? "bg-red-500" : "bg-emerald-500";
  const statusBorder = isMaintenance ? "border-red-500/20" : "border-emerald-500/20";
  const glowColor = isMaintenance ? "bg-red-500/20" : "bg-emerald-500/20";

  // Format the activity count (e.g., 1,200)
  const formattedCount = new Intl.NumberFormat('en-US').format(activityCount);

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative py-32 px-6 overflow-hidden"
    >
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Grid Layout - Adjusted cols to make Right Box Bigger */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* --- LEFT CONTENT (Text) - Takes 5 Columns --- */}
        <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
          <h2 className="about-text text-pink-400 tracking-widest uppercase text-sm font-bold">
            Our Mission
          </h2>
          
          <h3 className="about-text text-4xl md:text-5xl font-bold text-white leading-tight">
            We are building the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Neural Network
            </span>{" "}
            of <br />
            Global Communication.
          </h3>

          <p className="about-text text-lg text-white/60 leading-relaxed">
            NexaOne isn't just a video tool; it's a thinking partner. We merged 
            low-latency architecture with large language models to create a workspace 
            where distance is irrelevant and creativity is infinite.
          </p>

          <div className="about-text flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-white/80 font-medium">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Globe className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-white/80 font-medium">6+ AI Tools</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT (Visual UI) - Takes 7 Columns (WIDER) --- */}
        <div className="about-visual relative lg:col-span-7 w-full">
          <div className="relative z-10 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl w-full">
            
            {/* Header of Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">System Status</h4>
                  <div className={`text-sm flex items-center gap-2 font-medium ${statusColor}`}>
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusBg}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${statusBg}`}></span>
                    </span>
                    {isMaintenance ? "System Maintenance" : "All Systems Operational"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                 <div className={`w-2 h-2 rounded-full ${isMaintenance ? "bg-red-500" : "bg-emerald-500"}`} />
                 <span className="text-xs font-mono text-white/40">v4.0.2</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {/* Latency Card */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <p className="text-white/40 text-xs mb-2 uppercase tracking-wider font-semibold">Latency</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">12ms</span>
                  <Zap className="w-5 h-5 text-yellow-400 mb-1" />
                </div>
              </div>

              {/* Uptime Card */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <p className="text-white/40 text-xs mb-2 uppercase tracking-wider font-semibold">Uptime</p>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white">99.9%</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
                </div>
              </div>

              {/* Dynamic Activity Card (Full Width) */}
              <div className={`col-span-2 p-6 rounded-2xl border bg-gradient-to-r from-white/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 ${statusBorder}`}>
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-xl border ${statusBorder} ${isMaintenance ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                        {isMaintenance ? <AlertTriangle className={`w-6 h-6 ${statusColor}`} /> : <Globe className={`w-6 h-6 ${statusColor}`} />}
                   </div>
                   <div>
                        <p className="text-white/40 text-xs mb-1 uppercase tracking-wider font-semibold">Total AI Generations</p>
                        <span className="text-3xl font-bold text-white tracking-tight">{formattedCount}</span>
                   </div>
                </div>
                
                <div className="hidden sm:block h-10 w-[1px] bg-white/10 mx-4"></div>
                
                <div className="text-center sm:text-right w-full sm:w-auto bg-black/20 rounded-lg p-2 sm:bg-transparent sm:p-0">
                   <p className={`text-xs font-medium ${statusColor} mb-0.5`}>
                        {isMaintenance ? "Paused" : "Scaling"}
                   </p>
                   <p className="text-xs text-white/50">Auto-Mode</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements (Dynamic Color) */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] animate-pulse ${glowColor}`} />
          <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px]" />
        </div>

      </div>
    </section>
  );
};