"use client";

import React, { useState } from "react";
import axios from "axios";
import { Search, Globe, Image as ImageIcon, Video, Newspaper, Mic, Loader2, ArrowRight, ChevronRight, ChevronLeft, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for Voice Recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

type TabType = "search" | "images" | "videos" | "news";

export default function SearchEnginePage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("search");
  const [results, setResults] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [isListening, setIsListening] = useState(false);

  // --- VOICE SEARCH ---
  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setTimeout(() => performSearch(transcript, activeTab, 1), 500);
    };
    recognition.start();
  };

  // --- SEARCH LOGIC ---
  const performSearch = async (searchQuery: string, type: TabType, pageNum: number) => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      if (pageNum === 1) setResults(null); 
      
      const response = await axios.post("/api/search", {
        query: searchQuery,
        type: type,
        page: pageNum
      });

      setResults(response.data);
      setPage(pageNum);
    } catch (error) {
      console.log(error);
      alert("Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(query, activeTab, 1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (query) performSearch(query, tab, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    performSearch(query, activeTab, newPage);
    document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 px-4 md:px-8 py-4 md:py-0 overflow-hidden">
      
      {/* --- HEADER SECTION --- */}
      <div className="w-full max-w-4xl mx-auto space-y-6 shrink-0 z-10">
        <div className="text-center space-y-2 mt-2 md:mt-0">
           <h1 className="text-2xl md:text-3xl font-bold text-white">NexaOne AI Search Engine</h1>
        </div>

        {/* Search Bar Wrapper */}
        <form onSubmit={handleSubmit} className="relative group w-full">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
           </div>
           
           <input 
             type="text"
             className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-24 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 focus:bg-black/40 transition-all shadow-xl text-sm md:text-base"
             placeholder="Search anything..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />

           <div className="absolute inset-y-0 right-2 flex items-center gap-5 md:gap-2">
              <button 
                type="button"
                onClick={handleVoiceSearch}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10 text-white/40 hover:text-white"
                )}
              >
                <Mic className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <button 
                type="submit"
                disabled={isSearching}
                className="bg-indigo-600 p-2 rounded-full hover:bg-indigo-500 transition-colors"
              >
                 {isSearching ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <ArrowRight className="w-4 h-4 text-white" />}
              </button>
           </div>
        </form>

        {/* Tabs */}
        <div className="w-full overflow-x-auto scrollbar-hide pb-2">
           <div className="flex justify-start md:justify-center min-w-max">
             {[
               { id: "search", label: "All", icon: Globe },
               { id: "images", label: "Images", icon: ImageIcon },
               { id: "videos", label: "Videos", icon: Video },
               { id: "news", label: "News", icon: Newspaper },
             ].map((tab) => (
               <button 
                 key={tab.id}
                 onClick={() => handleTabChange(tab.id as TabType)}
                 className={cn(
                   "flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all shrink-0",
                   activeTab === tab.id ? "bg-white/10 text-white border border-white/10" : "text-white/40 hover:text-white hover:bg-white/5"
                 )}
               >
                 <tab.icon className="w-3 h-3 md:w-4 md:h-4" /> {tab.label}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* --- RESULTS AREA --- */}
      <div className="flex-1 w-full max-w-6xl mx-auto overflow-y-auto custom-scrollbar rounded-2xl bg-white/5 border border-white/10 relative">
         
         {/* EMPTY STATE */}
         {!results && !isSearching && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 p-4 text-center">
              <Globe className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-20" />
              <p className="text-sm md:text-base">Ready to search the web.</p>
           </div>
         )}

         {/* CONTENT WRAPPER */}
         <div className="p-4 md:p-8 space-y-6">
           
           {/* 1. WEB RESULTS & AI OVERVIEW */}
           {activeTab === "search" && results && (
              <div className="space-y-6 md:space-y-8 w-full max-w-4xl mx-auto">
                 
                 {/* --- NEW: AI OVERVIEW SECTION --- */}
                 {results.aiOverview && (
                   <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {/* Gradient Glow */}
                      <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
                      
                      <div className="flex items-center gap-2 mb-3">
                         <div className="p-1.5 bg-indigo-500 rounded-lg">
                            <Sparkles className="w-4 h-4 text-white" />
                         </div>
                         <h3 className="font-bold text-white text-lg">AI Overview</h3>
                      </div>
                      
                      <div className="text-white/90 leading-relaxed text-sm md:text-base">
                         {results.aiOverview}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-indigo-500/10 flex items-center gap-2 text-xs text-indigo-300/60">
                         <Bot className="w-3 h-3" />
                         <span>Generated by AI based on search results</span>
                      </div>
                   </div>
                 )}

                 {/* Existing Knowledge Graph */}
                 {results.knowledgeGraph && (
                   <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl break-words">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{results.knowledgeGraph.title}</h3>
                      <p className="text-indigo-200 text-sm md:text-base leading-relaxed">{results.knowledgeGraph.description}</p>
                   </div>
                 )}

                 {/* Organic Results */}
                 {results.organic?.map((item: any, i: number) => (
                   <div key={i} className="group w-full break-words">
                      <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-white/50 mb-1 hover:text-white w-full">
                         <img 
                           src={`https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}`} 
                           alt="icon" className="w-3 h-3 md:w-4 md:h-4 rounded-sm shrink-0"
                           onError={(e) => (e.currentTarget.style.display = 'none')} 
                         />
                         <span className="truncate">{new URL(item.link).hostname}</span>
                      </a>
                      <a href={item.link} target="_blank" rel="noreferrer" className="block">
                         <h3 className="text-base md:text-xl text-indigo-400 font-medium group-hover:underline decoration-indigo-500/50 underline-offset-4 mb-1 md:mb-2 leading-tight">
                           {item.title}
                         </h3>
                      </a>
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed line-clamp-3">{item.snippet}</p>
                   </div>
                 ))}
              </div>
           )}

           {/* 2. IMAGE RESULTS */}
           {activeTab === "images" && results && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                 {results.images?.map((img: any, i: number) => (
                    <a key={i} href={img.link} target="_blank" rel="noreferrer" className="relative group aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/10">
                       <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    </a>
                 ))}
              </div>
           )}

           {/* 3. VIDEO RESULTS */}
           {activeTab === "videos" && results && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                 {results.videos?.map((video: any, i: number) => (
                    <a key={i} href={video.link} target="_blank" rel="noreferrer" className="group bg-black/20 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all block">
                       <div className="relative aspect-video">
                          <img src={video.imageUrl} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
                             </div>
                          </div>
                       </div>
                       <div className="p-3 md:p-4">
                          <h3 className="text-white font-medium line-clamp-2 mb-1 group-hover:text-indigo-400 transition-colors text-xs md:text-sm">{video.title}</h3>
                          <div className="flex items-center justify-between text-[10px] md:text-xs text-white/40">
                             <span>{video.channel}</span>
                             <span>{video.date}</span>
                          </div>
                       </div>
                    </a>
                 ))}
              </div>
           )}

           {/* 4. NEWS RESULTS */}
           {activeTab === "news" && results && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                 {results.news?.map((news: any, i: number) => (
                    <a key={i} href={news.link} target="_blank" rel="noreferrer" className="group flex flex-col sm:flex-row gap-3 md:gap-4 bg-black/20 border border-white/10 p-3 md:p-4 rounded-xl hover:bg-white/5 transition-colors">
                       {news.imageUrl && (
                          <div className="w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-lg overflow-hidden">
                             <img src={news.imageUrl} alt="news" className="w-full h-full object-cover" />
                          </div>
                       )}
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-[10px] md:text-xs font-bold text-indigo-400">{news.source}</span>
                             <span className="text-[10px] text-white/30">• {news.date}</span>
                          </div>
                          <h3 className="text-white font-medium line-clamp-2 mb-1 md:mb-2 text-sm md:text-base group-hover:underline decoration-white/20">{news.title}</h3>
                          <p className="text-[10px] md:text-xs text-white/50 line-clamp-2">{news.snippet}</p>
                       </div>
                    </a>
                 ))}
              </div>
           )}

           {/* PAGINATION */}
           {results && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                 <button 
                   onClick={() => handlePageChange(page - 1)}
                   disabled={page === 1}
                   className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs md:text-sm transition-colors"
                 >
                   <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" /> Prev
                 </button>
                 <span className="text-white/40 text-xs md:text-sm">Page {page}</span>
                 <button 
                   onClick={() => handlePageChange(page + 1)}
                   className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs md:text-sm transition-colors"
                 >
                   Next <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                 </button>
              </div>
           )}
         </div>
      </div>
    </div>
  );
}