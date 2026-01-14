import { db } from "@/lib/db";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminHistoryPage() {
  const history = await db.history.findMany({
    take: 50, // Only show last 50 to keep it fast
    orderBy: { createdAt: "desc" },
    include: {
      user: true, // Fetch user details for each log
    },
  });

  return (
    <div className="p-8 text-white space-y-6">
      <h1 className="text-2xl font-bold">Global Generation Log</h1>
      
      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#1f2937]">
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
                    {format(item.createdAt, "PP p")}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-white/50">No generations found yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}