"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const reviews = [
  { name: "Alex Rivet", role: "Product Designer", text: "The 3D interface completely changed how I present my work. It's not just a tool, it's an experience." },
  { name: "Sarah Chen", role: "AI Researcher", text: "Having RAG-based search and video calls in one place saves me 2 hours every day." },
  { name: "James Wilson", role: "Agency Owner", text: "My clients are blown away when I share the dashboard link. It looks professional and futuristic." },
  { name: "Elena K.", role: "Freelancer", text: "The credit system is fair, and the image generation quality rivals Midjourney." },
];

export const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // The Magic: Link horizontal movement (xPercent) to vertical scroll
    gsap.to(sliderRef.current, {
      xPercent: -50, // Move left by 50% of width
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom", // Start when section hits bottom of screen
        end: "bottom top",   // End when section leaves top of screen
        scrub: 1,            // Smooth scrubbing effect (1s delay)
      },
    });
  }, []);

  return (
    <section 
      id="testimonials" 
      ref={containerRef} 
      className="py-32 bg-transparent overflow-hidden border-t border-white/5"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Trusted by Creators</h2>
        <p className="text-white/50">Scroll to see what the community is saying</p>
      </div>

      {/* Slider Container */}
      <div 
        ref={sliderRef} 
        className="flex w-[200%] gap-8 px-4" // Width 200% to allow scrolling
      >
        {/* We double the array to create a long strip */}
        {[...reviews, ...reviews].map((review, i) => (
          <div
            key={i}
            className="w-[400px] shrink-0 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-lg text-white/80 mb-6 leading-relaxed">"{review.text}"</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold">
                {review.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-white">{review.name}</h4>
                <p className="text-xs text-white/50">{review.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};