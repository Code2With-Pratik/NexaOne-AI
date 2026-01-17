"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar"; // ⚠️ Checked: This is where we updated the Sidebar code previously
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Menu, Zap } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { StarBackground } from "@/components/ui/StarBackground";

interface DashboardClientProps {
  children: React.ReactNode;
  creditBalance: number;
  isAdmin: boolean; // 1. Add Type Definition
}

export default function DashboardClient({
  children,
  creditBalance = 0,
  isAdmin = false // 2. Receive the prop
}: DashboardClientProps) {
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className="flex h-screen w-full bg-transparent text-white overflow-hidden relative">
      <StarBackground />
      
      {/* 3. Pass the prop to the Sidebar */}
      <Sidebar 
        apiLimitCount={creditBalance} 
        isAdmin={isAdmin} 
      />

      <div 
        className={cn(
          "flex-1 flex flex-col h-full transition-all duration-300 relative z-10",
          isSidebarOpen ? "md:ml-72" : "md:ml-20"
        )}
      >
        <header className="h-16 shrink-0 border-b border-white/10 flex items-center justify-between px-6 bg-black/10 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
              {/* CREDIT DISPLAY */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/30 bg-pink-500/10 text-yellow-400 text-xs font-mono font-bold shadow-[0_0_10px_-3px_rgba(99,102,241,0.4)]">
                <Zap className="w-3.5 h-3.5 fill-orange-500" />
                {creditBalance} Credits
              </div>
              
              <div className="flex items-center justify-center pl-2 border-l border-white/10">
                 <UserButton afterSignOutUrl="/" /> 
              </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent scroll-smooth pb-20">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}