import { db } from "@/lib/db";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ReplyDialog } from "../support/_components/reply-dialog";
import { cn } from "@/lib/utils";
import { QueryControls } from "./_components/query-controls";
import { CornerDownRight, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminQueriesPageProps {
  // 👇 1. UPDATE TYPE: searchParams is now a Promise
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function AdminQueriesPage(props: AdminQueriesPageProps) {
  // 👇 2. AWAIT THE PROMISE before using properties
  const searchParams = await props.searchParams;

  const query = searchParams.search || "";
  const page = Number(searchParams.page) || 1;
  const pageSize = 6;
  const skip = (page - 1) * pageSize;

  // Filter Logic
  const whereClause = query ? {
    OR: [
        { user: { name: { contains: query, mode: "insensitive" as const } } },
        { user: { email: { contains: query, mode: "insensitive" as const } } }
    ]
  } : {};

  // Fetch Data
  const [totalCount, queries] = await Promise.all([
    db.supportTicket.count({ where: whereClause }),
    db.supportTicket.findMany({
      where: whereClause,
      take: pageSize,
      skip: skip,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 md:p-8 text-white space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">User Queries & Support</h1>
          <Badge variant="outline" className="w-fit text-white border-white/20">
            {totalCount} Result{totalCount !== 1 ? "s" : ""}
          </Badge>
      </div>

      <QueryControls totalPages={totalPages} currentPage={page} />
      
      {/* TABLE SECTION */}
      <div className="hidden md:block border border-white/10 rounded-xl overflow-hidden bg-[#1f2937]">
          <table className="w-full text-sm text-left">
              <thead className="bg-[#111827] text-white/60 uppercase text-xs">
                  <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Query Details</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                  </tr>
              </thead>
              
              {queries.map((ticket) => (
                  <tbody key={ticket.id} className="hover:bg-white/5 transition border-b border-white/5 group">
                      <tr>
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-white/10">
                                      <AvatarImage src={ticket.user.image || ""} />
                                      <AvatarFallback>{ticket.user.name?.[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <p className="font-medium text-white">{ticket.user.name}</p>
                                      <div className="flex items-center gap-1 text-xs text-white/50">
                                          <Mail className="w-3 h-3" /> {ticket.user.email}
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4 max-w-sm">
                              <p className="font-bold text-xs mb-1 text-indigo-300">{ticket.subject}</p>
                              <p className="truncate text-white/80">{ticket.message}</p>
                          </td>
                          <td className="px-6 py-4">
                              <Badge className={cn("font-medium border-0", getStatusColor(ticket.status))}>
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
                      {/* Reply Row */}
                      {ticket.adminReply && (
                          <tr className="bg-indigo-500/5 border-t border-indigo-500/10">
                              <td colSpan={5} className="px-6 py-3">
                                  <div className="flex items-start gap-2 text-sm text-white/80 pl-12">
                                      <CornerDownRight className="w-4 h-4 text-indigo-400 mt-0.5" />
                                      <div>
                                          <span className="text-xs font-bold text-indigo-300 uppercase mr-2">Admin Reply:</span>
                                          <span className="italic">"{ticket.adminReply}"</span>
                                      </div>
                                  </div>
                              </td>
                          </tr>
                      )}
                  </tbody>
              ))}

              {queries.length === 0 && (
                  <tbody>
                      <tr>
                          <td colSpan={5} className="p-12 text-center">
                              <p className="text-white/50 text-lg">No results found.</p>
                              {query && <p className="text-white/30 text-sm mt-1">We couldn't find any tickets matching "{query}"</p>}
                          </td>
                      </tr>
                  </tbody>
              )}
          </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
          {queries.map((ticket) => (
              <div key={ticket.id} className="bg-[#1f2937] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                           <Avatar className="h-8 w-8">
                              <AvatarImage src={ticket.user.image || ""} />
                              <AvatarFallback>{ticket.user.name?.[0]}</AvatarFallback>
                           </Avatar>
                           <span className="font-bold text-sm">{ticket.user.name}</span>
                      </div>
                      <Badge className={cn("text-[10px]", getStatusColor(ticket.status))}>
                          {ticket.status}
                      </Badge>
                  </div>
                  
                  <div className="text-sm text-white/80 bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="font-bold text-indigo-300 text-xs mb-1">{ticket.subject}</p>
                      {ticket.message}
                  </div>

                  {ticket.adminReply && (
                      <div className="ml-4 pl-3 border-l-2 border-green-500 text-sm text-white/70">
                          <p className="text-xs font-bold text-green-400 mb-1">Admin Reply:</p>
                          "{ticket.adminReply}"
                      </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs text-white/40">{format(ticket.createdAt, "MMM d, h:mm a")}</span>
                      <ReplyDialog ticketId={ticket.id} currentStatus={ticket.status} />
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
    switch (status) {
        case "RESOLVED": return "bg-green-500/20 text-green-400";
        case "REJECTED": return "bg-red-500/20 text-red-400";
        default: return "bg-yellow-500/20 text-yellow-400";
    }
}