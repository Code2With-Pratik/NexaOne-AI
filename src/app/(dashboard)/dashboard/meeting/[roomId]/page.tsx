"use client";

import React, { useEffect, useState, use, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { io, Socket } from "socket.io-client";
import MeetingView from '@/components/meeting/MeetingView';
import { Loader2, Lock, XCircle, AlertTriangle } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export default function MeetingGatekeeperPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { roomId } = use(params);
  
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'checking' | 'waiting' | 'admitted' | 'rejected' | 'kicked' | 'ended'>('checking');
  const [isHost, setIsHost] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // 1. Prepare User Data (Robust Fallback)
    const userName = user.fullName || user.firstName || user.username || "Guest";
    const userAvatar = user.imageUrl;

    // 2. Initialize Socket ONE TIME
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"],
        query: { 
            userId: user.id, 
            userName: userName,
            userAvatar: userAvatar 
        }
      });
    }
    const socket = socketRef.current;

    // 3. 🔥 CRITICAL FIX: Force update metadata immediately
    // This ensures that even if the handshake missed the data, this event fixes it.
    if (socket.connected) {
        socket.emit("update_user_metadata", { userId: user.id, name: userName, avatar: userAvatar });
    } else {
        socket.on("connect", () => {
            socket.emit("update_user_metadata", { userId: user.id, name: userName, avatar: userAvatar });
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const hostParam = urlParams.get('host') === 'true';
    setIsHost(hostParam);

    // --- LISTENERS ---
    socket.on("participant_kicked", (data: { userId: string }) => {
        if (data.userId === user.id) {
            setStatus('kicked');
            setToken(''); 
        }
    });

    socket.on("meeting_ended", () => {
        setStatus('ended');
        setToken('');
    });

    if (hostParam) {
        fetchToken();
        setStatus('admitted');
    } else {
        setStatus('waiting');
        socket.on("join_status", (data: { status: string }) => {
            if (data.status === "approved") {
                setStatus('admitted');
                fetchToken();
            } else if (data.status === "rejected") {
                setStatus('rejected');
            }
        });

        // Send join request with FULL details
        socket.emit("join_request", { 
            roomId, 
            user: { name: userName, id: user.id, avatar: userAvatar } 
        });
    }

    return () => { 
        socket.off("join_status");
        socket.off("participant_kicked");
        socket.off("meeting_ended");
    };
  }, [isLoaded, user, roomId]);

  const fetchToken = async () => {
      try {
        const userName = user?.fullName || user?.firstName || "Guest";
        const avatarUrl = encodeURIComponent(user?.imageUrl || "");
        const resp = await fetch(`/api/livekit/token?room=${roomId}&username=${userName}&avatar=${avatarUrl}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (e) { console.error("Token error", e); }
  };

  const cancelRequest = () => {
      socketRef.current?.emit("cancel_request", { roomId });
      router.push('/dashboard/meeting');
  };

  if (!isLoaded) return <div className="h-full flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin w-8 h-8 text-white/20" /></div>;

  if (status === 'waiting') {
      return (
          <div className="h-[calc(100vh-6rem)] bg-black flex flex-col items-center justify-center text-center p-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
                  <Lock className="w-8 h-8 text-red-400" />
                  <span className="absolute top-0 right-0 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host...</h2>
              <p className="text-white/50 max-w-md mb-8">We've let the host know you're here.</p>
              <button onClick={cancelRequest} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-all border border-red-500/20 cursor-pointer"><XCircle className="w-5 h-5" /> Cancel & Return</button>
          </div>
      );
  }

  if (['rejected', 'kicked', 'ended'].includes(status)) {
    const messages = { rejected: { title: "Access Denied", desc: "The host declined your request." }, kicked: { title: "Removed", desc: "You have been removed from the meeting." }, ended: { title: "Meeting Ended", desc: "The host has ended the meeting." } };
    const info = messages[status as keyof typeof messages];
    return (
        <div className="h-[calc(100vh-6rem)] bg-black flex flex-col items-center justify-center text-center p-4">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">{info.title}</h2>
            <p className="text-white/50 mb-6">{info.desc}</p>
            <button onClick={() => router.push('/dashboard/meeting')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer">Back to Dashboard</button>
        </div>
    );
  }

  if (status === 'admitted' && token && socketRef.current) {
      return (
          <div className="h-[calc(100vh-6rem)] bg-black rounded-2xl overflow-hidden border border-white/10">
              <MeetingView token={token} roomId={roomId} isHost={isHost} socket={socketRef.current} onLeave={() => router.push('/dashboard/meeting')} />
          </div>
      );
  }
  
  return <div className="h-full flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin w-8 h-8 text-white/20" /></div>;
}