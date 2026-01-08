"use client";

import React, { useState } from "react";
import { Download, Sparkles, Image as ImageIcon, Copy, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sampleImages = [
  "https://images.unsplash.com/photo-1709669537142-9721cb97103a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1695504236952-475355c7a914?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621643644026-62153ae2931a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1664147683935-817885b5420d?q=80&w=600&auto=format&fit=crop"
];

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [ratio, setRatio] = useState("16:9");

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT: Controls */}
      <div className="w-full md:w-80 space-y-6">
        <div className="p-6 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 space-y-6 shadow-xl">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Prompt</label>
            <textarea 
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none placeholder:text-white/20"
              placeholder="A futuristic cyberpunk city with neon lights..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {["1:1", "16:9", "9:16"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium border transition-colors",
                    ratio === r 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <>
                 <Sparkles className="w-4 h-4" /> Generate
               </>
            )}
          </button>
        </div>

        {/* Credit Info */}
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs text-center">
          Generation costs <span className="font-bold">2 Credits</span>. <br/>
          You have 120 credits left.
        </div>
      </div>

      {/* RIGHT: Gallery / Output */}
      <div className="flex-1 rounded-2xl bg-[#0A0A0A] border border-white/10 p-6 overflow-y-auto custom-scrollbar">
         {prompt && isGenerating ? (
           <div className="h-full flex flex-col items-center justify-center text-white/40">
              <div className="relative w-24 h-24 mb-4">
                 <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
              <p>Dreaming up your masterpiece...</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main "Latest" Image */}
              <div className="md:col-span-2 group relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                <img src={sampleImages[0]} alt="Generated" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between">
                   <p className="text-xs text-white truncate max-w-[200px]">{prompt || "Neon Cityscape"}</p>
                   <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/20 rounded-lg text-white"><Download className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-white/20 rounded-lg text-white"><Maximize2 className="w-4 h-4" /></button>
                   </div>
                </div>
              </div>

              {/* History Grid */}
              {sampleImages.slice(1).map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                   <img src={img} alt="History" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-2 bg-white/10 hover:bg-white/30 rounded-lg text-white backdrop-blur-md"><Download className="w-4 h-4" /></button>
                   </div>
                </div>
              ))}
           </div>
         )}
      </div>
    </div>
  );
}