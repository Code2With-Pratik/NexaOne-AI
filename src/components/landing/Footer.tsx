"use client";

import React from "react";
import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl pt-24 pb-12 z-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Brand & Links */}
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
               <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                 <span className="text-white font-bold text-xl">A</span>
               </div>
               <span className="font-bold text-2xl tracking-tight text-white">
                 AI<span className="text-indigo-400">SuperApp</span>
               </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Empowering the next generation of creators with unified artificial intelligence.
            </p>
            
            {/* Social Icons (Moved here for better visual balance) */}
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
            {/* Column 1 */}
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

            {/* Column 2 */}
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

            {/* Column 3 */}
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

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© 2025 AI SuperApp Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <span>All Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};