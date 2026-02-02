"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Twitter, Github, Linkedin, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { getSystemStatus } from "@/actions/system";

export const Footer = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Fetch real status from DB
  useEffect(() => {
    const fetchStatus = async () => {
      const settings = await getSystemStatus();
      setIsMaintenance(settings?.maintenanceMode || false);
    };
    fetchStatus();
  }, []);

  // --- CONFIGURATION: Social Links ---
  const socialLinks = [
    { icon: Twitter, href: "https://x.com/ohh_its_pratik" },
    { icon: Github, href: "https://github.com/Code2With-Pratik" },
    { icon: Linkedin, href: "https://in.linkedin.com/in/pratik-dhandare" },
  ];

  // --- CONFIGURATION: Footer Columns ---
  const productLinks = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Dashboard", href: "/#dashboard" },
    { 
      name: "API Documentation", 
      href: "assets/NexaOneAI_API_Documentation.pdf", // Ensure this file is in your /public folder
      download: true 
    },
  ];

  const companyLinks = [
    { name: "Home", href: "/#hero" },
    { name: "About Us", href: "/#about" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "Contact Support", href: "/#contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", id: "privacy" },
    { name: "Terms of Service", id: "terms" },
    { name: "Cookie Policy", id: "cookies" },
    { name: "Security", id: "security" },
  ];

  // --- CONTENT FOR MODALS ---
  const modalContent: Record<string, { title: string; content: string }> = {
    privacy: {
      title: "Privacy Policy",
      content: "Your privacy is important to us. This policy outlines how NexaOne AI collects, uses, and protects your personal data. we ensure that your information is encrypted and never sold to third parties. We collect minimal data required to provide our AI communication services efficiently."
    },
    terms: {
      title: "Terms of Service",
      content: "By using NexaOne AI, you agree to abide by our terms. Users are responsible for maintaining account security and ensuring that AI-generated content complies with local laws. Unauthorized attempts to reverse engineer our AI models are strictly prohibited."
    },
    cookies: {
      title: "Cookie Policy",
      content: "We use cookies to enhance your experience. These small files help us remember your preferences and analyze site traffic. You can manage your cookie settings at any time through your browser, though some features may be limited if cookies are disabled."
    },
    security: {
      title: "Security",
      content: "NexaOne AI employs industry-standard AES-256 encryption for all communications. Our infrastructure is regularly audited for vulnerabilities. We provide multi-factor authentication (MFA) to ensure that your digital life remains private and secure from unauthorized access."
    }
  };

  return (
    <footer className="relative border-t border-white/10 bg-transparent pt-24 pb-12 z-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Brand & Links */}
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/#hero" className="flex items-center gap-2 group">
               <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                 <img src="/favicon.ico" alt="Favicon" className="mt-1"/>
               </div>
               <span className="font-bold text-2xl tracking-tight text-white">
                 NexaOne<span className="text-pink-500"> AI</span>
               </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Connect, create, and collaborate with the world's first AI-native communication super-app.
            </p>
            
            <div className="flex gap-4 pt-2">
              {socialLinks.map((item, i) => (
                <a 
                  key={i} 
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-pink-600 hover:border-pink-400 transition-all duration-300"
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Product */}
            <div>
              <h4 className="font-semibold text-white mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-white/50">
                {productLinks.map((item) => (
                  <li key={item.name}>
                    {item.download ? (
                      <a 
                        href={item.href} 
                        download 
                        className="hover:text-pink-400 transition-colors cursor-pointer"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link href={item.href} className="hover:text-pink-400 transition-colors">
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Company */}
            <div>
              <h4 className="font-semibold text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-white/50">
                {companyLinks.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-pink-400 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h4 className="font-semibold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-white/50">
                {legalLinks.map((item) => (
                  <li key={item.name}>
                    <button 
                      onClick={() => setActiveModal(item.id)}
                      className="hover:text-pink-400 transition-colors text-left cursor-pointer"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright & Status */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© 2026 AI SuperApp Inc. All rights reserved to <a href="https://github.com/Code2With-Pratik/my-ai-super-app" target="_blank" rel="noreferrer" className="hover:text-white transition">Code2With-Pratik</a>.</p>
          
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

      {/* --- POPUP MODAL (Same UI as Hero Demo) --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-[#0c0c0c] border-3 border-white/40 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out flex flex-col w-[95%] max-w-2xl rounded-2xl">
            {/* Header Control Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#161616] border-b border-white/5">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-3 h-3 rounded-full bg-[#ff0d00] hover:brightness-125 transition-all flex items-center justify-center group cursor-pointer"
                >
                  <X className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
                </button>
                <div className="w-3 h-3 rounded-full bg-[#ceb60092]" />
                <div className="w-3 h-3 rounded-full bg-[#00ac0092]" />
              </div>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                {modalContent[activeModal].title}
              </p>
              <div className="w-10" />
            </div>

            {/* Modal Content */}
            <div className="p-8 bg-black">
              <h2 className="text-2xl font-bold text-white mb-4">
                {modalContent[activeModal].title}
              </h2>
              <p className="text-white/60 leading-relaxed text-sm md:text-base">
                {modalContent[activeModal].content}
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};