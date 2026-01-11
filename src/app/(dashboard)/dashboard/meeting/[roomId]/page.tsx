"use client";

import React, { useEffect, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { io } from "socket.io-client";
import MeetingView from '@/components/meeting/MeetingView';
import { Loader2, Lock, XCircle } from 'lucide-react'; // Import XCircle

const socket = io("http://localhost:3000");

export default function MeetingGatekeeperPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { roomId } = use(params);
  
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'checking' | 'waiting' | 'admitted' | 'rejected'>('checking');
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const hostParam = urlParams.get('host') === 'true';
    setIsHost(hostParam);

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

        socket.emit("join_request", { 
            roomId, 
            user: { name: user.fullName, id: user.id } 
        });
    }

    return () => { socket.off("join_status"); };
  }, [isLoaded, user, roomId]);

  const fetchToken = async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${roomId}&username=${user?.fullName}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (e) { console.error("Token error", e); }
  };

  // 👇 NEW: Cancel Request Function
  const cancelRequest = () => {
      socket.emit("cancel_request", { roomId });
      router.push('/dashboard/meeting');
  };

  if (!isLoaded) return <div className="h-full flex items-center justify-center bg-black text-white">Loading...</div>;

  // 1. WAITING ROOM UI (Updated with Cancel Button)
  if (status === 'waiting') {
      return (
          <div className="h-[calc(100vh-6rem)] bg-black flex flex-col items-center justify-center text-center p-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
                  <Lock className="w-8 h-8 text-indigo-400" />
                  <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host...</h2>
              <p className="text-white/50 max-w-md mb-8">
                  We've let the host know you're here. You will join automatically once they admit you.
              </p>
              
              {/* 👇 CANCEL BUTTON */}
              <button 
                  onClick={cancelRequest} 
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-all border border-red-500/20"
              >
                  <XCircle className="w-5 h-5" />
                  Cancel & Return
              </button>
          </div>
      );
  }

  // ... (Keep Rejected/Admitted blocks same as before) ...
  if (status === 'rejected') {
    return (
        <div className="h-[calc(100vh-6rem)] bg-black flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
            <p className="text-white/50 mb-6">The host declined your request to join.</p>
            <button onClick={() => router.push('/dashboard/meeting')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
                Back to Dashboard
            </button>
        </div>
    );
  }

  if (status === 'admitted' && token) {
      return (
          <div className="h-[calc(100vh-6rem)] bg-black rounded-2xl overflow-hidden border border-white/10">
              <MeetingView 
                 token={token} 
                 roomId={roomId} 
                 isHost={isHost} 
                 onLeave={() => router.push('/dashboard/meeting')} 
              />
          </div>
      );
  }
  
  return <div className="h-full flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin w-8 h-8 text-white/20" /></div>;
}