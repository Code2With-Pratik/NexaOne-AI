"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useClerk } from "@clerk/nextjs"; // <--- 1. IMPORT CLERK HOOK
import { 
  LayoutDashboard, 
  MessageSquare, 
  Video, 
  Image as ImageIcon, 
  PenTool,
  Phone, 
  Users,
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
    name: "AI Tools", 
    icon: Sparkles,
    color: "text-yellow-400",
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
    name: "Communication", 
    icon: MessageSquare,
    color: "text-orange-500",
    subItems: [
      { name: "Live Chat", href: "/dashboard/chat", icon: MessageSquare, color: "text-emerald-400" },
      { name: "Group Meeting", href: "/dashboard/meeting", icon: Users, color: "text-yellow-400" },
      { name: "Call Logs", href: "/dashboard/call-logs",icon: Phone, color: "text-red-500" }, // Optional: choose a color
    ]
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings,
    color: "text-green-400"
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen } = useAppStore();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  
  // 2. GET SIGN OUT FUNCTION
  const { signOut } = useClerk();

  const toggleMenu = (name: string) => {
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
        isSidebarOpen 
          ? "w-64 translate-x-0" 
          : "w-64 -translate-x-full md:translate-x-0 md:w-20"
      )}
    >
      
      {/* Brand Logo */}
      <div className={cn("h-16 flex items-center border-b border-white/10 transition-all", isSidebarOpen ? "px-6" : "justify-center px-0")}>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <a href="http://localhost:3000/">
            <span className="font-bold text-white">A</span>
          </a>
        </div>
        <span className={cn("font-bold text-lg text-white ml-3 transition-opacity duration-200", !isSidebarOpen && "hidden md:hidden opacity-0")}>
          <a href="http://localhost:3000/">
             AI<span className="text-indigo-400">SuperApp</span>
          </a>
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {sidebarItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1 cursor-pointer",
                    !isSidebarOpen && "justify-center", 
                    isSidebarOpen && "justify-between",
                    isChildActive(item) ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5 shrink-0", isChildActive(item) ? "text-indigo-400" : item.color)} />
                    {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </div>
                  {isSidebarOpen && (
                    openMenus.includes(item.name) ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />
                  )}
                </button>

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
        <button 
          // 3. ATTACH LOGOUT FUNCTIONALITY
          onClick={() => signOut({ redirectUrl: '/' })}
          className={cn(
            "flex items-center w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group cursor-pointer",
            isSidebarOpen ? "px-3 py-2.5 gap-3" : "justify-center py-3"
          )}
        >
          <LogOut className="w-5 h-5 group-hover:text-red-500 shrink-0" />
          {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>

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