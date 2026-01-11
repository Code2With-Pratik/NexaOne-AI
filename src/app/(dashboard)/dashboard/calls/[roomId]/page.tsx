"use client";

import React, { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference, LayoutContextProvider, useRoomContext, ControlBar } from '@livekit/components-react';
import '@livekit/components-styles';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MessageSquare, Users, Copy, Check, PhoneOff } from 'lucide-react';
import InCallChatSidebar from '@/components/calls/InCallChatSidebar';
import { cn } from '@/lib/utils';

export default function GroupMeetingPage({ params }: { params: { roomId: string } }) {
  const { user } = useUser();
  const router = useRouter();
  const roomId = params.roomId;
  const [token, setToken] = useState('');
  const [is Host, setIsHost] = useState(false); // In real app, determine via DB or URL param

  useEffect(() => {
    if (!user) return;
    // Determine if host based on URL param for now (secure this later)
    const urlParams = new URLSearchParams(window.location.search);
    setIsHost(urlParams.get('host') === 'true');

    const fetchToken = async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${roomId}&username=${user.fullName}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (e) { console.error(e); }
    };
    fetchToken();
  }, [user, roomId]);

  if (!token) return <div className="h-full flex items-center justify-center text-white">Loading Meeting...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] bg-black relative overflow-hidden flex rounded-2xl border border-white/10">
       <LiveKitRoom
         video={true}
         audio={true}
         token={token}
         serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
         data-lk-theme="default"
         style={{ height: '100%', width: '100%' }}
         onDisconnected={() => router.push('/dashboard/calls')}
       >
          <MeetingLayout roomId={roomId} isHost={isHost} />
       </LiveKitRoom>
    </div>
  );
}

// Inner component to access room context
function MeetingLayout({ roomId, isHost }: { roomId: string, isHost: boolean }) {
    const room = useRoomContext();
    const [showChat, setShowChat] = useState(true);
    const [copied, setCopied] = useState(false);

    const copyInvite = () => {
        const link = `${window.location.origin}/dashboard/calls/${roomId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const handleLeave = () => {
        // If host, we might want to end call for everyone (requires server API)
        // For now, just disconnect self.
        room.disconnect();
    };

  return (
    <LayoutContextProvider>
      <div className="flex h-full">
        {/* Main Stage (Video Grid) */}
        <div className="flex-1 flex flex-col relative">
            {/* Header info */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 p-3 rounded-xl backdrop-blur-md flex items-center gap-4 border border-white/10">
                <div>
                    <h2 className="text-white font-bold">Meeting Room</h2>
                    <p className="text-white/50 text-xs">ID: {roomId}</p>
                </div>
                <button onClick={copyInvite} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 flex items-center gap-2 text-sm">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied Link!" : "Copy Link"}
                </button>
            </div>

            <div className="flex-1">
                 {/* LiveKit's smart video grid */}
                <VideoConference />
            </div>
            
            {/* Custom Bottom Bar overlying the video */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/80 rounded-2xl border border-white/10 backdrop-blur-xl z-20">
                 {/* Standard controls provided by LiveKit */}
                 <ControlBar variation="minimal" controls={{ screenShare: true, microphone: true, camera: true }} />
                 
                 <div className="w-px h-10 bg-white/20 mx-2 self-center"></div>

                 {/* Custom toggles */}
                 <button onClick={() => setShowChat(!showChat)} className={cn("p-3 rounded-full transition-colors relative", showChat ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/70")}>
                    <MessageSquare className="w-5 h-5" />
                    {/* Add red dot notification here if needed */}
                 </button>
                 <button className="p-3 rounded-full hover:bg-white/10 text-white/70 transition-colors">
                    <Users className="w-5 h-5" />
                 </button>

                 <div className="w-px h-10 bg-white/20 mx-2 self-center"></div>
                 
                 <button onClick={handleLeave} className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors font-bold flex items-center gap-2 px-6">
                    <PhoneOff className="w-5 h-5" /> {isHost ? "End Meeting" : "Leave"}
                 </button>
            </div>
        </div>

        {/* Sidebar Chat */}
        {showChat && <InCallChatSidebar onClose={() => setShowChat(false)} />}
      </div>
    </LayoutContextProvider>
  );
}