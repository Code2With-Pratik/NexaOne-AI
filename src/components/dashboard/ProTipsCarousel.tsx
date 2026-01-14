"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TIPS = [
  "💡 Pro Tip: Use 'photorealistic' in your image prompt for better results.",
  "🚀 Did you know? You can generate video from images using the 'Animate' tool.",
  "🎨 Tip: Try adding 'cinematic lighting, 8k resolution' to enhance details.",
  "⚡ Efficiency: Group multiple requests in one go to save time.",
  "💎 Premium: Ultra Plan members get 50% faster generation speeds."
];

export function ProTipsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex items-center justify-center py-6 mt-4 relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-indigo-900/10">
      {/* Background Glow */}
      <div className="absolute border-2 border-white/15 inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-50" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-yellow-500/10 rounded-full">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
        </div>
        
        <div className="h-6 overflow-hidden relative min-w-[300px] md:min-w-[400px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm md:text-base font-medium text-white/80 text-center absolute w-full"
            >
              {TIPS[index]}
            </motion.p>
          </AnimatePresence>
        </div>
        
        <Sparkles className="w-5 h-5 text-purple-400" />
      </div>
    </div>
  );
}