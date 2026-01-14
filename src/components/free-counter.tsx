"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface FreeCounterProps {
  creditBalance: number;
}

export const FreeCounter = ({ creditBalance = 0 }: FreeCounterProps) => {
  // Prevent hydration errors
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Logic: 100 is the default "Free Tier" cap, but they might buy more.
  // We can just show the raw number if they go over 100.
  const progressValue = (creditBalance / 100) * 100;

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-white mb-4 space-y-2">
            <p>
              {creditBalance} Credits Remaining
            </p>
            <Progress 
              className="h-3" 
              value={progressValue > 100 ? 100 : progressValue} 
              // You might need to customize the Progress color class in your UI library
            />
          </div>
          <Button onClick={() => window.location.href = "/settings"} className="w-full" variant="premium">
            Upgrade <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};