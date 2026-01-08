"use client";

import React, { useState } from "react";
import { Mail, Send, Copy, RotateCcw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmailGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [formData, setFormData] = useState({
    recipient: "",
    subject: "",
    tone: "Professional",
    context: ""
  });
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedEmail(
`Subject: ${formData.subject || "Regarding our recent discussion"}

Hi ${formData.recipient || "[Name]"},

I hope you are having a productive week.

I am writing to follow up on the points we discussed regarding ${formData.context || "the project"}. Based on our current timeline, I believe we are in a strong position to move forward.

Could you let me know if you have any availability later this week for a quick sync?

Best regards,

[Your Name]`
      );
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8">
      
      {/* LEFT: Input Form */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg"><Mail className="w-5 h-5 text-indigo-400" /></div>
            <h2 className="font-bold text-white">Email Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">To (Recipient)</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
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
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[120px] resize-none"
                placeholder="e.g. Ask for a meeting on Tuesday, mention the Q3 report..."
                value={formData.context}
                onChange={(e) => setFormData({...formData, context: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Generate Draft</>}
          </button>
        </div>
      </div>

      {/* RIGHT: Preview Pane */}
      <div className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl relative">
        <div className="h-14 border-b border-white/10 bg-white/5 flex items-center justify-between px-6">
          <span className="text-xs font-mono text-white/40">PREVIEW</span>
          <div className="flex gap-2">
             <button 
               onClick={() => setGeneratedEmail("")} 
               className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
               title="Clear"
             >
               <RotateCcw className="w-4 h-4" />
             </button>
             <button 
               onClick={handleCopy}
               disabled={!generatedEmail}
               className={cn(
                 "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                 copied ? "bg-green-500/20 text-green-400" : "bg-indigo-500 text-white hover:bg-indigo-400"
               )}
             >
               {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Text</>}
             </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {generatedEmail ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                 <pre className="whitespace-pre-wrap font-sans text-white/90 text-base leading-relaxed">
                   {generatedEmail}
                 </pre>
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