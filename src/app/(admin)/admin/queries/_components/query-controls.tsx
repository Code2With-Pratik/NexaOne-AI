"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export const QueryControls = ({ 
  totalPages, 
  currentPage 
}: { 
  totalPages: number; 
  currentPage: number; 
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // 1. Local state for the input box
  const [text, setText] = useState(searchParams.get("search") || "");

  // 2. Debounce Logic: Update URL 500ms after user stops typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only update if the value is different from URL to avoid loop
      if (text !== (searchParams.get("search") || "")) {
        const params = new URLSearchParams(searchParams);
        
        if (text) {
          params.set("search", text);
          params.set("page", "1"); // Reset to page 1 on search
        } else {
          params.delete("search");
        }
        
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [text, searchParams, pathname, router]);

  // 3. Handlers
  const handlePageChange = (direction: "next" | "prev") => {
    const params = new URLSearchParams(searchParams);
    const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSearch = () => {
    setText(""); // This triggers the useEffect above to clear the URL
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
        <Input 
          placeholder="Search name or email..." 
          className="pl-9 pr-8 bg-black/20 border-white/10 text-white focus:border-indigo-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {text && (
            <button onClick={clearSearch} className="absolute right-3 top-2.5 text-white/50 hover:text-white">
                <X className="w-4 h-4" />
            </button>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/50 mr-2">
            Page {currentPage} of {Math.max(1, totalPages)}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange("prev")}
          className="bg-transparent border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange("next")}
          className="bg-transparent border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};