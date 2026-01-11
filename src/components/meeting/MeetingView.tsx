"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LiveKitRoom,
  LayoutContextProvider,
  RoomAudioRenderer,
  useParticipants,
  useRoomContext,
  useTracks,
  ParticipantTile,
  ControlBar,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

import {
  MessageSquare,
  Users,
  ShieldAlert,
  Crown,
  Copy,
  Check,
  X,
  Clock,
  PhoneOff,
} from "lucide-react";

import { cn } from "@/lib/utils";
import InCallChatSidebar from "@/components/calls/InCallChatSidebar";
import { io, Socket } from "socket.io-client";

interface MeetingViewProps {
  token: string;
  roomId: string;
  isHost: boolean;
  onLeave: () => void;
}

type ActiveTab = "none" | "chat" | "participants" | "waiting";

type WaitingUser = {
  socketId: string;
  user: { name: string; identity?: string };
};

// Socket.IO server URL (NOT LiveKit URL)
const SOCKET_URL = "http://localhost:3000";

export default function MeetingView({ token, roomId, isHost, onLeave }: MeetingViewProps) {
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
      <MeetingContent roomId={roomId} isHost={isHost} onLeave={onLeave} />
    </LiveKitRoom>
  );
}

function MeetingContent({
  roomId,
  isHost,
  onLeave,
}: {
  roomId: string;
  isHost: boolean;
  onLeave: () => void;
}) {
  const room = useRoomContext();
  const participants = useParticipants();

  // --- Socket (single connection per mount) ---
  const socketRef = useRef<Socket | null>(null);

  // --- UI state ---
  const [activeTab, setActiveTab] = useState<ActiveTab>("none");
  const activeTabRef = useRef<ActiveTab>("none");

  const [hostIdentity, setHostIdentity] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Per-user timer (each user sees their own time since join)
  const joinAtRef = useRef<number>(Date.now());
  const [meetingTime, setMeetingTime] = useState(0);

  // Local-only pin/focus (each user controls their own UI)
  const [focusedTrack, setFocusedTrack] = useState<any>(null);

  // Keep active tab ref in sync (prevents stale closure in socket handlers)
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab === "chat") setUnreadMessages(0);
  }, [activeTab]);

  // Timer
  useEffect(() => {
    joinAtRef.current = Date.now();
    const t = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - joinAtRef.current) / 1000);
      setMeetingTime(elapsedSec);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Tracks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const defaultMainTrack = useMemo(() => {
    const screen = tracks.find((t) => t.source === Track.Source.ScreenShare);
    if (screen) return screen;
    return tracks[0] ?? null;
  }, [tracks]);

  const mainTrack = focusedTrack ?? defaultMainTrack;

  const otherTracks = useMemo(() => {
    if (!mainTrack) return tracks;
    return tracks.filter(
      (t) =>
        t.participant?.identity !== mainTrack.participant?.identity ||
        t.source !== mainTrack.source
    );
  }, [tracks, mainTrack]);

  const onTileClick = (track: any) => {
    if (!track?.participant) return;

    // Local-only toggle
    if (
      focusedTrack?.participant?.identity === track.participant.identity &&
      focusedTrack?.source === track.source
    ) {
      setFocusedTrack(null);
    } else {
      setFocusedTrack(track);
    }
  };

  // --- Socket lifecycle & waiting room / host logic ---
  useEffect(() => {
    // Create socket once
    const s = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = s;

    const localIdentity = room.localParticipant?.identity;

    if (isHost) {
      s.emit("meeting_start", { roomId, userId: localIdentity });
      setHostIdentity(localIdentity || "");
    } else {
      s.emit("get_room_info", { roomId });
    }

    s.on("room_info", (payload: { hostIdentity: string }) => {
      setHostIdentity(payload.hostIdentity || "");
    });

    if (isHost) {
      s.on("guest_waiting", ({ socketId, user }: WaitingUser) => {
        setWaitingUsers((prev) => {
          if (prev.some((u) => u.socketId === socketId)) return prev;
          return [...prev, { socketId, user }];
        });
        setActiveTab((prev) => (prev === "none" ? "waiting" : prev));
      });

      s.on("guest_cancelled", ({ socketId }: { socketId: string }) => {
        setWaitingUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      });
    }

    // Unread badge
    s.on("receive_message", () => {
      if (activeTabRef.current !== "chat") {
        setUnreadMessages((prev) => prev + 1);
      }
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [isHost, roomId, room.localParticipant?.identity, room]);

  const handleAdmit = (socketId: string) => {
    socketRef.current?.emit("process_request", {
      guestSocketId: socketId,
      action: "approved",
      roomId,
    });
    setWaitingUsers((prev) => prev.filter((u) => u.socketId !== socketId));
  };

  const handleReject = (socketId: string) => {
    socketRef.current?.emit("process_request", {
      guestSocketId: socketId,
      action: "rejected",
      roomId,
    });
    setWaitingUsers((prev) => prev.filter((u) => u.socketId !== socketId));
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <LayoutContextProvider>
      <div className="flex flex-col lg:flex-row h-full w-full bg-[#050505] relative overflow-hidden">
        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          {/* Top overlay */}
          <div className="absolute top-4 left-4 z-30 flex flex-wrap gap-2 lg:gap-3 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 text-white text-[10px] lg:text-xs font-mono flex items-center gap-2 pointer-events-auto shadow-lg">
              ID: {roomId.slice(0, 8)}...
              <button onClick={copyId} className="hover:text-indigo-400 transition">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-[10px] lg:text-xs font-mono flex items-center gap-2 shadow-lg">
              <Clock className="w-3 h-3 text-red-500 animate-pulse" />
              {formatTime(meetingTime)}
            </div>

            {isHost && (
              <div className="bg-indigo-600/90 px-3 py-2 rounded-xl text-white text-[10px] lg:text-xs font-bold flex items-center gap-1 shadow-lg">
                <Crown className="w-3 h-3" /> HOST
              </div>
            )}
          </div>

          {/* Stage + strip */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Main Stage (Big Video) */}
            <div className="flex-1 bg-black/40 relative flex items-center justify-center p-2 lg:p-4 min-h-[50vh] lg:min-h-0">
              {mainTrack ? (
                <div className="w-full h-full max-w-full max-h-full aspect-video relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <CustomParticipantTile
                    hostIdentity={hostIdentity}
                    trackRef={mainTrack}
                    onParticipantClick={onTileClick}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white/30 gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                    <Users className="w-8 h-8 opacity-50" />
                  </div>
                  <p>Waiting for participants...</p>
                </div>
              )}
            </div>

            {/* Side Strip (Small Videos) - Responsive: Horizontal on mobile, Vertical on desktop */}
            {otherTracks.length > 0 && (
              <div className="w-full lg:w-64 h-32 lg:h-full bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-white/10 p-2 lg:p-3 flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar z-10 shadow-xl shrink-0">
                {otherTracks.map((track) => (
                  <div
                    key={track.publication?.trackSid || `${track.participant.identity}_${track.source}`}
                    className={cn(
                      "min-w-[160px] lg:w-full aspect-video rounded-xl overflow-hidden border border-white/10 transition-all cursor-pointer relative shadow-md group shrink-0",
                      focusedTrack?.participant?.identity === track.participant.identity &&
                        focusedTrack?.source === track.source
                        ? "border-indigo-500/80"
                        : "hover:border-indigo-500/50"
                    )}
                  >
                    <CustomParticipantTile
                      hostIdentity={hostIdentity}
                      trackRef={track}
                      onParticipantClick={onTileClick}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded">
                        Pin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="h-16 lg:h-20 bg-[#121212] border-t border-white/10 px-4 flex items-center justify-center gap-2 lg:gap-4 z-40 shrink-0">
            <ControlBar variation="minimal" controls={{ microphone: true, camera: true, screenShare: true }} />

            <div className="w-px h-6 lg:h-8 bg-white/10 mx-1 lg:mx-2" />

            <button
              onClick={() => setActiveTab(activeTab === "chat" ? "none" : "chat")}
              className={cn(
                "p-2 lg:p-3.5 rounded-xl hover:bg-white/10 text-white transition relative",
                activeTab === "chat" ? "bg-indigo-600" : "bg-white/5"
              )}
            >
              <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5" />
              {unreadMessages > 0 && activeTab !== "chat" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-lg border border-[#121212]">
                  {unreadMessages}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab(activeTab === "participants" ? "none" : "participants")}
              className={cn(
                "p-2 lg:p-3.5 rounded-xl hover:bg-white/10 text-white transition",
                activeTab === "participants" ? "bg-indigo-600" : "bg-white/5"
              )}
            >
              <Users className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>

            {isHost && (
              <button
                onClick={() => setActiveTab(activeTab === "waiting" ? "none" : "waiting")}
                className={cn(
                  "p-2 lg:p-3.5 rounded-xl hover:bg-white/10 text-white transition relative",
                  activeTab === "waiting" ? "bg-indigo-600" : "bg-white/5"
                )}
              >
                <ShieldAlert className="w-4 h-4 lg:w-5 lg:h-5" />
                {waitingUsers.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg border border-[#121212]">
                    {waitingUsers.length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onLeave}
              className="ml-2 lg:ml-4 px-4 lg:px-6 py-2 lg:py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden sm:inline">End</span>
            </button>
          </div>
        </div>

        {/* Right sidebar (Full Screen on Mobile) */}
        {activeTab !== "none" && (
          <div className="absolute inset-0 lg:static w-full lg:w-80 border-l border-white/10 bg-[#111] flex flex-col animate-in slide-in-from-right lg:slide-in-from-right h-full shadow-2xl z-50">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#161616]">
              <h3 className="text-white font-bold capitalize flex items-center gap-2">
                {activeTab === "waiting" ? "Waiting room" : activeTab}
              </h3>
              <button onClick={() => setActiveTab("none")} className="p-1 hover:bg-white/10 rounded-lg transition">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {activeTab === "chat" && <InCallChatSidebar onClose={() => setActiveTab("none")} />}

            {activeTab === "participants" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                  In meeting ({participants.length})
                </div>
                {participants.map((p) => (
                  <div
                    key={p.identity}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                      {p.name?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium flex items-center gap-2 truncate">
                        {p.name || p.identity}
                        {p.isLocal && <span className="text-white/30 text-xs">(You)</span>}
                      </p>
                      <p className="text-[10px] text-white/40">
                        {p.identity === hostIdentity ? "Host" : "Participant"}
                      </p>
                    </div>
                    {p.identity === hostIdentity && <Crown className="w-4 h-4 text-yellow-400 drop-shadow-md" />}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "waiting" && (
              <div className="flex-1 overflow-y-auto p-4">
                {waitingUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-white/30 gap-2">
                    <ShieldAlert className="w-8 h-8 opacity-50" />
                    <p className="text-sm">No one is waiting.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitingUsers.map((req) => (
                      <div key={req.socketId} className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                            {(req.user?.name?.[0] || "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-bold">{req.user?.name || "Guest"}</p>
                            <p className="text-[10px] text-white/40">Wants to join...</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAdmit(req.socketId)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg transition shadow-lg shadow-green-600/20"
                          >
                            Admit
                          </button>
                          <button
                            onClick={() => handleReject(req.socketId)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg transition shadow-lg shadow-red-600/20"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  );
}

// Host badge visible to everyone
function CustomParticipantTile({ hostIdentity, onParticipantClick, ...props }: any) {
  const { trackRef, participant } = props;

  const identity = trackRef?.participant?.identity || participant?.identity;
  const isThisUserHost = identity && hostIdentity && identity === hostIdentity;

  return (
    <div className="relative w-full h-full group cursor-pointer" onClick={() => onParticipantClick?.(trackRef)}>
      <ParticipantTile {...props} />
      {isThisUserHost && (
        <div className="absolute top-2 right-2 bg-yellow-500/90 text-black px-2 py-0.5 rounded text-[10px] font-bold z-10 shadow-lg pointer-events-none flex items-center gap-1 backdrop-blur-sm">
          <Crown className="w-3 h-3 fill-black" /> HOST
        </div>
      )}
    </div>
  );
}