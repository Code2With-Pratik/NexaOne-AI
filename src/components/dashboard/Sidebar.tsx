"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  href?: string; // Optional because parents like "AI Tools" might not have a direct link
  subItems?: { name: string; href: string; icon: React.ElementType }[];
};

const sidebarItems: SidebarItem[] = [
  { 
    name: "Overview", 
    href: "/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    name: "Communication", 
    icon: MessageSquare,
    // NO href here, it's a parent toggle
    subItems: [
      { name: "Live Chat", href: "/dashboard/chat", icon: MessageSquare },
      { name: "Video Call", href: "/dashboard/video-call", icon: Video },
    ]
  },
  { 
    name: "AI Tools", 
    icon: Sparkles,
    subItems: [
      { name: "Assistant", href: "/dashboard/ai-tools/assistant", icon: Bot },
      { name: "Image Gen", href: "/dashboard/ai-tools/image-generator", icon: ImageIcon },
      { name: "Article Writer", href: "/dashboard/ai-tools/article-writer", icon: PenTool },
      { name: "Email Writer", href: "/dashboard/ai-tools/email-generator", icon: Mail },
      { name: "Caption Gen", href: "/dashboard/ai-tools/social-caption", icon: Type },
      { name: "Search Engine", href: "/dashboard/ai-tools/search-engine", icon: Search },
    ]
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings 
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  // State to track which menus are open. Defaulting 'Communication' and 'AI Tools' to closed.
  // You can set initial state to ['AI Tools'] if you want it open by default.
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => 
      prev.includes(name) 
        ? prev.filter((item) => item !== name) // Close it
        : [...prev, name] // Open it
    );
  };

  const isActive = (href: string) => pathname === href;
  // Helper to check if a parent should be highlighted because a child is active
  const isChildActive = (item: SidebarItem) => {
    return item.subItems?.some(sub => pathname === sub.href);
  };

  return (
    <aside className="w-64 h-screen bg-[#050505] border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
      
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3">
          <span className="font-bold text-white">A</span>
        </div>
        <span className="font-bold text-lg text-white">AI<span className="text-indigo-400">SuperApp</span></span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {sidebarItems.map((item) => (
          <div key={item.name}>
            
            {/* 1. If it has subItems, render as a Toggle Button */}
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1",
                    isChildActive(item) 
                      ? "bg-white/5 text-white" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", isChildActive(item) ? "text-indigo-400" : "text-white/40 group-hover:text-indigo-400")} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {openMenus.includes(item.name) ? (
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  )}
                </button>

                {/* Sub Menu Items (Rendered only if open) */}
                {openMenus.includes(item.name) && (
                  <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                          isActive(sub.href)
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <sub.icon className="w-4 h-4" />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // 2. If NO subItems, render as a standard Link
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1",
                  isActive(item.href!)
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive(item.href!) ? "text-white" : "text-white/40 group-hover:text-indigo-400")} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};