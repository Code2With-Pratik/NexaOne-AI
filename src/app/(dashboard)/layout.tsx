"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs"; // <--- IMPORT CLERK

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    // Locked scroll container (App Mode)
    <div className="flex h-screen w-full bg-black text-white overflow-hidden">
      {/* 1. Sidebar Component */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col h-full transition-all duration-300 relative z-10",
          isSidebarOpen ? "md:ml-72" : "md:ml-20"
        )}
      >
        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-white/10 flex items-center justify-between px-6 bg-black/10 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
             {/* Credit Counter */}
             <div className="px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono">
               120 Credits
             </div>
             
             {/* CLERK USER PROFILE BUTTON */}
             {/* This replaces the old static <a> tag */}
             <div className="flex items-center justify-center">
                <UserButton afterSignOutUrl="/" /> 
             </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent scroll-smooth pb-20">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}