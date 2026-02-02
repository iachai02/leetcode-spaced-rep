"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

interface StreakData {
  current: number;
  longest: number;
  isNewRecord: boolean;
}

interface StreakModalProps {
  open: boolean;
  onClose: () => void;
  streak: StreakData | null;
}

export function StreakModal({ open, onClose, streak }: StreakModalProps) {
  if (!streak) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPrimitive.Portal>
        {/* Blurred overlay */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        {/* Modal content */}
        <DialogPrimitive.Content
          className="bg-background fixed top-[50%] left-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="text-center space-y-4">
            {/* Flame icon with animation */}
            <div className="flex justify-center">
              <div className="relative">
                <Flame className="h-16 w-16 text-orange-500 animate-pulse" />
                {streak.isNewRecord && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    NEW!
                  </div>
                )}
              </div>
            </div>

            {/* Streak count */}
            <div>
              <DialogPrimitive.Title className="text-4xl font-bold">
                {streak.current} day{streak.current !== 1 ? "s" : ""}
              </DialogPrimitive.Title>
              <p className="text-muted-foreground mt-1">
                {streak.current === 1
                  ? "You started a new streak!"
                  : streak.isNewRecord
                  ? "New personal best!"
                  : "Keep it going!"}
              </p>
            </div>

            {/* Encouragement message */}
            <p className="text-sm text-muted-foreground">
              {streak.current === 1
                ? "Every journey starts with a single step. Come back tomorrow to build your streak!"
                : streak.current < 7
                ? `You're building momentum! ${7 - streak.current} more day${7 - streak.current !== 1 ? "s" : ""} until a week-long streak.`
                : streak.current < 30
                ? "Impressive dedication! Keep pushing toward a 30-day streak."
                : "You're on fire! Your consistency is paying off."}
            </p>

            {/* Best streak (if not a new record) */}
            {!streak.isNewRecord && streak.longest > streak.current && (
              <p className="text-xs text-muted-foreground">
                Your best: {streak.longest} days
              </p>
            )}

            {/* Close button */}
            <Button onClick={onClose} className="w-full mt-2">
              Continue
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
