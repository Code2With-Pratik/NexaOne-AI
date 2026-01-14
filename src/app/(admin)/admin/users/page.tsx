import { db } from "@/lib/db";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserActionsMenu } from "./_components/user-actions-menu";

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-white">User Management</h1>
         <span className="text-sm text-white/50">Total: {users.length}</span>
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#1f2937]">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-[#111827] text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-4">User</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Credits</th>
              <th scope="col" className="px-6 py-4">Joined</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
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
                  {user.isBlocked ? (
                    <Badge variant="destructive">Blocked</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20">Active</Badge>
                  )}
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
                  <UserActionsMenu 
                    userId={user.id} 
                    isBlocked={user.isBlocked} 
                    currentCredits={user.creditBalance} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}