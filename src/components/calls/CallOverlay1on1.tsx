"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  useRoomContext,
  LayoutContextProvider,
  useTracks,
  RoomAudioRenderer,
  ParticipantTile,
  useParticipants,
  useIsSpeaking,
} from '@livekit/components-react';
import { Track, Participant } from 'livekit-client';
import '@livekit/components-styles';
import { PhoneOff, Video, VideoOff, Mic, MicOff, Monitor, MessageSquare, X, Send, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from "@/providers/SocketProvider";
import { useUser } from '@clerk/nextjs';

// --- TYPES ---
type Message = { id: string; text: string; senderId: string; senderName: string; time: string; isMe: boolean; };

interface CallOverlayProps {
  token: string;
  roomName: string;
  onDisconnect: () => void;
  initialVideoEnabled: boolean;
  userName: string;
  userAvatar: string;
}

export default function CallOverlay1on1({ token, roomName, onDisconnect, initialVideoEnabled, userName, userAvatar }: CallOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] animate-in fade-in flex flex-col">
      <LiveKitRoom
        video={initialVideoEnabled}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: '100%', width: '100%' }}
        onDisconnected={onDisconnect}
      >
         <CustomCallLayout 
            initialVideo={initialVideoEnabled} 
            roomName={roomName}
            userName={userName}
            userAvatar={userAvatar}
         />
      </LiveKitRoom>
    </div>
  );
}

