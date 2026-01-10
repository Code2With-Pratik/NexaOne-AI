"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Phone, Video, MoreVertical, Send, Paperclip, Mic, Smile, CheckCheck, 
  Trash2, BellOff, Pin, X, StopCircle, Sticker, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/nextjs"; // Import Clerk
import { useRouter } from "next/navigation";

// --- TYPES ---
type Message = {
  id: string; // Database IDs are Strings (UUID)
  text: string; 
  senderId: string; // Clerk IDs are Strings
  receiverId: string;
  time: string;
  date: string;
  type: "text" | "image" | "voice" | "sticker";
  status: "sent" | "delivered" | "read";
};

type Contact = {
  id: string; // Contact IDs must be strings now
  name: string;
  avatar: string;
  color: string;
  status: "Online" | "Offline";
  lastSeen: string;
};

// --- CONFIG ---
const STICKERS = ["👻", "🤖", "👽", "🦄", "🔥", "💯", "🎉", "❤️", "🚀", "🍕"];

// Mock contacts (IDs match the 'seed' data we created: "1", "2")
const initialContacts: Contact[] = [
  { id: "1", name: "Alice Freeman", avatar: "A", color: "from-indigo-500 to-purple-500", status: "Online", lastSeen: "now" },
  { id: "2", name: "Team Rocket", avatar: "T", color: "from-pink-500 to-rose-500", status: "Online", lastSeen: "now" },
  { id: "3", name: "John Doe", avatar: "J", color: "from-blue-500 to-cyan-500", status: "Offline", lastSeen: "Yesterday" },
];

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser(); // Get Real User
  
  // --- STATE ---
  const [socket, setSocket] = useState<any>(null);
  // 1. Change State to start empty
const [contacts, setContacts] = useState<Contact[]>([]); 

// ... existing socket useEffect ...

