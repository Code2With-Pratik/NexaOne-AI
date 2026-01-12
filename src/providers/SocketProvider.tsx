"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Phone, PhoneIncoming, Video, PhoneOff, MessageSquare, X, Bell } from 'lucide-react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
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
  
  // Call State
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  
  // 👇 NEW: Reference for the Message Notification Sound
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const router = useRouter();

  // Updated Message Notification State to support 'types' (alert vs message)
  const [msgNotification, setMsgNotification] = useState<{
      senderName: string;
      content: string;
      senderId?: string;
      type: 'message' | 'alert'; // 👈 Added type
  } | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const newSocket = io("http://localhost:3000", { transports: ["websocket"] });
    
    // 👇 Initialize Notification Sound
    notificationSoundRef.current = new Audio("/sounds/water_drops.mp3");

    newSocket.on("connect", () => {
      console.log("✅ Global Socket Connected");
      setIsConnected(true);
      newSocket.emit("join", user.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("current_online_list", (users: string[]) => {
        setOnlineUsers(users);
    });

    newSocket.on("user_status_update", ({ userId, status }: { userId: string, status: string }) => {
        setOnlineUsers((prev) => {
            if (status === "Online") return prev.includes(userId) ? prev : [...prev, userId];
            return prev.filter(id => id !== userId);
        });
    });

    // --- CALL LISTENERS ---
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

    // 👇 NEW: Handle 'Call Rejected' Event Globally
    newSocket.on("call_rejected", () => {
        setMsgNotification({
            senderName: "Call Declined",
            content: "User is busy or declined the call.",
            type: "alert"
        });
        setTimeout(() => setMsgNotification(null), 4000);
    });

    // --- MESSAGE LISTENER ---
    newSocket.on("receive_message", (msg: any) => {
        // 1. Play Notification Sound
        if (notificationSoundRef.current) {
            notificationSoundRef.current.currentTime = 0;
            notificationSoundRef.current.play().catch(e => console.warn("Sound blocked:", e));
        }

        // 2. Determine Content Text
        let contentText = msg.text || "New Message";
        if (msg.type === "image") contentText = "📷 Sent an image";
        if (msg.type === "voice") contentText = "🎤 Sent a voice note";
        if (msg.type === "sticker") contentText = "👻 Sent a sticker";
        if (msg.type === "file") contentText = "📎 Sent a file";

        // 3. Show Toast
        setMsgNotification({
            senderName: msg.senderName || "New Message", 
            content: contentText,
            senderId: msg.senderId,
            type: "message"
        });

        setTimeout(() => {
            setMsgNotification(null);
        }, 3000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (ringtoneRef.current) ringtoneRef.current.pause();
    };
  }, [user, isLoaded]);

  // Call Handlers
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
    
    socket.emit("reject_call", { 
        callerId: incomingCall.callerId, 
        logId: incomingCall.logId 
    });
    
    setIncomingCall(null);
  };

  const closeNotification = () => setMsgNotification(null);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}

      {/* GLOBAL NOTIFICATION TOAST (Messages & Alerts) */}
      {msgNotification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-top-5 fade-in duration-300">
              <div 
                className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 px-4 py-3 rounded-full shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md cursor-pointer hover:bg-white/5 transition"
                onClick={() => {
                    // Only redirect if it's a message, not a system alert
                    if (msgNotification.type === 'message') router.push('/dashboard/chat');
                }}
              >
                  {/* Icon changes color based on type */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msgNotification.type === 'alert' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                      {msgNotification.type === 'alert' ? (
                          <Bell className="w-4 h-4 text-red-500" />
                      ) : (
                          <MessageSquare className="w-4 h-4 text-green-500" />
                      )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-bold truncate">{msgNotification.senderName}</h4>
                      <p className="text-white/60 text-xs truncate">{msgNotification.content}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); closeNotification(); }} 
                    className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white"
                  >
                      <X className="w-4 h-4" />
                  </button>
              </div>
          </div>
      )}

      {/* GLOBAL CALL POPUP */}
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