import { db } from "@/lib/db";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TableControls } from "@/components/admin/table-controls"; // 👈 Reuse

export const dynamic = "force-dynamic";

export default async function AdminBillingPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const params = await searchParams;
  const query = params.search || "";
  const page = Number(params.page) || 1;
  const pageSize = 10;

  // Search by Email only (usually sufficient for billing)
  const whereClause = query ? {
    user: { email: { contains: query, mode: "insensitive" as const } }
  } : {};

  const [total, transactions] = await Promise.all([
    db.transaction.count({ where: whereClause }),
    db.transaction.findMany({
      where: whereClause,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })
  ]);

  return (
    <div className="p-8 text-white space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Billing & Transactions</h1>
            <span className="text-sm text-white/50">Total: {total}</span>
        </div>

        {/* 🔍 Add Controls */}
        <TableControls totalPages={Math.ceil(total / pageSize)} currentPage={page} placeholder="Search customer email..." />

        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#1f2937]">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#111827] text-white/60 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Plan</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 font-medium">{tx.user.email}</td>
                            <td className="px-6 py-4">
                                <Badge variant="outline" className="border-indigo-500 text-indigo-400">
                                    {tx.credits > 50 ? "Ultra Plan" : "Pro Plan"}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 font-bold text-green-400">
                                ${(tx.amount / 100).toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                                {tx.status === "SUCCESS" ? (
                                    <span className="text-green-500 text-xs font-bold uppercase">Paid</span>
                                ) : (
                                    <span className="text-red-500 text-xs font-bold uppercase">Failed</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-white/50 text-xs">
                                {format(tx.createdAt, "MMM d, yyyy")}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-white/50">No transactions found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}