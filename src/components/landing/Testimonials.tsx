"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Star, Quote, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from "framer-motion";

// Helper to wrap numbers safely for infinite scrolling
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

type Testimonial = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  message: string;
  createdAt: string;
};

// --- PARALLAX COMPONENT ---
function ParallaxText({ children, baseVelocity = 100 }: { children: React.ReactNode; baseVelocity: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Smooth out the scroll interactions
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300 
  });
  
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
    clamp: false
  });

  // Wrap logic: 0 to -25% because we render 4 copies of the children
  const x = useTransform(baseX, (v) => `${wrap(0, -25, v)}%`);

  const directionFactor = useRef<number>(1);
  
  // Ref to track if user is hovering
  const isHovered = useRef(false);
  
  useAnimationFrame((t, delta) => {
    // STOP animation if hovered
    if (isHovered.current) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // React to scroll direction
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div 
      className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap cursor-pointer"
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
    >
      <motion.div 
        className="flex flex-nowrap gap-8 will-change-transform" 
        style={{ x }}
      >
        {children}
        {children} 
        {children} 
        {children} 
      </motion.div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("/api/feedback");
        const data = res.data;
        // If we have few reviews, duplicate them to ensure smooth infinite scroll
        if (data.length > 0 && data.length < 4) {
             setReviews([...data, ...data, ...data]); 
        } else {
             setReviews(data);
        }
      } catch (e) {
        console.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-white/50" /></div>;
  if (reviews.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-black/20">
      
      <div className="text-center mb-16 px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4">
          Loved by our Users
        </h2>
        <p className="text-white/50 text-lg">
          See what the community has to say about the AI Super App.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* ROW 1: Slower Speed (-0.8) */}
        <ParallaxText baseVelocity={-0.8}>
           {reviews.map((review, i) => (
              <TestimonialCard key={`${review.id}-${i}`} review={review} />
           ))}
        </ParallaxText>

        {/* ROW 2: Slower Speed (0.8) - Moves Opposite Direction */}
        <ParallaxText baseVelocity={0.8}>
           {reviews.map((review, i) => (
              <TestimonialCard key={`${review.id}-${i}-dup`} review={review} />
           ))}
        </ParallaxText>
      </div>

    </section>
  );
}

// --- CARD COMPONENT ---
function TestimonialCard({ review }: { review: Testimonial }) {
  return (
    <div className="w-[300px] md:w-[400px] bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl hover:bg-white/5 transition duration-300 relative group flex-shrink-0 whitespace-normal select-none">
      <Quote className="absolute top-4 right-4 w-6 h-6 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" />
      
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn("w-3.5 h-3.5", i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-white/10")} 
          />
        ))}
      </div>

      <p className="text-white/80 leading-relaxed mb-6 text-sm line-clamp-4 min-h-[80px]">
        "{review.message}"
      </p>

      <div className="flex items-center gap-3 border-t border-white/5 pt-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
            {review.avatar ? (
                <img src={review.avatar} alt={review.name} className="w-full h-full rounded-full object-cover" />
            ) : (
                review.name.substring(0, 2)
            )}
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">{review.name}</h4>
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Verified User</p>
        </div>
      </div>
    </div>
  );
}