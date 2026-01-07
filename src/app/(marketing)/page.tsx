import { Hero } from "@/components/landing/Hero";
// import { About } from "@/components/landing/About"; // Optional if you added it
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="flex flex-col w-full min-h-screen bg-black">
      {/* 1. Hero Section (3D & Parallax) */}
      <Hero />

      {/* 2. Features Grid (Bento Style) */}
      <Features />

      {/* 3. Testimonials (Reverse Scroll Slider) */}
      <Testimonials />
      
      {/* 4. Contact Form (Glassmorphism) */}
      <Contact />

      {/* 5. Footer (Animated Waves) */}
      <Footer />
    </main>
  );
}