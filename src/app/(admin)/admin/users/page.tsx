import { db } from "@/lib/db";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserActionsMenu } from "./_components/user-actions-menu";
import { TableControls } from "@/components/admin/table-controls";
import { Mail, Calendar, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const params = await searchParams;
  const query = params.search || "";
  const page = Number(params.page) || 1;
  const pageSize = 10;

  const whereClause = query ? {
    OR: [
      { name: { contains: query, mode: "insensitive" as const } },
      { email: { contains: query, mode: "insensitive" as const } }
    ]
  } : {};

  const [total, users] = await Promise.all([
    db.user.count({ where: whereClause }),
    db.user.findMany({
      where: whereClause,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
    })
  ]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-white">User Management</h1>
         <Badge variant="outline" className="text-white border-white/20">{total} Users</Badge>
      </div>

      <TableControls totalPages={Math.ceil(total / pageSize)} currentPage={page} placeholder="Search name or email..." />

      {/* === DESKTOP TABLE VIEW (Hidden on Mobile) === */}
      <div className="hidden md:block border border-white/10 rounded-xl overflow-hidden bg-[#1f2937]">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-[#111827] text-gray-400">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Credits</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="px-6 py-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-indigo-500">{user.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{user.name || "No Name"}</span>
                    <span className="text-xs text-white/40">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.isBlocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="secondary" className="bg-green-500/10 text-green-400">Active</Badge>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 font-mono text-white">
                    <span className="text-yellow-500">⚡</span> {user.creditBalance}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <UserActionsMenu userId={user.id} isBlocked={user.isBlocked} currentCredits={user.creditBalance} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === MOBILE CARD VIEW (Visible on Mobile) === */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
         {users.map((user) => (
            <div key={user.id} className="bg-[#1f2937] p-4 rounded-xl border border-white/10 space-y-4">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <Avatar>
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>{user.email[0]}</AvatarFallback>
                     </Avatar>
                     <div>
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-white/50">{user.email}</p>
                     </div>
                  </div>
                  <UserActionsMenu userId={user.id} isBlocked={user.isBlocked} currentCredits={user.creditBalance} />
               </div>
               
               <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black/20 p-2 rounded flex items-center gap-2 text-white/70">
                     <Zap className="w-4 h-4 text-yellow-500" /> {user.creditBalance} Credits
                  </div>
                  <div className="bg-black/20 p-2 rounded flex items-center gap-2 text-white/70">
                     <Calendar className="w-4 h-4 text-indigo-400" /> {format(new Date(user.createdAt), "MMM d")}
                  </div>
               </div>

               <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-white/40">Status:</span>
                  {user.isBlocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="secondary" className="bg-green-500/10 text-green-400">Active</Badge>}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}