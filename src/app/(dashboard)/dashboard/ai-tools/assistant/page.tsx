"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, Sparkles, Check, Copy } from "lucide-react"; // Added Check and Copy
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Separate component for the Code Block to handle the "Copied" state individually
const CodeBlock = ({ children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const onCopy = () => {
    if (codeRef.current) {
      const content = codeRef.current.innerText;
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 z-10 opacity-100 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="bg-black/40 rounded-lg overflow-hidden border border-white/10">
        <pre
          ref={codeRef}
          className="p-4 overflow-x-auto text-sm leading-relaxed"
          {...props}
        >
          {children}
        </pre>
      </div>
    </div>
  );
};

export default function AssistantPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoading && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isLoading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });
      setMessages((current) => [...current, response.data]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="text-white/50 text-sm">Chat with the smartest AI. Ask me anything.</p>
        </div>
      </div>

     {/* Chat Area */}
      <div className="flex-1 overflow-auto space-y-4 p-3 md:p-4 rounded-2xl bg-black/50 border-2 border-white/15 mb-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-8">
            <Sparkles className="w-12 h-12 mb-4 text-indigo-400" />
            <p className="text-lg font-medium text-white">No messages yet.</p>
            <p className="text-sm text-white/50">Start the conversation by typing below.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 md:gap-4 w-full p-3 md:p-4 rounded-xl text-sm",
              // RESPONSIVE FIX START
              // Mobile: max-w-[85%] (wider bubbles)
              // Desktop (md): max-w-[60%] (standard readable width)
              msg.role === "user"
                ? "bg-white/10 border border-white/15 ml-auto max-w-[85%] md:max-w-[60%]"
                : "bg-indigo-500/10 border border-indigo-500/50 max-w-[45%] md:max-w-[80%]"
              // RESPONSIVE FIX END
            )}
          >
            <div className="shrink-0">
              {msg.role === "user" ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} className="w-full h-full rounded-full" alt="User" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Added min-w-0 to prevent flex child overflow issues on small screens */}
            <div className="overflow-hidden leading-7 w-full text-white/90 min-w-0">
              <ReactMarkdown
                components={{
                  strong: ({ node, ...props }) => <span className="font-bold text-indigo-300" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  code: ({ node, ...props }) => {
                    return <code className="bg-black/30 rounded px-1 py-0.5 text-indigo-200 font-mono text-xs break-words" {...props} />;
                  },
                  pre: ({ node, ...props }) => <CodeBlock {...props} />,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          // Responsive max-width for loading bubble as well
          <div className="flex gap-4 w-full p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 max-w-[85%] md:max-w-[60%]">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 pt-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={onSubmit} className="relative">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me something..."
          disabled={isLoading}
          className="w-full bg-black/50 border-3 border-white/10 rounded-xl pl-4 pr-14 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50 caret-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}