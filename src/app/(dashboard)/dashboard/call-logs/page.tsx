"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { 
  PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff, Video, Phone, Clock, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to format date nicely
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  }).format(date);
};

export default function CallLogsPage() {
  const { user } = useUser();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/api/calls/history");
        setLogs(res.data);
      } catch (error) {
        console.error("Error fetching logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 h-full w-full bg-[#050505] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Call Logs</h1>
        <p className="text-white/50 mb-8">Recent voice and video call history.</p>
        
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
               <Phone className="w-12 h-12 text-white/20 mx-auto mb-4" />
               <p className="text-white/50">No recent calls found.</p>
            </div>
          ) : (
            logs.map((log) => {
              const isOutgoing = log.initiatorId === user?.id;
              // If outgoing, show receiver info. If incoming, show initiator info.
              const otherUser = isOutgoing ? log.receiver : log.initiator;
              
              // Status Logic
              let StatusIcon = isOutgoing ? PhoneOutgoing : PhoneIncoming;
              let statusColor = isOutgoing ? "text-green-400" : "text-blue-400";
              let statusLabel = isOutgoing ? "Outgoing Call" : "Incoming Call";

              if (log.status === "MISSED") {
                StatusIcon = PhoneMissed;
                statusColor = "text-red-500";
                statusLabel = "Missed Call";
              } else if (log.status === "REJECTED") {
                StatusIcon = PhoneOff;
                statusColor = "text-orange-500";
                statusLabel = "Rejected Call";
              }

              // Duration
              let duration = null;
              if (log.endedAt && log.status === "COMPLETED") {
                const diff = new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime();
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                duration = `${mins}m ${secs}s`;
              }

              return (
                <div key={log.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition border border-white/5 group">
                  
                  {/* Left: User Info */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={otherUser?.image || "/placeholder.png"} 
                      alt="User" 
                      className="w-12 h-12 rounded-full object-cover bg-gray-800"
                    />
                    <div>
                      <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                        {otherUser?.name || "Unknown"}
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50 border border-white/10 uppercase font-mono">
                            {log.type}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <StatusIcon className={cn("w-3.5 h-3.5", statusColor)} />
                        <span className={statusColor}>{statusLabel}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-white/40 text-xs">
                          {formatDate(log.startedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Duration / Actions */}
                  <div className="text-right">
                     {duration && (
                        <div className="flex items-center gap-1.5 text-white/40 text-xs bg-black/20 px-3 py-1.5 rounded-lg font-mono">
                            <Clock className="w-3 h-3" /> {duration}
                        </div>
                     )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}