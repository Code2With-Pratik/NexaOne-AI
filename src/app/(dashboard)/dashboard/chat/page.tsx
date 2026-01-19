"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Phone, Video, MoreVertical, Send, Paperclip, Mic, Smile, CheckCheck,
  Trash2, BellOff, Pin, ArrowLeft, FileText, Download, Sticker, UserX
} from "lucide-react";
import { cn } from '@/lib/utils';
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import CallOverlay1on1 from "@/components/calls/CallOverlay1on1";
import { useSocket } from "@/providers/SocketProvider";
import VoiceMessage from "@/components/chat/VoiceMessage"; 

// --- TYPES ---
type MessageType = "text" | "image" | "voice" | "sticker" | "file";

type Message = {
  id: string; text: string; senderId: string; receiverId: string;
  time: string; date: string; type: MessageType; fileName?: string; status: "sent" | "delivered" | "read";
};

type Contact = {
  id: string; name: string; avatar: string; color: string;
  status: "Online" | "Offline"; lastSeen: string; lastMessage?: string;
};

// Simple Modal Component for Call Status
const CallStatusModal = ({ status, onClose }: { status: "rejected" | "busy" | "timeout", onClose: () => void }) => (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <UserX className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1">
                    {status === "busy" ? "Line Busy" : status === "timeout" ? "No Answer" : "Call Rejected"}
                </h3>
                <p className="text-white/50 text-sm">
                    {status === "busy" ? "The user is currently in another call." : "The user is not available at the moment."}
                </p>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors">
                Close
            </button>
        </div>
    </div>
);

const STICKERS = ["👻", "🤖", "👽", "🦄", "🔥", "💯", "🎉", "❤️", "🚀", "🍕"];

// --- HELPERS ---
const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (msgDate.getTime() === today.getTime()) return "Today";
  if (msgDate.getTime() === yesterday.getTime()) return "Yesterday";
  if (now.getTime() - msgDate.getTime() < 7 * 24 * 60 * 60 * 1000) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString();
};
const getDirectRoomId = (id1: string, id2: string) => { return [id1, id2].sort().join('-'); };

