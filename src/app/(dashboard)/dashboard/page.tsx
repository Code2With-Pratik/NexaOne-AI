import React from "react";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { 
  History, 
  Sparkles, 
  MessageSquare, 
  ImageIcon, 
  VideoIcon, 
  PenTool, 
  Search, 
  Mail, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import FeedbackForm from "@/components/dashboard/FeedbackForm";

// --- CONFIGURATION ---
const tools = [
  { label: "AI Chatbot", icon: MessageSquare, color: "text-violet-500", bgColor: "bg-violet-500/10", href: "/dashboard/ai-tools/assistant" },
  { label: "Image Generator", icon: ImageIcon, color: "text-pink-700", bgColor: "bg-pink-700/10", href: "/dashboard/ai-tools/image-generator" },
  { label: "Caption Generator", icon: VideoIcon, color: "text-orange-700", bgColor: "bg-orange-700/10", href: "/dashboard/ai-tools/social-caption" },
  { label: "Article Writer", icon: PenTool, color: "text-emerald-500", bgColor: "bg-emerald-500/10", href: "/dashboard/ai-tools/article-writer" },
  { label: "Email Generator", icon: Mail, color: "text-green-700", bgColor: "bg-green-700/10", href: "/dashboard/ai-tools/email-generator" },
  { label: "Search Engine", icon: Search, color: "text-blue-500", bgColor: "bg-blue-500/10", href: "/dashboard/ai-tools/search-engine" }
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Fetch Data in Parallel
  const [history, queries] = await Promise.all([
    db.history.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" }
    }),
    db.supportTicket.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="mb-8 space-y-10 pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="space-y-4 text-center pt-8 px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-white text-center">
          Unleash your creative power
        </h2>
        <p className="text-white/60 font-light text-sm md:text-lg text-center max-w-2xl mx-auto">
          Chat with the smartest AI - Experience the power of AI with our suite of tools.
        </p>
      </div>

      {/* 2. TOOLS GRID (Responsive) */}
      <div className="px-4 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-4 border border-white/10 flex items-center justify-between rounded-xl hover:shadow-md hover:bg-white/5 transition cursor-pointer group bg-black/20"
            >
              <div className="flex items-center gap-x-4">
                <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                  <tool.icon className={cn("w-8 h-8", tool.color)} />
                </div>
                <div className="font-semibold text-white">
                  {tool.label}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-12 lg:px-20 grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* 3. HISTORY & QUERIES (Tabs/Split) */}
          <div className="space-y-8">
             
             {/* History Section */}
             <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    </div>
                    <Link href="/dashboard/history" className="text-xs text-white/40 hover:text-white">View All</Link>
                </div>
                
                <div className="space-y-3">
                    {history.length === 0 && <p className="text-white/30 text-sm">No activity yet.</p>}
                    {history.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium text-white truncate w-40 md:w-60">{item.tool}</span>
                                <span className="text-xs text-white/50 truncate w-40 md:w-60">"{item.query}"</span>
                            </div>
                            <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">
                                {format(item.createdAt, "h:mm a")}
                            </span>
                        </div>
                    ))}
                </div>
             </div>

             {/* Queries Section */}
             <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-pink-400" />
                    <h3 className="text-lg font-bold text-white">My Support Queries</h3>
                </div>
                
                <div className="space-y-3">
                    {queries.length === 0 && <p className="text-white/30 text-sm">No queries sent.</p>}
                    {queries.map((q) => (
                        <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                            <div>
                                <p className="text-sm font-medium text-white">{q.subject}</p>
                                <p className="text-xs text-white/50">{format(q.createdAt, "MMM d, yyyy")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {q.status === "RESOLVED" && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {q.status === "REJECTED" && <XCircle className="w-4 h-4 text-red-500" />}
                                {q.status === "PENDING" && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                                <span className={cn("text-xs font-bold", 
                                    q.status === "RESOLVED" ? "text-green-500" : 
                                    q.status === "REJECTED" ? "text-red-500" : "text-yellow-500"
                                )}>
                                    {q.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

          </div>

          {/* 4. FEEDBACK FORM & PRO TIPS */}
          <div className="flex flex-col gap-8">
              <div className="flex-1">
                 <FeedbackForm />
              </div>

              {/* Pro Tip Card */}
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-white/10 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-blue-500/20 rounded-full shrink-0 mt-1">
                    <Sparkles className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                    <span className="font-bold text-blue-200 block mb-1">Pro Tip:</span> 
                    <p className="text-sm text-white/80 leading-relaxed">
                        Draft a blog post with the Article Writer, then paste the title into the Image Generator for matching art!
                    </p>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
}