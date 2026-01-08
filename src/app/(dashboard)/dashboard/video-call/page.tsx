"use client";

import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const participants = [
  { id: 1, name: "You", role: "Host", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" },
  { id: 2, name: "Sarah Chen", role: "AI Lead", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" },
  { id: 3, name: "Alex Rivet", role: "Designer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" },
  { id: 4, name: "James Wilson", role: "Client", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" },
];

export default function VideoCallPage() {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-[#111] rounded-2xl overflow-hidden border border-white/10 relative">
      
      {/* Header Info */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium text-white">Weekly Sync</span>
        <span className="text-xs text-white/50 border-l border-white/20 pl-3">04:21</span>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4">
        {participants.map((p) => (
          <div key={p.id} className="relative group rounded-2xl overflow-hidden bg-[#222] border border-white/5">
             <img src={p.image} alt={p.name} className="w-50 h-50 object-cover opacity-90" />
             
             {/* Name Tag */}
             <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-2">
               {p.name} {p.role === "Host" && <span className="text-indigo-400">(Host)</span>}
               {!micOn && p.id === 1 && <MicOff className="w-3 h-3 text-red-400" />}
             </div>

             {/* Hover Actions */}
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white">
                  <Settings className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-[#0A0A0A] border-t border-white/10 flex items-center justify-center gap-4 px-6">
         <ControlBtn 
           active={micOn} 
           onClick={() => setMicOn(!micOn)} 
           onIcon={<Mic />} 
           offIcon={<MicOff />} 
         />
         <ControlBtn 
           active={videoOn} 
           onClick={() => setVideoOn(!videoOn)} 
           onIcon={<Video />} 
           offIcon={<VideoOff />} 
         />
         
         <div className="w-px h-8 bg-white/10 mx-2" />
         
         <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
           <Monitor className="w-5 h-5" />
         </button>
         <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all relative">
           <MessageSquare className="w-5 h-5" />
           <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 border-2 border-[#0A0A0A] rounded-full" />
         </button>
         <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
           <Users className="w-5 h-5" />
         </button>

         <div className="w-px h-8 bg-white/10 mx-2" />

         <button className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-colors">
           <PhoneOff className="w-5 h-5" />
           <span className="hidden sm:inline">End Call</span>
         </button>
      </div>
    </div>
  );
}

// Helper Button Component
const ControlBtn = ({ active, onClick, onIcon, offIcon }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-4 rounded-full transition-all duration-200",
      active 
        ? "bg-white/5 hover:bg-white/10 text-white" 
        : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
    )}
  >
    {active ? React.cloneElement(onIcon, { size: 20 }) : React.cloneElement(offIcon, { size: 20 })}
  </button>
);