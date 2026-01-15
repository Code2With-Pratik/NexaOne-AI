import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 👇 ADD '/api/razorpay(.*)' TO THIS LIST
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/api/image(.*)',
  '/api/conversation(.*)',
  '/api/code(.*)',
  '/api/music(.*)',
  '/api/video(.*)',
  '/api/razorpay(.*)', // 👈 Added: Protects payment routes
  '/admin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};