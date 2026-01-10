"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Monitor, Settings, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import Peer from "simple-peer";

// Configuration
const MY_ID = 99; // Assume I am User 99
const USER_TO_CALL = 1; // For demo, we are calling "Alice" (User 1)

export default function VideoCallPage() {
  // State
  const [me, setMe] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("My Name");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // Refs
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const socket = useRef<any>(null);

  useEffect(() => {
    // 1. Connect Socket
    socket.current = io("http://localhost:3000", { transports: ["websocket"] });
    
    // 2. Get Webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    // 3. Socket Events
    socket.current.on("connect", () => {
       // Join as myself
       socket.current.emit("join", MY_ID);
    });

    socket.current.on("callUser", (data: any) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.current.on("callEnded", () => {
      setCallEnded(true);
      if (connectionRef.current) connectionRef.current.destroy();
      window.location.reload(); // Quick reset
    });

  }, []);

  // --- ACTIONS ---

  const callUser = (id: number) => {
    const peer = new Peer({ initiator: true, trickle: false, stream: stream! });

    peer.on("signal", (data) => {
      socket.current.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: MY_ID,
        name: name
      });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    socket.current.on("callAccepted", (signal: any) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: stream! });

    peer.on("signal", (data) => {
      socket.current.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    socket.current.emit("endCall", { to: callAccepted ? USER_TO_CALL : caller });
    if (connectionRef.current) connectionRef.current.destroy();
    window.location.href = "/dashboard/chat";
  };

  // Toggle Controls
  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !cameraOn;
      setCameraOn(!cameraOn);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
      
      {/* HEADER */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full animate-pulse", callAccepted && !callEnded ? "bg-green-500" : "bg-yellow-500")} />
        <span className="text-sm font-medium text-white">
           {callAccepted && !callEnded ? "Connected" : receivingCall ? "Incoming Call..." : "Waiting for connection"}
        </span>
      </div>

      {/* --- VIDEO GRID --- */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* MY VIDEO */}
        <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 shadow-lg">
           <video ref={myVideo} playsInline muted autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
           <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-xs font-medium text-white">
             You {!micOn && "(Muted)"}
           </div>
        </div>

        {/* USER VIDEO (Only show if call accepted) */}
        {callAccepted && !callEnded ? (
           <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 shadow-lg">
              <video ref={userVideo} playsInline autoPlay className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-xs font-medium text-white">
                 Remote User
              </div>
           </div>
        ) : (
           // Placeholder when waiting
           <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/5 border-dashed">
              {receivingCall && !callAccepted ? (
                 <div className="text-center animate-bounce">
                    <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/50">
                       <Phone className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{name} is calling...</h3>
                    <button onClick={answerCall} className="bg-green-500 text-white px-8 py-2 rounded-full font-bold hover:bg-green-400 transition-all">
                       Answer Call
                    </button>
                 </div>
              ) : (
                 <div className="text-center text-white/30">
                    <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Waiting for other participant...</p>
                    <button onClick={() => callUser(USER_TO_CALL)} className="mt-4 px-6 py-2 bg-indigo-600/20 text-indigo-400 rounded-full text-sm hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/30">
                       Call Alice (Demo)
                    </button>
                 </div>
              )}
           </div>
        )}
      </div>

      {/* --- CONTROLS --- */}
      <div className="min-h-20 bg-[#0A0A0A] border-t border-white/10 flex items-center justify-center gap-4 px-6 z-20">
         <ControlBtn active={micOn} onClick={toggleMic} onIcon={<Mic />} offIcon={<MicOff />} />
         <ControlBtn active={cameraOn} onClick={toggleCamera} onIcon={<Video />} offIcon={<VideoOff />} />
         
         <div className="w-px h-8 bg-white/10 mx-2" />
         
         <button onClick={leaveCall} className="px-8 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all hover:scale-105">
           <PhoneOff className="w-5 h-5" /> End Call
         </button>
      </div>
    </div>
  );
}

const ControlBtn = ({ active, onClick, onIcon, offIcon }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-4 rounded-full transition-all duration-200 shadow-lg",
      active ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500 text-white hover:bg-red-600 animate-pulse"
    )}
  >
    {active ? React.cloneElement(onIcon, { size: 20 }) : React.cloneElement(offIcon, { size: 20 })}
  </button>
);