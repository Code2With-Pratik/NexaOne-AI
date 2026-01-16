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
      // Calculate the position of the target section
      const targetPosition = featureSection.getBoundingClientRect().top + window.scrollY;
      
      // Use GSAP to animate the window scroll manually
      // This works without extra plugins by animating a proxy object
      const scrollObj = { y: window.scrollY };
      
      gsap.to(scrollObj, {
        y: targetPosition,
        duration: 1.5, // Adjust this duration to make it slower/smoother (1.5s)
        ease: "power3.inOut", // Elegant ease-in-out effect
        onUpdate: () => {
          window.scrollTo(0, scrollObj.y);
        }
      });
    } else {
      // Fallback: Scroll down one screen height smoothly
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
      className="relative h-screen w-full overflow-hidden"
    >
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0 h-full w-full flex items-center justify-center pointer-events-none">
         <div className="relative w-full h-full scale-190 -translate-x-15 md:translate-y-0">
            <Spline scene="https://prod.spline.design/S5F2s4yId-8dZbvp/scene.splinecode" />
         </div>
        <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/20 via-transparent to-black/40" />
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 h-full w-full max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 items-center pointer-events-none">
        
        {/* --- LEFT CONTENT --- */}
        <div 
          ref={leftContentRef} 
          className="col-span-12 lg:col-span-4 flex flex-col justify-center items-start text-left pt-20 pointer-events-auto"
        >
          {/* Heading: 3 Lines Fixed */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-none">
            {/* Line 1: White */}
            <span className="whitespace-nowrap -ml-2">Craft Reality</span>
            <br />
            
            {/* Line 2: Blue/Purple Gradient */}
            <span className="text-8xl ml-32 text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 to-pink-400">
               with
            </span>
            <br />
            
            {/* Line 3: Pink/Purple Gradient */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Intelligence
            </span>
          </h1>

          {/* Paragraph */}
          <p className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed">
            The ultimate workspace uniting real-time communication with powerful AI tools.
            From HD group meetings to instant image generation, manage your entire digital life in one place
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/dashboard"
              className="px-5 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-98 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            
            <button className="px-8 py-4 rounded-full border-2 border-white/20 text-white font-medium hover:bg-white/10 transition-colors backdrop-blur-sm cursor-pointer">
              View Demo
            </button>
          </div>
        </div>

        {/* --- MIDDLE SPACER --- */}
        <div className="hidden lg:block lg:col-span-4 h-full"></div>

        {/* --- RIGHT CONTENT --- */}
        <div 
          ref={rightContentRef}
          className="col-span-12 lg:col-span-4 flex flex-col justify-center items-end text-right pointer-events-auto mt-10 lg:mt-0"
        >
          {/* NexaOne AI Heading */}
          <h2 className="text-5xl md:text-8xl whitespace-nowrap mt-15 font-bold tracking-tighter">
            NexaOne <br />
            <span className="text-transparent mr-38 bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              AI
            </span>
          </h2>

          {/* Star Icon - UPDATED WITH ROTATION */}
          <div className="relative mr-2 mb-8">
            <div className="absolute inset-0 blur-xl bg-purple-500/40 rounded-full"></div>
            {/* Added animate-[spin_10s_linear_infinite] for slow rotation */}
            <Star 
              className="relative w-20 h-20 text-white animate-[spin_10s_linear_infinite]" 
              strokeWidth={1.5} 
            />
          </div>

          {/* Paragraph */}
          <p className="text-lg text-white/60 pt-5 mb-10 max-w-lg leading-relaxed">
            Connect and create without limits. 
            Experience the first secure platform that fuses high-definition video calling with a complete suite of generative AI assistants.
          </p>


          {/* "NexaAI 4.0" Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white/90">
              NexaAI 4.0 Available
            </span>
          </div>
        </div>
      </div>

      {/* --- SCROLL DOWN BUTTON --- */}
      <button 
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors duration-900 animate-bounce cursor-pointer pointer-events-auto"
        aria-label="Scroll to features"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronsDown className="w-6 h-6" />
      </button>

    </section>
  );
};