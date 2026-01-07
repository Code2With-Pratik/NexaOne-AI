import { Hero } from "@/components/landing/Hero";
// You might need to create the About component if you haven't yet, 
// or remove this import line if you skipped it.
// import { About } from "@/components/landing/About"; 
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";

export default function LandingPage() {
  return (
    <main className="flex flex-col w-full min-h-screen bg-black">
      {/* 1. Hero (3D & Parallax) */}
      <Hero />

      {/* 2. Features (Bento Grid) */}
      <Features />

      {/* 3. Testimonials (Reverse Scroll Slider) */}
      <Testimonials />
      
      {/* 4. Footer Placeholder */}
      <div className="h-64 flex items-center justify-center border-t border-white/10">
        <p className="text-gray-500">Footer Coming Soon...</p>
      </div>
    </main>
  );
}