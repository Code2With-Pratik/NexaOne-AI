"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Phone, PhoneIncoming, Video, PhoneOff } from 'lucide-react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[]; // This list needs to be live!
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // 1. Connect
    const newSocket = io("http://localhost:3000", { transports: ["websocket"] });
    
    newSocket.on("connect", () => {
      console.log("Global Socket Connected:", newSocket.id);
      setIsConnected(true);
      newSocket.emit("join", user.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // 2. 👇 LOAD INITIAL LIST
    newSocket.on("current_online_list", (users: string[]) => {
        setOnlineUsers(users);
    });

    // 3. 👇 HANDLE REAL-TIME UPDATES (This was missing/incomplete!)
    newSocket.on("user_status_update", ({ userId, status }: { userId: string, status: string }) => {
        setOnlineUsers((prev) => {
            if (status === "Online") {
                // Add user if not already in list
                return prev.includes(userId) ? prev : [...prev, userId];
            } else {
                // Remove user from list
                return prev.filter(id => id !== userId);
            }
        });
    });

    // 4. Call Listeners
    newSocket.on("incoming_call", (data) => {
        setIncomingCall(data);
        const audio = new Audio("/sounds/time_rebel.mp3");
        audio.loop = true;
        audio.play().catch(e => console.error("Audio error", e));
        ringtoneRef.current = audio;
    });

    newSocket.on("call_ended", () => {
        setIncomingCall(null);
        if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current = null;
        }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (ringtoneRef.current) ringtoneRef.current.pause();
    };
  }, [user, isLoaded]);

  // ... (Keep handleAnswer and handleReject logic exactly as before) ...
  const handleAnswer = () => {
    if (!socket || !incomingCall) return;
    if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current = null; }
    socket.emit("call_accepted_signal", { 
        callerId: incomingCall.callerId, 
        roomId: incomingCall.roomId,
        logId: incomingCall.logId
    });
    setIncomingCall(null);
    router.push(`/dashboard/chat?roomId=${incomingCall.roomId}&autoJoin=true&isVideo=${incomingCall.isVideo}&logId=${incomingCall.logId}`);
  };

  const handleReject = () => {
    if (!socket || !incomingCall) return;
    if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current = null; }
    socket.emit("reject_call", { callerId: incomingCall.callerId, logId: incomingCall.logId });
    setIncomingCall(null);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
      {incomingCall && (
         <div className="fixed bottom-6 right-6 z-[9999] bg-[#1a1a1a] p-5 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center gap-4 w-80 animate-in slide-in-from-bottom-10">
             <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center animate-bounce">
                {incomingCall.isVideo ? <Video className="w-8 h-8 text-indigo-500" /> : <PhoneIncoming className="w-8 h-8 text-indigo-500" />}
             </div>
             <div className="text-center">
                 <h3 className="text-xl font-bold text-white">{incomingCall.callerName}</h3>
                 <p className="text-white/50 text-sm">Incoming {incomingCall.isVideo ? "Video" : "Voice"} Call...</p>
             </div>
             <div className="flex gap-3 w-full">
                 <button onClick={handleReject} className="flex-1 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition flex items-center justify-center gap-2">
                    <PhoneOff className="w-5 h-5" /> Decline
                 </button>
                 <button onClick={handleAnswer} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5" /> Answer
                 </button>
             </div>
         </div>
      )}
    </SocketContext.Provider>
  );
};