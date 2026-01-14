"use client";

import React, { useState } from "react";
import { Star, Send, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitFeedback } from "@/actions/shared"; // Import Action
import { toast } from "sonner";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !message.trim()) return;

    setLoading(true);
    try {
      await submitFeedback(rating, message);
      setSent(true);
      setRating(0);
      setMessage("");
      toast.success("Feedback submitted!");
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl h-full">
      <h3 className="text-xl font-bold text-white mb-2">Share your experience</h3>
      <p className="text-white/50 text-sm mb-6">
        Your feedback helps us improve. Rated comments will be featured on our homepage!
      </p>

      {sent ? (
        <div className="h-48 flex flex-col items-center justify-center animate-in fade-in zoom-in">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h4 className="text-white font-bold text-lg">Thank You!</h4>
          <p className="text-white/50 text-sm">Your feedback has been posted.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="flex gap-2 justify-center py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-white/20 hover:text-white/40"
                  )}
                />
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you liked..."
            className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 resize-none transition-all"
          />

          <button
            disabled={loading || rating === 0 || !message.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Feedback</>}
          </button>
        </form>
      )}
    </div>
  );
}