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
import { Track, Participant, Room } from 'livekit-client';
import '@livekit/components-styles';
import { 
  PhoneOff, Video, VideoOff, Mic, MicOff, Monitor, 
  MessageSquare, X, Send, RefreshCcw, MoreHorizontal, Maximize, Minimize 
} from 'lucide-react';
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

// --- SUB-COMPONENT: PARTICIPANT VIEW ---
interface ParticipantViewProps {
    participant?: Participant;
    track?: any;
    avatar: string;
    name: string;
    isLocal: boolean;
    onClick?: () => void;
    onFlipCamera?: () => void; 
    className?: string;
}

const ParticipantView = ({ participant, track, avatar, name, isLocal, onClick, onFlipCamera, className }: ParticipantViewProps) => {
    const isSpeaking = useIsSpeaking(participant);

    return (
        <div 
            onClick={onClick}
            className={cn(
                "relative overflow-hidden transition-all duration-300 bg-zinc-900 group",
                onClick ? "cursor-pointer" : "",
                isSpeaking && !isLocal ? "ring-4 ring-inset ring-red-600" : "",
                isSpeaking && isLocal ? "border-2 border-red-600" : "border border-white/10",
                className
            )}
        >
            {track && participant ? (
                <>
                    {/* 👇 FIX: Removed 'participant={participant}' prop */}
                    <ParticipantTile 
                        trackRef={track} 
                        className="w-full h-full object-cover" 
                        disableSpeakingIndicator={true}
                    />
                    
                    {/* FLIP CAMERA BUTTON - ONLY FOR LOCAL USER */}
                    {isLocal && onFlipCamera && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Stop bubbling to prevent swapping view
                                onFlipCamera();
                            }}
                            className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all z-30 cursor-pointer"
                            title="Flip Camera"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    )}
                </>
            ) : (
                /* Camera Off State */
                <div className="w-full h-full flex items-center justify-center flex-col gap-3 p-4 text-center">
                    <div className={cn("relative p-1 rounded-full", isSpeaking && "animate-pulse ring-4 ring-red-600")}>
                        {avatar ? (
                            <img 
                                src={avatar} 
                                alt={name} 
                                className={cn("rounded-full object-cover bg-zinc-800", isLocal ? "w-12 h-12" : "w-24 h-24")} 
                            />
                        ) : (
                            <div className={cn(
                                "rounded-full bg-gradient-to-br from-red-500 to-red-900 flex items-center justify-center font-bold text-white border-4 border-white/10",
                                isLocal ? "w-12 h-12 text-lg" : "w-24 h-24 text-3xl"
                            )}>
                                {name?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                    </div>
                    {/* Only show name on remote or large view to save space on local PiP */}
                    {(!isLocal) && (
                        <div>
                            <p className="text-white text-lg font-bold">{name}</p>
                            <p className="text-white/40 text-xs">Camera Off</p>
                        </div>
                    )}

                    {/* Show flip button even if camera is off, so they can switch before turning on */}
                    {isLocal && onFlipCamera && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onFlipCamera(); }}
                            className="absolute top-2 right-2 p-2 bg-white/10 text-white rounded-full z-30 cursor-pointer"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    )}
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
    
    // Controls
    const [isVideoOn, setIsVideoOn] = useState(initialVideo);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenShare, setIsScreenShare] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // "More" Menu State (The 3 dots menu)
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Camera Flip State
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    
    // View Pinning
    const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);

    // Chat
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const showChatRef = useRef(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // --- TRACKS ---
    const tracks = useTracks(
      [Track.Source.Camera, Track.Source.ScreenShare],
      { onlySubscribed: false },
    );
    
    const participants = useParticipants();
    const remoteParticipant = participants.find(p => !p.isLocal);
    const localParticipant = participants.find(p => p.isLocal);

    const localCameraTrack = tracks.find(t => t.participant.isLocal && t.source === Track.Source.Camera);
    const localScreenTrack = tracks.find(t => t.participant.isLocal && t.source === Track.Source.ScreenShare);
    const remoteCameraTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteScreenTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.ScreenShare);

    // --- VIEW ASSIGNMENT ---
    // Default: Remote = Main, Local = PiP
    let mainParticipant = remoteParticipant;
    let mainTrack = remoteScreenTrack || remoteCameraTrack;
    let pipParticipant = localParticipant;
    let pipTrack = localScreenTrack || localCameraTrack;

    // If Pinned Local (User wants to see themselves big)
    if (pinnedIdentity && localParticipant && pinnedIdentity === localParticipant.identity) {
        mainParticipant = localParticipant;
        mainTrack = localScreenTrack || localCameraTrack;
        pipParticipant = remoteParticipant;
        pipTrack = remoteScreenTrack || remoteCameraTrack;
    }

    // Function to swap views when clicking the small box
    const handleSwapViews = () => {
        if (pinnedIdentity === localParticipant?.identity) {
            setPinnedIdentity(null); 
        } else if (localParticipant) {
            setPinnedIdentity(localParticipant.identity);
        }
    };

    // --- DEVICE LOGIC (For Flip Camera) ---
    useEffect(() => {
        const getDevices = async () => {
            try {
                const devices = await Room.getLocalDevices('videoinput');
                setVideoDevices(devices);
            } catch (e) { console.error(e); }
        };
        getDevices();
    }, []);

    const flipCamera = async () => {
        if (videoDevices.length < 2) return;
        const currentDeviceId = room.getActiveDevice('videoinput');
        const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
        const nextIndex = (currentIndex + 1) % videoDevices.length;
        await room.switchActiveDevice('videoinput', videoDevices[nextIndex].deviceId);
    };

    // --- CHAT LOGIC ---
    useEffect(() => {
        showChatRef.current = showChat;
        if (showChat) {
            setUnreadCount(0);
            setShowMoreMenu(false); // Close the "..." menu if chat opens
        }
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

    // --- ACTION TOGGLES ---
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
        setShowMoreMenu(false); // Close menu after selection
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
      <div ref={containerRef} className="relative h-full w-full flex flex-row bg-black overflow-hidden font-sans">
        
        {/* =========================================
            MAIN CONTENT AREA
           ========================================= */}
        <div className="flex-1 relative flex flex-col min-w-0">
            
            {/* 1. FULLSCREEN VIEW (Remote by default) */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#121212]">
                {mainParticipant ? (
                    <ParticipantView 
                        participant={mainParticipant}
                        track={mainTrack}
                        name={mainParticipant.isLocal ? "You" : userName}
                        avatar={mainParticipant.isLocal ? (user?.imageUrl || "") : userAvatar}
                        isLocal={mainParticipant.isLocal}
                        onFlipCamera={mainParticipant.isLocal ? flipCamera : undefined}
                        className="w-full h-full"
                    />
                ) : (
                    /* Loading / Waiting UI */
                    <div className="flex flex-col items-center justify-center gap-4 opacity-70 animate-pulse">
                         {userAvatar ? (
                             <img src={userAvatar} className="w-24 h-24 rounded-full object-cover border-4 border-white/10" alt={userName} />
                         ) : (
                             <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-white/10 flex items-center justify-center text-3xl font-bold text-white">
                                {userName?.charAt(0).toUpperCase() || "?"}
                             </div>
                         )}
                         <div className="text-center">
                             <h3 className="text-white text-xl font-bold">Calling {userName}...</h3>
                             <p className="text-white/50 text-sm">Waiting for response</p>
                         </div>
                    </div>
                )}
            </div>

            {/* 2. PIP VIEW (Local by default) */}
            {pipParticipant && (
                <div className={cn(
                    "absolute right-4 z-40 w-28 aspect-[3/4] md:w-56 md:aspect-video rounded-xl shadow-2xl overflow-hidden border border-white/20 transition-all ease-in-out duration-300",
                    showChat ? "bottom-32 md:bottom-24" : "bottom-24" // Move up slightly if chat needs space, though tray hides now
                )}>
                    <ParticipantView 
                        participant={pipParticipant}
                        track={pipTrack}
                        name={pipParticipant.isLocal ? "You" : userName}
                        avatar={pipParticipant.isLocal ? (user?.imageUrl || "") : userAvatar}
                        isLocal={pipParticipant.isLocal}
                        onClick={handleSwapViews}
                        onFlipCamera={pipParticipant.isLocal ? flipCamera : undefined}
                        className="w-full h-full cursor-pointer hover:opacity-90"
                    />
                </div>
            )}

            {/* 3. MOBILE-STYLE BOTTOM TRAY (Fixed 5 Icons) */}
            {/* Logic: If chat is Open on mobile, this tray slides DOWN out of view to make space for keyboard/input */}
            <div className={cn(
                "absolute bottom-0 left-0 w-full z-50 p-4 transition-transform duration-300 ease-in-out",
                showChat ? "translate-y-[120%] md:translate-y-0" : "translate-y-0"
            )}>
                {/* The Tray Container - Wider for 5 buttons */}
                <div className="flex items-center justify-between px-6 py-3 max-w-md mx-auto bg-[#1a1a1a]/95 backdrop-blur-md border-2 border-white/5 rounded-lg shadow-2xl gap-2 md:gap-4">
                    
                    {/* BUTTON 1: MORE (...) */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className={cn("p-3 rounded-lg transition-colors cursor-pointer", showMoreMenu ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10")}
                        >
                            <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        {/* Popup Menu */}
                        {showMoreMenu && (
                            <div className="absolute bottom-full left-0 mb-4 bg-[#252525] border border-white/10 rounded-2xl shadow-xl p-2 min-w-[180px] animate-in slide-in-from-bottom-2 fade-in z-50">
                                <button 
                                    onClick={() => setShowChat(true)} 
                                    className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-left text-white text-sm transition-colors cursor-pointer"
                                >
                                    <MessageSquare className="w-5 h-5 text-red-500"/> Chat
                                    {unreadCount > 0 && <span className="ml-auto bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                                </button>
                                <button 
                                    onClick={toggleScreenShare} 
                                    className={cn("flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-left text-white text-sm transition-colors cursor-pointer", isScreenShare && "text-red-500")}
                                >
                                    <Monitor className="w-5 h-5"/> {isScreenShare ? "Stop Sharing" : "Share Screen"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* BUTTON 2: VIDEO */}
                    <button onClick={toggleVideo} className={cn("p-3 rounded-lg transition-colors cursor-pointer", isVideoOn ? "bg-white/10 text-white" : "bg-white text-black")}>
                        {isVideoOn ? <Video className="w-5 h-5 md:w-6 md:h-6"/> : <VideoOff className="w-5 h-5 md:w-6 md:h-6"/>}
                    </button>

                    {/* BUTTON 3: MIC */}
                    <button onClick={toggleMic} className={cn("p-3 rounded-lg transition-colors cursor-pointer", isMicOn ? "bg-white/10 text-white" : "bg-white text-black")}>
                        {isMicOn ? <Mic className="w-5 h-5 md:w-6 md:h-6"/> : <MicOff className="w-5 h-5 md:w-6 md:h-6"/>}
                    </button>

                    {/* BUTTON 4: FULLSCREEN (New) */}
                    <button onClick={toggleFullscreen} className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
                        {isFullscreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>

                    {/* BUTTON 5: END CALL */}
                    <button onClick={() => room.disconnect()} className="p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 cursor-pointer">
                        <PhoneOff className="w-6 h-6 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </div>

        {/* =========================================
            CHAT OVERLAY
           ========================================= */}
        {showChat && (
            <div className={cn(
                "fixed inset-0 z-[60] flex flex-col bg-[#121212] md:relative md:w-96 md:border-l md:border-white/10 animate-in slide-in-from-right duration-300"
            )}>
               {/* Header */}
               <div className="p-4 flex justify-between items-center border-b border-white/10 bg-[#1a1a1a] safe-area-top">
                   <h3 className="font-bold text-white flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-red-500"/> In-Call Chat
                   </h3>
                   <button onClick={() => setShowChat(false)} className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer">
                       <X className="w-6 h-6"/>
                   </button>
               </div>

               {/* Messages */}
               <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={chatScrollRef}>
                   {messages.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-white/30 gap-2">
                           <MessageSquare className="w-12 h-12 opacity-20"/> <p>No messages yet</p>
                       </div>
                   ) : (
                       messages.map((msg) => (
                           <div key={msg.id} className={cn("flex flex-col", msg.isMe ? "items-end" : "items-start")}>
                               <div className={cn("max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm", msg.isMe ? "bg-red-600 text-white rounded-tr-sm" : "bg-[#2a2a2a] text-white/90 rounded-tl-sm")}>
                                   {!msg.isMe && <p className="text-[10px] text-red-300 font-bold mb-1 opacity-70">{msg.senderName}</p>}
                                   <p>{msg.text}</p>
                                   <span className="text-[9px] opacity-50 block text-right mt-1">{msg.time}</span>
                               </div>
                           </div>
                       ))
                   )}
               </div>

               {/* Input Area */}
               <div className="p-3 bg-[#1a1a1a] border-t border-white/10 safe-area-bottom">
                   <div className="flex items-center gap-2 bg-[#252525] rounded-lg px-4 py-3 border border-white/5 focus-within:border-red-500/50 transition-all">
                       <input 
                           type="text" 
                           className="flex-1 bg-transparent border-none focus:outline-none text-white text-base placeholder:text-white/30" 
                           placeholder="Type a message..." 
                           value={inputText} 
                           onChange={(e) => setInputText(e.target.value)} 
                           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                       />
                       <button onClick={handleSendMessage} disabled={!inputText.trim()} className="p-2 bg-red-600 rounded-full text-white disabled:opacity-50 disabled:bg-gray-700 transition cursor-pointer">
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