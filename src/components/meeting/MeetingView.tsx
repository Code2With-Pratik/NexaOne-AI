"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LiveKitRoom,
  LayoutContextProvider,
  useParticipants,
  useRoomContext,
  useTracks,
  useConnectionState, 
  ParticipantTile,
  useIsSpeaking,
  VideoTrack,
} from "@livekit/components-react";
import { Track, ConnectionState } from "livekit-client"; 
import "@livekit/components-styles";

import {
  MessageSquare, Users, ShieldAlert, Crown, Copy, Check, X, Clock,
  PhoneOff, Maximize, Minimize, Ban, Pin, AlertTriangle, UserPlus, Send,
  MoreVertical, Mic, MicOff, Video, VideoOff, Monitor, MoreHorizontal
} from "lucide-react";

import { cn } from "@/lib/utils";
import InCallChatSidebar from "@/components/calls/InCallChatSidebar";
import { Socket } from "socket.io-client";

// --- TYPES ---
interface MeetingViewProps {
  token: string;
  roomId: string;
  isHost: boolean;
  socket: Socket;
  onLeave: () => void;
}

type ActiveTab = "none" | "chat" | "participants" | "waiting" | "invite";

type OnlineUser = {
    userId: string;
    name: string;
    avatar: string;
};

type WaitingUser = {
  socketId: string;
  user: { name: string; avatar?: string };
};

export default function MeetingView({ token, roomId, isHost, onLeave, socket }: MeetingViewProps) {
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100%", width: "100%" }}
      onDisconnected={onLeave}
    >
      <MeetingContent roomId={roomId} isHost={isHost} onLeave={onLeave} socket={socket} />
    </LiveKitRoom>
  );
}

