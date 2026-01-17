import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ImageIcon, MessageSquare, Code, Music, VideoIcon, LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Helper to get the right icon per tool
const getIcon = (tool: string) => {
  switch (tool) {
    case "Image Generator": return ImageIcon;
    case "Chatbot": return MessageSquare;
    case "Code Generator": return Code;
    case "Video Generator": return VideoIcon;
    case "Music Generator": return Music;
    default: return LayoutDashboard;
  }
};

const getColor = (tool: string) => {
  switch (tool) {
    case "Image Generator": return "text-pink-500 bg-pink-500/10";
    case "Chatbot": return "text-violet-500 bg-violet-500/10";
    case "Code Generator": return "text-green-500 bg-green-500/10";
    case "Video Generator": return "text-orange-500 bg-orange-500/10";
    default: return "text-gray-500 bg-gray-500/10";
  }
};

export default async function HistoryPage() {
  // ✅ FIX: Added 'await' here
  const { userId } = await auth();
  
  if (!userId) redirect("/");

  const history = await db.history.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <div className="px-4 md:px-0">
        <h2 className="text-2xl font-bold tracking-tight text-white">Generation History</h2>
        <p className="text-white/60 text-sm">View your past AI creations.</p>
      </div>

      <div className="space-y-4">
        {history.length === 0 && (
          <div className="text-center text-white/50 py-10">
            No history found. Start generating!
          </div>
        )}

        {history.map((item) => {
          const Icon = getIcon(item.tool);
          const isImage = item.tool === "Image Generator";

          return (
            <Card key={item.id} className="p-4 border-white/10 bg-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-white/10 transition">
              <div className={cn("p-2 w-fit rounded-md", getColor(item.tool))}>
                <Icon className="w-8 h-8" />
              </div>
              
              <div className="flex-1 space-y-1 overflow-hidden w-full">
                <div className="flex items-center justify-between">
                   <p className="font-semibold text-white text-sm">{item.tool}</p>
                   <p className="text-xs text-white/40">{format(new Date(item.createdAt), "MMM d, yyyy, h:mm a")}</p>
                </div>
                <p className="text-xs text-white/70 italic truncate">"{item.query}"</p>
                
                {/* Result Display */}
                <div className="mt-2 bg-black/30 rounded-lg p-3 text-sm text-white/90">
                   {isImage ? (
                      <div className="relative aspect-square w-32 h-32 rounded-md overflow-hidden border border-white/10">
                        {/* Use standard img tag for external URLs if not configured in next.config.js */}
                        <img src={item.result} alt="Generated" className="object-cover w-full h-full" />
                      </div>
                   ) : (
                      <p className="line-clamp-2">{item.result}</p>
                   )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}