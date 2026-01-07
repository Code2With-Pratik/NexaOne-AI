"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

// Split reviews into two groups so the rows look different
const reviewsRow1 = [
  { name: "Alex Rivet", role: "Product Designer", text: "The 3D interface completely changed how I present my work. It's not just a tool, it's an experience." },
  { name: "Sarah Chen", role: "AI Researcher", text: "Having RAG-based search and video calls in one place saves me 2 hours every day." },
  { name: "James Wilson", role: "Agency Owner", text: "My clients are blown away when I share the dashboard link. It looks professional and futuristic." },
  { name: "Elena K.", role: "Freelancer", text: "The credit system is fair, and the image generation quality rivals Midjourney." },
];

const reviewsRow2 = [
  { name: "Michael T.", role: "Developer", text: "The API integration was seamless. Documentation is top-notch." },
  { name: "Jessica L.", role: "Content Creator", text: "Finally, an AI tool that actually understands context. The writing assistant is a game changer." },
  { name: "David B.", role: "Startup Founder", text: "We replaced 4 different subscriptions with this one Super App. It's a no-brainer." },
  { name: "Emily R.", role: "Art Director", text: "The visual consistency across the image generator is impressive. Perfect for storyboards." },
];

export const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ROW 1: Moves LEFT (0% -> -50%)
    gsap.to(row1Ref.current, {
      xPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    // ROW 2: Moves RIGHT (-50% -> 0%)
    // We start at -50% so it looks like it's coming from the left
    gsap.fromTo(
      row2Ref.current,
      { xPercent: -50 },
      {
        xPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  }, []);

  return (
    <section 
      id="testimonials" 
      ref={containerRef} 
      className="py-32 bg-transparent overflow-hidden relative z-10"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Trusted by Creators</h2>
        <p className="text-white/50">Scroll to hear from the community</p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* --- ROW 1 (Moves Left) --- */}
        <div 
          ref={row1Ref} 
          className="flex w-[200%] gap-6 px-4"
        >
          {/* Duplicate array to create infinite strip illusion */}
          {[...reviewsRow1, ...reviewsRow1, ...reviewsRow1].map((review, i) => (
            <ReviewCard key={`row1-${i}`} review={review} />
          ))}
        </div>

        {/* --- ROW 2 (Moves Right) --- */}
        <div 
          ref={row2Ref} 
          className="flex w-[200%] gap-6 px-4"
        >
          {/* Duplicate array here too */}
          {[...reviewsRow2, ...reviewsRow2, ...reviewsRow2].map((review, i) => (
            <ReviewCard key={`row2-${i}`} review={review} />
          ))}
        </div>

      </div>
    </section>
  );
};

// Helper Component for cleaner code
const ReviewCard = ({ review }: { review: { name: string; role: string; text: string } }) => (
  <div className="w-[400px] flex-shrink-0 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 transition-colors">
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
      ))}
    </div>
    <p className="text-lg text-white/80 mb-6 leading-relaxed line-clamp-3">"{review.text}"</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
        {review.name[0]}
      </div>
      <div>
        <h4 className="font-bold text-white">{review.name}</h4>
        <p className="text-xs text-white/50">{review.role}</p>
      </div>
    </div>
  </div>
);