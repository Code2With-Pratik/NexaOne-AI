"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import { cn } from "@/lib/utils";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  // State: Is the sidebar visible?
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Helper: Auto-close on mobile, auto-open on desktop
  useEffect(() => {
    const checkScreen = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsSidebarOpen(false); // Default closed on mobile
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true); // Default open on desktop
      }
    };

    // Check on mount
    checkScreen();

    // Check on resize
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-full min-h-screen bg-[#0b0f19] flex flex-col">
      
      {/* 1. NAVBAR (Fixed Top) */}
      <div className="fixed top-0 w-full z-50 h-16 bg-[#111827]">
        <Navbar onToggle={toggleSidebar} />
      </div>

      <div className="flex flex-1 pt-1 h-screen overflow-hidden">
        
        {/* 2. SIDEBAR (Collapsible) */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 mt-10 bg-[#121316] border-r border-white/10 transition-all duration-300 ease-in-out overflow-hidden h-full",
            // Desktop: Relative positioning (pushes content)
            // Mobile: Absolute positioning (overlays content)
            isMobile ? "absolute" : "relative",
            // Width Logic: 64 (Open) vs 0 (Closed)
            isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full opacity-0"
          )}
        >
          <div className="w-64 h-full"> {/* Inner container fixes width to prevent text wrapping during transition */}
             <Sidebar />
          </div>
        </aside>

        {/* 3. MAIN CONTENT */}
        <main 
          className={cn(
            "flex-1 h-full overflow-y-auto transition-all duration-300 p-4 md:p-8",
            // If on mobile and sidebar is open, dim the content slightly
            isMobile && isSidebarOpen ? "opacity-50 pointer-events-none" : "opacity-100"
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile Overlay (Click outside to close) */}
      {isMobile && isSidebarOpen && (
        <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 md:hidden mt-16"
        />
      )}
    </div>
  );
}