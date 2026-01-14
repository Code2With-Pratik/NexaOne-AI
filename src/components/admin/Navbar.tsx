"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onToggle: () => void;
}

export default function Navbar({ onToggle }: NavbarProps) {
  return (
    <div className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-white/10 bg-[#111827]">
       
       <div className="flex items-center gap-x-4">
          {/* THE TOGGLE BUTTON */}
          <Button onClick={onToggle} variant="ghost" size="icon" className="text-white hover:bg-white/10">
             <Menu className="w-6 h-6" />
          </Button>

          <h2 className="text-lg md:text-xl font-bold text-white">
             Admin Console
          </h2>
       </div>

       <div className="flex items-center gap-x-4">
          <button className="p-2 bg-white/5 rounded-full text-white/70 hover:text-white transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <UserButton afterSignOutUrl="/" />
       </div>
    </div>
  );
}