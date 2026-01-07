import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { DashboardPreview } from "@/components/landing/DashboardPreview"; // New
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing"; // New
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="flex flex-col w-full min-h-screen bg-black">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Features Grid */}
      <Features />

      {/* 3. Dashboard Demo (The "Experience") */}
      <DashboardPreview />

      {/* 4. Social Proof */}
      <Testimonials />
      
      {/* 5. Pricing Plans */}
      <Pricing />
      
      {/* 6. Contact Form */}
      <Contact />

      {/* 7. Footer */}
      <Footer />
    </main>
  );
}