import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, DollarSign } from "lucide-react";
import { AdminChart } from "@/components/admin/AdminChart"; 
import { AdminPieChart } from "@/components/admin/AdminPieChart"; 
import { startOfDay, subDays, format } from "date-fns";

export default async function AdminOverviewPage() {
  // 1. Fetch Summary Data
  const userCount = await db.user.count();
  const historyCount = await db.history.count();
  
  // Calculate Total Credits
  const creditSum = await db.user.aggregate({ _sum: { creditBalance: true } });
  const totalCredits = creditSum._sum.creditBalance || 0;

  // 2. Fetch Revenue (Sum of successful transactions)
  const revenueSum = await db.transaction.aggregate({
     where: { status: "SUCCESS" },
     _sum: { amount: true }
  });
  const totalRevenue = revenueSum._sum.amount ? (revenueSum._sum.amount / 100).toFixed(2) : "0.00";

  // 3. Prepare Bar Chart Data (Last 7 Days)
  const chartData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const start = startOfDay(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const users = await db.user.count({ where: { createdAt: { gte: start, lte: end } } });
      const generations = await db.history.count({ where: { createdAt: { gte: start, lte: end } } });

      chartData.push({
          name: format(date, "EEE"), // e.g., "Mon"
          users,
          generations
      });
  }

  // 4. Prepare Pie Chart Data (Grouped by Tool)
  const toolUsage = await db.history.groupBy({
    by: ['tool'],
    _count: { tool: true },
  });

  const pieData = toolUsage.map((item) => ({
    name: item.tool,
    value: item._count.tool,
  }));

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      <h2 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h2>
      
      {/* SUMMARY CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Users" value={userCount} subtext="All time users" icon={Users} color="text-indigo-400" />
        <DashboardCard title="AI Generations" value={historyCount} subtext="All time requests" icon={Activity} color="text-pink-500" />
        <DashboardCard title="Credits Outstanding" value={totalCredits} subtext="Global Balance" icon={CreditCard} color="text-yellow-500" />
        <DashboardCard title="Revenue" value={`$${totalRevenue}`} subtext="Lifetime Earnings" icon={DollarSign} color="text-green-500" />
      </div>

      {/* 📊 CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
         {/* Bar Chart: 4 Columns */}
         <div className="col-span-1 lg:col-span-4">
            <AdminChart data={chartData} />
         </div>
         
         {/* Pie Chart: 3 Columns */}
         <div className="col-span-1 lg:col-span-3">
            <AdminPieChart data={pieData} />
         </div>
      </div>
    </div>
  );
}

// Small helper component for cleaner code
function DashboardCard({ title, value, subtext, icon: Icon, color }: any) {
  return (
    <Card className="bg-[#1F2937] border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-8 w-8 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-white/50">{subtext}</p>
      </CardContent>
    </Card>
  );
}