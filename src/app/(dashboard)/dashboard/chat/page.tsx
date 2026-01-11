"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Phone, Video, MoreVertical, Send, Paperclip, Mic, Smile, CheckCheck,
  Trash2, BellOff, Bell, Pin, PinOff, X, StopCircle, Sticker, ArrowLeft, PhoneIncoming
} from "lucide-react";
import { cn } from '@/lib/utils';
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import CallOverlay1on1 from "@/components/calls/CallOverlay1on1";

// --- TYPES ---
type Message = {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  time: string;
  date: string;
  type: "text" | "image" | "voice" | "sticker";
  status: "sent" | "delivered" | "read";
};

type Contact = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: "Online" | "Offline";
  lastSeen: string;
};

// --- CONFIG ---
const STICKERS = ["👻", "🤖", "👽", "🦄", "🔥", "💯", "🎉", "❤️", "🚀", "🍕"];
// 🎵 Ensure this file exists in your public/sounds folder
const RINGTONE_URL = "/sounds/time_rebel.mp3"; 

// --- 📅 HELPER: SMART DATE FORMATTER ---
const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) {
    return "Today";
  } else if (msgDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else if (now.getTime() - msgDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString();
  }
};

// --- 📞 HELPER: ROOM ID GENERATOR ---
const getDirectRoomId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('-');
};

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // --- STATE: CHAT ---
  const [socket, setSocket] = useState<any>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [activeChatId, setActiveChatId] = useState<string>("");

  // Search & Preferences
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<string[]>([]);

  // Input State
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Typing State
  const [isTyping, setIsTyping] = useState(false);
  const [whoIsTyping, setWhoIsTyping] = useState<string | null>(null);

  // UI Toggles
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);

  // --- STATE: CALLING ---
  const [incomingCall, setIncomingCall] = useState<{ callerId: string, callerName: string, isVideo: boolean, roomId: string } | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callToken, setCallToken] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [startWithVideo, setStartWithVideo] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 👇 FIXED: Declared ringtoneRef here
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // --- 1. INITIALIZE SOCKET & LISTENERS ---
  useEffect(() => {
    if (!isLoaded || !user) return;

    const newSocket = io("http://localhost:3000", { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected as:", user.id);
      newSocket.emit("join", user.id);
    });

    // --- CHAT LISTENERS ---
    newSocket.on("receive_message", (msg: any) => {
      const formattedMsg: Message = {
        id: msg.id || Date.now().toString(),
        text: msg.text || msg.content,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: formatDateLabel(new Date().toISOString()),
        type: msg.type || "text",
        status: "read"
      };

      const targetChatId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      addMessageToState(targetChatId, formattedMsg);

      if (msg.senderId === activeChatId) {
        setWhoIsTyping(null);
      }
    });

    newSocket.on("user_status_update", ({ userId, status }: any) => {
      setContacts(prev => prev.map(c => c.id === userId ? { ...c, status } : c));
    });

    newSocket.on("current_online_list", (onlineIds: string[]) => {
      setContacts(prev => prev.map(c => onlineIds.includes(c.id) ? { ...c, status: "Online" } : { ...c, status: "Offline" }));
    });

    newSocket.on("display_typing", ({ senderId }: any) => {
       if (senderId === activeChatId) setWhoIsTyping(senderId);
    });

    newSocket.on("hide_typing", ({ senderId }: any) => {
       if (senderId === activeChatId) setWhoIsTyping(null);
    });

    // --- CALL LISTENERS ---
    // Listener for incoming call notification
    newSocket.on("incoming_call", (data: any) => {
        if (!isInCall) {
            setIncomingCall(data);
            // 👇 FIXED: Play sound safely
            if (ringtoneRef.current) {
                ringtoneRef.current.play()
                    .catch(e => console.warn("Ringtone failed (check public folder):", e));
            }
        }
    });

    // Listener for when the callee accepts the call
    newSocket.on("call_accepted", async ({ roomId }: any) => {
        stopRingtone();
        await joinLiveKitRoom(roomId);
    });

    // Listener for when the other party ends the call
    newSocket.on("call_ended", () => {
        stopRingtone();
        setIsInCall(false);
        setCallToken("");
        setIncomingCall(null);
    });

    return () => { 
        newSocket.disconnect(); 
        stopRingtone();
    };
  }, [isLoaded, user, activeChatId, isInCall]);

  // --- 2. FETCH DATA ON LOAD ---
  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/users");
        const userData = await userRes.json();
        if (Array.isArray(userData)) setContacts(userData);

        const prefRes = await fetch("/api/user/preferences");
        if (prefRes.ok) {
            const prefData = await prefRes.json();
            if (prefData) {
              setPinnedIds(prefData.pinnedChatIds || []);
              setMutedIds(prefData.mutedChatIds || []);
            }
        }
      } catch (err) {
        console.error("Failed to load data", err);
      }
    }
    loadData();
  }, []);

  // --- 3. FETCH HISTORY ---
  useEffect(() => {
    if (!activeChatId || !user) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?partnerId=${activeChatId}`);
        const data = await res.json();

        if (!Array.isArray(data)) return;

        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: formatDateLabel(msg.createdAt),
          type: msg.type as any,
          status: "read"
        }));

        setConversations(prev => ({
          ...prev,
          [activeChatId]: formattedMessages
        }));
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };

    fetchHistory();
  }, [activeChatId, user]);

  // --- 4. CALL FUNCTIONS ---

  const stopRingtone = () => {
      if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
      }
  };

  const joinLiveKitRoom = async (roomId: string) => {
      try {
          const resp = await fetch(`/api/livekit/token?room=${roomId}&username=${user?.fullName}`);
          const data = await resp.json();
          if (data.token) {
              setCallToken(data.token);
              setCurrentRoomId(roomId);
              setIsInCall(true);
              setIncomingCall(null);
          }
      } catch (e) {
          console.error("Failed to get token:", e);
      }
  };

  const initiateCall = async (isVideo: boolean) => {
    if (!activeChatId || !user || !socket) return;
    const roomId = getDirectRoomId(user.id, activeChatId);
    setStartWithVideo(isVideo);

    socket.emit("outgoing_call", {
        callerId: user.id,
        calleeId: activeChatId,
        callerName: user.fullName,
        isVideo,
        roomId
    });

    await joinLiveKitRoom(roomId);
  };

  const answerCall = async () => {
    if(!incomingCall || !user || !socket) return;
    stopRingtone();
    const roomId = incomingCall.roomId;
    setStartWithVideo(incomingCall.isVideo);

    socket.emit("call_accepted_signal", {
        callerId: incomingCall.callerId,
        roomId
    });

    await joinLiveKitRoom(roomId);
  };

  const declineCall = () => {
      stopRingtone();
      setIncomingCall(null);
  };

  const handleLocalDisconnect = () => {
      if (socket) {
          let partnerId = activeChatId;
          if (incomingCall && incomingCall.callerId) partnerId = incomingCall.callerId;

          if (partnerId) {
             socket.emit("end_call", { to: partnerId });
          }
      }
      stopRingtone();
      setIsInCall(false);
      setCallToken("");
  };

  // --- 5. CHAT ACTIONS ---
  const handleChatAction = async (action: "pin" | "mute" | "delete") => {
    if (!activeChatId) return;

    try {
      if (action === "pin") {
        setPinnedIds(prev => prev.includes(activeChatId) ? prev.filter(id => id !== activeChatId) : [...prev, activeChatId]);
      }
      if (action === "mute") {
        setMutedIds(prev => prev.includes(activeChatId) ? prev.filter(id => id !== activeChatId) : [...prev, activeChatId]);
      }
      if (action === "delete") {
        setConversations(prev => ({ ...prev, [activeChatId]: [] }));
        setActiveChatId("");
      }
      await axios.post("/api/chat/actions", { action, targetId: activeChatId });
      setShowChatMenu(false);
    } catch (error) {
      console.error("Action failed", error);
    }
  };

  // --- HELPERS ---
  const addMessageToState = (chatId: string, msg: Message) => {
    setConversations(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), msg]
    }));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, activeChatId, whoIsTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !activeChatId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { senderId: user?.id, receiverId: activeChatId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop_typing", { senderId: user?.id, receiverId: activeChatId });
    }, 2000);
  };

  const sendMessagePayload = (content: string, type: "text" | "image" | "voice" | "sticker") => {
    if (!socket || !user) return;

    const now = new Date();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: content,
      senderId: user.id,
      receiverId: activeChatId,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: formatDateLabel(now.toISOString()),
      type: type,
      status: "sent"
    };

    addMessageToState(activeChatId, newMessage);
    socket.emit("send_message", newMessage);

    socket.emit("stop_typing", { senderId: user.id, receiverId: activeChatId });
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    sendMessagePayload(inputText, "text");
    setInputText("");
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => sendMessagePayload(reader.result as string, "image");
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => sendMessagePayload(reader.result as string, "voice");
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Microphone access denied"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- RENDER PREP ---
  const filteredContacts = contacts
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const isAPinned = pinnedIds.includes(a.id);
      const isBPinned = pinnedIds.includes(b.id);
      return (isAPinned === isBPinned) ? 0 : isAPinned ? -1 : 1;
    });

  const activeContact = contacts.find(c => c.id === activeChatId) || { id: "", name: "Select a Chat", avatar: "", color: "", status: "", lastSeen: "" };
  const activeMessages = conversations[activeChatId] || [];
  const myRealId = user?.id;
  const isPinned = pinnedIds.includes(activeChatId);
  const isMuted = mutedIds.includes(activeChatId);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl relative">
      
      {/* 👇 FIXED: Audio element to play the ringtone */}
      <audio ref={ringtoneRef} src={RINGTONE_URL} loop />

      {/* --- SIDEBAR --- */}
      <div className={cn("w-full md:w-80 h-full border-r border-white/10 flex flex-col bg-black/20", activeChatId ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b border-white/10 relative">
          <Search className="absolute left-7 top-6 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.map((contact) => (
             <div key={contact.id} onClick={() => setActiveChatId(contact.id)} className={cn("p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 relative", activeChatId === contact.id ? "bg-white/10 border-l-2 border-l-indigo-500" : "border-l-2 border-l-transparent")}>
                <div className="relative">
                   <img 
                     src={contact.avatar} 
                     alt={contact.name} 
                     className={cn("w-12 h-12 rounded-full object-cover bg-gradient-to-tr", contact.color)} 
                   />
                   {contact.status === "Online" && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#1a1a1a]" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                   <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                        {contact.name}
                        {pinnedIds.includes(contact.id) && <Pin className="w-3 h-3 text-white/50 rotate-45" />}
                        {mutedIds.includes(contact.id) && <BellOff className="w-3 h-3 text-white/50" />}
                      </h4>
                      <span className="text-[10px] text-white/40">{contact.lastSeen || "now"}</span>
                   </div>
                   <p className="text-xs text-white/50 truncate">Tap to chat</p>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* --- CHAT AREA --- */}
      <div className={cn("flex-1 flex flex-col bg-transparent h-full relative", !activeChatId ? "hidden md:flex" : "flex")}>

        {activeChatId ? (
          <>
            {/* HEADER */}
            <div className="h-16 px-4 md:px-6 border-b border-white/10 flex items-center justify-between bg-black/20 z-20">
              <div className="flex items-center gap-3">
                 <button onClick={() => setActiveChatId("")} className="md:hidden text-white/60 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                 <img 
                   src={activeContact.avatar} 
                   alt={activeContact.name}
                   className={cn("w-10 h-10 rounded-full object-cover bg-gradient-to-tr", activeContact.color)}
                 />
                 <div>
                   <h3 className="font-bold text-white text-base">{activeContact.name}</h3>
                   <p className={cn("text-xs flex items-center gap-1.5", activeContact.status === "Online" ? "text-green-400" : "text-white/40")}>
                     {whoIsTyping === activeChatId ? (
                        <span className="text-indigo-400 font-bold animate-pulse">Typing...</span>
                     ) : (
                        <>
                          <span className={cn("w-1.5 h-1.5 rounded-full", activeContact.status === "Online" ? "bg-green-400 animate-pulse" : "bg-gray-400")} />
                          {activeContact.status}
                        </>
                     )}
                   </p>
                 </div>
              </div>

              <div className="flex items-center gap-1 text-white/60">
                 <button onClick={() => initiateCall(false)} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                 <button onClick={() => initiateCall(true)} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors"><Video className="w-5 h-5" /></button>

                 <div className="relative">
                   <button onClick={() => setShowChatMenu(!showChatMenu)} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
                   {showChatMenu && (
                     <div className="absolute top-10 right-0 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 p-1 animate-in zoom-in-95">
                       <button onClick={() => handleChatAction("mute")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg">
                         {isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                         {isMuted ? "Unmute Notifications" : "Mute Notifications"}
                       </button>
                       <button onClick={() => handleChatAction("pin")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg">
                         {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                         {isPinned ? "Unpin Chat" : "Pin Chat"}
                       </button>
                       <button onClick={() => handleChatAction("delete")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg">
                         <Trash2 className="w-4 h-4" /> Delete Chat
                       </button>
                     </div>
                   )}
                 </div>
              </div>
            </div>

            {/* MESSAGES LIST */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
              {activeMessages.map((m, i) => {
                const isMe = m.senderId === myRealId;
                const showDate = i === 0 || activeMessages[i-1].date !== m.date;

                return (
                  <React.Fragment key={m.id}>
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <span className="bg-black/40 border border-white/5 text-white/40 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-semibold">
                          {m.date}
                        </span>
                      </div>
                    )}

                    <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div className={cn("max-w-[85%] md:max-w-[65%] p-3 rounded-2xl text-sm relative group shadow-md transition-all", isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-[#252525] text-white/90 rounded-tl-none border border-white/5")}>
                        {m.type === 'image' && <img src={m.text} alt="Shared" className="rounded-lg max-h-60 w-auto object-cover cursor-pointer hover:opacity-90" />}
                        {m.type === 'sticker' && <span className="text-5xl block p-2 hover:scale-110 transition-transform cursor-pointer">{m.text}</span>}
                        {m.type === 'voice' && <audio controls src={m.text} className="h-8 w-48 md:w-60 accent-indigo-500" />}
                        {m.type === 'text' && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}

                        <div className="flex items-center justify-end gap-1 mt-1 opacity-50 select-none">
                          <span className="text-[10px] font-medium">{m.time}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md relative z-30">
               {/* ... (Emoji & Sticker pickers remain same) ... */}
               {showEmojiPicker && (
                 <div className="absolute bottom-20 left-4 z-50 animate-in slide-in-from-bottom-5 fade-in">
                   <EmojiPicker theme="dark" onEmojiClick={(e) => setInputText(p => p + e.emoji)} />
                 </div>
               )}
               {showStickerPicker && (
                 <div className="absolute bottom-20 left-16 z-50 bg-[#1a1a1a] p-3 rounded-xl border border-white/10 shadow-2xl grid grid-cols-5 gap-2 animate-in slide-in-from-bottom-5 fade-in w-64">
                   {STICKERS.map(s => (
                     <button key={s} onClick={() => { sendMessagePayload(s, "sticker"); setShowStickerPicker(false); }} className="text-3xl hover:bg-white/10 p-2 rounded-lg transition-colors">{s}</button>
                   ))}
                 </div>
               )}

               <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-2 py-2 shadow-inner focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={cn("p-2 rounded-full transition-colors", showEmojiPicker ? "text-yellow-400 bg-white/10" : "text-white/50 hover:text-yellow-400 hover:bg-white/5")}><Smile className="w-6 h-6" /></button>
                  <button onClick={() => setShowStickerPicker(!showStickerPicker)} className={cn("p-2 rounded-full transition-colors", showStickerPicker ? "text-pink-400 bg-white/10" : "text-white/50 hover:text-pink-400 hover:bg-white/5")}><Sticker className="w-5 h-5" /></button>
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white/50 hover:text-blue-400 hover:bg-white/5 rounded-full transition-colors"><Paperclip className="w-5 h-5" /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                  <input
                    type="text"
                    className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm py-2 min-w-0"
                    placeholder={isRecording ? "Listening..." : "Message..."}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isRecording}
                  />

                  {inputText.trim() ? (
                    <button onClick={handleSendMessage} className="p-2.5 rounded-xl bg-indigo-600 text-white hover:scale-105 transition-transform shadow-lg shadow-indigo-500/25"><Send className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={isRecording ? stopRecording : startRecording} className={cn("p-2 rounded-full transition-all duration-300", isRecording ? "bg-red-500 text-white animate-pulse scale-110 shadow-lg shadow-red-500/50" : "text-white/50 hover:text-red-400 hover:bg-white/5")}>
                      {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/30 flex-col gap-2">
            <Search className="w-10 h-10 opacity-50" />
            <p>Select a chat or search for a user to start</p>
          </div>
        )}
      </div>

       {/* --- INCOMING CALL POPUP --- */}
       {incomingCall && !isInCall && (
         <div className="fixed bottom-4 right-4 z-50 bg-[#1a1a1a] p-4 rounded-2xl shadow-2xl border border-green-500/30 flex flex-col items-center gap-3 w-72 animate-in slide-in-from-bottom-10">
             <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
                <PhoneIncoming className="w-6 h-6 text-green-500" />
             </div>
             <div className="text-center">
                 <h3 className="text-lg font-bold text-white">{incomingCall.callerName}</h3>
                 <p className="text-white/50 text-xs">Incoming {incomingCall.isVideo ? "Video" : "Voice"} Call...</p>
             </div>
             <div className="flex gap-2 w-full">
                 <button onClick={declineCall} className="flex-1 py-2 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition text-sm">
                    Decline
                 </button>
                 <button onClick={answerCall} className="flex-1 py-2 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition shadow-lg shadow-green-500/20 text-sm">
                    Answer
                 </button>
             </div>
         </div>
       )}

       {/* --- LIVEKIT CALL OVERLAY --- */}
       {isInCall && callToken && (
         <CallOverlay1on1
            token={callToken}
            roomName={currentRoomId}
            onDisconnect={handleLocalDisconnect}
            initialVideoEnabled={startWithVideo}
         />
       )}

    </div>
  );
}