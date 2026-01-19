import React from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getCreditBalance } from "@/lib/api-limit";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  // 1. Fetch User & Settings Parallelly for speed
  const [user, settings] = await Promise.all([
    db.user.findUnique({ where: { clerkId: userId } }),
    db.systemSettings.findUnique({ where: { id: "settings" } })
  ]);

  // 2. 🛑 BANNED USER CHECK
  if (user?.isBlocked) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Account Suspended</h1>
            <p className="text-white/60">Your account has been banned due to policy violations.</p>
            <p className="text-white/40 mt-2">Contact support if you think this is a mistake.</p>
        </div>
    );
  }

  // 3. 🛠️ MAINTENANCE MODE CHECK
  const isMaintenanceMode = settings?.maintenanceMode || false;
  const isUserAdmin = user?.role === "ADMIN";

  if (isMaintenanceMode && !isUserAdmin) {
     return (
        <div className="h-screen flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10 blur-[100px]" />
             <div className="z-10 text-center space-y-6 max-w-lg">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <span className="text-4xl">🚧</span>
                </div>
                <h1 className="text-4xl font-bold">System Under Maintenance</h1>
                <p className="text-lg text-white/60">
                    NexaOne AI is currently being upgraded. We will be back online in 24-48 hours.
                </p>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-sm font-mono text-red-500">Status: Deploying Pro Features...</p>
                </div>
             </div>
        </div>
     );
  }

  // 4. Normal Loading: Fetch Credits
  const creditBalance = await getCreditBalance();

  return (
    // 👇 FIX: The 'data-lenis-prevent' attribute here disables smooth scrolling 
    // for EVERYTHING inside this layout (Sidebar, Chat, Logs, History).
    // className="contents" ensures this div doesn't break your layout styling.
    <div data-lenis-prevent className="contents">
        <DashboardClient creditBalance={creditBalance} isAdmin={isUserAdmin}>
            {children}
        </DashboardClient>
    </div>
  );
}