"use client";

import React, { useRef } from "react";
import Spline from "@splinetool/react-spline";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(textRef.current, {
      yPercent: 50,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-transparent">
      {/* 3D Layer */}
      <div className="absolute inset-0 z-0 scale-110">
        <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
        {/* UPDATED: bg-linear-to-t */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/40" />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div ref={textRef} className="text-center px-4 max-w-4xl mx-auto pointer-events-auto pt-20">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white/90">Gen-AI 2.0 is Here</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 animate-fade-in-up [animation-delay:200ms]">
            Craft Reality <br />
            {/* UPDATED: bg-linear-to-r */}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
              With Intelligence
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            The first all-in-one ecosystem connecting real-time communication with generative AI tools. Chat, create, and collaborate in 3D.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:600ms]">
            <Link href="/dashboard" className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors backdrop-blur-sm">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};