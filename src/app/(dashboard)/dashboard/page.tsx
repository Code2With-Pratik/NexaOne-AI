import React from "react";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { 
  History, 
  Sparkles, 
  MessageSquare,
  Bot, 
  ImageIcon, 
  Type, 
  PenTool, 
  Search, 
  Mail, 
  ArrowRight,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  CornerDownRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import FeedbackForm from "@/components/dashboard/FeedbackForm";

// --- CONFIGURATION ---
const tools = [
  { label: "AI Assistant", icon: Bot, color: "text-violet-500", bgColor: "bg-violet-500/10", href: "/dashboard/ai-tools/assistant" },
  { label: "Image Generator", icon: ImageIcon, color: "text-pink-500", bgColor: "bg-pink-700/10", href: "/dashboard/ai-tools/image-generator" },
  { label: "Caption Generator", icon: Type, color: "text-orange-500", bgColor: "bg-orange-700/10", href: "/dashboard/ai-tools/social-caption" },
  { label: "Article Writer", icon: PenTool, color: "text-emerald-500", bgColor: "bg-emerald-500/10", href: "/dashboard/ai-tools/article-writer" },
  { label: "Email Generator", icon: Mail, color: "text-yellow-500", bgColor: "bg-green-700/10", href: "/dashboard/ai-tools/email-generator" },
  { label: "Search Engine", icon: Search, color: "text-cyan-500", bgColor: "bg-blue-500/10", href: "/dashboard/ai-tools/search-engine" }
];

const proTips = [
  "Draft a blog post with the Article Writer, then paste the title into the Image Generator for matching art!",
  "For better results, be specific! Add styles like 'cyberpunk', 'minimalist', or 'oil painting' to your image prompts.",
  "Need to rewrite an email? Paste it into the AI Chatbot and ask it to 'make this sound more professional'.",
  "Don't lose your best ideas! Check the 'History' tab to find all your past generations.",
  "You can use the Caption Generator to create variations for Instagram, Twitter, and LinkedIn from a single idea.",
  "Use the Search Engine tool to get real-time data before writing an article to ensure accuracy."
];

// Helper to estimate credit cost (Visual only, based on tool type)
const getCreditCost = (toolName: string) => {
  if (toolName.includes("Image")) return 5;
  if (toolName.includes("Video") || toolName.includes("Caption")) return 5;
  return 1;
};

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

  // Server-side random tip (Changes on every reload)
  const randomTip = proTips[Math.floor(Math.random() * proTips.length)];

  return (
    <div className="mb-8 space-y-10 pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="space-y-4 text-center pt-8 px-4">
        <h2 className="text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 text-center">
          Unleash your creative power
        </h2>
        <p className="text-white/60 font-light text-sm md:text-lg text-center max-w-2xl mx-auto">
          Chat with the smartest AI - Experience the power of AI with our suite of tools.
        </p>
      </div>

      {/* 2. TOOLS GRID */}
      <div className="px-4 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-4 border-1 border-pink-500/50 flex items-center justify-between rounded-xl hover:shadow-md hover:bg-pink-600/20 transition cursor-pointer group bg-black/20"
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
          
          {/* 3. HISTORY & QUERIES */}
          <div className="space-y-8">
             
             {/* History Section */}
             <div className="bg-[#0000003d] border border-pink-500/50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <History className="w-5 h-5 text-pink-400 lg:ml-30" />
                    <h3 className="text-lg font-bold text-white whitespace-nowrap">Recent Generations</h3>
                </div>
                
                <div className="space-y-3">
                    {history.length === 0 && <p className="text-white/30 text-sm">No generations yet.</p>}
                    {history.map((item) => (
                        <div key={item.id} className="p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">{item.tool}</span>
                                        <span className="text-[15px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-red-500 border border-yellow-500/20 flex items-center gap-1">
                                            <Zap className="w-2 h-2" /> -{getCreditCost(item.tool)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/60 truncate w-56 md:w-80">"{item.query}"</p>
                                </div>
                                <span className="text-[12px] text-white/50 whitespace-nowrap pt-1">
                                    {format(item.createdAt, "MMM d, h:mm a")}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Queries Section */}
             <div className="bg-[#0000003d] border border-pink-500/50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-pink-500 lg:ml-30" />
                    <h3 className="text-lg font-bold text-white">My Support Queries</h3>
                </div>
                
                <div className="space-y-4">
                    {queries.length === 0 && <p className="text-white/30 text-sm">No queries sent.</p>}
                    {queries.map((q) => (
                        <div key={q.id} className="p-4 rounded-lg bg-black/20 border border-white/10 flex flex-col gap-3">
                            {/* Header: Subject & Status */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-white">{q.subject}</p>
                                    <p className="text-[10px] text-white/40 mt-1">
                                        Sent: {format(q.createdAt, "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>
                                <div className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider",
                                    q.status === "RESOLVED" ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                                    q.status === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                                    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                )}>
                                    {q.status}
                                </div>
                            </div>

                            {/* Admin Reply (Conditional) */}
                            {q.adminReply && (
                                <div className="mt-1 bg-white/5 rounded p-3 border-l-2 border-pink-500">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CornerDownRight className="w-3 h-3 text-pink-400" />
                                        <span className="text-xs font-bold text-pink-500">Admin Reply</span>
                                    </div>
                                    <p className="text-xs text-white/80 leading-relaxed">
                                        "{q.adminReply}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             </div>

          </div>

          {/* 4. FEEDBACK & PRO TIPS */}
          <div className="flex flex-col gap-8">
              <div className="flex-1">
                 <FeedbackForm />
              </div>

              {/* Pro Tip Card */}
              <div className="bg-[#0000003d] border border-pink-500/50 rounded-xl p-5 flex items-start gap-4 shadow-lg">
                <div className="p-4 bg-white/5 rounded-full shrink-0 mt-1">
                    <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
                </div>
                <div>
                    <span className="font-bold text-pink-500 block mb-1">Daily Pro Tip:</span> 
                    <p className="text-sm text-white/80 leading-relaxed">
                        {randomTip}
                    </p>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
}