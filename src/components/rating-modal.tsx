"use client";

import { useState, useEffect, useCallback } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { previewIntervals, formatInterval, type Rating } from "@/lib/sm2";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  leetcode_id: number | null;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  url: string | null;
  tags: string[] | null;
  status: string;
  nextReview: string | null;
}

interface ProgressState {
  ease_factor: number;
  interval: number;
  repetitions: number;
  status: string;
}

interface RatingModalProps {
  problem: Problem | null;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

const ratingOptions: { value: Rating; label: string; color: string; selectedBg: string }[] = [
  { value: "again", label: "Again", color: "border-red-500/50", selectedBg: "bg-red-500/20 border-red-500" },
  { value: "hard", label: "Hard", color: "border-orange-500/50", selectedBg: "bg-orange-500/20 border-orange-500" },
  { value: "medium", label: "Medium", color: "border-blue-500/50", selectedBg: "bg-blue-500/20 border-blue-500" },
  { value: "easy", label: "Easy", color: "border-green-500/50", selectedBg: "bg-green-500/20 border-green-500" },
];

export function RatingModal({ problem, open, onClose, onSubmit }: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [progress, setProgress] = useState<ProgressState | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!problem) return;
    const response = await fetch(`/api/problems/${problem.id}`);
    if (response.ok) {
      const data = await response.json();
      setProgress(data.progress);
    }
  }, [problem]);

  useEffect(() => {
    if (open && problem) {
      // Reset state when modal opens
      setSelectedRating(null);
      setNotes("");
      setSubmitting(false);

      // Calculate time spent from localStorage
      const timerData = localStorage.getItem(`timer_${problem.id}`);
      if (timerData) {
        const { startTime } = JSON.parse(timerData);
        const elapsed = Math.round((Date.now() - startTime) / 60000);
        setTimeSpent(Math.min(elapsed, 60));
      }

      fetchProgress();
    }
  }, [open, problem, fetchProgress]);

  const handleSubmit = async () => {
    if (!selectedRating || !problem) return;

    setSubmitting(true);

    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.id,
        rating: selectedRating,
        timeSpent,
        notes: notes || undefined,
      }),
    });

    if (response.ok) {
      localStorage.removeItem(`timer_${problem.id}`);
      onSubmit();
    } else {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (problem) {
      localStorage.removeItem(`timer_${problem.id}`);
    }
    onClose();
  };

  if (!problem) return null;

  const currentState = progress
    ? {
        easeFactor: progress.ease_factor,
        interval: progress.interval,
        repetitions: progress.repetitions,
        status: progress.status as "new" | "learning" | "review" | "mastered",
      }
    : null;

  const intervals = previewIntervals(currentState);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPrimitive.Portal>
        {/* Blurred overlay */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        {/* Modal content */}
        <DialogPrimitive.Content
          className="bg-background fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Close button */}
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {/* Header */}
          <div className="flex flex-col gap-2 mb-4">
            <DialogPrimitive.Title className="text-lg font-semibold flex items-center gap-2">
              {problem.leetcode_id && (
                <span className="text-muted-foreground">#{problem.leetcode_id}</span>
              )}
              {problem.title}
            </DialogPrimitive.Title>
            {problem.difficulty && (
              <Badge
                variant="outline"
                className={cn("w-fit", difficultyColors[problem.difficulty])}
              >
                {problem.difficulty}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {/* Timer display */}
            <div className="flex items-center justify-center py-3 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold">{timeSpent}</p>
                <p className="text-xs text-muted-foreground">minutes</p>
              </div>
            </div>

            {/* Rating options */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                How did it go?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedRating(option.value)}
                    disabled={submitting}
                    className={cn(
                      "py-3 px-4 rounded-md border-2 transition-all flex flex-col items-center",
                      selectedRating === option.value
                        ? option.selectedBg
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatInterval(intervals[option.value])}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Notes (optional)
              </label>
              <Textarea
                placeholder="Any notes about this problem..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Submit button */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={submitting}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedRating || submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
