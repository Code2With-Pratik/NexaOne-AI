"use client";

import React, { useState, useRef } from "react"; // 1. Import useRef
import axios from "axios";
import { PenTool, Copy, FileText, Check, Loader2, Download } from "lucide-react"; // 2. Import Download Icon
import ReactMarkdown from "react-markdown";

export default function ArticleWriterPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  
  // 3. Create a reference for the content we want to print
  const contentRef = useRef<HTMLDivElement>(null);

  // Form State
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium (1000w)");

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

    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    // ... (Your existing copy code here) ...
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- 4. NEW: PDF Download Function ---
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      // Dynamic import to avoid "window is not defined" error in Next.js
      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = contentRef.current;
      
      // Configuration for the PDF
      const opt = {
        margin:       [20, 20, 20, 20], // Top, Left, Bottom, Right margins
        filename:     `article-${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, // Higher scale = better quality
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate and Save
      html2pdf().set(opt).from(element).save();
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF");
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT: Configuration */}
      <div className="w-full md:w-96 space-y-6">
        <div className="p-6 rounded-2xl bg-white/2 border-3 border-white/10 space-y-6 shadow-xl">
           {/* ... (Your Inputs for Topic, Tone, Length remain the same) ... */}
           
           <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Article Topic</label>
            <input 
              type="text" 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 placeholder:text-white/20"
              placeholder="e.g. The Future of EV Cars"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Tone</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 [&>option]:bg-gray-900"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
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
      </div>

      {/* RIGHT: Output Editor */}
      <div className="flex-1 rounded-2xl bg-white/2 border-3 border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/20 shrink-0">
           <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
              <FileText className="w-4 h-4" />
              <span>markdown_preview.md</span>
           </div>
           
           {/* Actions Group */}
           <div className="flex items-center gap-2">
             {generatedText && (
               <>
                 {/* 5. NEW: Download PDF Button */}
                 <button 
                   onClick={handleDownloadPDF}
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
        {/* 6. Attach Ref here: ref={contentRef} */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar text-white/90">
           {/* Wrap the content in a div with the Ref */}
           <div ref={contentRef} className="max-w-none p-4"> 
             {generatedText ? (
               <ReactMarkdown
                components={{
                  // FIX: Use explicit Hex codes (#ffffff) instead of "text-white" to avoid oklab errors
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-[#3300ff] mb-6 mt-2 border-b border-[#ffffff20] pb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-[#ff8800] mt-8 mb-4" {...props} />, // Orange-200
                  h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-[#fff700] mt-6 mb-3" {...props} />, // Orange-100
                  p: ({node, ...props}) => <p className="mb-4 leading-7 text-[#6b6c6d]" {...props} />, // Gray-300
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-[#6b6c6d]" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-[#6b6c6d]" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  strong: ({node, ...props}) => <span className="font-bold text-[#b50000]" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#f97316] pl-4 italic my-4 text-[#9ca3af]" {...props} />, // Orange-500 & Gray-400
                }}
             >
               {generatedText}
             </ReactMarkdown>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-white/50 min-h-[400px]">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <PenTool className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="text-lg font-medium text-white/80">Ready to write</p>
                  <p className="text-sm">Enter a topic and settings to begin.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}