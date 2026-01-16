"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs"; // 1. Import Clerk

export const DynamicNavbar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState("");
  
  // 2. Get Auth Status
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setIsHovered(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(() => {
    const isCompact = isScrolled && !isHovered;
    gsap.to(containerRef.current, {
      width: isCompact ? "180px" : "90%",
      maxWidth: isCompact ? "180px" : "1200px",
      height: isCompact ? "50px" : "70px",
      borderRadius: "9999px",
      duration: 0.8,
      ease: "elastic.out(1, 0.9)",
    });
  }, [isScrolled, isHovered]);

  return (
    <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none">
      <div
        ref={containerRef}
        onMouseEnter={() => isScrolled && setIsHovered(true)}
        onMouseLeave={() => isScrolled && setIsHovered(false)}
        className={cn(
          "pointer-events-auto relative flex items-center justify-between px-6 backdrop-blur-xl transition-colors duration-300 overflow-hidden",
          isScrolled && !isHovered
            ? "bg-black/80 border border-white/20 shadow-2xl cursor-pointer"
            : "bg-white/5 border border-white/10 shadow-xl"
        )}
      >
        {/* Capsule Mode (Time) */}
        <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-300", isScrolled && !isHovered ? "opacity-100 delay-100" : "opacity-0")}>
          <span className="text-white font-medium tracking-wider text-sm pointer-events-none">{time}</span>
        </div>

        {/* Full Mode (Links) */}
        <div className={cn("flex items-center justify-between w-full transition-opacity duration-200", isScrolled && !isHovered ? "opacity-0 invisible" : "opacity-100 visible delay-100")}>
          
          {/* Logo */}
          <Link href="#hero" className="flex items-center gap-2 group relative z-10 cursor-pointer">
            {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">A</span>
            </div> */}
            <img src="/favicon.ico" alt="Favicon" className="h-10 w-10" />
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block mb-1">
              NexaOne<span className="text-pink-400"> AI</span>
            </span>
          </Link>

          {/* Nav Links - Hidden on small mobile */}
          <div className="hidden md:flex items-center gap-8">
            {["About", "Features", "Testimonials", "Pricing"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="font-medium text-white/60 hover:text-white transition-colors cursor-pointer relative z-10"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Auth Buttons (Dynamic) */}
          <div className="flex items-center gap-4 relative z-10">
             {isSignedIn ? (
               // --- LOGGED IN VIEW ---
               <>
                 <Link href="/dashboard">
                   <button className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer">
                     <LayoutDashboard className="w-4 h-4" /> Dashboard
                   </button>
                 </Link>
                 {/* User Profile Icon */}
                 <div className="w-8 h-8 flex items-center justify-center">
                    <UserButton afterSignOutUrl="/" />
                 </div>
               </>
             ) : (
               // --- LOGGED OUT VIEW ---
               <>
                 <Link href="/sign-in" className="text-sm text-white/80 hover:text-white hidden sm:block cursor-pointer">
                    Login
                 </Link>
                 <Link href="/sign-up" className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 cursor-pointer hover:scale-105">
                    Start Free <ArrowRight className="w-4 h-4" />
                 </Link>
               </>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};