import { db } from "@/lib/db";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ReplyDialog } from "./_components/reply-dialog"; // Client Component for reply input

export default async function AdminSupportPage() {
  const tickets = await db.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="p-8 text-white space-y-6">
      <h1 className="text-2xl font-bold">Support Inbox</h1>
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
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-white/5">
                <td className="px-6 py-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={ticket.user.image || ""} />
                    <AvatarFallback>{ticket.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                     <p className="font-medium">{ticket.user.name}</p>
                     <p className="text-xs text-white/50">{ticket.user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                    <p className="font-bold text-xs mb-1 text-indigo-300">{ticket.subject}</p>
                    <p className="truncate text-white/70">{ticket.message}</p>
                </td>
                <td className="px-6 py-4">
                    <Badge variant={ticket.status === "PENDING" ? "secondary" : "default"}>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}