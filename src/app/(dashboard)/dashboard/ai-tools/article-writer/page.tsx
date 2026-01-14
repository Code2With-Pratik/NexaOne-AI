"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { PenTool, Copy, FileText, Check, Loader2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { ProModal } from "@/components/pro-modal";
import { useReactToPrint } from "react-to-print"; // 1. Import the new library

export default function ArticleWriterPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);

  // Form State
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium (1000w)");

  // Ref for PDF generation
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGeneratedText(""); 

      const response = await axios.post("/api/article", {
        topic,
        tone,
        length
      });

      setGeneratedText(response.data);
      router.refresh();

    } catch (error: any) {
      console.log(error);
      if (error?.response?.status === 403) {
        setProModalOpen(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    toast.success("Article copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- 2. NEW: ROBUST PDF PRINT FUNCTION ---
  // This uses the browser's native print dialog to save as PDF.
  // It handles ALL modern CSS (Tailwind, Gradients, Lab colors) perfectly.
  const handleDownloadPDF = useReactToPrint({
    contentRef: contentRef, // Pass the Ref directly
    documentTitle: `Article-${Date.now()}`,
    onBeforeGetContent: () => {
      if (!generatedText) {
        toast.error("Generate an article first!");
        return Promise.reject();
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
        toast.success("PDF Downloaded successfully");
    }
  });

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      <ProModal 
        isOpen={proModalOpen} 
        onClose={() => setProModalOpen(false)} 
      />

      {/* LEFT: Configuration */}
      <div className="w-full md:w-96 space-y-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-xl backdrop-blur-sm">
           
           {/* Topic Input */}
           <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Article Topic</label>
            <input 
              type="text" 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 placeholder:text-white/20 transition-colors"
              placeholder="e.g. The Future of EV Cars"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Tone</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 [&>option]:bg-gray-900"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={isGenerating}
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Witty</option>
                  <option>Academic</option>
                  <option>Persuasive</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Length</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 [&>option]:bg-gray-900"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  disabled={isGenerating}
                >
                  <option>Short (500 words)</option>
                  <option>Medium (1000 words)</option>
                  <option>Long (2000 words)</option>
                </select>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!topic || isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {isGenerating ? (
               <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
               <>
                 <PenTool className="w-4 h-4" /> Generate Article
               </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs text-center">
           Generation costs <span className="font-bold">2 Credits</span>.
        </div>
      </div>

      {/* RIGHT: Output Editor */}
      <div className="flex-1 rounded-2xl bg-black/20 border border-white/10 flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm">
        
        {/* Toolbar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/40 shrink-0">
           <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
              <FileText className="w-4 h-4" />
              <span>markdown_preview.md</span>
           </div>
           
           <div className="flex items-center gap-2">
             {generatedText && (
               <>
                 <button 
                   onClick={() => handleDownloadPDF()}
                   className="text-xs text-white/70 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors border border-white/10"
                   title="Download as PDF"
                 >
                   <Download className="w-4 h-4" /> PDF
                 </button>

                 <button 
                   onClick={handleCopy}
                   className="text-xs text-white/70 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                 >
                   {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                   {copied ? "Copied" : "Copy"}
                 </button>
               </>
             )}
           </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar text-white/90">
           
           {/* 3. PRINT STYLES 
              We use a simple white container. The browser print engine will handle the rest.
              We add a 'print:text-black' class just in case you use Tailwind print modifiers.
           */}
           <div 
             ref={contentRef} 
             className="max-w-none p-10 rounded-lg bg-white text-black min-h-full"
           > 
             {generatedText ? (
               <ReactMarkdown
                components={{
                  // Standard clean styles for the PDF
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-blue-600 mb-6 mt-2 border-b border-gray-200 pb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-orange-600 mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-amber-600 mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 leading-7 text-gray-700" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  strong: ({node, ...props}) => <span className="font-bold text-red-600" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-orange-500 pl-4 italic my-4 text-gray-500" {...props} />,
                }}
             >
               {generatedText}
             </ReactMarkdown>
             ) : (
                // This empty state is hidden from print usually, but we keep it clean.
                // We use inline styles here to force transparency on screen but keep structure.
               <div className="h-full flex flex-col items-center justify-center min-h-[400px]" style={{ backgroundColor: "#111827" }}>
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <PenTool className="w-10 h-10 opacity-50 text-white" />
                  </div>
                  <p className="text-lg font-medium text-white">Ready to write</p>
                  <p className="text-sm text-gray-400">Enter a topic and settings to begin.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}