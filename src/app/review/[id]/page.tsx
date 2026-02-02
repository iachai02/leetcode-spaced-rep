"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { previewIntervals, formatInterval, type Rating } from "@/lib/sm2";

interface Problem {
  id: string;
  leetcode_id: number | null;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  url: string | null;
}

interface ProgressState {
  ease_factor: number;
  interval: number;
  repetitions: number;
  status: string;
}

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);

  const fetchProblem = useCallback(async () => {
    const response = await fetch(`/api/problems/${problemId}`);
    if (response.ok) {
      const data = await response.json();
      setProblem(data.problem);
      setProgress(data.progress);
    }
    setLoading(false);
  }, [problemId]);

  useEffect(() => {
    // Calculate time spent from localStorage
    const timerData = localStorage.getItem(`timer_${problemId}`);
    if (timerData) {
      const { startTime } = JSON.parse(timerData);
      const elapsed = Math.round((Date.now() - startTime) / 60000);
      setTimeSpent(Math.min(elapsed, 60));
    }

    fetchProblem();
  }, [problemId, fetchProblem]);

  const handleRating = async (rating: Rating) => {
    setSubmitting(true);

    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId,
        rating,
        timeSpent,
        notes: notes || undefined,
      }),
    });

    if (response.ok) {
      // Clear timer
      localStorage.removeItem(`timer_${problemId}`);
      router.push("/dashboard");
    } else {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem(`timer_${problemId}`);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Problem not found.</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                {problem.leetcode_id && (
                  <span className="text-muted-foreground">#{problem.leetcode_id}</span>
                )}
                {problem.title}
              </CardTitle>
              {problem.difficulty && (
                <Badge
                  variant="outline"
                  className={difficultyColors[problem.difficulty]}
                >
                  {problem.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <div className="flex items-center justify-center py-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-3xl font-bold">{timeSpent}</p>
              <p className="text-sm text-muted-foreground">minutes</p>
            </div>
          </div>

          {/* Rating buttons */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              How did it go?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col border-red-500/50 hover:bg-red-500/10"
                onClick={() => handleRating("again")}
                disabled={submitting}
              >
                <span className="font-semibold">Again</span>
                <span className="text-xs text-muted-foreground">
                  {formatInterval(intervals.again)}
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col border-orange-500/50 hover:bg-orange-500/10"
                onClick={() => handleRating("hard")}
                disabled={submitting}
              >
                <span className="font-semibold">Hard</span>
                <span className="text-xs text-muted-foreground">
                  {formatInterval(intervals.hard)}
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col border-blue-500/50 hover:bg-blue-500/10"
                onClick={() => handleRating("medium")}
                disabled={submitting}
              >
                <span className="font-semibold">Medium</span>
                <span className="text-xs text-muted-foreground">
                  {formatInterval(intervals.medium)}
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col border-green-500/50 hover:bg-green-500/10"
                onClick={() => handleRating("easy")}
                disabled={submitting}
              >
                <span className="font-semibold">Easy</span>
                <span className="text-xs text-muted-foreground">
                  {formatInterval(intervals.easy)}
                </span>
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Notes (optional)
            </label>
            <Textarea
              placeholder="Any notes about this problem..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Skip */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={submitting}
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