// --- SUB-COMPONENT: REMOTE PARTICIPANT VIEW ---
const RemoteParticipantView = ({ participant, track, avatar, name }: { participant: Participant, track?: any, avatar: string, name: string }) => {
    const isSpeaking = useIsSpeaking(participant);

    return (
        <div className={cn(
            "w-full h-full transition-all duration-300 relative",
            isSpeaking ? "ring-4 ring-inset ring-red-500 shadow-[inset_0_0_50px_rgba(220,38,38,0.5)]" : ""
        )}>
            {track ? (
                <ParticipantTile 
                    trackRef={track} 
                    className="w-full h-full object-cover" 
                    disableSpeakingIndicator={true}
                />
            ) : (
                /* Camera Off -> Show Avatar */
                <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                    <div className={cn("relative p-1 rounded-full", isSpeaking && "animate-pulse ring-4 ring-red-500")}>
                        {/* 👇 FIX: Check if avatar exists before rendering img */}
                        {avatar ? (
                            <img 
                                src={avatar} 
                                alt={name} 
                                className="w-32 h-32 rounded-full object-cover bg-zinc-800" 
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-white/10">
                                {name?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                    </div>
                    <p className="text-white text-2xl font-bold">{name}</p>
                    <p className="text-white/40 text-sm">Camera Off</p>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: LOCAL PARTICIPANT VIEW ---
const LocalParticipantView = ({ participant, track }: { participant: Participant, track?: any }) => {
    const isSpeaking = useIsSpeaking(participant);

    return (
        <div className={cn(
            "w-full h-full rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black transition-all hover:scale-105",
            isSpeaking ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : ""
        )}>
             {track ? (
                 <ParticipantTile trackRef={track} className="w-full h-full object-cover" />
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white/50 text-xs flex-col">
                     <div className="w-8 h-8 rounded-full bg-white/10 mb-2" />
                     Camera Off
                 </div>
             )}
        </div>
    );
};

function CustomCallLayout({ initialVideo, roomName, userName, userAvatar }: { initialVideo: boolean, roomName: string, userName: string, userAvatar: string }) {
    const { user } = useUser();
    const { socket } = useSocket();
    const room = useRoomContext();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Call Controls
    const [isVideoOn, setIsVideoOn] = useState(initialVideo);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenShare, setIsScreenShare] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Chat State
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const showChatRef = useRef(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // --- TRACKS & PARTICIPANTS ---
    const tracks = useTracks(
      [Track.Source.Camera, Track.Source.ScreenShare],
      { onlySubscribed: false },
    );
    
    const participants = useParticipants();
    const remoteParticipant = participants.find(p => !p.isLocal);
    const localParticipant = participants.find(p => p.isLocal);

    // Identify Tracks
    const localTrack = tracks.find(t => t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteScreenShare = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.ScreenShare);
    const remoteCamera = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
    const mainTrack = remoteScreenShare || remoteCamera;

    // --- CHAT LOGIC ---
    useEffect(() => {
        showChatRef.current = showChat;
        if (showChat) setUnreadCount(0);
    }, [showChat]);
    
    useEffect(() => {
        if (!socket) return;
        const handleReceiveMessage = (msg: any) => {
            const newMessage: Message = {
                id: msg.id || Date.now().toString(), text: msg.text || msg.content,
                senderId: msg.senderId, senderName: msg.senderName || "User",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: msg.senderId === user?.id
            };
            setMessages(prev => [...prev, newMessage]);
            if (!showChatRef.current) setUnreadCount(prev => prev + 1);
        };
        socket.on("receive_message", handleReceiveMessage);
        return () => { socket.off("receive_message", handleReceiveMessage); };
    }, [socket, user]);

    useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [messages, showChat]);

    const handleSendMessage = () => {
        if (!inputText.trim() || !socket || !user) return;
        const ids = roomName.split('-');
        const receiverId = ids.find(id => id !== user.id); 
        if (receiverId) {
            const msgData = { text: inputText, senderId: user.id, receiverId: receiverId, senderName: user.fullName, type: "text" };
            const newMessage: Message = { id: Date.now().toString(), text: inputText, senderId: user.id, senderName: user.fullName || "Me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true };
            setMessages(prev => [...prev, newMessage]);
            socket.emit("send_message", msgData);
            setInputText("");
        }
    };

    // --- TOGGLES ---
    const toggleVideo = async () => {
        const enabled = room.localParticipant.isCameraEnabled;
        await room.localParticipant.setCameraEnabled(!enabled);
        setIsVideoOn(!enabled);
    };

    const toggleMic = async () => {
         const enabled = room.localParticipant.isMicrophoneEnabled;
         await room.localParticipant.setMicrophoneEnabled(!enabled);
         setIsMicOn(!enabled);
    };

    const toggleScreenShare = async () => {
        const enabled = room.localParticipant.isScreenShareEnabled;
        await room.localParticipant.setScreenShareEnabled(!enabled);
        setIsScreenShare(!enabled);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

  return (
    <LayoutContextProvider>
      <div ref={containerRef} className="relative h-full w-full flex flex-row bg-black overflow-hidden group">
        
        {/* === LEFT AREA (VIDEO) === */}
        <div className="flex-1 relative flex flex-col min-w-0">
            
            {/* 1. REMOTE USER (MAIN FULLSCREEN) */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#121212]">
                {remoteParticipant ? (
                    <RemoteParticipantView 
                        participant={remoteParticipant} 
                        track={mainTrack}
                        avatar={userAvatar}
                        name={userName}
                    />
                ) : (
                    /* Waiting For User */
                    <div className="flex flex-col items-center justify-center gap-4 opacity-70 animate-pulse">
                         {/* 👇 FIX: Conditional rendering for Avatar or Fallback Initials */}
                         {userAvatar ? (
                             <img src={userAvatar} className="w-24 h-24 rounded-full object-cover border-4 border-white/10" alt={userName} />
                         ) : (
                             <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-white/10 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">{userName?.charAt(0).toUpperCase() || "?"}</span>
                             </div>
                         )}
                        
                        <div className="text-center">
                            <h3 className="text-white text-xl font-bold">Calling {userName}...</h3>
                            <p className="text-white/50 text-sm">Waiting for them to join</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. LOCAL USER (PIP - BOTTOM RIGHT) */}
            <div className="absolute bottom-24 right-4 z-20 w-28 md:w-56 aspect-video">
                 {localParticipant && (
                    <LocalParticipantView participant={localParticipant} track={localTrack} />
                 )}
            </div>

            {/* 3. CONTROL BAR */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3 p-3 bg-[#1a1a1a]/90 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl z-50 max-w-[95vw] overflow-x-auto custom-scrollbar opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={toggleMic} className={cn("p-3 md:p-3.5 rounded-xl transition-all shrink-0 cursor-pointer", isMicOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/10 text-red-500 border border-red-500/50")}>
                        {isMicOn ? <Mic className="w-5 h-5"/> : <MicOff className="w-5 h-5"/>}
                </button>
                <button onClick={toggleVideo} className={cn("p-3 md:p-3.5 rounded-xl transition-all shrink-0 cursor-pointer", isVideoOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/10 text-red-500 border border-red-500/50")}>
                        {isVideoOn ? <Video className="w-5 h-5"/> : <VideoOff className="w-5 h-5"/>}
                </button>
                <button onClick={toggleScreenShare} className={cn("p-3 md:p-3.5 rounded-xl transition-all shrink-0 cursor-pointer", isScreenShare ? "bg-red-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/10 hover:bg-white/20 text-white")}>
                        <Monitor className="w-5 h-5" />
                </button>
                <button onClick={() => setShowChat(!showChat)} className={cn("p-3 md:p-3.5 rounded-xl transition-all relative shrink-0 cursor-pointer", showChat ? "bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white")}>
                        <MessageSquare className="w-5 h-5" />
                        {unreadCount > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#1a1a1a] animate-bounce">{unreadCount}</div>}
                </button>
                <div className="w-px h-8 bg-white/10 mx-1 shrink-0"></div>
                <button onClick={toggleFullscreen} className="p-3 md:p-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 cursor-pointer">
                     {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
                <button onClick={() => room.disconnect()} className="px-5 py-3 md:px-6 md:py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 shrink-0 cursor-pointer">
                    <PhoneOff className="w-5 h-5" />
                    <span className="hidden sm:inline">End</span>
                </button>
            </div>
        </div>

        {/* RIGHT AREA (CHAT) */}
        {showChat && (
            <div className={cn(
                "border-l border-white/10 bg-[#121212] z-40 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl",
                "fixed inset-y-0 right-0 w-full md:relative md:w-96" 
            )}>
               <div className="p-4 flex justify-between items-center border-b border-white/10 bg-[#1a1a1a]">
                   <h3 className="font-bold text-white flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-red-500"/> In-Call Chat
                   </h3>
                   <button onClick={() => setShowChat(false)} className="hover:bg-white/10 p-1 rounded-lg transition cursor-pointer">
                       <X className="w-5 h-5 text-white/50 hover:text-white"/>
                   </button>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" ref={chatScrollRef}>
                   {messages.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-white/50 text-sm gap-2">
                           <MessageSquare className="w-8 h-8 opacity-50"/> <p>No messages yet</p>
                       </div>
                   ) : (
                       messages.map((msg) => (
                           <div key={msg.id} className={cn("flex flex-col", msg.isMe ? "items-end" : "items-start")}>
                               <div className={cn("max-w-[85%] p-3 rounded-2xl text-sm relative group shadow-sm", msg.isMe ? "bg-red-600 text-white rounded-tr-none" : "bg-[#252525] text-white/90 rounded-tl-none border border-white/5")}>
                                   {!msg.isMe && <p className="text-[10px] text-red-300 font-bold mb-1">{msg.senderName}</p>}
                                   <p className="leading-relaxed">{msg.text}</p>
                                   <span className="text-[8px] opacity-70 block text-right mt-1">{msg.time}</span>
                               </div>
                           </div>
                       ))
                   )}
               </div>

               <div className="p-3 bg-[#1a1a1a] border-t border-white/10">
                   <div className="flex items-center gap-2 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 focus-within:border-red-500/50 transition-all">
                       <input type="text" className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm placeholder:text-white/30" placeholder="Type a message..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                       <button onClick={handleSendMessage} disabled={!inputText.trim()} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"><Send className="w-4 h-4" /></button>
                   </div>
               </div>
            </div>
        )}

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  );
}