"use client";

import { useState, useEffect } from "react";
import { Bell, MailOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, markAllAsRead, markAsRead } from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// 👇 Updated Type to match your Schema exactly
type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  // type: string; // Removed this since it's not in your DB
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data
  const fetchData = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, []);

  // 2. Actions
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    await markAllAsRead();
    toast.success("All cleared!");
  };

  const handleItemClick = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markAsRead(id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 bg-white/5 rounded-full text-white/70 hover:text-white transition relative outline-none focus:ring-2 focus:ring-indigo-500/50">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#111827] rounded-full flex items-center justify-center">
              <span className="sr-only">New notifications</span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0 bg-[#1f2937] border-white/10 text-white shadow-xl rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllRead}
              className="h-auto px-2 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="h-[300px]">
          {loading ? (
             <div className="p-4 text-center text-white/40 text-xs">Loading updates...</div>
          ) : notifications.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-white/40">
                <MailOpen className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">No new notifications</p>
             </div>
          ) : (
             <div className="divide-y divide-white/5">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-white/5 transition flex items-start gap-3",
                      !item.isRead ? "bg-indigo-500/5" : ""
                    )}
                  >
                    <div className={cn(
                      "mt-1 w-2 h-2 rounded-full shrink-0",
                      !item.isRead ? "bg-indigo-500" : "bg-white/20"
                    )} />
                    
                    <div className="flex-1 space-y-1">
                      <p className={cn("text-sm leading-none", !item.isRead ? "font-semibold text-white" : "text-white/70")}>
                        {item.title}
                      </p>
                      <p className="text-xs text-white/50 line-clamp-2">
                        {item.message}
                      </p>
                      <p className="text-[10px] text-white/30 pt-1">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                ))}
             </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}