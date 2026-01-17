"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; 
import { Download, Sparkles, Image as ImageIcon, Maximize2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProModal } from "@/components/pro-modal"; 
import { toast } from "sonner"; 

// Helper to download base64 images
const downloadImage = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Available artistic themes
const THEMES = [
  { value: "Modern", label: "Modern" },
  { value: "Anime Style", label: "Anime" },
  { value: "Cyberpunk Neon", label: "Neon" },
  { value: "Studio Ghibli", label: "Ghibli" },
  { value: "Oil Painting", label: "Painting" },
  { value: "3D Render", label: "3D" },
];

export default function ImageGeneratorPage() {
  const router = useRouter(); 

  // --- STATE ---
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState("Modern");
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // New State for Pro Modal
  const [proModalOpen, setProModalOpen] = useState(false);

  // --- GENERATE LOGIC ---
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setImages([]); 

      const finalPrompt = `${prompt}, ${theme} style, high quality, 8k, detailed`;

      // API Call
      const response = await axios.post("/api/image", {
        prompt: finalPrompt,
        resolution: "1024x1024"
      });

      // Handle Response (Support both single string and array)
      const urls = Array.isArray(response.data) ? response.data.map((img: any) => img.url) : [response.data];
      setImages(urls);
      
      // Refresh the router to update the Sidebar Credit Counter
      router.refresh(); 

    } catch (error: any) {
      console.log(error);
      
      // 👇 CHECK FOR 403 (OUT OF CREDITS)
      if (error?.response?.status === 403) {
        setProModalOpen(true); // Open the Upgrade Modal
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-transparent max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* PRO MODAL */}
      <ProModal 
        isOpen={proModalOpen} 
        onClose={() => setProModalOpen(false)} 
      />

      {/* LEFT: Controls */}
      <div className="w-full md:w-80 space-y-6">
        
        {/* 👇 HEADER ADDED HERE */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-pink-500">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Image Generator</h1>
            <p className="text-white/50 text-sm">Turn your text into stunning visual art.</p>
          </div>
        </div>

        {/* Control Box */}
        <div className="p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
          
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Prompt</label>
            <textarea 
              className="w-full h-32 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-pink-500 resize-none placeholder:text-white/20 transition-colors"
              placeholder="A futuristic cyberpunk city with neon lights..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Art Style</label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  disabled={isGenerating}
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                    theme === t.value
                      ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 text-white font-bold cursor-pointer text-sm hover:opacity-90 transition-all disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? (
               <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
               <>
                 <Sparkles className="w-4 h-4 fill-white" /> Generate
               </>
            )}
          </button>
        </div>

        {/* Credit Info */}
        <div className="p-4 rounded-xl border border-white/10 text-pink-500 text-xs text-center">
          Generation costs <span className="font-bold">5 Credits</span>. <br/>
          (High Quality Mode Active)
        </div>
      </div>

      {/* RIGHT: Output Gallery */}
      <div className="flex-1 rounded-2xl border border-white/10 p-1 overflow-hidden flex flex-col items-center justify-center min-h-[400px] relative">
          
          {isGenerating && (
            <div className="flex flex-col items-center justify-center text-white/40 animate-pulse">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p>Creating masterpiece...</p>
            </div>
          )}

          {!isGenerating && images.length === 0 && (
            <div className="text-center text-white/30">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Enter a prompt to start generating.</p>
            </div>
          )}

          {/* Display Result */}
          {images.map((src, i) => (
            <div 
             key={i} 
             className="relative group w-full h-full rounded-xl overflow-hidden shadow-2xl focus:outline-none"
            >
              <img src={src} alt="Generated" className="w-full h-full object-contain bg-black/50" />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(src, `ai-image-${Date.now()}.jpg`);
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10 transition-transform cursor-pointer hover:scale-110 active:scale-95"
                    title="Download"
                  >
                     <Download className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(src);
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border cursor-pointer border-white/10 transition-transform hover:scale-110 active:scale-95"
                    title="Maximize"
                  >
                     <Maximize2 className="w-5 h-5" />
                  </button>
              </div>
            </div>
          ))}
      </div>

      {/* --- LIGHTBOX MODAL (Full Screen View) --- */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex flex-col items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Full Screen" 
                className="w-full h-full object-contain rounded-lg shadow-2xl" 
              />
              
              <div className="mt-6 flex gap-4">
                 <button 
                    onClick={() => downloadImage(selectedImage, `ai-image-full-${Date.now()}.jpg`)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-lg shadow-indigo-500/20"
                 >
                    <Download className="w-5 h-5" /> Download Original
                 </button>
              </div>
            </div>
        </div>
      )}

    </div>
  );
}