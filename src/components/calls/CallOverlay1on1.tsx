"use client";

import React, { useState } from 'react';
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
import { PhoneOff, Video, VideoOff, Mic, MicOff, Monitor, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import InCallChatSidebar from './InCallChatSidebar'; // Reusing your existing chat component

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
         <CustomCallLayout initialVideo={initialVideoEnabled} />
      </LiveKitRoom>
    </div>
  );
}

function CustomCallLayout({ initialVideo }: { initialVideo: boolean }) {
    const room = useRoomContext();
    const [isVideoOn, setIsVideoOn] = useState(initialVideo);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenShare, setIsScreenShare] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Get all video tracks (Camera + Screen Share)
    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
      ],
      { onlySubscribed: false },
    );

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
        <div className="flex-1 flex flex-col relative">
            <div className="flex-1 p-4">
                {/* Custom Grid Layout - No default controls! */}
                <GridLayout tracks={tracks}>
                    <ParticipantTile />
                </GridLayout>
            </div>

            {/* CUSTOM CONTROL BAR - Single Row, No Overlap */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 bg-[#1a1a1a]/90 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl z-50 whitespace-nowrap max-w-[90vw] overflow-x-auto custom-scrollbar">
                
                {/* Mic */}
                <button onClick={toggleMic} className={cn("p-3.5 rounded-xl transition-all", isMicOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/10 text-red-500 border border-red-500/50")}>
                        {isMicOn ? <Mic className="w-5 h-5"/> : <MicOff className="w-5 h-5"/>}
                </button>

                {/* Camera */}
                <button onClick={toggleVideo} className={cn("p-3.5 rounded-xl transition-all", isVideoOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/10 text-red-500 border border-red-500/50")}>
                        {isVideoOn ? <Video className="w-5 h-5"/> : <VideoOff className="w-5 h-5"/>}
                </button>

                {/* Screen Share */}
                <button onClick={toggleScreenShare} className={cn("p-3.5 rounded-xl transition-all", isScreenShare ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/10 hover:bg-white/20 text-white")}>
                        <Monitor className="w-5 h-5" />
                </button>

                {/* Chat Toggle */}
                <button onClick={() => setShowChat(!showChat)} className={cn("p-3.5 rounded-xl transition-all relative", showChat ? "bg-indigo-600 text-white" : "bg-white/10 hover:bg-white/20 text-white")}>
                        <MessageSquare className="w-5 h-5" />
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-white/10 mx-1"></div>

                {/* End Call */}
                <button onClick={() => room.disconnect()} className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2">
                    <PhoneOff className="w-5 h-5" />
                    <span className="hidden sm:inline">End</span>
                </button>
            </div>
        </div>

        {/* SIDEBAR CHAT (Optional - Slides in) */}
        {showChat && (
            <div className="w-80 h-full border-l border-white/10 bg-[#121212] relative z-40">
                <InCallChatSidebar onClose={() => setShowChat(false)} />
            </div>
        )}

        {/* Required for Audio to work */}
        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  );
}