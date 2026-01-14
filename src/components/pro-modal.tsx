"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, X } from "lucide-react";
import { useAppStore } from "@/lib/store"; // We'll use this to control state globally or pass props

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProModal = ({ isOpen, onClose }: ProModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md p-0 overflow-hidden">
        
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
            </button>
            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Zap className="w-6 h-6 text-indigo-600 fill-indigo-600" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">Upgrade to Pro</DialogTitle>
            <DialogDescription className="text-white/90">
                You have used all your free credits.
            </DialogDescription>
        </div>

        {/* Features List */}
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="p-2 bg-green-500/20 rounded-full">
                    <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-sm font-semibold">Unlimited Generations</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="p-2 bg-green-500/20 rounded-full">
                    <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-sm font-semibold">Priority Support</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="p-2 bg-green-500/20 rounded-full">
                    <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-sm font-semibold">Access to Newest Models</div>
            </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 pt-0">
            <Button 
                onClick={() => window.location.href = "/dashboard/settings"} 
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90 transition text-white font-bold py-6 text-lg shadow-[0_0_20px_-5px_rgba(99,102,241,0.6)]"
            >
                Upgrade Now
                <Zap className="w-5 h-5 ml-2 fill-white" />
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};