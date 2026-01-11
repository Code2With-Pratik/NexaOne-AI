import React, { useState, useEffect } from 'react';
import { useRoomContext, useChat } from '@livekit/components-react';
import { Send, X } from 'lucide-react';

export default function InCallChatSidebar({ onClose }: { onClose: () => void }) {
  // LiveKit's useChat hook handles sending/receiving data messages
  const { send, chatMessages, isSending } = useChat();
  const [message, setMessage] = useState('');
  const room = useRoomContext();

  const onSend = async () => {
    if (!message.trim() || isSending) return;
    await send(message);
    setMessage('');
  };

  return (
    <div className="w-80 bg-[#1a1a1a] border-l border-white/10 flex flex-col h-full animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-white font-bold">Group Chat</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatMessages.map((msg, i) => {
          const isMe = msg.from?.identity === room.localParticipant.identity;
          return (
            <div key={msg.timestamp + i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                <p className="font-bold text-xs mb-1 opacity-70">{msg.from?.name || 'Guest'}</p>
                <p>{msg.message}</p>
              </div>
               <span className="text-[10px] text-white/30 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Write a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-white focus:outline-none focus:border-indigo-500"
        />
        <button onClick={onSend} disabled={!message.trim()} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}