import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { approveTestimonial, toggleMaintenance } from "@/actions/admin";
import { Power, CheckCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // 1. Fetch Testimonials
  const pendingTestimonials = await db.testimonial.findMany({
    where: { isPublic: false },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  // 2. Fetch System Settings (Maintenance Mode)
  const settings = await db.systemSettings.findUnique({
    where: { id: "settings" }
  });
  
  const isMaintenanceMode = settings?.maintenanceMode || false;

  return (
    <div className="p-4 md:p-8 text-white space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings & Configuration</h1>
          <p className="text-white/50 text-sm md:text-base">Manage global settings and content approvals.</p>
        </div>
      </div>

      {/* 1. SYSTEM CONTROLS (Maintenance Mode) */}
      <div className={`p-6 rounded-xl border transition-all duration-500 shadow-lg ${isMaintenanceMode ? "bg-red-500/10 border-red-500/50 shadow-red-500/5" : "bg-[#1f2937] border-white/10"}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${isMaintenanceMode ? "bg-red-500/20" : "bg-green-500/20"}`}>
                        <Power className={`w-6 h-6 ${isMaintenanceMode ? "text-red-400" : "text-green-400"}`} />
                     </div>
                     <h2 className="text-xl font-bold">Maintenance Mode</h2>
                     {isMaintenanceMode && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse">
                            ACTIVE
                        </span>
                     )}
                  </div>
                  <p className="text-sm text-white/60 max-w-xl leading-relaxed">
                      {isMaintenanceMode 
                        ? "⚠️ Users are currently BLOCKED from accessing AI tools. The dashboard is in lockdown mode. Only Admins can bypass this." 
                        : "System is running normally. Enable this to instantly block user access during database migrations or critical updates."}
                  </p>
              </div>
              
              {/* Dynamic Toggle Button */}
              <form action={async () => {
                  "use server";
                  await toggleMaintenance(isMaintenanceMode);
              }} className="w-full md:w-auto">
                  <Button 
                    variant={isMaintenanceMode ? "destructive" : "default"}
                    className={`w-full md:w-auto h-12 px-6 text-base font-semibold shadow-xl transition-all cursor-pointer ${
                        isMaintenanceMode 
                        ? "bg-red-600 hover:bg-red-700 shadow-red-900/20" 
                        : "bg-green-600 hover:bg-green-500 shadow-green-900/20"
                    }`}
                  >
                    {isMaintenanceMode ? "Turn Off Maintenance" : "Turn On Maintenance"}
                  </Button>
              </form>
          </div>
      </div>

      {/* 2. TESTIMONIAL APPROVAL SECTION */}
      <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-indigo-500 rounded-full" />
             <h2 className="text-xl font-bold">Pending Testimonials <span className="text-white/40 ml-2 text-sm font-normal">({pendingTestimonials.length} waiting)</span></h2>
          </div>
          
          {pendingTestimonials.length === 0 ? (
            <div className="bg-[#1f2937] border border-white/10 rounded-xl p-12 text-center flex flex-col items-center justify-center text-white/40 space-y-4">
                <CheckCircle className="w-12 h-12 text-white/20" />
                <p>All caught up! No pending testimonials.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingTestimonials.map((t) => (
                    <div key={t.id} className="group bg-[#111827] border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10">
                        <div className="space-y-4 mb-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarImage src={t.user.image || ""} />
                                        <AvatarFallback>{t.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm text-white line-clamp-1">{t.user.name}</p>
                                        <div className="flex text-yellow-500 text-xs">
                                            {"★".repeat(t.rating)}
                                            <span className="text-white/20 ml-1">{"★".repeat(5 - t.rating)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-indigo-400 transition-colors">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Message Bubble */}
                            <div className="relative bg-white/5 p-3 rounded-lg rounded-tl-none border border-white/5">
                                <p className="text-white/80 text-sm italic leading-relaxed">"{t.message}"</p>
                            </div>
                        </div>
                        
                        {/* Action */}
                        <form action={async () => {
                            "use server";
                            await approveTestimonial(t.id);
                        }} className="mt-auto pt-4 border-t border-white/5">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all group-hover:scale-[1.02] cursor-pointer">
                                Approve & Publish
                            </Button>
                        </form>
                    </div>
                ))}
            </div>
          )}
      </div>
    </div>
  );
}