"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  Bell
} from "lucide-react";

// Define the available tabs (Only Billing & Notifications)
type Tab = "billing" | "notifications";

export default function SettingsPage() {
  // Set default tab to "billing" since profile is gone
  const [activeTab, setActiveTab] = useState<Tab>("billing");

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT: Settings Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <SettingsTab 
            label="Billing & Plans" 
            icon={CreditCard} 
            active={activeTab === "billing"} 
            onClick={() => setActiveTab("billing")} 
          />
          <SettingsTab 
            label="Notifications" 
            icon={Bell} 
            active={activeTab === "notifications"} 
            onClick={() => setActiveTab("notifications")} 
          />
        </div>

        {/* RIGHT: Content Area */}
        <div className="flex-1 bg-transparent border border-white/25 rounded-2xl p-8 shadow-xl">
          {activeTab === "billing" && <BillingSection />}
          {activeTab === "notifications" && <NotificationsSection />}
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS FOR EACH SECTION ---

const BillingSection = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Current Plan Card */}
      <div className="bg-linear-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
         <div className="relative z-10 flex justify-between items-start">
           <div>
             <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Current Plan</p>
             <h3 className="text-3xl font-bold text-white mb-2">Pro Creator</h3>
             <p className="text-white/60 text-sm mb-6">Renews on Oct 24, 2025</p>
             <button className="px-4 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
               Manage Subscription
             </button>
           </div>
           <div className="text-right">
             <div className="text-4xl font-bold text-white">$29<span className="text-lg text-white/40 font-normal">/mo</span></div>
           </div>
         </div>
         {/* Decorative Glow */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
      </div>

      {/* Credit Usage */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Credit Usage</h3>
        <div className="space-y-4">
           <div>
             <div className="flex justify-between text-sm mb-2">
               <span className="text-white/70">AI Image Generation</span>
               <span className="text-white font-mono">450 / 1000</span>
             </div>
             <div className="h-2 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full w-[45%] bg-pink-500 rounded-full" />
             </div>
           </div>
           <div>
             <div className="flex justify-between text-sm mb-2">
               <span className="text-white/70">GPT-4 Words</span>
               <span className="text-white font-mono">12k / 50k</span>
             </div>
             <div className="h-2 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full w-[24%] bg-indigo-500 rounded-full" />
             </div>
           </div>
        </div>
      </div>

      {/* Invoice History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Invoices</h3>
        <div className="border border-white/10 rounded-xl overflow-hidden">
          {[
            { date: "Oct 01, 2025", amount: "$29.00", status: "Paid" },
            { date: "Sep 01, 2025", amount: "$29.00", status: "Paid" },
            { date: "Aug 01, 2025", amount: "$29.00", status: "Paid" },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5 last:border-0">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-white/5 rounded-lg text-white/60"><CreditCard className="w-4 h-4" /></div>
                 <span className="text-sm text-white font-medium">{inv.date}</span>
               </div>
               <div className="flex items-center gap-6">
                 <span className="text-sm text-white/60">{inv.amount}</span>
                 <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-bold">{inv.status}</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NotificationsSection = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-white mb-4">Email Notifications</h3>
      
      {[
        { title: "Weekly Performance Report", desc: "Get a summary of your AI usage every Monday." },
        { title: "Product Updates", desc: "Receive news about new features and improvements." },
        { title: "Security Alerts", desc: "Get notified about login attempts from new devices." }
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
           <div>
             <h4 className="font-medium text-white">{item.title}</h4>
             <p className="text-xs text-white/50">{item.desc}</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
             <input type="checkbox" defaultChecked={i === 0 || i === 2} className="sr-only peer" />
             <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
           </label>
        </div>
      ))}

      <div className="pt-6">
         <button className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-xl font-bold text-sm transition-colors">
           Save Preferences
         </button>
      </div>
    </div>
  );
};

// Helper for Sidebar Tabs
const SettingsTab = ({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
      active 
        ? "bg-white/10 text-white shadow-lg" 
        : "text-white/50 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-indigo-400" : "text-white/40")} />
    {label}
  </button>
);