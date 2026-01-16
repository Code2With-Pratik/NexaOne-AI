"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Star, Quote, Loader2 , BadgeCheck } from "lucide-react";
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
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r text-white mb-4">
          Loved by our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Users</span> 
        </h2>
        <p className="text-white/50 text-lg">
          See what the community has to say about the NexaOneAI.
        </p>
      </div>

      <div className="flex flex-col gap-12">
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
    <div className="relative w-[320px] md:w-[400px] p-8 rounded-3xl bg-gradient-to-b from-black/20 to-pink-900/20 
     border-3 border-white/10 shadow-2xl transition-all duration-500

      hover:bg-pink-900/15 /* Slight internal brighten */
      hover:border-pink-500/50 /* Border lights up */
      hover:shadow-[0_0_40px_-10px_rgba(255,182,193,0.6)] /* The pink colored glow shadow */
      hover:-translate-y-1 /* Subtle lift */
      
      group flex-shrink-0 whitespace-normal select-none mr-6 /* Add margin for spacing */
    ">
      {/* Top Right Quote Icon - updated hover color to match glow */}
      <Quote className="absolute top-8 right-8 w-6 h-6 text-white/30 group-hover:text-pink-400/50 transition-colors" />
      
      {/* THE NEW RATING PILL */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
         <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
         {/* Displaying rating as "5.0" */}
         <span className="text-sm font-bold text-white/90">{review.rating}.0</span>
      </div>

      {/* Message text - slightly larger font for modern feel */}
      <p className="text-white/80 leading-relaxed mb-8 text-base line-clamp-4 font-sans">
        "{review.message}"
      </p>

      {/* Footer Section - Integrated your existing user details */}
      <div className="flex items-center gap-4">
        {/* Avatar - Switched to rounded square to match modern aesthetic */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white uppercase shrink-0 shadow-lg shadow-pink-500/10">
            {review.avatar ? (
                <img src={review.avatar} alt={review.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
                review.name.substring(0, 2)
            )}
        </div>
        <div>
          <h4 className="text-white flex items-center gap-2 font-bold text-base leading-none mb-1">{review.name}
           {/* Added explicit text color to badge for better contrast against glass */}
           <BadgeCheck className="w-4 h-4 text-pink-500 fill-blue-400/10" />
          </h4>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Verified User
          </p>
        </div>
      </div>
    </div>
  );
}