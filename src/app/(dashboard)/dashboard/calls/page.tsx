"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
// import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Video, History, Plus, ArrowRight } from 'lucide-react';

// Dummy data for logs - replace with real API fetch
const dummyLogs = [
    { id: '1', type: 'VIDEO', initiator: 'Alice', status: 'COMPLETED', date: 'Today, 10:30 AM', duration: '15m' },
    { id: '2', type: 'AUDIO', initiator: 'You', receiver: 'Bob', status: 'MISSED', date: 'Yesterday', duration: '0s' },
];

export default function CallsDashboardPage() {
    const { user } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'meet' | 'logs'>('meet');
    const [joinRoomId, setJoinRoomId] = useState('');

    const startNewMeeting = () => {
        // 👇 FIX: Use native browser UUID (No library needed)
        const newRoomId = crypto.randomUUID().slice(0, 8); 
        
        console.log("Generated Room ID:", newRoomId); // Debug check

        if (newRoomId) {
            router.push(`/dashboard/calls/${newRoomId}?host=true`);
        } else {
            alert("Failed to generate Room ID");
        }
    };

    const joinMeeting = () => {
        if(!joinRoomId.trim()) return;
        router.push(`/dashboard/calls/${joinRoomId}`);
    };

  return (
    <div className="h-[calc(100vh-6rem)] bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden flex">
        {/* Sidebar navigation for tabs */}
        <div className="w-64 bg-black/20 border-r border-white/10 p-4 flex flex-col gap-2">
            <button onClick={() => setActiveTab('meet')} className={cn("flex items-center gap-3 p-3 rounded-xl text-left transition-colors", activeTab === 'meet' ? "bg-indigo-600 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}>
                <Video className="w-5 h-5" /> Start or Join
            </button>
            <button onClick={() => setActiveTab('logs')} className={cn("flex items-center gap-3 p-3 rounded-xl text-left transition-colors", activeTab === 'logs' ? "bg-indigo-600 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}>
                <History className="w-5 h-5" /> Call Logs
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            
            {/* TAB 1: START / JOIN */}
            {activeTab === 'meet' && (
                <div className="max-w-2xl mx-auto space-y-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Video Meetings</h1>
                        <p className="text-white/50">Create a new secure meeting room or join an existing one.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Start New */}
                        <div onClick={startNewMeeting} className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-6 rounded-3xl cursor-pointer group hover:border-indigo-400 transition-all">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">New Meeting</h3>
                            <p className="text-white/50 text-sm">Create a new room and invite others via link or ID.</p>
                        </div>

                        {/* Join Existing */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                                <ArrowRight className="w-8 h-8 text-white" />
                            </div>
                             <h3 className="text-xl font-bold text-white mb-4">Join Meeting</h3>
                             <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter Room ID"
                                    value={joinRoomId}
                                    onChange={(e) => setJoinRoomId(e.target.value)}
                                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 flex-1"
                                />
                                <button onClick={joinMeeting} disabled={!joinRoomId} className="bg-indigo-600 px-6 rounded-xl font-bold text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors">
                                    Join
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CALL LOGS */}
            {activeTab === 'logs' && (
                <div className="max-w-3xl mx-auto">
                     <h1 className="text-2xl font-bold text-white mb-8">Recent Calls</h1>
                     <div className="space-y-2">
                        {dummyLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", log.status === 'MISSED' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500')}>
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold">{log.initiator === 'You' ? `To: ${log.receiver}` : `From: ${log.initiator}`} <span className="text-xs text-white/40 ml-2">({log.type})</span></h4>
                                        <p className="text-white/40 text-sm">{log.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className={cn("text-sm font-medium", log.status === 'MISSED' ? 'text-red-400' : 'text-white/70')}>{log.status}</p>
                                     <p className="text-white/40 text-xs">{log.duration}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    </div>
  );
}