"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Mic, Smile, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// --- INITIAL MOCK DATA ---
const initialContacts = [
  { id: 1, name: "Alice Freeman", avatar: "A", color: "from-indigo-500 to-purple-500", status: "Online", lastSeen: "now" },
  { id: 2, name: "Team Rocket", avatar: "T", color: "from-pink-500 to-rose-500", status: "Online", lastSeen: "now" },
  { id: 3, name: "John Doe", avatar: "J", color: "from-blue-500 to-cyan-500", status: "Offline", lastSeen: "Yesterday" },
  { id: 4, name: "Sarah Smith", avatar: "S", color: "from-emerald-500 to-green-500", status: "Offline", lastSeen: "Mon" },
];

const initialMessages: Record<number, { id: number; text: string; sender: "me" | "them"; time: string }[]> = {
  1: [
    { id: 1, text: "Hey! How is the AI dashboard coming along?", sender: "them", time: "10:00 AM" },
    { id: 2, text: "It's going great! Just finished the landing page.", sender: "me", time: "10:05 AM" },
    { id: 3, text: "That's awesome. Can I see a preview?", sender: "them", time: "10:06 AM" },
  ],
  2: [
    { id: 1, text: "Meeting started in Room 4.", sender: "them", time: "09:15 AM" }
  ],
  3: [
     { id: 1, text: "Project approved! 🚀", sender: "them", time: "Yesterday" }
  ],
  4: []
};

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState(1);
  const [inputText, setInputText] = useState("");
  // Store messages in state so we can update them
  const [conversations, setConversations] = useState(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, activeChatId]);

  const activeContact = initialContacts.find(c => c.id === activeChatId) || initialContacts[0];
  const activeMessages = conversations[activeChatId] || [];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: "me" as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Add User Message
    setConversations(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));
    setInputText("");

    // 2. Simulate Reply (Dynamic feel)
    setTimeout(() => {
      const replyMessage = {
        id: Date.now() + 1,
        text: `This is a simulated reply from ${activeContact.name}!`,
        sender: "them" as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversations(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), replyMessage]
      }));
    }, 1500 + Math.random() * 1000); // Random delay 1.5s - 2.5s
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-white/20">
      
      {/* LEFT: Contact List */}
      <div className="w-full md:w-80 h-1/3 md:h-full border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-black/20">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {initialContacts.map((contact) => {
             // Preview last message dynamically
             const msgs = conversations[contact.id] || [];
             const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
             
             return (
                <div 
                  key={contact.id}
                  onClick={() => setActiveChatId(contact.id)}
                  className={cn(
                    "p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5",
                    activeChatId === contact.id ? "bg-white/5 border-l-2 border-l-indigo-500" : "border-l-2 border-l-transparent"
                  )}
                >
                  <div className="relative">
                    <div className={cn("w-10 h-10 rounded-full bg-gradient-to-tr flex items-center justify-center font-bold text-white shrink-0", contact.color)}>
                      {contact.avatar}
                    </div>
                    {contact.status === "Online" && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-medium text-white text-sm truncate">{contact.name}</h4>
                      <span className="text-xs text-white/40">{lastMsg?.time || contact.lastSeen}</span>
                    </div>
                    <p className="text-xs text-white/60 truncate">
                       {lastMsg ? (lastMsg.sender === "me" ? `You: ${lastMsg.text}` : lastMsg.text) : "No messages yet"}
                    </p>
                  </div>
                </div>
             );
          })}
        </div>
      </div>

      {/* RIGHT: Chat Window */}
      <div className="flex-1 flex flex-col bg-transparent h-2/3 md:h-full">
        {/* Chat Header */}
        <div className="h-16 px-4 md:px-6 border-b border-white/10 flex items-center justify-between bg-transparent">
          <div className="flex items-center gap-3">
             <div className={cn("w-10 h-10 rounded-full bg-gradient-to-tr flex items-center justify-center font-bold text-white shrink-0", activeContact.color)}>
                {activeContact.avatar}
             </div>
             <div className="min-w-0">
               <h3 className="font-bold text-white truncate">{activeContact.name}</h3>
               <p className={cn("text-xs flex items-center gap-1", activeContact.status === "Online" ? "text-green-400" : "text-white/40")}>
                 <span className={cn("w-1.5 h-1.5 rounded-full", activeContact.status === "Online" ? "bg-green-400" : "bg-gray-400")} /> 
                 {activeContact.status}
               </p>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-white/60">
             <button className="hover:text-white p-2 transition-colors"><Phone className="w-5 h-5" /></button>
             <button className="hover:text-white p-2 transition-colors"><Video className="w-5 h-5" /></button>
             <button className="hover:text-white p-2 transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] scroll-smooth"
        >
          {activeMessages.length > 0 ? (
            activeMessages.map((m) => (
              <div key={m.id} className={cn("flex", m.sender === "me" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl text-sm relative animate-in zoom-in-95 duration-200",
                  m.sender === "me" 
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20" 
                    : "bg-[#1f1f1f] text-white/90 rounded-tl-none border border-white/10"
                )}>
                  <p className="leading-relaxed">{m.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                     <span className="text-[10px]">{m.time}</span>
                     {m.sender === "me" && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/20">
               <Smile className="w-12 h-12 mb-2 opacity-20" />
               <p className="text-sm">Say hello to {activeContact.name}!</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-4 bg-black/20 border-t border-white/10 backdrop-blur-sm">
           <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all">
              <button className="text-white/40 hover:text-white hidden sm:block transition-colors"><Smile className="w-5 h-5" /></button>
              <button className="text-white/40 hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
              <input 
                type="text" 
                className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm py-2 min-w-0 placeholder:text-white/30"
                placeholder={`Message ${activeContact.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {inputText.trim() ? (
                <button 
                  onClick={handleSendMessage}
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button className="text-white/40 hover:text-white transition-colors"><Mic className="w-5 h-5" /></button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}