export default function ChatPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { socket, onlineUsers } = useSocket(); 

  // --- STATE ---
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<string[]>([]);

  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [whoIsTyping, setWhoIsTyping] = useState<string | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Call State
  const [isInCall, setIsInCall] = useState(false);
  const [callToken, setCallToken] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [startWithVideo, setStartWithVideo] = useState(false);
  const [currentLogId, setCurrentLogId] = useState<string>("");
  
  // Call Status Logic for Popup
  const [callStatusPopup, setCallStatusPopup] = useState<"rejected" | "busy" | "timeout" | null>(null);

  // 👇 NEW: Ref to track if call is accepted (Solves the auto-disconnect bug)
  const isCallAcceptedRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. AUTO-JOIN ---
  useEffect(() => {
    const autoJoin = searchParams.get("autoJoin");
    const roomParam = searchParams.get("roomId");
    const videoParam = searchParams.get("isVideo") === "true";
    const logIdParam = searchParams.get("logId");

    if (autoJoin && roomParam && socket && user) {
        console.log("🚀 Auto-joining call...");
        setCurrentRoomId(roomParam);
        setStartWithVideo(videoParam);
        if(logIdParam) setCurrentLogId(logIdParam);
        joinLiveKitRoom(roomParam);
        window.history.replaceState({}, '', '/dashboard/chat');
    }
  }, [searchParams, socket, user]);

  // --- 2. LOAD DATA ---
  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/users");
        const userData = await userRes.json();
        if (Array.isArray(userData)) setContacts(userData);
        const prefRes = await fetch("/api/user/preferences");
        if (prefRes.ok) {
            const prefData = await prefRes.json();
            if (prefData) { setPinnedIds(prefData.pinnedChatIds || []); setMutedIds(prefData.mutedChatIds || []); }
        }
      } catch (err) { console.error("Load failed", err); }
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
        
        const formattedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id, 
          text: msg.content, 
          senderId: msg.senderId, 
          receiverId: msg.receiverId,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: formatDateLabel(msg.createdAt), 
          type: msg.type as MessageType, 
          status: "read", 
          fileName: msg.fileName
        }));
        
        setConversations(prev => ({ ...prev, [activeChatId]: formattedMessages }));
        if(socket) socket.emit("mark_messages_read", { senderId: activeChatId, receiverId: user.id });
      } catch (err) { console.error(err); }
    };
    fetchHistory();
  }, [activeChatId, user, socket]);

  // --- 4. SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (msg: any) => {
      const formattedMsg: Message = {
        id: msg.id || Date.now().toString(), text: msg.text || msg.content, senderId: msg.senderId, receiverId: msg.receiverId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date: formatDateLabel(new Date().toISOString()), 
        type: (msg.type as MessageType) || "text", status: "delivered", fileName: msg.fileName
      };
      
      const targetChatId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      addMessageToState(targetChatId, formattedMsg);
      if (msg.senderId === activeChatId) setWhoIsTyping(null);

      // Update Sidebar
      let preview = msg.text;
      if (msg.type === "image") preview = "Sent an image";
      if (msg.type === "voice") preview = "Sent a voice note";
      if (msg.type === "file") preview = "Sent a file";
      setLastMessages(prev => ({ ...prev, [msg.senderId]: preview }));

      if (msg.senderId === activeChatId) {
          socket.emit("mark_messages_read", { senderId: msg.senderId, receiverId: user.id });
      }
    };

    const handleReadUpdate = ({ receiverId }: { receiverId: string }) => {
        if (receiverId === activeChatId) {
             setConversations(prev => {
                 const msgs = prev[activeChatId] || [];
                 return { ...prev, [activeChatId]: msgs.map(m => m.status !== 'read' ? { ...m, status: 'read' } : m) };
             });
        }
    };

    const handleCallAccepted = async ({ roomId }: any) => { 
        // 👇 FIX: Mark call as accepted so timeout doesn't kill it
        isCallAcceptedRef.current = true;
        await joinLiveKitRoom(roomId); 
    };
    
    const handleCallEnded = () => { 
        setIsInCall(false); 
        setCallToken(""); 
        setCurrentLogId("");
        isCallAcceptedRef.current = false;
    };

    const handleCallSuccess = ({ logId }: any) => { setCurrentLogId(logId); };
    
    // Handle Rejection with Popup
    const handleCallRejected = () => { 
        setIsInCall(false); 
        setCallToken(""); 
        setCurrentLogId(""); 
        setCallStatusPopup("rejected");
        isCallAcceptedRef.current = false;
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_read_update", handleReadUpdate);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_sent_success", handleCallSuccess);
    socket.on("call_rejected", handleCallRejected);
    socket.on("display_typing", ({ senderId }: any) => { if (senderId === activeChatId) setWhoIsTyping(senderId); });
    socket.on("hide_typing", ({ senderId }: any) => { if (senderId === activeChatId) setWhoIsTyping(null); });

    return () => { 
        socket.off("receive_message", handleReceiveMessage);
        socket.off("messages_read_update", handleReadUpdate);
        socket.off("call_accepted", handleCallAccepted);
        socket.off("call_ended", handleCallEnded);
        socket.off("call_sent_success", handleCallSuccess);
        socket.off("call_rejected", handleCallRejected);
    };
  }, [socket, user, activeChatId]);

  // --- HELPERS ---
  const joinLiveKitRoom = async (roomId: string) => {
      try {
          const resp = await fetch(`/api/livekit/token?room=${roomId}&username=${user?.fullName}`);
          const data = await resp.json();
          if (data.token) { setCallToken(data.token); setCurrentRoomId(roomId); setIsInCall(true); }
      } catch (e) { console.error("Failed to get token:", e); }
  };

  const initiateCall = async (isVideo: boolean) => {
    if (!activeChatId || !user || !socket) return;
    const roomId = getDirectRoomId(user.id, activeChatId);
    setStartWithVideo(isVideo);
    
    // 👇 Reset acceptance status before dialing
    isCallAcceptedRef.current = false;

    socket.emit("outgoing_call", { callerId: user.id, calleeId: activeChatId, callerName: user.fullName, isVideo, roomId });
    await joinLiveKitRoom(roomId);
    
    // 👇 FIX: Timeout logic checks the Ref instead of just blindly firing
    setTimeout(() => { 
        // Only trigger 'No Answer' if the call hasn't been accepted yet
        if (!isCallAcceptedRef.current) {
            setIsInCall(prev => { 
                if (prev) { 
                    setCallStatusPopup("timeout"); 
                    return false; // Close the overlay
                } 
                return prev; 
            }); 
        }
    }, 45000);
  };

  const handleLocalDisconnect = () => {
      if (socket) { socket.emit("end_call", { to: activeChatId, logId: currentLogId }); }
      setIsInCall(false); setCallToken(""); setCurrentLogId("");
      isCallAcceptedRef.current = false;
  };

  const handleChatAction = async (action: "pin" | "mute" | "delete") => {
    if (!activeChatId) return;
    try {
      if (action === "pin") setPinnedIds(prev => prev.includes(activeChatId) ? prev.filter(id => id !== activeChatId) : [...prev, activeChatId]);
      if (action === "mute") setMutedIds(prev => prev.includes(activeChatId) ? prev.filter(id => id !== activeChatId) : [...prev, activeChatId]);
      if (action === "delete") { setConversations(prev => ({ ...prev, [activeChatId]: [] })); setActiveChatId(""); }
      await axios.post("/api/chat/actions", { action, targetId: activeChatId });
      setShowChatMenu(false);
    } catch (error) { console.error("Action failed", error); }
  };

  const addMessageToState = (chatId: string, msg: Message) => {
    setConversations(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), msg] }));
  };

  const sendMessagePayload = (content: string, type: MessageType, fileName?: string) => {
    if (!socket || !user) return;
    const now = new Date();
    const newMessage: Message = {
      id: Date.now().toString(), text: content, senderId: user.id, receiverId: activeChatId,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date: formatDateLabel(now.toISOString()), 
      type: type, fileName: fileName, status: "sent"
    };
    addMessageToState(activeChatId, newMessage);
    socket.emit("send_message", { ...newMessage, senderName: user.fullName });
    socket.emit("stop_typing", { senderId: user.id, receiverId: activeChatId });
    setIsTyping(false);
  };

  // --- RECORDING LOGIC ---
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
        reader.onloadend = () => { sendMessagePayload(reader.result as string, "voice"); };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { console.error("Mic Error:", err); alert("Microphone access denied."); }
  };

  const cancelRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.onstop = null; 
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSendMessage = () => { if (!inputText.trim()) return; sendMessagePayload(inputText, "text"); setInputText(""); setShowEmojiPicker(false); };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
          const result = reader.result as string;
          if (file.type.startsWith("image/")) { sendMessagePayload(result, "image"); } 
          else { sendMessagePayload(result, "file", file.name); }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [conversations, activeChatId, whoIsTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !activeChatId) return;
    if (!isTyping) { setIsTyping(true); socket.emit("typing", { senderId: user?.id, receiverId: activeChatId }); }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { setIsTyping(false); socket.emit("stop_typing", { senderId: user?.id, receiverId: activeChatId }); }, 2000);
  };

  const contactsWithStatus = contacts.map(c => ({
      ...c,
      status: (onlineUsers.includes(c.id) ? "Online" : "Offline") as "Online" | "Offline",
      lastMessage: lastMessages[c.id] || "Tap to chat"
  }));

  const filteredContacts = contactsWithStatus
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
       const isAPinned = pinnedIds.includes(a.id);
       const isBPinned = pinnedIds.includes(b.id);
       return (isAPinned === isBPinned) ? 0 : isAPinned ? -1 : 1;
    });

  const activeContact = contactsWithStatus.find(c => c.id === activeChatId) || { id: "", name: "Select a Chat", avatar: "", color: "", status: "", lastSeen: "" };
  const activeMessages = conversations[activeChatId] || [];
  const myRealId = user?.id;
  const isPinned = pinnedIds.includes(activeChatId);
  const isMuted = mutedIds.includes(activeChatId);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-white/20 bg-black/10 backdrop-blur-xs shadow-2xl relative">
      
      {/* RENDER CALL STATUS MODAL */}
      {callStatusPopup && <CallStatusModal status={callStatusPopup} onClose={() => setCallStatusPopup(null)} />}

      {/* SIDEBAR */}
      <div className={cn("w-full md:w-80 h-full border-r-2 border-white/20 flex flex-col bg-black/20", activeChatId ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b border-white/10 relative">
          <Search className="absolute left-7 top-6 w-4 h-5 text-white/40" />
          <input type="text" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.map((contact) => (
             <div key={contact.id} onClick={() => setActiveChatId(contact.id)} className={cn("p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 relative", activeChatId === contact.id ? "bg-white/10 border-l-2 border-l-indigo-500" : "border-l-2 border-l-transparent")}>
                <div className="relative">
                   <img src={contact.avatar} alt={contact.name} className={cn("w-12 h-12 rounded-full object-cover bg-gradient-to-tr", contact.color)} />
                   {contact.status === "Online" && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#1a1a1a]" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                   <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                        {contact.name}
                        {pinnedIds.includes(contact.id) && <Pin className="w-4 h-4 text-white/50 rotate-45" />}
                        {mutedIds.includes(contact.id) && <BellOff className="w-4 h-4 text-white/50" />}
                      </h4>
                      <span className="text-[12px] text-white/40">{contact.lastSeen || "now"}</span>
                   </div>
                   <p className={cn("text-xs truncate", contact.lastMessage === "Tap to chat" ? "text-white/30 italic" : "text-white/80 font-medium")}>{contact.lastMessage}</p>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={cn("flex-1 flex flex-col bg-transparent h-full relative", !activeChatId ? "hidden md:flex" : "flex")}>
        
        {/* CALL OVERLAY */}
       {isInCall && callToken ? (
          <div className="absolute inset-0 z-50 bg-black w-full h-full">
              <CallOverlay1on1
                  token={callToken}
                  roomName={currentRoomId}
                  onDisconnect={handleLocalDisconnect}
                  initialVideoEnabled={startWithVideo}
                  // 👇 PASS THE ACTIVE CONTACT INFO HERE
                  userName={activeContact.name}
                  userAvatar={activeContact.avatar}
              />
          </div>
      ) : (
          activeChatId ? (
            <>
              {/* HEADER */}
              <div className="h-16 px-4 md:px-6 border-b-2 border-white/20 flex items-center justify-between bg-black/20 z-20">
                <div className="flex items-center gap-3">
                   <button onClick={() => setActiveChatId("")} className="md:hidden text-white/60 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                   <img src={activeContact.avatar} alt={activeContact.name} className={cn("w-10 h-10 rounded-full object-cover bg-gradient-to-tr", activeContact.color)} />
                   <div>
                     <h3 className="font-bold text-white text-base">{activeContact.name}</h3>
                     <p className={cn("text-xs flex items-center gap-1.5", activeContact.status === "Online" ? "text-green-400" : "text-white/40")}>
                       {whoIsTyping === activeChatId ? <span className="text-indigo-400 font-bold animate-pulse">Typing...</span> : <>{activeContact.status}</>}
                     </p>
                   </div>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                   <button onClick={() => initiateCall(false)} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full cursor-pointer"><Phone className="w-5 h-5" /></button>
                   <button onClick={() => initiateCall(true)} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full cursor-pointer"><Video className="w-5 h-5" /></button>
                   <div className="relative">
                     <button onClick={() => setShowChatMenu(!showChatMenu)} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full cursor-pointer"><MoreVertical className="w-5 h-5" /></button>
                     {showChatMenu && (
                       <div className="absolute top-10 right-0 w-32 bg-[#1a1a1ade] border border-white/10 rounded-xl shadow-2xl z-50 p-1 flex flex-col">
                         <button onClick={() => handleChatAction("mute")} className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><BellOff className="w-4 h-4 text-white/50" /><span>{isMuted ? "Unmute" : "Mute"}</span></button>
                         <button onClick={() => handleChatAction("pin")} className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><Pin className="w-4 h-4 text-white/50 rotate-45" /><span>{isPinned ? "Unpin" : "Pin"}</span></button>
                         <button onClick={() => handleChatAction("delete")} className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4 text-red-500" /><span>Delete</span></button>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 custom-scrollbar">
                {activeMessages.map((m, i) => {
                  const isMe = m.senderId === myRealId;
                  return (
                    <React.Fragment key={m.id}>
                      {(i === 0 || activeMessages[i-1].date !== m.date) && <div className="flex justify-center my-6"><span className="bg-black/40 border border-white/5 text-white/40 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-semibold">{m.date}</span></div>}
                      <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                        <div className={cn("max-w-[85%] md:max-w-[65%] p-3 rounded-2xl text-sm relative group shadow-md", isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-[#252525] text-white/90 rounded-tl-none border border-white/5")}>
                          {m.type === 'image' && <img src={m.text} alt="Shared" className="rounded-lg max-h-60 w-auto object-cover" />}
                          {m.type === 'sticker' && <span className="text-5xl block p-2">{m.text}</span>}
                          {m.type === 'voice' && <VoiceMessage src={m.text} isMe={isMe} />}
                          {m.type === 'file' && (
                             <a href={m.text} download={m.fileName || "document"} className="flex items-center gap-3 bg-black/20 p-3 rounded-lg hover:bg-black/30 transition text-white/90 no-underline">
                                 <div className="bg-white/10 p-2 rounded-lg"><FileText className="w-6 h-6 text-white" /></div>
                                 <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate max-w-[150px]">{m.fileName || "Document"}</p><p className="text-[10px] text-white/50">Click to download</p></div>
                                 <Download className="w-4 h-4 text-white/50" />
                             </a>
                          )}
                          {m.type === 'text' && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                          <div className="flex items-center justify-end gap-1 mt-1 opacity-50 select-none">
                              <span className="text-[10px] font-medium">{m.time}</span>
                              {isMe && <CheckCheck className={cn("w-3 h-3", m.status === 'read' ? "text-blue-400" : "text-white/50")} />}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* INPUT AREA */}
              <div className="p-4 bg-black/40 border-t border-white/10 relative z-30">
                 {showEmojiPicker && <div className="absolute bottom-20 left-4 z-50"><EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setInputText(p => p + e.emoji)} /></div>}
                 {showStickerPicker && <div className="absolute bottom-20 left-16 z-50 bg-[#1a1a1ad8] p-3 rounded-xl border border-white/10 shadow-2xl grid grid-cols-5 gap-2 w-64">{STICKERS.map(s => <button key={s} onClick={() => { sendMessagePayload(s, "sticker"); setShowStickerPicker(false); }} className="text-3xl hover:bg-white/10 p-2 rounded-lg">{s}</button>)}</div>}
                 
                 <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-2 py-2 shadow-inner transition-all">
                   {isRecording ? (
                      <div className="flex items-center justify-between w-full bg-[#1a1a1a] border border-red-500/20 p-2 rounded-full animate-in fade-in zoom-in duration-200 relative overflow-hidden">
                          {/* 👇 RESTORED: Original Wave Animation */}
                          <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />
                          <div className="flex items-center gap-2 pl-4 z-10">
                              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                              <span className="text-xs font-mono font-bold tracking-widest text-red-500">REC</span>
                          </div>
                          
                          <div className="flex items-center justify-center gap-1 h-8 flex-1 mx-4">
                              {/* Inject Style Tag here for the wave keyframes */}
                              <style>{`
                                  @keyframes wave {
                                      0%, 100% { height: 15%; opacity: 0.3; }
                                      50% { height: 70%; opacity: 1; }
                                  }
                              `}</style>
                              {[...Array(12)].map((_, i) => (
                                  <div 
                                      key={i} 
                                      className="w-1 bg-red-500 rounded-full opacity-80"
                                      style={{
                                          animation: `wave 1s ease-in-out infinite`,
                                          animationDelay: `${i * 0.1}s`,
                                          height: '100%' 
                                      }}
                                  />
                              ))}
                          </div>

                          <div className="flex items-center gap-3 pr-2 z-10">
                              <button onClick={cancelRecording} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"><Trash2 className="w-5 h-5" /></button>
                              <button onClick={stopRecording} className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"><Send className="w-4 h-4 ml-0.5 fill-current" /></button>
                          </div>
                      </div>
                   ) : (
                       <>
                           <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-white/50 hover:text-yellow-400 cursor-pointer"><Smile className="w-6 h-6" /></button>
                           <button onClick={() => setShowStickerPicker(!showStickerPicker)} className="p-2 text-white/50 hover:text-pink-400 cursor-pointer"><Sticker className="w-5 h-5" /></button>
                           <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white/50 hover:text-blue-400 cursor-pointer"><Paperclip className="w-5 h-5" /></button>
                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*, .pdf, .doc, .docx" onChange={handleFileUpload} />
                           <input type="text" className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm py-2 min-w-0" placeholder="Message..." value={inputText} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} />
                           {inputText.trim() ? (
                               <button onClick={handleSendMessage} className="p-2.5 rounded-xl bg-indigo-600 text-white cursor-pointer"><Send className="w-4 h-4" /></button>
                           ) : (
                               <button onClick={startRecording} className="p-2 rounded-full text-white/50 hover:text-red-400 hover:bg-white/5 transition cursor-pointer"><Mic className="w-5 h-5" /></button>
                           )}
                       </>
                   )}
                 </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30 flex-col gap-2">
              <Search className="w-10 h-10 opacity-50" />
              <p>Select a chat or search for a user to start</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}