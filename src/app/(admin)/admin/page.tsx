import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, DollarSign } from "lucide-react";

export default async function AdminOverviewPage() {
  // 1. Fetch Real Data
  const userCount = await db.user.count();
  const historyCount = await db.history.count(); // Ensure you have this model, or remove if not
  
  // Calculate total credits in circulation
  const creditSum = await db.user.aggregate({
    _sum: { creditBalance: true }
  });

  const totalCredits = creditSum._sum.creditBalance || 0;

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="bg-[#1f2937] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-white/50">+20% from last month</p>
          </CardContent>
        </Card>

        {/* Total Generations */}
        <Card className="bg-[#1f2937] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historyCount}</div>
            <p className="text-xs text-white/50">+180 since last hour</p>
          </CardContent>
        </Card>

        {/* Credits Active */}
        <Card className="bg-[#1f2937] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-white/50">Global Balance</p>
          </CardContent>
        </Card>

        {/* Revenue (Mock) */}
        <Card className="bg-[#1f2937] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-white/50">Connect Stripe to see this</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}