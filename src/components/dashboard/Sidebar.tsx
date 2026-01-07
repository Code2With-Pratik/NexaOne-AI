"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Video, 
  Image as ImageIcon, 
  PenTool, 
  Mail, 
  Search, 
  Bot, 
  Settings, 
  LogOut,
  X 
} from "lucide-react";

const tools = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, color: "text-sky-500" },
  { name: "Live Chat", href: "/dashboard/chat", icon: MessageSquare, color: "text-green-500" },
  { name: "Video Calls", href: "/dashboard/video-call", icon: Video, color: "text-blue-500" },
  { name: "AI Images", href: "/dashboard/ai-tools/image-generator", icon: ImageIcon, color: "text-pink-500" },
  { name: "AI Writer", href: "/dashboard/ai-tools/article-writer", icon: PenTool, color: "text-orange-500" },
  { name: "Email Gen", href: "/dashboard/ai-tools/email-generator", icon: Mail, color: "text-purple-500" },
  { name: "Assistant", href: "/dashboard/ai-tools/assistant", icon: Bot, color: "text-yellow-500" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 h-full bg-black/95 border-r border-white/10 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-72" : "w-0 md:w-20 overflow-hidden" // Collapsed state
      )}
    >
      <div className="flex flex-col h-full py-4">
        {/* Header */}
        <div className="px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className={cn("flex items-center gap-2", !isSidebarOpen && "md:justify-center")}>
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold">A</span>
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl text-white tracking-tight">
                AI<span className="text-indigo-400">Super</span>
              </span>
            )}
          </Link>
          {/* Mobile Close Button */}
          <button onClick={toggleSidebar} className="md:hidden text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                pathname === tool.href 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <tool.icon className={cn("w-6 h-6 shrink-0 transition-colors", tool.color)} />
              {isSidebarOpen && (
                <span className="font-medium text-sm animate-fade-in-up">{tool.name}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
           <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5">
             <Settings className="w-6 h-6" />
             {isSidebarOpen && <span>Settings</span>}
           </Link>
           {/* Placeholder for Logout */}
           <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
             <LogOut className="w-6 h-6" />
             {isSidebarOpen && <span>Sign Out</span>}
           </button>
        </div>
      </div>
    </aside>
  );
};