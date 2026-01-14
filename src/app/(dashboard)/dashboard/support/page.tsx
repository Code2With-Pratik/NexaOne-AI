import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SupportForm } from "./_components/support-form"; // Client Component
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export default async function UserSupportPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const tickets = await db.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* 1. Dynamic Contact Form */}
      <div className="grid gap-8 md:grid-cols-2">
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Contact Support</h1>
            <p className="text-white/60 mb-8">Having issues with payments or AI generations? Let us know.</p>
            <SupportForm />
        </div>

        {/* 2. My Queries List */}
        <div className="space-y-4">
             <h2 className="text-xl font-bold text-white">My Ticket History</h2>
             {tickets.length === 0 && <p className="text-white/40">No tickets submitted yet.</p>}
             
             {tickets.map((ticket) => (
                <Card key={ticket.id} className="p-4 bg-white/5 border-white/10 text-white">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold">{ticket.subject}</span>
                        <Badge variant={
                            ticket.status === "RESOLVED" ? "default" : 
                            ticket.status === "REJECTED" ? "destructive" : "secondary"
                        }>
                            {ticket.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-white/70 truncate">{ticket.message}</p>
                    
                    {/* Admin Reply Section */}
                    {ticket.adminReply && (
                        <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                            <p className="text-xs text-indigo-300 font-bold mb-1">Admin Response:</p>
                            <p className="text-sm text-white/90">{ticket.adminReply}</p>
                        </div>
                    )}
                    <p className="text-xs text-white/30 mt-2 text-right">
                        {format(ticket.createdAt, "MMM d, yyyy")}
                    </p>
                </Card>
             ))}
        </div>
      </div>
    </div>
  );
}