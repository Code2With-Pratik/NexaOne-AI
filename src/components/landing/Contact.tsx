"use client";

import React, { useState } from "react";
import Spline from "@splinetool/react-spline";
import { Mail, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { submitContactForm } from "@/actions/shared";
import { toast } from "sonner";

export const Contact = () => {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    try {
      const result = await submitContactForm(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSuccess(true);
        toast.success("Message sent to our team!");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section id="contact" className="py-12 lg:py-32 px-4 lg:px-6 bg-transparent text-white relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 relative z-10 items-stretch">
        
        {/* --- LEFT COLUMN: 3D MODEL & INFO --- */}
        {/* Mobile: Reset margins (mt-0, ml-0). Desktop: Keep your negative margins (-mt-8 -ml-14) */}
        <div className="relative min-h-[400px] lg:min-h-[500px] lg:h-auto rounded-3xl overflow-hidden order-2 lg:order-1 mt-0 ml-0 lg:-mt-8 lg:-ml-14 bg-white/5 border border-white/10 lg:border-none lg:bg-transparent">
          
          {/* 1. The 3D Model (Background) */}
          <div className="absolute inset-0 w-full h-full z-0">
            {!isSplineLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                </div>
            )}
            
            <Spline 
                scene="https://prod.spline.design/kl8p44vQlFDdMyxQ/scene.splinecode" 
                onLoad={() => setIsSplineLoaded(true)}
                // Mobile: scale-100, center pos. Desktop: scale-120, translate-x-68
                className="w-full h-full scale-100 lg:scale-120 translate-x-0 lg:translate-x-68 mt-0 lg:mt-25" 
            />
          </div>

          {/* 2. The Content Overlay */}
          <div className="absolute inset-0 z-10 p-6 lg:p-8 flex flex-col justify-between pointer-events-none bg-gradient-to-b from-black/80 via-transparent to-black/90 lg:to-transparent">
            
            {/* Top Text */}
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Let's Build the <br className="hidden lg:block" /> Future</h2>
              <p className="text-sm lg:text-lg text-white/80 max-w-md drop-shadow-md">
                Connect with us to unlock the full potential of NexaOne. 
                From technical inquiries to partnership opportunities, 
                we’re here to help you build without limits.
              </p>
            </div>

            {/* Bottom Contact Details */}
            {/* Mobile: Reset translation. Desktop: Keep -translate-y-30 */}
            <div className="space-y-4 lg:space-y-5 pointer-events-auto translate-y-0 lg:-translate-y-30">
              <div className="flex items-center gap-3 lg:gap-4 bg-black/60 lg:bg-black/40 p-3 lg:p-4 rounded-2xl backdrop-blur-md border border-white/10 lg:border-white/5 w-fit">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs text-white/50 uppercase tracking-wider">Email us</p>
                  <p className="text-sm lg:text-base font-medium text-white break-all">work.pratik1204@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 lg:gap-4 bg-black/60 lg:bg-black/40 p-3 lg:p-4 rounded-2xl backdrop-blur-md border border-white/10 lg:border-white/5 w-fit">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs text-white/50 uppercase tracking-wider">Headquarters</p>
                  <p className="text-sm lg:text-base font-medium text-white">Bhilai Chhattisgarh, India</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- RIGHT COLUMN: FORM --- */}
        <div className="order-1 lg:order-2 p-6 lg:p-8 rounded-3xl bg-pink-500/5 border-2 border-white/15 h-full flex flex-col justify-center">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center py-12 space-y-4">
              <CheckCircle className="w-16 h-16 text-pink-500" />
              <h3 className="text-2xl font-bold">Message Sent!</h3>
              <p className="text-white/50 text-center">We will get back to you shortly.</p>
              <button onClick={() => setSuccess(false)} className="text-pink-400 hover:underline">Send another</button>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-5 lg:space-y-6">
              <div className="space-y-2">
                 <h3 className="text-3xl lg:text-5xl font-bold">Get In Touch</h3>
                 <p className="text-white/50 text-sm lg:text-base">Fill out the form and we'll start the conversation.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50">First Name</label>
                  <input name="firstName" required type="text" className="w-full bg-black/20 border border-white/15 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition-colors text-white text-sm font-sans" placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50">Last Name</label>
                  <input name="lastName" required type="text" className="w-full bg-black/20 border border-white/15 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition-colors text-white text-sm font-sans" placeholder="Enter last name" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50">Email</label>
                <input name="email" required type="email" className="w-full bg-black/20 border border-white/15 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition-colors text-white text-sm font-sans" placeholder="username@gmail.com" />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50">Message</label>
                <textarea name="message" required className="w-full h-32 bg-black/20 border border-white/15 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition-colors resize-none text-white text-sm font-sans" placeholder="Tell us about your query..." />
              </div>

              <button disabled={pending} type="submit" className="w-full py-3 lg:py-4 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-500 text-white font-bold cursor-pointer text-base lg:text-lg hover:bg-pink-500/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
                {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};