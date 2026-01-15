import React from "react";
import Link from "next/link";
import { Twitter, Github, Linkedin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getSystemStatus } from "@/actions/system"; // 👈 Import the action

export const Footer = async () => {
  // 1. Fetch real status from DB
  const settings = await getSystemStatus();
  const isMaintenance = settings?.maintenanceMode || false;

  return (
    <footer className="relative border-t border-white/10 bg-transparent pt-24 pb-12 z-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Brand & Links */}
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                 <span className="text-white font-bold text-xl">A</span>
               </div>
               <span className="font-bold text-2xl tracking-tight text-white">
                 AI<span className="text-indigo-400">SuperApp</span>
               </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Empowering the next generation of creators with unified artificial intelligence.
            </p>
            
            <div className="flex gap-4 pt-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-white/50">
                {["Features", "Pricing", "Dashboard", "API Documentation"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-white/50">
                {["About Us", "Careers", "Blog", "Contact Support"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-white/50">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright & Status */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© 2026 AI SuperApp Inc. All rights reserved to <a href="https://github.com/Code2With-Pratik/my-ai-super-app" className="hover:text-white transition">Code2With-Pratik</a>.</p>
          
          {/* 👇 DYNAMIC STATUS INDICATOR */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isMaintenance ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
             <span className="relative flex h-2 w-2">
               <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMaintenance ? "bg-red-500" : "bg-emerald-500"}`}></span>
               <span className={`relative inline-flex rounded-full h-2 w-2 ${isMaintenance ? "bg-red-500" : "bg-emerald-500"}`}></span>
             </span>
             <span className="font-medium">
                {isMaintenance ? (
                    <span className="flex items-center gap-2">
                        System Maintenance <AlertTriangle className="w-3 h-3" />
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        All Systems Operational <CheckCircle2 className="w-3 h-3" />
                    </span>
                )}
             </span>
          </div>
        </div>

      </div>
    </footer>
  );
};