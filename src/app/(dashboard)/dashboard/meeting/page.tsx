"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Video, ArrowRight, Keyboard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MeetingLobbyPage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  // 1. START MEETING (Host)
  const startMeeting = () => {
      // Generate a random ID for the room
      const roomId = crypto.randomUUID(); 
      // Redirect to the room page as HOST
      router.push(`/dashboard/meeting/${roomId}?host=true`);
  };

  // 2. JOIN MEETING (Guest)
  const joinMeeting = () => {
      if (!joinId.trim()) return;
      // Redirect to the room page as GUEST
      router.push(`/dashboard/meeting/${joinId}`);
  };

  return (
    <div className="h-[calc(100vh-6rem)] p-8 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-pink-300 mb-6">
                <Sparkles className="w-3 h-3" />
                <span>Secure • Low Latency • HD Video</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-500 to-pink-600">Conferencing</span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
                Connect with your team instantly. Create a secure room with host controls, 
                waiting rooms, and real-time collaboration tools.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
            
            {/* CARD 1: NEW MEETING (Host) */}
            <div 
                onClick={startMeeting}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group bg-gradient-to-br from-pink-600/10 to-pink-900/10 border-2 border-pink-500/30 p-8 rounded-3xl hover:border-pink-500/50 transition-all cursor-pointer relative overflow-hidden shadow-2xl"
            >
                {/* Hover Glow Effect */}
                <div className={cn("absolute inset-0 bg-pink-600/10 transition-opacity duration-500", isHovered ? "opacity-100" : "opacity-0")}></div>
                
                <div className="w-14 h-14 bg-pink-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-108 transition-transform shadow-lg shadow-pink-600/30 relative z-10">
                    <Video className="w-7 h-7 text-white" />
                </div>
                
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">New Meeting</h2>
                    <p className="text-pink-200/50 mb-8 text-sm">Create a new room and invite others via link.</p>
                    
                    <div className="flex items-center gap-2 text-white font-semibold text-sm bg-pink-600/20 w-fit px-4 py-2 rounded-xl group-hover:bg-pink-600 group-hover:shadow-lg transition-all">
                        Start Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>

            {/* CARD 2: JOIN MEETING (Guest) */}
            <div className="bg-[#0a0a0a35] border-2 border-white/10 p-8 rounded-3xl hover:border-white/20 transition-all shadow-2xl flex flex-col justify-between">
                <div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border-2 border-white/5">
                        <Users className="w-7 h-7 text-white/80" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">Join Meeting</h2>
                    <p className="text-white/50 mb-8 text-sm">Enter the code or link shared with you.</p>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input 
                            type="text" 
                            placeholder="Enter Room ID" 
                            value={joinId}
                            onChange={(e) => setJoinId(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                            className="w-full bg-white/2 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-pink-500/50 focus:bg-white/1 transition-all"
                        />
                    </div>
                    <button 
                        onClick={joinMeeting} 
                        disabled={!joinId}
                        className="w-full bg-white text-black font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm shadow-lg shadow-white/5 cursor-pointer"
                    >
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}