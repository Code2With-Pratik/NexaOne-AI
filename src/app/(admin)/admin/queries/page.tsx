import { db } from "@/lib/db";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ReplyDialog } from "../support/_components/reply-dialog"; // Reuse the reply component we made!

export default async function AdminQueriesPage() {
  const queries = await db.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="p-8 text-white space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Queries & Support</h1>
          <Badge variant="outline" className="text-white border-white/20">{queries.length} Total</Badge>
      </div>
      
      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#1f2937]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#111827] text-white/60 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Query</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {queries.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4 flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarImage src={ticket.user.image || ""} />
                    <AvatarFallback>{ticket.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                     <p className="font-medium text-white">{ticket.user.name}</p>
                     <p className="text-xs text-white/50">{ticket.user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-sm">
                    <p className="font-bold text-xs mb-1 text-indigo-300">{ticket.subject}</p>
                    <p className="truncate text-white/80">{ticket.message}</p>
                </td>
                <td className="px-6 py-4">
                    <Badge className={cn(
                        ticket.status === "RESOLVED" ? "bg-green-500/20 text-green-400" : 
                        ticket.status === "REJECTED" ? "bg-red-500/20 text-red-400" : 
                        "bg-yellow-500/20 text-yellow-400"
                    )}>
                        {ticket.status}
                    </Badge>
                </td>
                <td className="px-6 py-4 text-xs text-white/50">
                    {format(ticket.createdAt, "MMM d, HH:mm")}
                </td>
                <td className="px-6 py-4 text-right">
                    <ReplyDialog ticketId={ticket.id} currentStatus={ticket.status} />
                </td>
              </tr>
            ))}
            {queries.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-white/50">No pending queries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}