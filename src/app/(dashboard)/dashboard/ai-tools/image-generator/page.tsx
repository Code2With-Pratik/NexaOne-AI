"use client";

import React, { useState } from "react";
import axios from "axios";
import { Download, Sparkles, Image as ImageIcon, Maximize2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState("Modern");
  
  // Store generated images here
  const [images, setImages] = useState<string[]>([]);
  
  // NEW: State to track which image is currently maximized
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setImages([]); 

      const finalPrompt = `${prompt}, ${theme} style, high quality, 8k, detailed`;

      const response = await axios.post("/api/image", {
        prompt: finalPrompt,
      });

      setImages([response.data]);
      
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-transparent max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT: Controls */}
      <div className="w-full md:w-80 space-y-6">
        <div className="p-6 rounded-2xl bg-white/2 border-3 border-white/10 space-y-6 shadow-xl">
          
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Prompt</label>
            <textarea 
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none placeholder:text-white/20"
              placeholder="A futuristic cyberpunk city with neon lights..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
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
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                    theme === t.value
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold cursor-pointer text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
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
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs text-center">
          Generation costs <span className="font-bold">2 Credits</span>. <br/>
          (Free Model: Stable Diffusion XL)
        </div>
      </div>

      {/* RIGHT: Output Gallery */}
      <div className="flex-1 rounded-2xl bg-black/5 border-[3px] border-white/15 p-[3px] overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
         
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
            tabIndex={0} // Allows tap on mobile
            onClick={() => {}} // iOS tap fix
            className="relative group w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/20 focus:outline-none"
           >
              <img src={src} alt="Generated" className="w-full h-full object-cover" />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm rounded-xl">
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
                 
                 {/* MAXIMIZE BUTTON */}
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setSelectedImage(src); // Open Modal
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

      {/* --- NEW: FULL SCREEN LIGHTBOX MODAL --- */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
           
           {/* Close Button (Top Right) */}
           <button 
             onClick={() => setSelectedImage(null)}
             className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 cursor-pointer"
           >
             <X className="w-6 h-6" />
           </button>

           {/* Image Container */}
           <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex flex-col items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Full Screen" 
                className="w-full h-full object-contain rounded-lg shadow-2xl" 
              />
              
              {/* Bottom Actions for Modal */}
              <div className="mt-4 flex gap-4">
                 <button 
                    onClick={() => downloadImage(selectedImage, `ai-image-full-${Date.now()}.jpg`)}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                 >
                   <Download className="w-4 h-4" /> Download Original
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}