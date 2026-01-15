import { db } from "@/lib/db";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TableControls } from "@/components/admin/table-controls";
import { CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const params = await searchParams;
  const query = params.search || "";
  const page = Number(params.page) || 1;
  const pageSize = 10;

  // Search by Email only
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
    <div className="p-4 md:p-8 text-white space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Billing & Transactions</h1>
            <span className="text-sm text-white/50">Total: {total}</span>
        </div>

        {/* 🔍 Search Controls */}
        <TableControls totalPages={Math.ceil(total / pageSize)} currentPage={page} placeholder="Search customer email..." />

        {/* === DESKTOP TABLE VIEW (Hidden on Mobile) === */}
        <div className="hidden md:block border border-white/10 rounded-xl overflow-hidden bg-[#1f2937]">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#111827] text-white/60 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Plan</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Payment ID</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition">
                            <td className="px-6 py-4 font-medium">{tx.user.email}</td>
                            <td className="px-6 py-4">
                                <Badge variant="outline" className="border-indigo-500 text-indigo-400">
                                    {/* 👇 UPDATED: Use stored plan name directly */}
                                    {tx.planName || "Unknown Plan"}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 font-bold text-green-400">
                                {/* 👇 UPDATED: Format as INR (₹) */}
                                ₹{(tx.amount / 100).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-white/40">
                                {/* 👇 NEW: Show Razorpay Payment ID */}
                                {tx.razorpayPaymentId || "-"}
                            </td>
                            <td className="px-6 py-4">
                                {tx.status === "SUCCESS" ? (
                                    <span className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase">
                                        <CheckCircle className="w-3 h-3" /> Paid
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase">
                                        <XCircle className="w-3 h-3" /> Failed
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-white/50 text-xs">
                                {format(tx.createdAt, "MMM d, yyyy")}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-white/50">No transactions found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* === MOBILE CARD VIEW (Visible on Mobile Only) === */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
            {transactions.map((tx) => (
                <div key={tx.id} className="bg-[#1f2937] p-4 rounded-xl border border-white/10 space-y-3">
                    {/* Header: Email & Amount */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white truncate max-w-[200px]">{tx.user.email}</span>
                            <span className="text-xs text-white/40">{format(tx.createdAt, "MMM d, h:mm a")}</span>
                        </div>
                        <span className="text-lg font-bold text-green-400">
                             {/* 👇 UPDATED: INR Format */}
                             ₹{(tx.amount / 100).toFixed(2)}
                        </span>
                    </div>

                    {/* Details: Plan & Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 text-[10px]">
                            {tx.planName || "Unknown"}
                        </Badge>
                        
                        {tx.status === "SUCCESS" ? (
                            <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                <CheckCircle className="w-3 h-3" /> PAID
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                <XCircle className="w-3 h-3" /> FAILED
                            </span>
                        )}
                    </div>
                    {/* Tiny Payment ID for reference */}
                    <div className="text-[10px] text-white/20 font-mono text-right">
                        ID: {tx.razorpayPaymentId}
                    </div>
                </div>
            ))}
            {transactions.length === 0 && (
                <div className="p-8 text-center text-white/50 bg-[#1f2937] rounded-xl border border-white/10">
                    No transactions found.
                </div>
            )}
        </div>
    </div>
  );
}