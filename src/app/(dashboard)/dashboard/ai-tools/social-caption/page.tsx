"use client";

import React, { useState } from "react";
import { Hash, Instagram, Linkedin, Twitter, Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CaptionGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [platform, setPlatform] = useState("Instagram");
  const [description, setDescription] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Simulate different outputs based on platform
      const newCaptions = [
        platform === "Instagram" 
          ? "Chasing sunsets and dreams. ✨🌅 \n\n#DreamBig #SunsetLovers #Vibes"
          : platform === "Twitter"
          ? "Just shipped a new feature! 🚀 Efficiency is key. \n\n#BuildInPublic #Tech"
          : "Excited to share our latest milestone. Hard work pays off when you have a dedicated team. 🤝 \n\n#Leadership #GrowthMindset",
        
        platform === "Instagram"
          ? "POV: You found the perfect workflow. 💻☕️ \n\n#DevLife #Coding #Setup"
          : platform === "Twitter"
          ? "AI is changing the game. Are you ready? 🤖 \n\n#AI #FutureOfWork"
          : "Innovation isn't just a buzzword; it's our daily practice. Proud of what we built this quarter. 📈 \n\n#Innovation #TechTrends"
      ];
      setCaptions(newCaptions);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8">
      
      {/* LEFT: Input Configuration */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-pink-500/20 rounded-lg"><Hash className="w-5 h-5 text-pink-400" /></div>
            <h2 className="font-bold text-white">Caption Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Instagram", icon: Instagram },
                  { name: "Twitter", icon: Twitter },
                  { name: "LinkedIn", icon: Linkedin }
                ].map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setPlatform(p.name)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                      platform === p.name 
                        ? "bg-white/10 border-indigo-500 text-white" 
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <p.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">What is your post about?</label>
              <textarea 
                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-white/20"
                placeholder="e.g. A photo of my new workspace setup with coffee and code..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!description || isGenerating}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Generate Captions"}
          </button>
        </div>
      </div>

      {/* RIGHT: Results */}
      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pb-10">
        <h3 className="text-sm font-semibold text-white/60 px-2">Generated Options</h3>
        
        {captions.length > 0 ? (
          <div className="grid gap-4">
            {captions.map((cap, i) => (
              <div key={i} className="group relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all">
                <p className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">{cap}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/30">{cap.length} characters</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy(cap, i)}
                      className={cn(
                        "p-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors",
                        copiedIndex === i ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {copiedIndex === i ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedIndex === i ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/10 rounded-2xl">
            <Hash className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Enter a topic to generate captions.</p>
          </div>
        )}
      </div>
    </div>
  );
}