"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import Router
import { Hash, Instagram, Linkedin, Twitter, Copy, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Import Toast
import { ProModal } from "@/components/pro-modal"; // Import Pro Modal

export default function CaptionGeneratorPage() {
  const router = useRouter(); // Initialize Router
  const [isGenerating, setIsGenerating] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [platform, setPlatform] = useState("Instagram");
  const [description, setDescription] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [proModalOpen, setProModalOpen] = useState(false); // Modal State

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setCaptions([]); 

      const response = await axios.post("/api/caption", {
        platform,
        description
      });

      setCaptions(response.data);
      router.refresh(); // Refresh Credits

    } catch (error: any) {
      console.log(error);
      
      // 👇 CHECK FOR 403
      if (error?.response?.status === 403) {
        setProModalOpen(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // --- MOBILE SAFE COPY FUNCTION ---
  const handleCopy = async (text: string, index: number) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        return;
      } catch (err) {
        console.error("Modern copy failed", err);
      }
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error("Copy failed manually.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8">
      
      {/* 👇 ADD PRO MODAL */}
      <ProModal 
        isOpen={proModalOpen} 
        onClose={() => setProModalOpen(false)} 
      />

      {/* LEFT: Input Configuration */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-white/5 border-3 border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
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
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-black/20 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
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
                className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-white/20"
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
             {isGenerating ? (
               <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
               <>
                 <Sparkles className="w-4 h-4 fill-white" /> Generate Captions
               </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT: Results */}
      <div className="flex-1 space-y-4 rounded-2xl overflow-y-auto border-3 border-white/15 custom-scrollbar pb-10">
        <h3 className="text-sm font-semibold text-white/60 px-2 py-2">Generated Options</h3>
        
        {isGenerating && (
             <div className="flex flex-col items-center justify-center h-40 text-white/40 animate-pulse">
                <p>Crafting viral captions...</p>
             </div>
        )}

        {!isGenerating && captions.length > 0 ? (
          <div className="grid gap-4">
            {captions.map((cap, i) => (
              <div key={i} className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">{cap}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/30">{cap.length} characters</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy(cap, i)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors",
                        copiedIndex === i ? "bg-green-500/20 text-green-400" : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white"
                      )}
                    >
                      {copiedIndex === i ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === i ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/10 rounded-2xl min-h-[300px]">
                <Hash className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Enter a topic to generate captions.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}