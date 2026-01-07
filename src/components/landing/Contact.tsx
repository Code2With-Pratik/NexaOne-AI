"use client";

import React from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export const Contact = () => {
  return (
    <section id="contact" className="py-32 px-6 bg-black text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 relative z-10">
        
        {/* Left: Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Let's Build the Future</h2>
            <p className="text-lg text-white/60">
              Have questions about the Enterprise API or need a custom integration? 
              Our AI architects are ready to help.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-white/40">Email us</p>
                <p className="font-medium">hello@ai-superapp.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <MapPin className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-white/40">Headquarters</p>
                <p className="font-medium">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50">First Name</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50">Last Name</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/50">Email</label>
              <input type="email" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="john@company.com" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/50">Message</label>
              <textarea className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="Tell us about your project..." />
            </div>

            <button className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
              Send Message <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};