function MeetingContent({ roomId, isHost, onLeave, socket }: { roomId: string; isHost: boolean; onLeave: () => void; socket: Socket }) {
  const room = useRoomContext();
  const roomState = useConnectionState();
  const participants = useParticipants(); 
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout & Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>("none");
  const activeTabRef = useRef<ActiveTab>("none");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Controls & State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenShare, setIsScreenShare] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Meeting Logic
  const [hostIdentity, setHostIdentity] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  const [kickTarget, setKickTarget] = useState<string | null>(null);
  const [showEndMeetingModal, setShowEndMeetingModal] = useState(false); 
  const [kickedUserIds, setKickedUserIds] = useState<Set<string>>(new Set());

  // Socket Data
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());

  // Deduplicate users
  const uniqueOnlineUsers = useMemo(() => {
      const seen = new Set();
      return onlineUsers.filter(u => {
          if (!u || !u.userId) return false; 
          if (seen.has(u.userId)) return false; 
          seen.add(u.userId);
          return true;
      });
  }, [onlineUsers]);

  const [meetingTime, setMeetingTime] = useState(0);
  const joinAtRef = useRef<number>(Date.now());
  const [focusedTrack, setFocusedTrack] = useState<any>(null);

  const activeParticipants = useMemo(() => {
    return participants.filter(p => !kickedUserIds.has(p.identity));
  }, [participants, kickedUserIds]);

  // --- EFFECTS ---
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab === "chat") setUnreadMessages(0);
    // Close "More" menu when a tab opens
    if (activeTab !== "none") setShowMoreMenu(false);
  }, [activeTab]);

  useEffect(() => {
    joinAtRef.current = Date.now();
    const t = setInterval(() => {
      setMeetingTime(Math.floor((Date.now() - joinAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const localIdentity = room.localParticipant?.identity;

    if (isHost) {
      socket.emit("meeting_start", { roomId, userId: localIdentity });
      setHostIdentity(localIdentity || "");
    } else {
      socket.emit("get_room_info", { roomId });
    }

    const handleRoomInfo = (payload: { hostIdentity: string }) => {
      setHostIdentity(payload.hostIdentity || "");
    };

    const handleGuestWaiting = (data: WaitingUser) => {
       setWaitingUsers((prev) => {
           if (prev.some(u => u.socketId === data.socketId)) return prev;
           return [...prev, data];
       });
       // Auto-open waiting tab if host is just sitting there? Maybe annoying.
       // Instead we show a badge on the More button.
    };

    const handleGuestCancelled = ({ socketId }: { socketId: string }) => {
       setWaitingUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    };

    const handleMessage = () => {
       if (activeTabRef.current !== "chat") setUnreadMessages((prev) => prev + 1);
    };

    const handleOnlineList = (entries: [string, any][]) => {
        if (!Array.isArray(entries)) return;
        const users: OnlineUser[] = entries.map(([uid, data]) => ({
            userId: uid,
            name: data?.name || "User",
            avatar: data?.avatar || ""
        })).filter(u => u.userId !== localIdentity);

        setOnlineUsers(users);
    };

    const handleUserStatus = ({ userId, status, user }: { userId: string, status: string, user?: any }) => {
        setOnlineUsers(prev => {
            if (userId === localIdentity) return prev;
            if (status === "Online" && user) {
                const otherUsers = prev.filter(u => u.userId !== userId);
                return [...otherUsers, { userId, name: user.name || "User", avatar: user.avatar || "" }];
            }
            if (status === "Offline") {
                return prev.filter(u => u.userId !== userId);
            }
            return prev;
        });
    };

    socket.on("room_info", handleRoomInfo);
    socket.on("receive_message", handleMessage);
    socket.on("current_online_list", handleOnlineList);
    socket.on("user_status_update", handleUserStatus);

    if (isHost) {
      socket.on("guest_waiting", handleGuestWaiting);
      socket.on("guest_cancelled", handleGuestCancelled);
    }

    socket.emit("request_online_users");
    const intervalId = setInterval(() => {
        if(socket.connected) {
            socket.emit("request_online_users");
        }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      socket.off("room_info", handleRoomInfo);
      socket.off("receive_message", handleMessage);
      socket.off("guest_waiting", handleGuestWaiting);
      socket.off("guest_cancelled", handleGuestCancelled);
      socket.off("current_online_list", handleOnlineList);
      socket.off("user_status_update", handleUserStatus);
    };
  }, [isHost, roomId, room.localParticipant?.identity, socket]);

  // --- ACTIONS ---
  const handleAdmit = (socketId: string) => {
    socket.emit("process_request", { guestSocketId: socketId, action: "approved", roomId });
    setWaitingUsers((prev) => prev.filter((u) => u.socketId !== socketId));
  };

  const handleReject = (socketId: string) => {
    socket.emit("process_request", { guestSocketId: socketId, action: "rejected", roomId });
    setWaitingUsers((prev) => prev.filter((u) => u.socketId !== socketId));
  };

  const requestKick = (identity: string) => {
      setKickTarget(identity);
  };

  const confirmKick = () => {
      if (kickTarget) {
          socket.emit("kick_participant", { roomId, targetIdentity: kickTarget });
          setKickedUserIds(prev => new Set(prev).add(kickTarget));
          setKickTarget(null);
      }
  };

  const handleEndMeetingForAll = () => {
      if(!isHost) return;
      setShowEndMeetingModal(true);
  }

  const confirmEndMeeting = () => {
      socket.emit("end_meeting_for_all", { roomId });
      setShowEndMeetingModal(false);
      onLeave(); 
  };

  const handleSendInvite = (targetUserId: string) => {
      if (!room.localParticipant?.identity) return;

      const meetingLink = `${window.location.origin}/dashboard/meeting/${roomId}`;
      const inviteMessage = `📞 Join my meeting!\n\nID: ${roomId}\nLink: ${meetingLink}`;

      socket.emit("send_message", {
          senderId: room.localParticipant.identity,
          receiverId: targetUserId,
          text: inviteMessage,
          type: "text"
      });

      setInvitedUserIds(prev => new Set(prev).add(targetUserId));
      setTimeout(() => {
          setInvitedUserIds(prev => {
              const next = new Set(prev);
              next.delete(targetUserId);
              return next;
          });
      }, 3000);
  };

  // --- TOGGLES ---
  const toggleMic = async () => {
    const enabled = room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(!enabled);
    setIsMicOn(!enabled);
  }

  const toggleCamera = async () => {
    const enabled = room.localParticipant.isCameraEnabled;
    await room.localParticipant.setCameraEnabled(!enabled);
    setIsVideoOn(!enabled);
  }

  const toggleScreenShare = async () => {
      const enabled = room.localParticipant.isScreenShareEnabled;
      await room.localParticipant.setScreenShareEnabled(!enabled);
      setIsScreenShare(!enabled);
      setShowMoreMenu(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
    setShowMoreMenu(false);
  };

  // --- TRACK LOGIC ---
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }, { source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const safeTracks = useMemo(() => {
     return tracks.filter(t => !kickedUserIds.has(t.participant.identity));
  }, [tracks, kickedUserIds]);

  const screenShareTrack = safeTracks.find(t => t.source === Track.Source.ScreenShare);
  
  const mainTrack = useMemo(() => {
      if (focusedTrack) return focusedTrack;
      if (screenShareTrack) return screenShareTrack;
      const remote = safeTracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
      return remote || safeTracks[0];
  }, [focusedTrack, screenShareTrack, safeTracks]);

  const gridTracks = useMemo(() => {
      return safeTracks.filter(t => 
          t.participant.identity !== mainTrack?.participant.identity || 
          t.source !== mainTrack?.source
      );
  }, [safeTracks, mainTrack]);

  // Adjust grid limit based on device, but CSS handles layout
  const visibleGridTracks = gridTracks.slice(0, 8); 

  return (
    <LayoutContextProvider>
      <div ref={containerRef} className="flex flex-col h-full w-full bg-[#050505] relative overflow-hidden font-sans">
        
        {/* === MODALS (Kick / End Meeting) === */}
        {kickTarget && (
            <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-4">
                <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ban className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Remove Participant?</h3>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setKickTarget(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition">Cancel</button>
                        <button onClick={confirmKick} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">Remove</button>
                    </div>
                </div>
            </div>
        )}
        {showEndMeetingModal && (
            <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-4">
                <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">End Meeting?</h3>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowEndMeetingModal(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition">Cancel</button>
                        <button onClick={confirmEndMeeting} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">End All</button>
                    </div>
                </div>
            </div>
        )}

        {/* === CONTENT AREA === */}
        {/* RESPONSIVE LAYOUT: Column on Mobile, Row on Desktop */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            
            {/* 1. MAIN STAGE (Takes most space) */}
            <div className="flex-1 bg-[#0a0a0a] relative flex items-center justify-center p-2 md:p-4 min-h-0">
                {/* Meeting Info Overlay */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-mono flex items-center gap-2">
                        <span className="hidden sm:inline">ID:</span> {roomId.slice(0, 8)}...
                        <button onClick={() => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="hover:text-red-400">
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-mono flex items-center gap-2">
                        <Clock className="w-3 h-3 text-red-500 animate-pulse" /> {formatTime(meetingTime)}
                    </div>
                </div>

                {mainTrack ? (
                    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <CustomParticipantTile trackRef={mainTrack} isHost={isHost} isMain={true} onPin={() => setFocusedTrack(null)} onKick={requestKick} hostIdentity={hostIdentity} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-white/20 animate-pulse">
                        <Users className="w-16 h-16 mb-4" />
                        <p>Waiting for participants...</p>
                    </div>
                )}
            </div>

            {/* 2. PARTICIPANT GRID */}
            {/* MOBILE: Horizontal Scroll at Bottom | DESKTOP: Vertical Scroll at Right */}
            {visibleGridTracks.length > 0 && (
                <div className={cn(
                    "bg-[#111] border-white/10 shrink-0",
                    "w-full h-28 md:w-80 md:h-auto md:border-l p-2 md:p-3", // Responsive sizing
                    "flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto custom-scrollbar" // Scroll direction
                )}>
                    {visibleGridTracks.map((track) => (
                        <div key={track.publication?.trackSid || `${track.participant.identity}_${track.source}`} 
                             className="relative rounded-xl overflow-hidden border border-white/10 shadow-md group bg-black shrink-0 w-36 h-full md:w-full md:h-32">
                            <CustomParticipantTile trackRef={track} isHost={isHost} isMain={false} onPin={() => setFocusedTrack(track)} onKick={requestKick} hostIdentity={hostIdentity} />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* === BOTTOM CONTROL TRAY (FIXED & RESPONSIVE) === */}
        <div className={cn(
            "bg-[#121212] border-t border-white/10 p-4 z-40 shrink-0 transition-transform duration-300",
            activeTab !== "none" ? "translate-y-full md:translate-y-0" : "translate-y-0" // Hide on mobile if tab open
        )}>
            <div className="flex items-center justify-between px-6 py-3 max-w-sm mx-auto bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl">
                
                {/* 1. MORE MENU (...) */}
                <div className="relative">
                    <button onClick={() => setShowMoreMenu(!showMoreMenu)} className={cn("p-3 rounded-lg transition-colors relative", showMoreMenu ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10")}>
                        <MoreHorizontal className="w-6 h-6" />
                        {/* Global Notification Dot for More Menu */}
                        {(unreadMessages > 0 || (isHost && waitingUsers.length > 0)) && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border border-[#1a1a1a] animate-pulse"></span>
                        )}
                    </button>

                    {/* POPUP MENU */}
                    {showMoreMenu && (
                         <div className="absolute bottom-full left-0 mb-4 bg-[#252525] border border-white/10 rounded-2xl shadow-xl p-2 min-w-[200px] animate-in slide-in-from-bottom-2 fade-in z-50">
                            {/* Chat */}
                            <button onClick={() => setActiveTab("chat")} className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-left text-white text-sm transition-colors">
                                <MessageSquare className="w-5 h-5 text-blue-400"/> Chat
                                {unreadMessages > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadMessages}</span>}
                            </button>
                            
                            {/* Participants */}
                            <button onClick={() => setActiveTab("participants")} className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-left text-white text-sm transition-colors">
                                <Users className="w-5 h-5 text-purple-400"/> People
                            </button>

                            {/* Invite */}
                            <button onClick={() => setActiveTab("invite")} className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-left text-white text-sm transition-colors">
                                <UserPlus className="w-5 h-5 text-green-400"/> Invite
                            </button>

                            {/* Screen Share */}
                            <button onClick={toggleScreenShare} className={cn("flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-left text-white text-sm transition-colors", isScreenShare && "text-red-400")}>
                                <Monitor className="w-5 h-5"/> {isScreenShare ? "Stop Sharing" : "Share Screen"}
                            </button>

                            {/* Host: Waiting Room */}
                            {isHost && (
                                <button onClick={() => setActiveTab("waiting")} className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-left text-white text-sm transition-colors">
                                    <ShieldAlert className="w-5 h-5 text-yellow-400"/> Waiting Room
                                    {waitingUsers.length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{waitingUsers.length}</span>}
                                </button>
                            )}

                            {/* Fullscreen */}
                            <div className="h-px bg-white/10 my-1"/>
                            <button onClick={toggleFullscreen} className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-left text-white text-sm transition-colors">
                                {isFullscreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>} {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            </button>
                         </div>
                    )}
                </div>

                {/* 2. CAMERA */}
                <button onClick={toggleCamera} className={cn("p-3 rounded-lg transition-colors", isVideoOn ? "bg-white/10 text-white" : "bg-white text-black")}>
                    {isVideoOn ? <Video className="w-6 h-6"/> : <VideoOff className="w-6 h-6"/>}
                </button>

                {/* 3. MIC */}
                <button onClick={toggleMic} className={cn("p-3 rounded-lg transition-colors", isMicOn ? "bg-white/10 text-white" : "bg-white text-black")}>
                    {isMicOn ? <Mic className="w-6 h-6"/> : <MicOff className="w-6 h-6"/>}
                </button>

                {/* 4. END CALL */}
                {isHost ? (
                    <button onClick={handleEndMeetingForAll} className="p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30">
                        <PhoneOff className="w-6 h-6" />
                    </button>
                ) : (
                    <button onClick={onLeave} className="p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30">
                        <PhoneOff className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>

        {/* === SIDEBARS / OVERLAYS (Chat, Invite, etc.) === */}
        {activeTab !== "none" && (
            <div className={cn(
                "fixed inset-0 z-[60] bg-[#1111119c] flex flex-col animate-in slide-in-from-right",
                "md:absolute md:top-0 md:right-0 md:w-80 md:h-full md:border-l md:border-white/10 md:shadow-2xl" // Desktop: Sidebar, Mobile: Fullscreen Overlay
            )}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#161616] safe-area-top">
                    <h3 className="text-white font-bold capitalize flex items-center gap-2">
                        {activeTab === "waiting" ? "Waiting Room" : activeTab === "invite" ? "Invite Users" : activeTab}
                    </h3>
                    <button onClick={() => setActiveTab("none")} className="p-2 hover:bg-white/10 rounded-full transition"><X className="w-6 h-6 text-white/70" /></button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === "chat" && <InCallChatSidebar onClose={() => setActiveTab("none")} />}

                    {activeTab === "participants" && (
                        <div className="h-full overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {activeParticipants.map((p) => {
                                let avatarUrl = "";
                                try { const meta = p.metadata ? JSON.parse(p.metadata) : {}; avatarUrl = meta.avatar || ""; } catch(e) {}
                                return (
                                    <div key={p.identity} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                                            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : (p.name?.[0] || "?")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium flex items-center gap-2">{p.name || p.identity} {p.isLocal && <span className="text-white/30 text-xs">(You)</span>}</p>
                                            <p className="text-[10px] text-white/40">{p.identity === hostIdentity ? "Host" : "Participant"}</p>
                                        </div>
                                        {isHost && !p.isLocal && (
                                            <button onClick={() => requestKick(p.identity)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition" title="Kick User"><Ban className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {activeTab === "invite" && (
                        <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                             <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
                                 <p className="text-blue-200 text-xs">Send meeting link directly to a user's chat.</p>
                             </div>
                             {uniqueOnlineUsers.length === 0 ? (
                                 <div className="text-center text-white/30 mt-10">
                                     <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                     <p className="text-sm">No other users online.</p>
                                 </div>
                             ) : (
                                 uniqueOnlineUsers.map((u) => {
                                     const isSent = invitedUserIds.has(u.userId);
                                     return (
                                         <div key={u.userId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                             <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center text-xs text-white font-bold">
                                                     {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0] || "?"}
                                                 </div>
                                                 <div>
                                                     <p className="text-white text-sm font-medium truncate w-24">{u.name}</p>
                                                     <p className="text-[10px] text-green-400">Online</p>
                                                 </div>
                                             </div>
                                             <button onClick={() => handleSendInvite(u.userId)} disabled={isSent} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1", isSent ? "bg-green-500/20 text-green-500 cursor-default" : "bg-blue-600 hover:bg-blue-700 text-white")}>
                                                 {isSent ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />} {isSent ? "Sent" : "Invite"}
                                             </button>
                                         </div>
                                     );
                                 })
                             )}
                        </div>
                    )}

                    {activeTab === "waiting" && (
                        <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {waitingUsers.length === 0 ? <p className="text-center text-white/30 text-sm mt-10">No one is waiting.</p> : waitingUsers.map((req) => (
                                <div key={req.socketId} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-xs font-bold text-white">
                                            {req.user.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" /> : (req.user.name?.[0] || "?")}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-bold">{req.user?.name || "Guest"}</p>
                                            <p className="text-[10px] text-white/40">Wants to join...</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAdmit(req.socketId)} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg">Admit</button>
                                        <button onClick={() => handleReject(req.socketId)} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg">Deny</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </LayoutContextProvider>
  );
}

// CustomParticipantTile
function CustomParticipantTile({ trackRef, isHost, isMain, onPin, onKick, hostIdentity }: any) {
    const participant = trackRef.participant;
    const isSpeaking = useIsSpeaking(participant);
    const isHostUser = participant.identity === hostIdentity;
    const isVideoEnabled = !trackRef.isMuted && trackRef.source === Track.Source.Camera;

    let avatarUrl = "";
    try { const meta = participant.metadata ? JSON.parse(participant.metadata) : {}; avatarUrl = meta.avatar || ""; } catch(e) {}

    return (
        <div className={cn("relative w-full h-full group bg-black transition-all duration-300", (isSpeaking && isVideoEnabled) ? "ring-2 md:ring-4 ring-inset ring-green-500" : "")}>
            {isVideoEnabled ? (
                <VideoTrack trackRef={trackRef} className="w-full h-full object-cover bg-black" />
            ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-2 md:gap-4 bg-[#111]">
                    <div className={cn("w-12 h-12 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/10 relative", isSpeaking && "animate-pulse ring-4 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]")}>
                        {avatarUrl ? <img src={avatarUrl} alt="User" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl md:text-2xl font-bold text-white">{participant.name?.[0] || "?"}</div>}
                    </div>
                    {isMain && <p className="text-white/50 text-xs md:text-sm">Camera Off</p>}
                </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-md text-white text-[10px] md:text-xs font-bold flex items-center gap-1 pointer-events-none z-20">
                {isHostUser && <Crown className="w-3 h-3 text-yellow-400" />} {participant.name || participant.identity} {participant.isLocal && " (You)"}
            </div>
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="bg-black/60 p-1.5 rounded-lg text-white hover:bg-white/20 cursor-pointer" title={isMain ? "Unpin" : "Pin"}><Pin className={cn("w-3 h-3 md:w-4 md:h-4", isMain ? "fill-white" : "")} /></button>
                {isHost && !participant.isLocal && (
                    <button onClick={(e) => { e.stopPropagation(); onKick(participant.identity); }} className="bg-red-600/80 p-1.5 rounded-lg text-white hover:bg-red-600 cursor-pointer" title="Kick User"><Ban className="w-3 h-3 md:w-4 md:h-4" /></button>
                )}
            </div>
        </div>
    );
}