import { db } from "@/lib/db";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { approveTestimonial } from "@/actions/admin"; // You need to add this to actions/admin.ts

export default async function AdminSettingsPage() {
  const pendingTestimonials = await db.testimonial.findMany({
    where: { isPublic: false },
    include: { user: true }
  });

  return (
    <div className="p-8 text-white space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings & Configuration</h1>
        <p className="text-white/50">Manage global settings and content approvals.</p>
      </div>

      {/* Testimonial Approval Section */}
      <div className="bg-[#1f2937] p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-bold mb-4">Pending Testimonials ({pendingTestimonials.length})</h2>
          
          <div className="space-y-4">
            {pendingTestimonials.length === 0 && (
                <p className="text-white/30 italic">No pending testimonials to approve.</p>
            )}
            
            {pendingTestimonials.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-[#111827] p-4 rounded-lg border border-white/5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-indigo-400">{t.user.name}</span>
                            <span className="text-yellow-500 text-xs">{"★".repeat(t.rating)}</span>
                        </div>
                        <p className="text-white/80 text-sm">"{t.message}"</p>
                    </div>
                    
                    <form action={async () => {
                        "use server";
                        await approveTestimonial(t.id);
                    }}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-500">Approve</Button>
                    </form>
                </div>
            ))}
          </div>
      </div>
      
      {/* Maintenance Mode Placeholder */}
      <div className="bg-[#1f2937] p-6 rounded-xl border border-white/10 opacity-50 cursor-not-allowed">
          <h2 className="text-xl font-bold mb-4">System Settings</h2>
          <div className="flex items-center justify-between">
              <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-xs text-white/50">Disable access for all non-admin users.</p>
              </div>
              <Button disabled variant="secondary">Disabled (Pro Feature)</Button>
          </div>
      </div>
    </div>
  );
}