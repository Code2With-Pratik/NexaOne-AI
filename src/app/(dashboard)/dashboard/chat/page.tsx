"use client";

import React, { useState } from "react";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Mic, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const contacts = [
  { id: 1, name: "Alice Freeman", msg: "Can you send the design file?", time: "10:30 AM", unread: 2, online: true },
  { id: 2, name: "Team Rocket", msg: "Meeting started in Room 4.", time: "09:15 AM", unread: 0, online: true },
  { id: 3, name: "John Doe", msg: "Project approved! 🚀", time: "Yesterday", unread: 0, online: false },
  { id: 4, name: "Sarah Smith", msg: "See you tomorrow.", time: "Mon", unread: 0, online: false },
];

const messages = [
  { id: 1, text: "Hey! How is the AI dashboard coming along?", sender: "them", time: "10:00 AM" },
  { id: 2, text: "It's going great! Just finished the landing page.", sender: "me", time: "10:05 AM" },
  { id: 3, text: "That's awesome. Can I see a preview?", sender: "them", time: "10:06 AM" },
  { id: 4, text: "Sure, sending the link now.", sender: "me", time: "10:07 AM" },
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(1);
  const [inputText, setInputText] = useState("");

  return (
    // RESPONSIVE FIX: flex-col on mobile, md:flex-row on desktop
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-white/20">
      
      {/* LEFT: Contact List */}
      {/* RESPONSIVE FIX: w-full on mobile, fixed w-80 on desktop. Added basis for mobile height. */}
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
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => setActiveChat(contact.id)}
              className={cn(
                "p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5",
                activeChat === contact.id ? "bg-white/5 border-l-2 border-l-indigo-500" : "border-l-2 border-l-transparent"
              )}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shrink-0">
                  {contact.name[0]}
                </div>
                {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-medium text-white text-sm truncate">{contact.name}</h4>
                  <span className="text-xs text-white/40">{contact.time}</span>
                </div>
                <p className="text-xs text-white/60 truncate">{contact.msg}</p>
              </div>
              {contact.unread > 0 && (
                <div className="flex flex-col justify-center">
                   <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                     {contact.unread}
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Chat Window */}
      <div className="flex-1 flex flex-col bg-transparent h-2/3 md:h-full">
        {/* Chat Header */}
        <div className="h-16 px-4 md:px-6 border-b border-white/10 flex items-center justify-between bg-transparent">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shrink-0">
                A
             </div>
             <div className="min-w-0">
               <h3 className="font-bold text-white truncate">Alice Freeman</h3>
               <p className="text-xs text-green-400 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online
               </p>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-white/60">
             <button className="hover:text-white p-2"><Phone className="w-5 h-5" /></button>
             <button className="hover:text-white p-2"><Video className="w-5 h-5" /></button>
             <button className="hover:text-white p-2"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.sender === "me" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl text-sm relative",
                m.sender === "me" 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white/10 text-white/90 rounded-tl-none border border-white/5"
              )}>
                <p>{m.text}</p>
                <span className="text-[10px] opacity-50 block text-right mt-1">{m.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-4 bg-black/20 border-t border-white/10">
           <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <button className="text-white/40 hover:text-white hidden sm:block"><Smile className="w-5 h-5" /></button>
              <button className="text-white/40 hover:text-white"><Paperclip className="w-5 h-5" /></button>
              <input 
                type="text" 
                className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm py-2 min-w-0"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {inputText ? (
                <button className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button className="text-white/40 hover:text-white"><Mic className="w-5 h-5" /></button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}