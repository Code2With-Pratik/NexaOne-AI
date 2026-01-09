"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Globe, Image as ImageIcon, Video, Newspaper, Mic, Loader2, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for Voice Recognition (window object)
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

  // --- VOICE SEARCH FUNCTION ---
  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser. Try Chrome.");
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
      // Auto-trigger search after speaking
      setTimeout(() => performSearch(transcript, activeTab, 1), 500);
    };

    recognition.start();
  };

  // --- MAIN SEARCH FUNCTION ---
  const performSearch = async (searchQuery: string, type: TabType, pageNum: number) => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      // Only clear results if it's a new search, not pagination
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
    // Scroll to top
    document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      {/* --- HEADER SECTION --- */}
      <div className="w-full max-w-3xl mx-auto space-y-6 shrink-0 z-10">
        <div className="text-center space-y-2">
           <h1 className="text-3xl font-bold text-white">AI Search Engine</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
           </div>
           
           <input 
             type="text"
             className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-24 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 focus:bg-black/40 transition-all shadow-xl"
             placeholder="Search anything..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />

           {/* Right Actions: Voice + Search Button */}
           <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <button 
                type="button"
                onClick={handleVoiceSearch}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10 text-white/40 hover:text-white"
                )}
                title="Voice Search"
              >
                <Mic className="w-5 h-5" />
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
        <div className="flex justify-center gap-2 overflow-x-auto pb-2">
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
                 "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                 activeTab === tab.id ? "bg-white/10 text-white border border-white/10" : "text-white/40 hover:text-white hover:bg-white/5"
               )}
             >
               <tab.icon className="w-4 h-4" /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* --- RESULTS AREA --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 relative">
         
         {!results && !isSearching && (
           <div className="h-full flex flex-col items-center justify-center text-white/20">
              <Globe className="w-16 h-16 mb-4 opacity-20" />
              <p>Ready to search.</p>
           </div>
         )}

         {/* 1. WEB RESULTS */}
         {activeTab === "search" && results && (
            <div className="space-y-8 max-w-4xl mx-auto">
               {results.knowledgeGraph && (
                 <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{results.knowledgeGraph.title}</h3>
                    <p className="text-indigo-200 leading-relaxed">{results.knowledgeGraph.description}</p>
                 </div>
               )}

               {results.organic?.map((item: any, i: number) => (
                 <div key={i} className="group">
                    <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-white/50 mb-1 hover:text-white">
                       <img 
                         src={`https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}`} 
                         alt="icon" className="w-4 h-4 rounded-sm"
                         onError={(e) => (e.currentTarget.style.display = 'none')} 
                       />
                       <span className="truncate max-w-[300px]">{new URL(item.link).hostname}</span>
                    </a>
                    <a href={item.link} target="_blank" rel="noreferrer" className="block">
                       <h3 className="text-xl text-indigo-400 font-medium group-hover:underline decoration-indigo-500/50 underline-offset-4 mb-2">
                         {item.title}
                       </h3>
                    </a>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{item.snippet}</p>
                 </div>
               ))}
            </div>
         )}

         {/* 2. IMAGE RESULTS */}
         {activeTab === "images" && results && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {results.images?.map((img: any, i: number) => (
                  <a key={i} href={img.link} target="_blank" rel="noreferrer" className="relative group aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/10">
                     <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-xs text-white line-clamp-2 font-medium">{img.title}</p>
                     </div>
                  </a>
               ))}
            </div>
         )}

         {/* 3. VIDEO RESULTS */}
         {activeTab === "videos" && results && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {results.videos?.map((video: any, i: number) => (
                  <a key={i} href={video.link} target="_blank" rel="noreferrer" className="group bg-black/20 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all">
                     <div className="relative aspect-video">
                        <img src={video.imageUrl} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                           <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                           </div>
                        </div>
                     </div>
                     <div className="p-4">
                        <h3 className="text-white font-medium line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">{video.title}</h3>
                        <div className="flex items-center justify-between text-xs text-white/40">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
               {results.news?.map((news: any, i: number) => (
                  <a key={i} href={news.link} target="_blank" rel="noreferrer" className="group flex gap-4 bg-black/20 border border-white/10 p-4 rounded-xl hover:bg-white/5 transition-colors">
                     {news.imageUrl && (
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                           <img src={news.imageUrl} alt="news" className="w-full h-full object-cover" />
                        </div>
                     )}
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-bold text-indigo-400">{news.source}</span>
                           <span className="text-[10px] text-white/30">• {news.date}</span>
                        </div>
                        <h3 className="text-white font-medium line-clamp-2 mb-2 group-hover:underline decoration-white/20">{news.title}</h3>
                        <p className="text-xs text-white/50 line-clamp-2">{news.snippet}</p>
                     </div>
                  </a>
               ))}
            </div>
         )}

         {/* PAGINATION CONTROLS */}
         {results && (
            <div className="mt-12 flex items-center justify-center gap-4 border-t border-white/10 pt-8">
               <button 
                 onClick={() => handlePageChange(page - 1)}
                 disabled={page === 1}
                 className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm transition-colors"
               >
                 <ChevronLeft className="w-4 h-4" /> Prev
               </button>
               <span className="text-white/40 text-sm">Page {page}</span>
               <button 
                 onClick={() => handlePageChange(page + 1)}
                 className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors"
               >
                 Next <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         )}

      </div>
    </div>
  );
}