// 2. Add this NEW useEffect to fetch users
useEffect(() => {
  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setContacts(data);
        // Optional: Auto-select the first user
        // setActiveChatId(data[0].id); 
      }
    } catch (err) {
      console.error("Failed to load users", err);
    }
  }

  loadUsers();
}, []); // Runs once when page loads
  // Conversations key is now String (Contact ID)
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [activeChatId, setActiveChatId] = useState<string>("1"); // Default to "1" (Alice)
  
  // Input State
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  // UI Toggles
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- 1. INITIALIZE SOCKET & LISTENERS ---
  useEffect(() => {
    // Only connect if user is loaded and logged in
    if (!isLoaded || !user) return;

    const newSocket = io("http://localhost:3000", { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected as:", user.id);
      newSocket.emit("join", user.id); // Join with Real Clerk ID
    });

    // Handle Incoming Messages
    newSocket.on("receive_message", (msg: any) => {
      const formattedMsg: Message = {
        id: msg.id || Date.now().toString(),
        text: msg.text || msg.content,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: "Today",
        type: msg.type || "text",
        status: "read"
      };
      
      // Determine which chat this message belongs to
      // If I sent it, it goes to receiver's chat. If I received it, it goes to sender's chat.
      const targetChatId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      addMessageToState(targetChatId, formattedMsg);
    });

    newSocket.on("user_status_change", ({ userId, status }: any) => {
      setContacts(prev => prev.map(c => c.id === userId ? { ...c, status } : c));
    });

    return () => { newSocket.disconnect(); };
  }, [isLoaded, user]); // Re-run when user loads

  // --- 2. FETCH HISTORY FROM DB ---
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
          senderId: msg.senderId, // Keep as String
          receiverId: msg.receiverId, // Keep as String
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(msg.createdAt).toDateString() === new Date().toDateString() ? "Today" : new Date(msg.createdAt).toLocaleDateString(),
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

  // --- 3. AUTO-SCROLL ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, activeChatId]);

  // --- HELPER: ADD MSG TO STATE ---
  const addMessageToState = (chatId: string, msg: Message) => {
    setConversations(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), msg]
    }));
  };

  // --- 4. SENDING LOGIC ---
  const sendMessagePayload = (content: string, type: "text" | "image" | "voice" | "sticker") => {
    if (!socket || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(), // Temp ID
      text: content,
      senderId: user.id, // Real Clerk ID
      receiverId: activeChatId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: "Today",
      type: type,
      status: "sent"
    };

    // Optimistic UI Update
    addMessageToState(activeChatId, newMessage);
    
    // Send to Server
    socket.emit("send_message", newMessage);
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

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => sendMessagePayload(reader.result as string, "voice");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- 5. RENDER HELPERS ---
  // Fallback to a dummy object if no contact is found (prevents crash)
const activeContact = contacts.find(c => c.id === activeChatId) || contacts[0] || {
  id: "",
  name: "Select a Chat",
  avatar: "?",
  color: "from-gray-700 to-gray-800",
  status: "Offline",
  lastSeen: ""
};
  const activeMessages = conversations[activeChatId] || [];
  const myRealId = user?.id;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl">
      
      {/* --- LEFT: SIDEBAR --- */}
      <div className={cn("w-full md:w-80 h-full border-r border-white/10 flex flex-col bg-black/20", activeChatId ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b border-white/10 relative">
          <Search className="absolute left-7 top-6 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search chats..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.map((contact) => {
             const msgs = conversations[contact.id] || [];
             const lastMsg = msgs[msgs.length - 1];
             return (
               <div key={contact.id} onClick={() => setActiveChatId(contact.id)} className={cn("p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 relative", activeChatId === contact.id ? "bg-white/10 border-l-2 border-l-indigo-500" : "border-l-2 border-l-transparent")}>
                  <div className="relative">
                     <div className={cn("w-12 h-12 rounded-full bg-gradient-to-tr flex items-center justify-center font-bold text-lg text-white", contact.color)}>{contact.avatar}</div>
                     {contact.status === "Online" && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#1a1a1a]" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-semibold text-white text-sm">{contact.name}</h4>
                        <span className="text-[10px] text-white/40">{lastMsg?.time || contact.lastSeen}</span>
                     </div>
                     <p className="text-xs text-white/50 truncate flex items-center gap-1">
                        {lastMsg?.type === 'image' && <span className="text-xs">📷 Photo</span>}
                        {lastMsg?.type === 'voice' && <span className="text-xs">🎤 Voice</span>}
                        {lastMsg?.type === 'text' && lastMsg.text}
                        {!lastMsg && "Tap to start chatting"}
                     </p>
                  </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* --- RIGHT: CHAT AREA --- */}
      <div className={cn("flex-1 flex flex-col bg-transparent h-full relative", !activeChatId ? "hidden md:flex" : "flex")}>
        
        {/* HEADER */}
        <div className="h-16 px-4 md:px-6 border-b border-white/10 flex items-center justify-between bg-black/20 z-20">
          <div className="flex items-center gap-3">
             {/* Back Button for Mobile */}
             <button onClick={() => setActiveChatId("")} className="md:hidden text-white/60 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
             
             <div className={cn("w-10 h-10 rounded-full bg-gradient-to-tr flex items-center justify-center font-bold text-white", activeContact.color)}>{activeContact.avatar}</div>
             <div>
               <h3 className="font-bold text-white text-base">{activeContact.name}</h3>
               <p className={cn("text-xs flex items-center gap-1.5", activeContact.status === "Online" ? "text-green-400" : "text-white/40")}>
                 <span className={cn("w-1.5 h-1.5 rounded-full", activeContact.status === "Online" ? "bg-green-400 animate-pulse" : "bg-gray-400")} /> {activeContact.status}
               </p>
             </div>
          </div>
          
          <div className="flex items-center gap-1 text-white/60">
             <button onClick={() => router.push('/dashboard/video-call')} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
             <button onClick={() => router.push('/dashboard/video-call')} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
             
             <div className="relative">
               <button onClick={() => setShowChatMenu(!showChatMenu)} className="hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
               {showChatMenu && (
                 <div className="absolute top-10 right-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 p-1 animate-in zoom-in-95">
                   <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg"><BellOff className="w-4 h-4" /> Mute Notifications</button>
                   <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg"><Pin className="w-4 h-4" /> Pin Chat</button>
                   <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /> Delete Chat</button>
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
                    <span className="bg-black/40 border border-white/5 text-white/40 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">{m.date}</span>
                  </div>
                )}
                
                <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] md:max-w-[65%] p-3 rounded-2xl text-sm relative group shadow-md transition-all",
                    isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-[#252525] text-white/90 rounded-tl-none border border-white/5"
                  )}>
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
           
           {/* Popups */}
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
                onChange={(e) => setInputText(e.target.value)} 
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

      </div>
    </div>
  );
}