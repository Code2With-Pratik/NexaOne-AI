import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Zap, Calendar, Mail, User as UserIcon, CreditCard, ExternalLink } from "lucide-react";
import { ProTipsCarousel } from "@/components/dashboard/ProTipsCarousel";
import Link from "next/link";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) redirect("/sign-in");

  // Fetch DB user for credits & plan details
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId }
  });

  if (!dbUser) return null;

  // Logic to determine Plan Name from DB (Default to "Free Tier")
  const planName = dbUser.planName || "Free Tier";
  
  // Dynamic Styling based on Plan
  let planColor = "text-gray-400 border-white/10 bg-white/5";
  if (planName === "Ultra Plan") {
      planColor = "text-purple-400 border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]";
  } else if (planName === "Pro Plan") {
      planColor = "text-pink-400 border-pink-500/50 bg-pink-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">My Account</h1>
        <p className="text-white/70">Manage your profile and subscription details.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* CARD 1: PROFILE & CREDITS */}
        <Card className="bg-pink-600/10 border-2 border-pink-500/30 text-white shadow-xl relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="w-5 h-5 text-pink-600" /> Profile Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* User Info Row */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/10 shadow-lg">
                <AvatarImage src={user.imageUrl || ""} />
                <AvatarFallback className="bg-pink-600 text-white">{user.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-bold leading-none">{user.fullName}</h3>
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                   <Mail className="w-3 h-3" /> {user.emailAddresses[0].emailAddress}
                </div>
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-4">
                {/* Credit Balance */}
                <div className="p-4 bg-black/2 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase font-bold tracking-wider">
                        <Zap className="w-3 h-3 text-yellow-500" /> Credits
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">
                        {dbUser.creditBalance.toLocaleString()}
                    </div>
                </div>

                {/* Joined Date */}
                <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase font-bold tracking-wider">
                        <Calendar className="w-3 h-3 text-blue-400" /> Joined
                    </div>
                    <div className="text-lg font-medium text-white">
                        {format(dbUser.createdAt, "MMM d, yyyy")}
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: CURRENT PLAN */}
        <Card className="bg-white/2 border-2 border-white/20 text-white shadow-xl flex flex-col">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-green-400" /> Subscription
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 pt-6 space-y-6">
             <div className="space-y-2">
                 <h4 className="text-sm font-medium text-white/60 uppercase tracking-wide">Current Plan</h4>
                 <div className={`inline-flex items-center px-4 py-2 rounded-lg border transition-all ${planColor}`}>
                     <span className="font-bold text-lg">{planName}</span>
                     {planName !== "Free Tier" && <Badge className="ml-3 bg-green-500 hover:bg-green-600 text-white border-0">ACTIVE</Badge>}
                 </div>
             </div>

             <div className="space-y-2">
                 <p className="text-sm text-white/50">
                    {planName === "Free Tier" 
                        ? "Upgrade to Pro to unlock higher limits and faster generation speeds." 
                        : "Your credits never expire. Top up anytime."}
                 </p>
             </div>
          </CardContent>

          <CardFooter className="pt-6 border-t border-white/5 bg-black/10">
             {/* Razorpay Flow: Redirect to Pricing to buy more or upgrade */}
             <Link href="/#pricing" className="w-full">
                 <Button className="w-full gap-2 bg-white/3 hover:bg-white/5 hover:text-white text-white/70 border border-white/10 cursor-pointer" variant="outline">
                     {planName === "Free Tier" ? "Upgrade Plan" : "Buy More Credits"} 
                     <ExternalLink className="w-4 h-4 opacity-50" />
                 </Button>
             </Link>
          </CardFooter>
        </Card>

      </div>

      {/* 👇 PRO TIPS SECTION */}
      <div className="pt-2">
         <ProTipsCarousel />
      </div>

    </div>
  );
}