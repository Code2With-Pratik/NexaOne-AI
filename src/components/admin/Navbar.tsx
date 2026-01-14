"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/admin/NotificationBell"; // 👈 Import new component

interface NavbarProps {
  onToggle: () => void;
}

export default function Navbar({ onToggle }: NavbarProps) {
  return (
    <div className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-white/10 bg-[#111827]">
       
       <div className="flex items-center gap-x-4">
          <Button onClick={onToggle} variant="ghost" size="icon" className="text-white hover:bg-white/10">
             <Menu className="w-6 h-6" />
          </Button>

          <h2 className="text-lg md:text-xl font-bold text-white">
             Admin Console
          </h2>
       </div>

       <div className="flex items-center gap-x-4">
          {/* 👇 REPLACED STATIC BUTTON WITH DYNAMIC COMPONENT */}
          <NotificationBell />
          
          <UserButton afterSignOutUrl="/" />
       </div>
    </div>
  );
}