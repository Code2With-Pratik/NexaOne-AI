"use client";

import React, { useState } from "react";
import { Search, Globe, ArrowRight, BookOpen, Layers } from "lucide-react";

export default function SearchEnginePage() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setHasSearched(false);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setHasSearched(true);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col">
      
      {/* Search Bar Container */}
      <div className={`transition-all duration-500 ease-out ${hasSearched ? "py-6" : "flex-1 flex flex-col justify-center pb-32"}`}>
        
        {!hasSearched && (
          <div className="text-center mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-bold text-white">Where knowledge begins</h1>
            <p className="text-white/50">Ask anything. Get answers with citations.</p>
          </div>
        )}

        <form onSubmit={handleSearch} className="relative group w-full max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-[#0A0A0A] border border-white/10 rounded-full px-6 py-4 focus-within:border-indigo-500/50 shadow-2xl">
            <Search className="w-5 h-5 text-white/40 mr-4" />
            <input 
              type="text" 
              className="flex-1 bg-transparent border-none focus:outline-none text-white text-lg placeholder:text-white/20"
              placeholder="How does quantum entanglement work?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!query || loading}
              className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:bg-white/5 hover:bg-indigo-500 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Area */}
      {hasSearched && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
          
          {/* Sources Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-white/60 text-sm font-medium uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Sources
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors">
                  <div className="text-xs text-white/40 mb-1 truncate">en.wikipedia.org</div>
                  <div className="text-sm font-medium text-white line-clamp-2">Quantum mechanics - Wikipedia Overview</div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Answer Section */}
          <div>
             <div className="flex items-center gap-2 mb-4 text-indigo-400 text-sm font-medium uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> AI Answer
            </div>
            <div className="prose prose-invert max-w-none prose-p:text-white/90 prose-headings:text-white">
              <h3 className="text-xl font-bold">Understanding Entanglement</h3>
              <p>
                Quantum entanglement is a phenomenon where two or more particles become connected in such a way that the state of one cannot be described independently of the other. Even when separated by large distances, a change in one particle instantly affects the other.
              </p>
              <ul>
                <li><strong>Non-locality:</strong> The connection defies classical physics' limitations of space.</li>
                <li><strong>Superposition:</strong> Particles exist in multiple states at once until measured.</li>
              </ul>
              <p>
                This principle is fundamental to emerging technologies like <span className="text-indigo-400 underline decoration-indigo-500/30 cursor-pointer">quantum computing</span> and cryptography.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}