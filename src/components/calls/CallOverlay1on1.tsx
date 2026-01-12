"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  useRoomContext,
  LayoutContextProvider,
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { PhoneOff, Video, VideoOff, Mic, MicOff, Monitor, MessageSquare, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from "@/providers/SocketProvider";
import { useUser } from '@clerk/nextjs';

// --- TYPES ---
type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  time: string;
  isMe: boolean;
};

interface CallOverlayProps {
  token: string;
  roomName: string;
  onDisconnect: () => void;
  initialVideoEnabled: boolean;
}

export default function CallOverlay1on1({ token, roomName, onDisconnect, initialVideoEnabled }: CallOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col animate-in fade-in">
      <LiveKitRoom
        video={initialVideoEnabled}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: '100%', width: '100%' }}
        onDisconnected={onDisconnect}
      >
         <CustomCallLayout initialVideo={initialVideoEnabled} roomName={roomName} />
      </LiveKitRoom>
    </div>
  );
}

function CustomCallLayout({ initialVideo, roomName }: { initialVideo: boolean, roomName: string }) {
    const { user } = useUser();
    const { socket } = useSocket();
    const room = useRoomContext();
    
    // Call Controls
    const [isVideoOn, setIsVideoOn] = useState(initialVideo);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenShare, setIsScreenShare] = useState(false);
    
    // Chat State
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    
    // 👇 NEW: Unread Count State
    const [unreadCount, setUnreadCount] = useState(0);
    
    // 👇 NEW: Ref to track chat open status inside event listener
    const showChatRef = useRef(false);
    
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Get Video Tracks
    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
      ],
      { onlySubscribed: false },
    );

    // --- CHAT LOGIC ---

    // 1. Keep Ref in sync with State
    useEffect(() => {
        showChatRef.current = showChat;
        if (showChat) {
            setUnreadCount(0); // Reset badge when opening
        }
    }, [showChat]);
    
    // 2. Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg: any) => {
            const newMessage: Message = {
                id: msg.id || Date.now().toString(),
                text: msg.text || msg.content,
                senderId: msg.senderId,
                senderName: msg.senderName || "User",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: msg.senderId === user?.id
            };
            
            setMessages(prev => [...prev, newMessage]);

            // 👇 NEW: Increment badge if chat is closed
            if (!showChatRef.current) {
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [socket, user]);

    // 3. Auto-scroll to bottom
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, showChat]);

    // 4. Send Message
    const handleSendMessage = () => {
        if (!inputText.trim() || !socket || !user) return;

        const ids = roomName.split('-');
        const receiverId = ids.find(id => id !== user.id); 

        if (receiverId) {
            const msgData = {
                text: inputText,
                senderId: user.id,
                receiverId: receiverId,
                senderName: user.fullName,
                type: "text"
            };

            const newMessage: Message = {
                id: Date.now().toString(),
                text: inputText,
                senderId: user.id,
                senderName: user.fullName || "Me",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            };
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

  return (
    <LayoutContextProvider>
      <div className="relative h-full w-full flex flex-row overflow-hidden">
        
        {/* MAIN VIDEO AREA */}
        <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-300">
            <div className="flex-1 p-4 flex items-center justify-center">
                <GridLayout tracks={tracks} style={{ height: '100%' }}>
                    <ParticipantTile />
                </GridLayout>
            </div>

            {/* CUSTOM CONTROL BAR */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 bg-[#1a1a1a]/90 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl z-50 whitespace-nowrap max-w-[90vw] overflow-x-auto custom-scrollbar">
                <button onClick={toggleMic} className={cn("p-3.5 rounded-xl transition-all", isMicOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/10 text-red-500 border border-red-500/50")}>
                        {isMicOn ? <Mic className="w-5 h-5"/> : <MicOff className="w-5 h-5"/>}
                </button>
                <button onClick={toggleVideo} className={cn("p-3.5 rounded-xl transition-all", isVideoOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/10 text-red-500 border border-red-500/50")}>
                        {isVideoOn ? <Video className="w-5 h-5"/> : <VideoOff className="w-5 h-5"/>}
                </button>
                <button onClick={toggleScreenShare} className={cn("p-3.5 rounded-xl transition-all", isScreenShare ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/10 hover:bg-white/20 text-white")}>
                        <Monitor className="w-5 h-5" />
                </button>
                
                {/* 👇 UPDATE: Chat Button with Badge */}
                <button 
                    onClick={() => setShowChat(!showChat)} 
                    className={cn("p-3.5 rounded-xl transition-all relative", showChat ? "bg-indigo-600 text-white" : "bg-white/10 hover:bg-white/20 text-white")}
                >
                        <MessageSquare className="w-5 h-5" />
                        
                        {/* Red Dot Badge */}
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#1a1a1a] animate-bounce">
                                {unreadCount}
                            </div>
                        )}
                </button>

                <div className="w-px h-8 bg-white/10 mx-1"></div>
                <button onClick={() => room.disconnect()} className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2">
                    <PhoneOff className="w-5 h-5" />
                    <span className="hidden sm:inline">End</span>
                </button>
            </div>
        </div>

        {/* SIDEBAR CHAT (FUNCTIONAL) */}
        {showChat && (
            <div className="w-80 h-full border-l border-white/10 bg-[#121212] relative z-40 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl">
               <div className="p-4 flex justify-between items-center border-b border-white/10 bg-[#1a1a1a]">
                   <h3 className="font-bold text-white flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-indigo-500"/> 
                       In-Call Chat
                   </h3>
                   <button onClick={() => setShowChat(false)} className="hover:bg-white/10 p-1 rounded-lg transition">
                       <X className="w-5 h-5 text-white/50 hover:text-white"/>
                   </button>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" ref={chatScrollRef}>
                   {messages.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm gap-2">
                           <MessageSquare className="w-8 h-8 opacity-50"/>
                           <p>No messages yet</p>
                       </div>
                   ) : (
                       messages.map((msg) => (
                           <div key={msg.id} className={cn("flex flex-col", msg.isMe ? "items-end" : "items-start")}>
                               <div className={cn(
                                   "max-w-[85%] p-3 rounded-2xl text-sm relative group shadow-sm",
                                   msg.isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-[#252525] text-white/90 rounded-tl-none border border-white/5"
                               )}>
                                   {!msg.isMe && <p className="text-[10px] text-indigo-300 font-bold mb-1">{msg.senderName}</p>}
                                   <p className="leading-relaxed">{msg.text}</p>
                                   <span className="text-[9px] opacity-50 block text-right mt-1">{msg.time}</span>
                               </div>
                           </div>
                       ))
                   )}
               </div>

               <div className="p-3 bg-[#1a1a1a] border-t border-white/10">
                   <div className="flex items-center gap-2 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 focus-within:border-indigo-500/50 transition-all">
                       <input 
                           type="text" 
                           className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm placeholder:text-white/30"
                           placeholder="Type a message..."
                           value={inputText}
                           onChange={(e) => setInputText(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                       />
                       <button 
                           onClick={handleSendMessage}
                           disabled={!inputText.trim()}
                           className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                           <Send className="w-4 h-4" />
                       </button>
                   </div>
               </div>
            </div>
        )}

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  );
}