import { db } from "@/lib/db";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function AdminBillingPage() {
  // Fetch transactions (Ensure you have a Transaction model in Prisma)
  const transactions = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="p-8 text-white space-y-6">
        <h1 className="text-2xl font-bold">Billing & Transactions</h1>

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
                        <tr><td colSpan={5} className="p-8 text-center text-white/50">No transactions yet. Connect Stripe!</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}