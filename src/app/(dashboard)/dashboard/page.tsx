"use client";

import React, { useState } from "react";
import { ArrowRight, Zap, MessageSquare } from "lucide-react";
import { Rating } from "react-simple-star-rating";
import { useUser } from "@clerk/nextjs"; // <--- IMPORT CLERK HOOK

export default function DashboardHome() {
  const { user, isLoaded } = useUser(); // <--- GET USER DATA
  const [rating, setRating] = useState(0);

  // Handle Rating Logic
  const handleRating = (rate: number) => setRating(rate);

  return (
    <div className="space-y-10">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-8 md:p-12">
        <div className="relative z-10">
          {/* DYNAMIC WELCOME MESSAGE */}
          <h1 className="text-4xl font-bold mb-4">
             Welcome back, {isLoaded ? (user?.firstName || "Creator") : "..."}.
          </h1>
          <p className="text-white/60 max-w-xl mb-6">
            You have 120 credits remaining. Your AI tools are ready to deploy.
          </p>
          <button className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
            Create New Project <Zap className="w-4 h-4 fill-black" />
          </button>
        </div>
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      </div>

      {/* Quick Stats / Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <h3 className="text-white/50 text-sm font-medium mb-2">Total Generated</h3>
            <p className="text-3xl font-bold">1,204 <span className="text-xs text-green-400 font-normal">+12%</span></p>
         </div>
         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <h3 className="text-white/50 text-sm font-medium mb-2">Active Chats</h3>
            <p className="text-3xl font-bold">8 <span className="text-xs text-gray-400 font-normal">Open</span></p>
         </div>
      </div>

      {/* --- FEEDBACK SECTION --- */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
           <h2 className="text-2xl font-bold">Your Voice Matters</h2>
           <p className="text-white/60">
             Help us improve the AI Super App. Your feedback directly influences our roadmap and appears on our landing page.
           </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10">
           <h3 className="font-semibold mb-4 flex items-center gap-2">
             <MessageSquare className="w-4 h-4 text-indigo-400" /> 
             Submit Review
           </h3>
           
           <div className="space-y-4">
             {/* Star Rating */}
             <div className="flex flex-col gap-2">
               <label className="text-xs text-white/50 uppercase tracking-wide">Rating</label>
               <Rating 
                 onClick={handleRating}
                 SVGstyle={{ display: 'inline' }}
                 size={24}
                 transition
                 fillColor="#818cf8"
                 emptyColor="#333"
               />
             </div>

             {/* Text Area */}
             <div className="flex flex-col gap-2">
               <label className="text-xs text-white/50 uppercase tracking-wide">Review</label>
               <textarea 
                 className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                 placeholder="Tell us what you think about the AI tools..."
               />
             </div>

             <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
               Submit Feedback
             </button>
           </div>
        </div>
      </div>

    </div>
  );
}