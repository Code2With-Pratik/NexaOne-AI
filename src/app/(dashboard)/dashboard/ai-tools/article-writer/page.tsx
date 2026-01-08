"use client";

import React, { useState } from "react";
import { PenTool, Copy, RefreshCw, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ArticleWriterPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);

  // Form State
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setGeneratedText(`
# The Future of Artificial Intelligence

Artificial Intelligence (AI) is rapidly transforming industries across the globe. From healthcare to finance, the applications are limitless.

## Key Trends to Watch
1. **Generative AI**: Tools like this one are enabling creators to produce content at scale.
2. **Automation**: Mundane tasks are being automated, freeing up humans for creative work.
3. **Ethics**: As AI grows, so does the need for responsible guidelines.

## Conclusion
We are just scratching the surface of what is possible. The next decade will be defined by how we integrate AI into our daily lives.
      `);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT: Configuration */}
      <div className="w-full md:w-96 space-y-6">
        <div className="p-6 rounded-2xl bg-transparent border border-white/25 space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Article Topic</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. The Future of EV Cars"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Tone</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 [&>option]:bg-black"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Witty</option>
                  <option>Academic</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Length</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 [&>option]:bg-black"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option>Short (500w)</option>
                  <option>Medium (1000w)</option>
                  <option>Long (2000w)</option>
                </select>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!topic || isGenerating}
            className="w-full py-3 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {isGenerating ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <>
                 <PenTool className="w-4 h-4" /> Write Article
               </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT: Output Editor */}
      <div className="flex-1 rounded-2xl bg-transparent border border-white/25 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
           <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
              <FileText className="w-4 h-4" />
              <span>markdown_preview.md</span>
           </div>
           {generatedText && (
             <button 
               onClick={handleCopy}
               className="text-xs text-white/70 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
             >
               {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
               {copied ? "Copied!" : "Copy Text"}
             </button>
           )}
        </div>

        {/* Text Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
           {generatedText ? (
             <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-white/80 prose-li:text-white/80">
               {/* Just displaying raw text with line breaks for now */}
               <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                 {generatedText}
               </pre>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-white/50">
                <PenTool className="w-16 h-16 mb-4 opacity-20" />
                <p>Ready to write. Enter a topic to begin.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}