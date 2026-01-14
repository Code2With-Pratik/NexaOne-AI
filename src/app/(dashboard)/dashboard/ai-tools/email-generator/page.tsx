"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Mail, Send, Copy, RotateCcw, CheckCircle2, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProModal } from "@/components/pro-modal";
import { useReactToPrint } from "react-to-print"; // 1. Import the robust print library

export default function EmailGeneratorPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [formData, setFormData] = useState({
    recipient: "",
    tone: "Professional",
    context: ""
  });
  const [copied, setCopied] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  
  // Ref for PDF generation
  const contentRef = useRef<HTMLDivElement>(null);

  // --- GENERATE LOGIC ---
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGeneratedEmail(""); 

      const response = await axios.post("/api/email", {
        recipient: formData.recipient,
        tone: formData.tone,
        context: formData.context
      });

      setGeneratedEmail(response.data);
      router.refresh();

    } catch (error: any) {
      console.log(error);
      
      // Check for 403 (Credits)
      if (error?.response?.status === 403) {
        setProModalOpen(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // --- COPY LOGIC ---
  const handleCopy = async () => {
    const textToCopy = generatedEmail;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.error("Modern copy failed", err);
      }
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Copy failed manually.");
    }
  };

  // --- 2. NEW: ROBUST PDF DOWNLOAD ---
  const handleDownloadPDF = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Email-Draft-${Date.now()}`,
    onBeforeGetContent: () => {
      if (!generatedEmail) {
        toast.error("Generate an email first!");
        return Promise.reject();
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
        toast.success("PDF Downloaded successfully");
    }
  });

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8">
      
      <ProModal 
        isOpen={proModalOpen} 
        onClose={() => setProModalOpen(false)} 
      />

      {/* LEFT: Input Form */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-white/5 border-3 border-white/10 rounded-2xl p-6 space-y-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg"><Mail className="w-5 h-5 text-indigo-400" /></div>
            <h2 className="font-bold text-white">Email Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">To (Recipient)</label>
              <input 
                type="text" 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-white/20"
                placeholder="Client Name or Company"
                value={formData.recipient}
                onChange={(e) => setFormData({...formData, recipient: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {["Professional", "Friendly", "Urgent"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData({...formData, tone: t})}
                    className={cn(
                      "px-2 py-2 rounded-lg text-xs font-medium border transition-all",
                      formData.tone === t 
                        ? "bg-indigo-600 border-indigo-500 text-white" 
                        : "bg-black/20 border-white/10 text-white/60 hover:bg-white/10"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Key Points / Context</label>
              <textarea 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[120px] resize-none placeholder:text-white/20"
                placeholder="e.g. Ask for a meeting on Tuesday, mention the Q3 report..."
                value={formData.context}
                onChange={(e) => setFormData({...formData, context: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !formData.context}
            className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
               <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
               <>
                 <Send className="w-4 h-4" /> Generate Draft
               </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT: Preview Pane */}
      <div className="flex-1 bg-white/5 border-3 border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl relative backdrop-blur-sm">
        
        {/* --- TOOLBAR --- */}
        <div className="h-14 border-b border-white/10 bg-black/20 flex items-center justify-between px-6 shrink-0">
          <span className="text-xs font-mono text-white/40">PREVIEW</span>
          <div className="flex gap-2">
             {generatedEmail && (
                <>
                  <button 
                    onClick={() => setGeneratedEmail("")} 
                    className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    title="Clear"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  
                  {/* PDF Download Trigger */}
                  <button 
                    onClick={() => handleDownloadPDF()} 
                    className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ml-2",
                      copied ? "bg-green-500/20 text-green-400" : "bg-indigo-600 text-white hover:bg-indigo-500"
                    )}
                  >
                    {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </>
             )}
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-t-3 border-white/15">
          {generatedEmail ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                 
                 {/* 👇 3. PRINTABLE AREA 
                    We set background to WHITE and text to BLACK explicitly.
                    This ensures the PDF looks like a real document, not a dark mode screenshot.
                 */}
                 <div 
                   ref={contentRef} 
                   style={{ 
                     color: "#000000",           // Force Black Text for Print
                     backgroundColor: "#ffffff", // Force White Paper for Print
                     padding: "40px",         
                     fontFamily: "Arial, sans-serif",
                     whiteSpace: "pre-wrap",
                     lineHeight: "1.6"
                   }}
                 >
                   {generatedEmail}
                 </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                 <Mail className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm">Fill in the details to generate your email.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}