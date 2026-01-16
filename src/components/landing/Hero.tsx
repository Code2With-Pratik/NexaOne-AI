"use client";

import React, { useRef } from "react";
import Spline from "@splinetool/react-spline";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, ChevronsDown } from "lucide-react";

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);

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

  // --- CUSTOM SMOOTH SCROLL FUNCTION ---
  const handleScrollDown = () => {
    const featureSection = document.getElementById("features");
    
    if (featureSection) {
      const targetPosition = featureSection.getBoundingClientRect().top + window.scrollY;
      const scrollObj = { y: window.scrollY };
      
      gsap.to(scrollObj, {
        y: targetPosition,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => {
          window.scrollTo(0, scrollObj.y);
        }
      });
    } else {
      const scrollObj = { y: window.scrollY };
      gsap.to(scrollObj, {
        y: window.scrollY + window.innerHeight,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
           window.scrollTo(0, scrollObj.y);
        }
      });
    }
  };

  return (
    <section
      ref={containerRef}
      // Changed: h-screen to h-[100svh] for better mobile browser support
      className="relative h-[100svh] w-full overflow-hidden"
    >
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0 h-full w-full flex items-center justify-center pointer-events-none">
         {/* MOBILE FIX: 
            1. scale-125 (Mobile) -> scale-190 (Desktop/lg) to make room for text.
            2. translate-y-10 (Mobile) -> translate-y-0 (Desktop) to push robot down slightly.
         */}
         <div className="relative w-full h-full scale-135 lg:scale-190 translate-x-0 translate-y-38 lg:-translate-x-15 lg:translate-y-0 transition-transform duration-700">
            <Spline scene="https://prod.spline.design/S5F2s4yId-8dZbvp/scene.splinecode" />
         </div>
         {/* Darkened overlay on mobile to make text pop against the robot */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 lg:from-fuchsia-900/20 lg:to-black/40" />
      </div>

      {/* Main Grid Layout */}
      {/* Added flex flex-col for mobile to manage vertical stacking explicitly */}
      <div className="relative z-10 h-full w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col lg:grid lg:grid-cols-12 pointer-events-none">
        
        {/* --- LEFT CONTENT (Top on Mobile) --- */}
        <div 
          ref={leftContentRef} 
          // MOBILE: justify-start (top), pt-24 (space for navbar), h-1/2 (take top half)
          // DESKTOP: justify-center, pt-20, col-span-4
          className="h-[55%] lg:h-auto lg:col-span-4 flex flex-col justify-start lg:justify-center items-center text-center lg:items-start lg:text-left pt-28 lg:pt-20 pointer-events-auto"
        >
          {/* Heading */}
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

          {/* Paragraph: Smaller text on mobile, tighter margins */}
          <p className="lg:text-lg text-white/70 lg:text-white/60 mb-6 lg:mb-10 max-w-xs lg:max-w-lg leading-relaxed">
            The ultimate workspace uniting real-time communication with powerful AI tools.
             From HD group meetings to instant image generation, manage your entire digital life in one place
          </p>

          {/* Buttons: Smaller padding on mobile */}
          <div className="flex flex-row items-center gap-3 lg:gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-3 lg:px-5 lg:py-4 rounded-full bg-white text-black font-bold text-sm lg:text-lg hover:bg-indigo-50 transition-all hover:scale-98 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
            
            <button className="px-5 py-3 lg:px-8 lg:py-4 rounded-full border-2 border-white/20 text-white font-medium text-sm lg:text-base hover:bg-white/10 transition-colors backdrop-blur-sm cursor-pointer">
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
          <h2 className="text-4xl lg:text-8xl lg:mt-13 whitespace-nowrap font-bold tracking-tighter">
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

      {/* --- SCROLL DOWN BUTTON --- */}
      <button 
        onClick={handleScrollDown}
        // Bottom-4 on mobile, Bottom-8 on desktop
        className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 lg:gap-2 text-white/60 hover:text-white transition-colors duration-900 animate-bounce cursor-pointer pointer-events-auto"
        aria-label="Scroll to features"
      >
        <span className="text-[10px] lg:text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronsDown className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

    </section>
  );
};