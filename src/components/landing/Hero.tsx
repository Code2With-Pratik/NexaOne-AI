"use client";

import React, { useRef, useState } from "react";
import Spline from "@splinetool/react-spline";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, ChevronsDown, X, Maximize2, Minimize2 } from "lucide-react";

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);

  // --- MODAL STATE ---
  // Modes: "hidden" | "normal" | "minimized" | "maximized"
  const [viewMode, setViewMode] = useState<"hidden" | "normal" | "minimized" | "maximized">("hidden");

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Left Side Animation
    tl.fromTo(
      leftContentRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, delay: 0.2 }
    );

    // Right Side Animation
    tl.fromTo(
      rightContentRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1 },
      "<" 
    );
  }, []);

  // --- SMOOTH SCROLL ---
  const handleScrollDown = () => {
    const featureSection = document.getElementById("about");
    const targetPosition = featureSection 
      ? featureSection.getBoundingClientRect().top + window.scrollY 
      : window.scrollY + window.innerHeight;
    
    const scrollObj = { y: window.scrollY };
    gsap.to(scrollObj, {
      y: targetPosition,
      duration: 1.5,
      ease: "power3.inOut",
      onUpdate: () => window.scrollTo(0, scrollObj.y)
    });
  };

  return (
    <section id="hero"
      ref={containerRef}
      className="relative h-[100svh] w-full overflow-hidden"
    >
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0 h-full w-full flex items-center justify-center pointer-events-none">
         <div className="relative w-full h-full scale-135 lg:scale-190 translate-x-0 translate-y-38 lg:-translate-x-15 lg:translate-y-0 transition-transform duration-700">
            <Spline scene="https://prod.spline.design/S5F2s4yId-8dZbvp/scene.splinecode" />
         </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 lg:from-fuchsia-900/20 lg:to-black/40" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 h-full w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col lg:grid lg:grid-cols-12 pointer-events-none">
        
        {/* --- LEFT CONTENT --- */}
        <div 
          ref={leftContentRef} 
          className="h-[55%] lg:h-auto lg:col-span-4 flex flex-col justify-start lg:justify-center items-center text-center lg:items-start lg:text-left pt-28 lg:pt-20 pointer-events-auto"
        >
          <h1 className="text-4xl md:text-8xl font-bold tracking-tighter text-white mb-4 lg:mb-8 leading-none">
            <span className="whitespace-nowrap ml-0 lg:-ml-2">Craft Reality</span>
            <br />
            <span className="text-4xl md:text-8xl ml-0 lg:ml-32 text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 to-pink-400">
               with
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Intelligence
            </span>
          </h1>

          <p className="lg:text-lg text-white/70 lg:text-white/60 mb-6 lg:mb-10 max-w-xs lg:max-w-lg leading-relaxed">
            The ultimate workspace uniting real-time communication with powerful AI tools.
          </p>

          <div className="flex flex-row items-center gap-3 lg:gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-3 lg:px-5 lg:py-4 rounded-full bg-white text-black font-bold text-sm lg:text-lg hover:bg-indigo-50 transition-all hover:scale-98 flex items-center gap-2 shadow-xl"
            >
              Get Started <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
            
            {/* DEMO BUTTON - Now triggers setViewMode correctly */}
            <button 
              onClick={() => setViewMode("normal")}
              className="px-5 py-3 lg:px-8 lg:py-4 rounded-full border-2 border-white/20 text-white font-medium text-sm lg:text-base hover:bg-white/10 transition-colors backdrop-blur-sm cursor-pointer"
            >
              Demo
            </button>
          </div>
        </div>

            {/* --- MIDDLE SPACER --- */}
        <div className="hidden lg:block lg:col-span-4 h-full"></div>

        {/* --- RIGHT CONTENT (Bottom on Mobile) --- */}
        <div 
          ref={rightContentRef}
          // MOBILE: justify-end (bottom), pb-24 (space for scroll btn), h-1/2
          // DESKTOP: justify-center, col-span-4
          className="h-[45%] lg:h-auto lg:col-span-4 flex flex-col justify-end lg:justify-center items-center text-center lg:items-end lg:text-right pointer-events-auto pb-24 lg:pb-0 lg:mt-0"
        >
          {/* NexaOne AI Heading */}
          <h2 className="text-4xl lg:text-8xl lg:mt-29 whitespace-nowrap font-bold tracking-tighter">
            NexaOne <br />
            <span className="text-transparent mr-0 lg:mr-38 bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              AI
            </span>
          </h2>

          {/* Star Icon: Smaller on mobile, margins adjusted to prevent collision */}
          <div className="relative mr-0 lg:mr-2 my-2 lg:mb-8 lg:mt-0">
            <div className="absolute inset-0 blur-xl bg-purple-500/40 rounded-full"></div>
            <Star 
              className="relative w-10 h-10 lg:w-20 lg:h-20 text-white animate-[spin_10s_linear_infinite]" 
              strokeWidth={1.5} 
            />
          </div>

          {/* Paragraph: Hidden on very small screens or shortened */}
          <p className="lg:text-lg text-white/60 mb-4 lg:mb-10 lg:mt-4 max-w-xs lg:max-w-lg leading-relaxed">
           Connect and create without limits. Experience the first secure platform that fuses 
           high-definition video calling with a complete suite of generative AI assistants.
          </p>


          {/* Badge: Scale down slightly on mobile */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md animate-pulse">
            <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400" />
            <span className="text-xs lg:text-sm font-medium text-white/90">
              NexaAI 4.0 Available
            </span>
          </div>
        </div>
      </div>

    {/* --- VIDEO POPUP MODAL --- */}
      {viewMode !== "hidden" && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 
          ${viewMode === "minimized" ? "pointer-events-none" : "bg-black/20 backdrop-blur-md pointer-events-auto"}`}
        >
          <div 
            className={`bg-[#0c0c0c] border-5 border-white/20 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out flex flex-col
            ${viewMode === "normal" ? "w-[95%] md:w-[80%] max-w-5xl aspect-video rounded-2xl" : ""}
            ${viewMode === "maximized" ? "w-full h-full rounded-none" : ""}
            ${viewMode === "minimized" ? "fixed bottom-6 right-6 w-[300px] md:w-[400px] aspect-video rounded-xl pointer-events-auto shadow-black shadow-2xl" : ""}
          `}
          >
            {/* Header Control Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#161616] border-b border-white/5">
              <div className="flex items-center gap-3">
                {/* Red: Close */}
                <button 
                  onClick={() => setViewMode("hidden")}
                  className="w-3 h-3 rounded-full bg-[#ff0d00] hover:brightness-110 flex items-center justify-center group pointer-events-auto cursor-pointer"
                >
                  <X className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
                </button>
                
                {/* Yellow: Minimize */}
                <button 
                  onClick={() => setViewMode(viewMode === "minimized" ? "normal" : "minimized")}
                  className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 flex items-center justify-center group pointer-events-auto cursor-pointer"
                >
                  <Minimize2 className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
                </button>
                
                {/* Green: Maximize */}
                <button 
                  onClick={() => setViewMode(viewMode === "maximized" ? "normal" : "maximized")}
                  className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 flex items-center justify-center group pointer-events-auto cursor-pointer"
                >
                  <Maximize2 className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
                </button>
              </div>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">nexaone.ai</p>
              <div className="w-12"></div>
            </div>

            {/* YouTube Embed Content */}
            <div className="relative flex-1 bg-black">
              {/* We only render the iframe if viewMode is not hidden to stop playback on close */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/be0zH8CWwVo?autoplay=1&modestbranding=1&rel=0"
                title="NexaOne AI Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* --- SCROLL BUTTON --- */}
      <button 
        onClick={handleScrollDown}
        className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-all animate-bounce cursor-pointer pointer-events-auto"
      >
        <span className="text-[10px] font-medium tracking-widest uppercase">Scroll</span>
        <ChevronsDown className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

    </section>
  );
};

