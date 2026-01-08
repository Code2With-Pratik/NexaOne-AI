"use client";

import React, { useState } from "react";
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Camera, 
  Check, 
  Smartphone, 
  Mail,
  Moon,
  Zap,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define the available tabs
type Tab = "profile" | "account" | "billing" | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT: Settings Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <SettingsTab 
            label="My Profile" 
            icon={User} 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")} 
          />
          <SettingsTab 
            label="Account Security" 
            icon={Shield} 
            active={activeTab === "account"} 
            onClick={() => setActiveTab("account")} 
          />
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
        <div className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-xl">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "account" && <AccountSection />}
          {activeTab === "billing" && <BillingSection />}
          {activeTab === "notifications" && <NotificationsSection />}
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS FOR EACH SECTION ---

const ProfileSection = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-6 pb-8 border-b border-white/10">
        <div className="relative group">
           <div className="w-24 h-24 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
             <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover opacity-90" />
           </div>
           <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <Camera className="w-6 h-6 text-white" />
           </button>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Alex Rivet</h3>
          <p className="text-white/50 text-sm">Product Designer</p>
          <button className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium">Change Avatar</button>
        </div>
      </div>

      <form className="space-y-6 max-w-lg">
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">First Name</label>
             <input type="text" defaultValue="Alex" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
           </div>
           <div className="space-y-2">
             <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Last Name</label>
             <input type="text" defaultValue="Rivet" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Email Address</label>
           <input type="email" defaultValue="alex@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>

        <div className="space-y-2">
           <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Bio</label>
           <textarea className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none" defaultValue="Passionate about AI and Design." />
        </div>

        <div className="pt-4">
          <button type="button" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

const AccountSection = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Password</h3>
        <p className="text-white/50 text-sm mb-6">Update your password to keep your account secure.</p>
        
        <div className="space-y-4 max-w-md">
           <input type="password" placeholder="Current Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
           <input type="password" placeholder="New Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
           <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors">
             Update Password
           </button>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-white">Authenticator App</p>
                <p className="text-xs text-white/50">Secure your account with Google Authenticator.</p>
              </div>
           </div>
           <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold border border-green-500/20">
             Enabled
           </button>
        </div>
      </div>

       <div className="pt-8 border-t border-white/10">
         <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
         <p className="text-white/50 text-sm mb-4">Once you delete your account, there is no going back.</p>
         <button className="px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
           <LogOut className="w-4 h-4" /> Delete Account
         </button>
       </div>
    </div>
  );
};

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