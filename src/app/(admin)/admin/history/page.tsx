import { db } from "@/lib/db";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableControls } from "@/components/admin/table-controls";
import { Clock, Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHistoryPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const params = await searchParams;
  const query = params.search || "";
  const page = Number(params.page) || 1;
  const pageSize = 8;

  const whereClause = query ? {
    OR: [
        { user: { name: { contains: query, mode: "insensitive" as const } } },
        { user: { email: { contains: query, mode: "insensitive" as const } } },
        { tool: { contains: query, mode: "insensitive" as const } }
    ]
  } : {};

  const [total, history] = await Promise.all([
    db.history.count({ where: whereClause }),
    db.history.findMany({
      where: whereClause,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    })
  ]);

  return (
    <div className="p-4 md:p-8 text-white space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Global Log</h1>
        <span className="text-sm text-white/50">Total: {total}</span>
      </div>

      <TableControls totalPages={Math.ceil(total / pageSize)} currentPage={page} placeholder="Search user, email or tool..." />
      
      {/* === DESKTOP TABLE === */}
      <div className="hidden md:block border border-white/10 rounded-xl overflow-hidden bg-[#1f2937]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#111827] text-white/60 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Tool</th>
              <th className="px-6 py-4">Prompt</th>
              <th className="px-6 py-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={item.user.image || ""} />
                            <AvatarFallback>{item.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{item.user.name}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-indigo-400 font-medium">{item.tool}</td>
                <td className="px-6 py-4 max-w-xs truncate text-white/70" title={item.query}>
                    {item.query}
                </td>
                <td className="px-6 py-4 text-white/40 text-xs">
                    {format(item.createdAt, "MMM d, h:mm a")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === MOBILE CARD VIEW === */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
          {history.map((item) => (
              <div key={item.id} className="bg-[#1f2937] p-4 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={item.user.image || ""} />
                              <AvatarFallback>{item.user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-bold text-white">{item.user.name}</span>
                      </div>
                      <span className="text-xs text-indigo-400 font-bold px-2 py-1 bg-indigo-500/10 rounded border border-indigo-500/20">{item.tool}</span>
                  </div>
                  
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 text-white/40 mb-1 text-[10px] uppercase font-bold tracking-wider">
                          <Terminal className="w-3 h-3" /> Input
                      </div>
                      <p className="text-sm text-white/80 line-clamp-2">"{item.query}"</p>
                  </div>

                  <div className="flex items-center justify-end text-xs text-white/30 pt-1">
                      <Clock className="w-3 h-3 mr-1" /> {format(item.createdAt, "MMM d, h:mm a")}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}