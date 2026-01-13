"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
import { ArrowRight } from "lucide-react";

export const DynamicNavbar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState("");

  // 1. Clock Logic (Updates every minute)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  // 2. Scroll Detection Logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setIsHovered(false); // Reset hover state when at top
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. The GSAP "Elastic" Animation Engine
  useGSAP(() => {
    const isCompact = isScrolled && !isHovered;

    // Animate the Container Size & Shape
    gsap.to(containerRef.current, {
      width: isCompact ? "180px" : "90%", // Capsule vs Full Width
      height: isCompact ? "50px" : "70px",
      borderRadius: "9999px", // Always rounded
      duration: 0.8,
      ease: "elastic.out(1, 0.5)", // The "iPhone Bounce" Physics
    });

  }, [isScrolled, isHovered]);

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center">
      <div
        ref={containerRef}
        onMouseEnter={() => isScrolled && setIsHovered(true)}
        onMouseLeave={() => isScrolled && setIsHovered(false)}
        className={cn(
          "relative flex items-center justify-between px-6 backdrop-blur-xl transition-colors duration-300",
          isScrolled && !isHovered 
            ? "bg-black/80 border border-white/10 shadow-2xl cursor-pointer" // Dark Capsule Look
            : "bg-white/10 border border-white/20 shadow-xl" // Glassmorphism Look
        )}
      >
        {/* --- STATE A: CAPSULE (Time Only) --- */}
        {isScrolled && !isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-medium font-mono tracking-wider animate-in fade-in duration-500">
              {time}
            </span>
          </div>
        )}

        {/* --- STATE B: FULL NAVBAR (Links) --- */}
        <div
          className={cn(
            "flex items-center justify-between w-full transition-opacity duration-300",
            isScrolled && !isHovered ? "opacity-0 invisible delay-0" : "opacity-100 visible delay-100"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white/90">
              NexaOne<span className="text-indigo-400"> AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {["About", "Features", "Dashboard", "Testimonials", "Pricing"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-white hover:text-indigo-300 hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-indigo-50 transition-transform hover:scale-105 flex items-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};