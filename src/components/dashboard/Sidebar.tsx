"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store"; // Import the store
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
  ChevronDown, 
  ChevronRight,
  Type,
  LogOut,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define the structure for sidebar items
type SidebarItem = {
  name: string;
  icon: React.ElementType;
  href?: string;
  color: string;
  subItems?: { name: string; href: string; icon: React.ElementType; color: string }[];
};

const sidebarItems: SidebarItem[] = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    color: "text-sky-500"
  },
  { 
    name: "Communication", 
    icon: MessageSquare,
    color: "text-green-500",
    subItems: [
      { name: "Live Chat", href: "/dashboard/chat", icon: MessageSquare, color: "text-emerald-400" },
      { name: "Video Call", href: "/dashboard/video-call", icon: Video, color: "text-rose-500" },
    ]
  },
  { 
    name: "AI Tools", 
    icon: Sparkles,
    color: "text-violet-500",
    subItems: [
      { name: "Assistant", href: "/dashboard/ai-tools/assistant", icon: Bot, color: "text-indigo-400" },
      { name: "Image Gen", href: "/dashboard/ai-tools/image-generator", icon: ImageIcon, color: "text-pink-500" },
      { name: "Article Writer", href: "/dashboard/ai-tools/article-writer", icon: PenTool, color: "text-orange-500" },
      { name: "Email Writer", href: "/dashboard/ai-tools/email-generator", icon: Mail, color: "text-yellow-400" },
      { name: "Caption Gen", href: "/dashboard/ai-tools/social-caption", icon: Type, color: "text-cyan-400" },
      { name: "Search Engine", href: "/dashboard/ai-tools/search-engine", icon: Search, color: "text-teal-400" },
    ]
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings,
    color: "text-indigo-400"
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen } = useAppStore(); // Get state from store
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (name: string) => {
    // Only allow toggling if sidebar is open
    if (!isSidebarOpen) return;
    
    setOpenMenus((prev) => 
      prev.includes(name) 
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isChildActive = (item: SidebarItem) => item.subItems?.some(sub => pathname === sub.href);

  return (
    <aside 
      className={cn(
        "h-screen bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out",
        // Desktop: w-64 (Open) vs w-20 (Closed)
        // Mobile: translate-x-0 (Open) vs -translate-x-full (Closed/Hidden)
        isSidebarOpen 
          ? "w-64 translate-x-0" 
          : "w-64 -translate-x-full md:translate-x-0 md:w-20"
      )}
    >
      
      {/* Brand Logo */}
      <div className={cn("h-16 flex items-center border-b border-white/10 transition-all", isSidebarOpen ? "px-6" : "justify-center px-0")}>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="font-bold text-white">A</span>
        </div>
        {/* Hide Text if Collapsed */}
        <span className={cn("font-bold text-lg text-white ml-3 transition-opacity duration-200", !isSidebarOpen && "hidden md:hidden opacity-0")}>
          AI<span className="text-indigo-400">SuperApp</span>
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {sidebarItems.map((item) => (
          <div key={item.name}>
            
            {/* 1. Logic for Items with Submenus */}
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1 cursor-pointer",
                    // If closed, center the icon
                    !isSidebarOpen && "justify-center", 
                    // If open, space between
                    isSidebarOpen && "justify-between",
                    isChildActive(item) ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                  title={!isSidebarOpen ? item.name : undefined} // Tooltip on hover when closed
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5 shrink-0", isChildActive(item) ? "text-indigo-400" : item.color)} />
                    {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </div>
                  
                  {/* Arrows - Only show if sidebar is open */}
                  {isSidebarOpen && (
                    openMenus.includes(item.name) ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />
                  )}
                </button>

                {/* Sub Menu - Only show if Sidebar AND Menu are Open */}
                {openMenus.includes(item.name) && isSidebarOpen && (
                  <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                          isActive(sub.href) ? "bg-indigo-600 text-white shadow-lg" : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <sub.icon className={cn("w-4 h-4", isActive(sub.href) ? "text-white" : sub.color)} />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // 2. Logic for Standard Links
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1 cursor-pointer",
                  !isSidebarOpen && "justify-center",
                  isActive(item.href!) ? "bg-indigo-600 text-white shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive(item.href!) ? "text-white" : item.color)} />
                {isSidebarOpen && <span className="text-sm font-medium ml-3">{item.name}</span>}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className={cn("border-t border-white/10 transition-all", isSidebarOpen ? "p-4" : "p-2")}>
        <button className={cn(
          "flex items-center w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group cursor-pointer",
          isSidebarOpen ? "px-3 py-2.5 gap-3" : "justify-center py-3"
        )}>
          <LogOut className="w-5 h-5 group-hover:text-red-500 shrink-0" />
          {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Close Button for Mobile View */}
      <button
        onClick={() => useAppStore.setState({ isSidebarOpen: false })}
        className="absolute top-4 right-4 text-white rounded-full p-2 md:hidden"
        aria-label="Close Sidebar"
      >
        ✕
      </button>
    </aside>
  );
};