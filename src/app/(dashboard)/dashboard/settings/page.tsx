import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Zap, Calendar, Mail, User as UserIcon, CreditCard, ExternalLink } from "lucide-react";
import { ProTipsCarousel } from "@/components/dashboard/ProTipsCarousel";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) redirect("/sign-in");

  // Fetch DB user for credits & member date
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId }
  });

  if (!dbUser) return null;

  // Logic to determine Plan Name based on credits (or your own logic)
  const planName = dbUser.creditBalance > 1000 ? "Ultra Plan" : dbUser.creditBalance > 100 ? "Pro Plan" : "Free Plan";
  const planColor = planName === "Ultra Plan" ? "text-purple-400 border-purple-500/50 bg-purple-500/10" : 
                    planName === "Pro Plan" ? "text-indigo-400 border-indigo-500/50 bg-indigo-500/10" : 
                    "text-gray-400 border-white/10 bg-white/5";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Account</h1>
        <p className="text-white/50">Manage your profile and subscription details.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* CARD 1: PROFILE & CREDITS */}
        <Card className="bg-[#4f39f612] border-2 border-white/10 text-white shadow-xl relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="w-5 h-5 text-indigo-400" /> Profile Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* User Info Row */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/10 shadow-lg">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback className="bg-indigo-600 text-white">{user.firstName?.[0]}</AvatarFallback>
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
                <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase font-bold tracking-wider">
                        <Zap className="w-3 h-3 text-yellow-500" /> Credits
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">
                        {dbUser.creditBalance}
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
        <Card className="bg-[#4f39f612] border-2 border-white/10 text-white shadow-xl flex flex-col">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-green-400" /> Subscription
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 pt-6 space-y-6">
             <div className="space-y-2">
                 <h4 className="text-sm font-medium text-white/60 uppercase tracking-wide">Current Plan</h4>
                 <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${planColor}`}>
                     <span className="font-bold text-lg">{planName}</span>
                     {planName !== "Free Plan" && <Badge className="ml-3 bg-green-500 hover:bg-green-600 text-white border-0">ACTIVE</Badge>}
                 </div>
             </div>

             <div className="space-y-2">
                 <p className="text-sm text-white/50">
                    {planName === "Free Plan" 
                        ? "Upgrade to Pro to unlock higher limits and faster generation speeds." 
                        : "Your plan renews automatically. You can cancel anytime."}
                 </p>
             </div>
          </CardContent>

          <CardFooter className="pt-6 border-t border-white/5 bg-black/10">
             {/* If using Stripe Customer Portal, you would link to it here */}
             <Button className="w-full gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10" variant="outline">
                 Manage Subscription <ExternalLink className="w-4 h-4 opacity-50" />
             </Button>
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