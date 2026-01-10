"use client";

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { useUser } from "@clerk/nextjs";
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Copy, 
  ArrowLeft, Check
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const socket = io("http://localhost:3000");

export default function VideoCallPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callId = searchParams.get("callId"); // Get ID from URL

  // --- STATE ---
  const [me, setMe] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerName, setCallerName] = useState("");
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  // Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Refs
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    // Auto-fill ID from URL
    if (callId) {
      setIdToCall(callId);
    }

    if (user) {
      setName(user.fullName || "User");
      
      // 1. Get Webcam Access
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          if (myVideo.current) myVideo.current.srcObject = currentStream;
        });

      // 2. Setup Socket
      socket.on("connect", () => {
        // IMPORTANT: In your custom server.js, socket.id matches the Clerk ID you emitted in "join"
        // But for WebRTC signaling, we need the *socket ID* specifically for simple-peer routing
        setMe(socket.id); 
      });

      socket.on("callUser", (data: any) => {
        setReceivingCall(true);
        setCaller(data.from);
        setName(data.name);
        setCallerSignal(data.signal);
      });
    }
  }, [user, callId]);

  // --- ACTIONS ---

  const callUser = (id: string) => {
    // Note: In a real app, you need to map Clerk ID (id) -> Socket ID via your server
    // For now, this assumes 'id' is the socket ID (works if you copy-paste from "Share this ID")
    // OR if you update server.js to map ClerkID -> SocketID.
    
    const peer = new Peer({ initiator: true, trickle: false, stream: stream! });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: stream! });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) connectionRef.current.destroy();
    window.location.href = "/dashboard/chat"; // Return to chat on end
  };

  // --- SCREEN SHARE LOGIC 🖥️ ---
  const toggleScreenShare = () => {
    if (!isScreenSharing) {
      // START SHARE
      navigator.mediaDevices.getDisplayMedia({ cursor: true } as any)
        .then((screenStream) => {
          const screenTrack = screenStream.getVideoTracks()[0];
          screenTrackRef.current = screenTrack;

          if (connectionRef.current && stream) {
            // Replace Camera Track with Screen Track
            const videoTrack = stream.getVideoTracks()[0];
            connectionRef.current.replaceTrack(videoTrack, screenTrack, stream);
          }

          if (myVideo.current) myVideo.current.srcObject = screenStream;
          setIsScreenSharing(true);

          // Handle "Stop Sharing" from browser native UI
          screenTrack.onended = () => {
             stopScreenShare();
          };
        });
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    // STOP SHARE
    if (screenTrackRef.current) {
        screenTrackRef.current.stop(); 
        
        // Revert to Camera
        if (connectionRef.current && stream) {
            const videoTrack = stream.getVideoTracks()[0];
            connectionRef.current.replaceTrack(screenTrackRef.current, videoTrack, stream);
        }
        
        if (myVideo.current) myVideo.current.srcObject = stream;
        setIsScreenSharing(false);
    }
  };

  // --- MUTE/VIDEO TOGGLES ---
  const toggleMic = () => {
    if (stream) {
        stream.getAudioTracks()[0].enabled = !isMicOn;
        setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
        stream.getVideoTracks()[0].enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
    }
  };

  const [copied, setCopied] = useState(false);
  const copyId = () => {
      navigator.clipboard.writeText(me);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      
      {/* HEADER */}
      <div className="absolute top-4 left-4 z-10">
          <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <ArrowLeft className="w-5 h-5" /> Back to Chat
          </button>
      </div>

      {/* VIDEO GRID */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl items-center justify-center flex-1">
        
        {/* MY VIDEO */}
        <div className="relative group">
            <video playsInline muted ref={myVideo} autoPlay className={cn("rounded-2xl border-2 border-white/10 shadow-2xl bg-black object-cover transition-all", callAccepted && !callEnded ? "w-64 h-48 md:w-80 md:h-60" : "w-[90vw] h-[60vh]")} />
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-md">You {isScreenSharing && "(Sharing Screen)"}</div>
        </div>

        {/* USER VIDEO (ONLY SHOW IF CALL ACCEPTED) */}
        {callAccepted && !callEnded && (
            <div className="relative flex-1 h-full w-full max-h-[70vh]">
                <video playsInline ref={userVideo} autoPlay className="w-full h-full rounded-2xl border-2 border-indigo-500/30 shadow-2xl bg-black object-cover" />
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-md">{callerName || "Remote User"}</div>
            </div>
        )}
      </div>

      {/* CONTROLS BAR */}
      <div className="mt-8 flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10">
         <button onClick={toggleMic} className={cn("p-4 rounded-full transition-all", isMicOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-500")}>
             {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
         </button>
         
         <button onClick={toggleVideo} className={cn("p-4 rounded-full transition-all", isVideoOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-500")}>
             {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
         </button>

         <button onClick={toggleScreenShare} className={cn("p-4 rounded-full transition-all", isScreenSharing ? "bg-green-500 hover:bg-green-600 text-black" : "bg-white/10 hover:bg-white/20")}>
             <Monitor className="w-6 h-6" />
         </button>

         <div className="w-px h-10 bg-white/20 mx-2" />

         <button onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20">
             <PhoneOff className="w-6 h-6 fill-white" />
         </button>
      </div>

      {/* CALL NOTIFICATION MODAL */}
      {receivingCall && !callAccepted && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-green-500/50 p-6 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-top-10 z-50">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <PhoneOff className="w-6 h-6 text-green-500" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-white">{name} is calling...</h3>
                  <p className="text-white/40 text-sm">Incoming Video Call</p>
              </div>
              <button onClick={answerCall} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors">
                  Answer
              </button>
          </div>
      )}

      {/* ID DISPLAY (FOR TESTING) */}
      {!callAccepted && (
        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-sm">
            <p className="text-xs text-white/40 mb-2">Share this ID to receive a call:</p>
            <div className="flex gap-2">
                <code className="bg-black/50 px-2 py-1 rounded text-green-400 font-mono text-sm truncate flex-1">{me}</code>
                <button onClick={copyId} className="p-1 hover:text-white text-white/50">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            
            <div className="mt-4 flex gap-2">
                <input 
                    type="text" 
                    placeholder="Enter ID to call" 
                    value={idToCall} 
                    onChange={(e) => setIdToCall(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white w-full focus:outline-none focus:border-indigo-500"
                />
                <button onClick={() => callUser(idToCall)} className="bg-indigo-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-indigo-700">Call</button>
            </div>
        </div>
      )}

    </div>
  );
}