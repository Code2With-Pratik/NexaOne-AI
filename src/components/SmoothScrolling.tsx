"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation"; // 👈 1. Import usePathname

export default function SmoothScrolling() {
  const pathname = usePathname();

  // 👇 2. Define logic to disable Lenis
  // If the user is on the Landing page ('/') or About page, run Lenis.
  // If they are on '/chat', '/dashboard', '/call-logs', etc., DO NOT run it.
  
  // OPTION A: Disable on specific App routes (Recommended)
  // Check if the current path starts with any of these "App" folders
  const isAppRoute = ["/chat", "/dashboard", "/assistant", "/logs"].some(route => 
    pathname.startsWith(route)
  );

  // OPTION B: Only enable on Home Page (Strict)
  // const isAppRoute = pathname !== "/"; 

  // 👇 3. Early Return: If we are on an App route, return nothing. 
  // This prevents Lenis from ever initializing or hijacking scroll events.
  if (isAppRoute) {
    return null;
  }

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}