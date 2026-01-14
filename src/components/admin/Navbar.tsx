"use client";

import { UserButton } from "@clerk/nextjs";
import { ShieldCheck, Bell } from "lucide-react";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 bg-[#111827]">
       {/* Left Side */}
       <div className="flex items-center gap-x-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
             <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Console</h2>
       </div>

       {/* Right Side */}
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