"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const About = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.from(".about-text", {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%", // Starts when top of section hits 80% of viewport
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-32 bg-black text-white overflow-hidden"
    >
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div className="space-y-8">
          <h2 className="about-text text-indigo-400 font-mono text-sm tracking-widest uppercase">
            About the Platform
          </h2>
          <h3 className="about-text text-4xl md:text-5xl font-bold leading-tight">
            Not just a tool. <br />
            An <span className="text-white/40">Extension of Your Mind.</span>
          </h3>
          <p className="about-text text-lg text-white/60 leading-relaxed">
            We combined the real-time connectivity of chat apps with the creative
            power of Generative AI. Whether you need to generate images, write
            articles, or hold a video conference, it all happens in one unified
            3D interface.
          </p>
          
          <div className="about-text grid grid-cols-2 gap-6 pt-4">
            <div>
              <h4 className="text-3xl font-bold text-white">10+</h4>
              <p className="text-sm text-gray-500">AI Tools</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-white">0ms</h4>
              <p className="text-sm text-gray-500">Latency</p>
            </div>
          </div>
        </div>

        {/* Right: Visual Abstract Shape */}
        <div className="relative h-[400px] bg-linear-to-tr from-indigo-500/10 to-purple-500/10 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="absolute w-64 h-64 bg-indigo-500/30 rounded-full blur-[100px] animate-pulse" />
          <div className="relative z-10 text-center glass-panel p-8 rounded-xl max-w-xs">
             <p className="text-2xl font-semibold">"The Swiss Army Knife for Digital Creators"</p>
          </div>
        </div>
      </div>
    </section>
  );
};