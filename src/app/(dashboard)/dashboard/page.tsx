"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  ImageIcon, 
  VideoIcon, 
  PenTool, 
  Search, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  History
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
// 👇 IMPORT THE NEW COMPONENT
import FeedbackForm from "@/components/dashboard/FeedbackForm";

// --- CONFIGURATION ---
const tools = [
  { label: "AI Chatbot", icon: MessageSquare, color: "text-violet-500", bgColor: "bg-violet-500/10", href: "/dashboard/ai-tools/assistant" },
  { label: "Image Generator", icon: ImageIcon, color: "text-pink-700", bgColor: "bg-pink-700/10", href: "/dashboard/ai-tools/image-generator" },
  { label: "Caption Generator", icon: VideoIcon, color: "text-orange-700", bgColor: "bg-orange-700/10", href: "/dashboard/ai-tools/social-caption" },
  { label: "Article Writer", icon: PenTool, color: "text-emerald-500", bgColor: "bg-emerald-500/10", href: "/dashboard/ai-tools/article-writer" },
  { label: "Email Generator", icon: Mail, color: "text-green-700", bgColor: "bg-green-700/10", href: "/dashboard/ai-tools/email-generator" },
  { label: "Search Engine", icon: Search, color: "text-blue-500", bgColor: "bg-blue-500/10", href: "/dashboard/ai-tools/search-engine" }
];

// Mock History Data (Placeholders)
const mockHistory = [
  { tool: "Image Generator", detail: "Cyberpunk City at Night", time: "2 mins ago" },
  { tool: "Search Engine", detail: "Latest SpaceX Launch", time: "1 hour ago" },
  { tool: "Article Writer", detail: "Future of AI in 2026", time: "3 hours ago" },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="mb-8 space-y-10">
      
      {/* 1. HERO SECTION */}
      <div className="space-y-4 text-center pt-8">
        <h2 className="text-3xl md:text-5xl font-bold text-white text-center">
          Unleash your creative power
        </h2>
        <p className="text-white/60 font-light text-sm md:text-lg text-center max-w-2xl mx-auto">
          Chat with the smartest AI - Experience the power of AI with our suite of tools.
        </p>
      </div>

      {/* 2. TOOLS GRID */}
      <div className="px-4 md:px-20 lg:px-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.href}
              onClick={() => router.push(tool.href)}
              className="p-4 border border-white/10 flex items-center justify-between rounded-xl hover:shadow-md hover:bg-white/5 transition cursor-pointer group bg-black/20"
            >
              <div className="flex items-center gap-x-4">
                <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                  <tool.icon className={cn("w-8 h-8", tool.color)} />
                </div>
                <div className="font-semibold text-white">
                  {tool.label}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. HISTORY & FEEDBACK SPLIT SECTION */}
      <div className="px-4 md:px-20 lg:px-32 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Recent History */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full">
             <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
             </div>
             
             <div className="space-y-4 flex-1">
                {mockHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group">
                     <div>
                        <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{item.tool}</p>
                        <p className="text-xs text-white/50">{item.detail}</p>
                     </div>
                     <span className="text-[10px] text-white/30">{item.time}</span>
                  </div>
                ))}
                <button className="w-full py-2 text-xs text-center text-white/40 hover:text-white mt-auto border-t border-white/5">
                   View Full History
                </button>
             </div>
          </div>

          {/* RIGHT: Feedback Form (Integrated Component) */}
          <div className="flex flex-col h-full">
             {/* We wrap it to match height if needed, or just let it flow */}
             <FeedbackForm />
          </div>

      </div>
      
      {/* 4. PRO TIP CARD */}
      <div className="px-4 md:px-20 lg:px-32 pb-8">
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-white/10 rounded-xl p-4 flex items-center gap-4">
           <div className="p-2 bg-blue-500/20 rounded-full shrink-0">
              <Sparkles className="w-5 h-5 text-blue-300" />
           </div>
           <p className="text-sm text-white/80">
             <span className="font-bold text-blue-200">Pro Tip:</span> Connect your feedback form to a database later to collect real user testimonials!
           </p>
        </div>
      </div>

    </div>
  );
}