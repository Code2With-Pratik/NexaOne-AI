"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  "Explain Quantum Computing",
  "Write a Python script to scrape a website",
  "Summarize this meeting note",
  "Debug this React component",
];

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, role: "ai", text: "Hello! I'm your personal AI assistant. How can I help you accelerate your workflow today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg = { id: Date.now(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // 2. Simulate AI Response
    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        role: "ai", 
        text: "This is a simulated AI response. In a real app, this would connect to the OpenAI API or Anthropic API to give you an intelligent answer based on your prompt." 
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] max-w-5xl mx-auto flex flex-col bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl">
      
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center px-6 bg-white/5 backdrop-blur-md z-10">
        <Bot className="w-6 h-6 text-indigo-400 mr-3" />
        <div>
          <h3 className="font-bold text-white text-sm">Super Assistant</h3>
          <p className="text-xs text-white/40">Powered by GPT-4</p>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === "ai" ? "bg-indigo-600" : "bg-white/10"
            )}>
              {msg.role === "ai" ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>

            {/* Bubble */}
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === "user" 
                ? "bg-white text-black rounded-tr-none" 
                : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
            )}>
              {msg.text}
              {msg.role === "ai" && (
                <div className="mt-3 flex gap-2 border-t border-white/10 pt-2 opacity-0 hover:opacity-100 transition-opacity">
                   <button className="text-xs text-white/40 hover:text-white flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
                   <button className="text-xs text-white/40 hover:text-white flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Regenerate</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
               <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0A0A0A] border-t border-white/10 space-y-4">
        
        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setInput(s)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:border-indigo-500/50 hover:text-white transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl p-2 focus-within:border-indigo-500/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask anything..."
            className="w-full bg-transparent border-none focus:outline-none text-sm text-white max-h-32 min-h-[44px] py-3 px-2 resize-none custom-scrollbar"
          />
          <button 
            onClick={handleSend}
            disabled={!input || isTyping}
            className="p-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-white/20">
          AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}