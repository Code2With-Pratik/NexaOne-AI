"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // 👈 Added Image Import
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useClerk } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  MessageSquare, 
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
  Sparkles,
  X,
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
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
      { name: "Call Logs", href: "/dashboard/call-logs",icon: Phone, color: "text-red-500" },
    ]
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings,
    color: "text-green-400"
  },
];

interface SidebarProps {
  apiLimitCount?: number;
  isPro?: boolean;
  isAdmin?: boolean;
}

export const Sidebar = ({ 
  apiLimitCount = 0, 
  isPro = false,
  isAdmin = false 
}: SidebarProps) => {
  const pathname = usePathname();
  const { isSidebarOpen } = useAppStore(); 
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { signOut } = useClerk();

  const toggleMenu = (name: string) => {
    if (!isSidebarOpen) {
       useAppStore.setState({ isSidebarOpen: true });
       setOpenMenus([name]);
       return;
    }
    setOpenMenus((prev) => 
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) { 
      useAppStore.setState({ isSidebarOpen: false });
    }
  };

  const isActive = (href: string) => pathname === href;
  const isChildActive = (item: any) => item.subItems?.some((sub: any) => pathname === sub.href);

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => useAppStore.setState({ isSidebarOpen: false })}
          className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={cn(
          "h-screen bg-[#111827] border-r border-white/10 flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        
        {/* Brand Logo & Close Button */}
        <div className={cn("h-16 flex items-center border-b border-white/10 transition-all shrink-0", isSidebarOpen ? "px-6 justify-between" : "justify-center px-0")}>
          
          {/* 👇 UPDATED LOGO SECTION: Clickable & Uses Image */}
          <Link 
            href="/" 
            className="flex items-center overflow-hidden hover:opacity-80 transition-opacity"
          >
            <div className="relative w-8 h-8 shrink-0">
               <Image 
                 src="/favicon.ico" 
                 alt="Logo" 
                 fill 
                 className="object-contain"
               />
            </div>
            <span className={cn("font-bold text-lg text-white ml-3 whitespace-nowrap transition-opacity duration-200", !isSidebarOpen && "hidden opacity-0")}>
              NexaOne <span className="text-indigo-400">AI</span>
            </span>
          </Link>
          {/* 👆 END UPDATED SECTION */}

          <button 
            onClick={() => useAppStore.setState({ isSidebarOpen: false })}
            className="md:hidden p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          
          {/* ADMIN BUTTON (Only shows if isAdmin is true) */}
          {isAdmin && (
             <Link
               href="/admin"
               onClick={handleLinkClick}
               className={cn(
                 "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group mb-4 cursor-pointer border border-red-500/20 bg-red-500/10 hover:bg-red-500/20",
                 !isSidebarOpen && "justify-center",
               )}
               title="Admin Console"
             >
               <ShieldCheck className="w-5 h-5 shrink-0 text-red-400" />
               {isSidebarOpen && <span className="text-sm font-bold text-red-400 ml-3">Admin Console</span>}
             </Link>
          )}

          {sidebarItems.map((item) => (
             <div key={item.name}>
               {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1 cursor-pointer select-none",
                      !isSidebarOpen && "justify-center", 
                      isSidebarOpen && "justify-between",
                      isChildActive(item) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                    title={!isSidebarOpen ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isChildActive(item) ? "text-indigo-400" : item.color)} />
                      {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                    </div>
                    {isSidebarOpen && (
                      openMenus.includes(item.name) ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                  </button>

                  {/* Submenu */}
                  {openMenus.includes(item.name) && isSidebarOpen && (
                    <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={handleLinkClick}
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
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1 cursor-pointer",
                    !isSidebarOpen && "justify-center",
                    isActive(item.href!) ? "bg-indigo-600 text-white shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive(item.href!) ? "text-white" : item.color)} />
                  {isSidebarOpen && <span className="text-sm font-medium ml-3">{item.name}</span>}
                </Link>
              )}
             </div>
          ))}
        </div>

        {/* Footer / Logout */}
        <div className={cn("border-t border-white/10 transition-all shrink-0", isSidebarOpen ? "p-4" : "p-2")}>
          <button 
            onClick={() => signOut({ redirectUrl: '/' })}
            className={cn(
              "flex items-center w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group cursor-pointer",
              isSidebarOpen ? "px-3 py-2.5 gap-3" : "justify-center py-3"
            )}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>

      </aside>
    </>
  );
};