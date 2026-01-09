"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users, MessageSquare, Settings, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const participants = [
  // ID 1 is reserved for 'You' (Real Camera)
  { id: 2, name: "Sarah Chen", role: "AI Lead", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" },
  { id: 3, name: "Alex Rivet", role: "Designer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" },
  { id: 4, name: "James Wilson", role: "Client", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" },
];

export default function VideoCallPage() {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Real Video State
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- 1. ACCESS WEBCAM ---
  useEffect(() => {
    let mounted = true;

    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) return;
        
        streamRef.current = stream;
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
        setError("");
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Camera access denied or unavailable.");
      }
    }

    getMedia();

    return () => {
      mounted = false;
      // Cleanup: Stop all tracks when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- 2. TOGGLE CONTROLS ---
  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => track.enabled = !cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-black/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
      
      {/* Header Info */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium text-white">Weekly Sync</span>
        <span className="text-xs text-white/50 border-l border-white/20 pl-3">Live</span>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        
        {/* --- YOUR TILE (REAL CAM) --- */}
        <div className="relative group rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 min-h-[200px] shadow-lg">
           {error ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                  <AlertCircle className="w-8 h-8 mb-2 text-red-400" />
                  <p className="text-xs">{error}</p>
              </div>
           ) : (
              <video 
                 ref={myVideoRef} 
                 autoPlay 
                 muted 
                 playsInline 
                 className={cn("w-full h-full object-cover transform scale-x-[-1]", !cameraOn && "opacity-0")} 
              />
           )}
           
           {/* Camera Off Placeholder */}
           {!cameraOn && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#222]">
                  <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white">
                      You
                  </div>
              </div>
           )}

           <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-2">
             You (Host) {!micOn && <MicOff className="w-3 h-3 text-red-400" />}
           </div>
        </div>

        {/* --- OTHER PARTICIPANTS (MOCK) --- */}
        {participants.map((p) => (
          <div key={p.id} className="relative group rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5 min-h-[200px]">
             <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-90" />
             
             <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-2">
               {p.name} <span className="text-white/50">| {p.role}</span>
             </div>

             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="min-h-20 bg-[#0A0A0A] border-t border-white/10 flex flex-wrap items-center justify-center gap-3 md:gap-4 px-4 py-3 md:px-6 z-20">
         <ControlBtn 
           active={micOn} 
           onClick={toggleMic} 
           onIcon={<Mic />} 
           offIcon={<MicOff />} 
           label="Mic"
         />
         <ControlBtn 
           active={cameraOn} 
           onClick={toggleCamera} 
           onIcon={<Video />} 
           offIcon={<VideoOff />} 
           label="Cam"
         />
         
         <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />
         
         <div className="flex gap-3">
            <button className="p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all tooltip" title="Share Screen">
              <Monitor className="w-5 h-5" />
            </button>
            <button className="p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all relative" title="Chat">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 border-2 border-[#0A0A0A] rounded-full" />
            </button>
            <button className="p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all" title="Participants">
              <Users className="w-5 h-5" />
            </button>
         </div>

         <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />

         <button 
           onClick={() => window.location.href = '/dashboard'}
           className="px-4 md:px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-colors ml-auto md:ml-0 shadow-lg shadow-red-500/20"
         >
           <PhoneOff className="w-5 h-5" />
           <span className="hidden sm:inline">End Call</span>
         </button>
      </div>
    </div>
  );
}

// Improved Helper Component
const ControlBtn = ({ active, onClick, onIcon, offIcon }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-3 md:p-4 rounded-full transition-all duration-200 shadow-lg",
      active 
        ? "bg-white/10 hover:bg-white/20 text-white" 
        : "bg-red-500 text-white hover:bg-red-600 animate-pulse"
    )}
  >
    {active ? React.cloneElement(onIcon, { size: 20 }) : React.cloneElement(offIcon, { size: 20 })}
  </button>
);