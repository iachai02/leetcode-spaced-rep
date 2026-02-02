"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProblemCard } from "@/components/problem-card";
import { RatingModal } from "@/components/rating-modal";
import { Badge } from "@/components/ui/badge";
import { ActivityHeatmap } from "@/components/activity-heatmap";

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

interface QueueData {
  problems: Problem[];
  dailyGoal: number;
  reviewedToday: number;
  hasMoreProblems: boolean;
}

interface StatsData {
  currentStreak: number;
  longestStreak: number;
  reviewedToday: number;
  dailyGoal: number;
  mastered: number;
  learning: number;
  review: number;
  totalReviews: number;
  // Activity data for heatmap - bundled with stats to avoid extra fetch
  activity: Record<string, number>;
  maxActivityCount: number;
}

interface UpcomingProblem {
  id: string;
  leetcode_id: number | null;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  url: string | null;
  tags: string[] | null;
  status: string;
  nextReview: string | null;
  interval: number;
  attemptCount: number;
}

export default function DashboardPage() {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [extraProblems, setExtraProblems] = useState(0);
  const [showAddMoreDialog, setShowAddMoreDialog] = useState(false);
  const [ratingProblem, setRatingProblem] = useState<Problem | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  // Track skipped problems - these won't show again until page refresh
  // We use state instead of localStorage because skipping is temporary (just for this session)
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [upcomingProblems, setUpcomingProblems] = useState<UpcomingProblem[]>([]);

  const fetchData = useCallback(async (excludeIds: string[] = []) => {
    // Pass skipped IDs to the API so it returns replacement problems
    const excludeParam = excludeIds.length > 0 ? `&exclude=${excludeIds.join(",")}` : "";
    const [queueResponse, statsResponse, upcomingResponse] = await Promise.all([
      fetch(`/api/problems/queue?limit=20${excludeParam}`),
      fetch("/api/stats"),
      fetch("/api/problems/upcoming"),
    ]);
    const queueJson = await queueResponse.json();
    const statsJson = await statsResponse.json();
    const upcomingJson = await upcomingResponse.json();
    setQueueData(queueJson);
    setStatsData(statsJson);
    setUpcomingProblems(upcomingJson.problems ?? []);
    setLoading(false);
  }, []);

  // Fetch data on mount and when extraProblems or skippedIds changes
  useEffect(() => {
    fetchData(skippedIds);
  }, [extraProblems, skippedIds, fetchData]);

  // Listen for visibility change to show rating modal when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const activeProblemId = localStorage.getItem("active_problem_id");
        if (activeProblemId && queueData?.problems) {
          const problem = queueData.problems.find((p) => p.id === activeProblemId);
          if (problem) {
            setRatingProblem(problem);
            setShowRatingModal(true);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [queueData?.problems]);

  const handleRatingClose = () => {
    localStorage.removeItem("active_problem_id");
    setShowRatingModal(false);
    setRatingProblem(null);
  };

  const handleRatingSubmit = () => {
    localStorage.removeItem("active_problem_id");
    setShowRatingModal(false);
    setRatingProblem(null);
    // Refresh data to update the list
    fetchData(skippedIds);
  };

  // When user skips a problem, we add it to the skipped list
  // The API will return a replacement problem, maintaining the queue size
  const handleSkipProblem = (problemId: string) => {
    setSkippedIds((prev) => [...prev, problemId]);
  };

  // Calculate how many problems to show (derived from state, not in useEffect deps)
  const dailyGoal = queueData?.dailyGoal ?? 3;
  const reviewedToday = queueData?.reviewedToday ?? 0;
  const targetForToday = dailyGoal + extraProblems;
  const remainingToShow = Math.max(0, targetForToday - reviewedToday);

  const handleAddMore = (count: number) => {
    setExtraProblems(extraProblems + count);
    setShowAddMoreDialog(false);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Slice problems to only show the remaining amount for today
  const problemsToShow = queueData?.problems.slice(0, remainingToShow) ?? [];
  const completedDailyGoal = reviewedToday >= dailyGoal;
  const completedAllForToday = reviewedToday >= targetForToday;
  const hasNoProblemSets = queueData?.problems.length === 0 && !queueData?.hasMoreProblems;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {reviewedToday} / {targetForToday} today
          {extraProblems > 0 && (
            <span className="text-xs ml-1">(+{extraProblems} extra)</span>
          )}
        </div>
      </div>

      <Tabs defaultValue="problems">
        <TabsList className="mb-4">
          <TabsTrigger value="problems">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="problems">
          {/* No problem sets selected */}
          {hasNoProblemSets ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No problems in your queue.
                </p>
                <Link href="/sets">
                  <Button>Select Problem Sets</Button>
                </Link>
              </CardContent>
            </Card>
          ) : completedAllForToday || problemsToShow.length === 0 ? (
            /* Completed all problems for today */
            <Card>
              <CardContent className="py-8 text-center">
                {completedDailyGoal ? (
                  <>
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-xl font-semibold mb-2">
                      Daily goal completed!
                    </p>
                    <p className="text-muted-foreground mb-4">
                      You&apos;ve reviewed {reviewedToday} problem{reviewedToday !== 1 ? "s" : ""} today.
                      {queueData?.hasMoreProblems && " Want to keep going?"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-semibold mb-2">
                      No more problems for now
                    </p>
                    <p className="text-muted-foreground mb-4">
                      You&apos;ve completed your current batch. Add more to continue practicing.
                    </p>
                  </>
                )}
                {queueData?.hasMoreProblems && (
                  <Button variant="outline" onClick={() => setShowAddMoreDialog(true)}>
                    Add More Problems
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Show problems */
            <div className="space-y-4">
              <div className="grid gap-4">
                {problemsToShow.map((problem) => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    onStart={() => {}}
                    onSkip={() => handleSkipProblem(problem.id)}
                  />
                ))}
              </div>

              {/* Show "Add More" if there are more problems available */}
              {queueData?.hasMoreProblems && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => setShowAddMoreDialog(true)}>
                    Add More Problems
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {upcomingProblems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No upcoming reviews yet. Complete some problems to see your schedule!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Problems you&apos;ve attempted, sorted by next review date.
              </p>
              {upcomingProblems.map((problem, index) => (
                <UpcomingProblemRow
                  key={problem.id}
                  problem={problem}
                  position={index + 1}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {statsData?.reviewedToday ?? 0}
                  <span className="text-lg text-muted-foreground font-normal">
                    {" "}
                    / {statsData?.dailyGoal ?? 3}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {statsData?.currentStreak ?? 0}
                  <span className="text-lg text-muted-foreground font-normal">
                    {" "}
                    days
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Longest Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {statsData?.longestStreak ?? 0}
                  <span className="text-lg text-muted-foreground font-normal">
                    {" "}
                    days
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{statsData?.totalReviews ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-500">
                  {statsData?.learning ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-500">
                  {statsData?.review ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mastered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-500">
                  {statsData?.mastered ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Heatmap */}
          <div className="mt-4">
            <ActivityHeatmap
              activity={statsData?.activity ?? {}}
              maxCount={statsData?.maxActivityCount ?? 0}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add More Problems Dialog */}
      <Dialog open={showAddMoreDialog} onOpenChange={setShowAddMoreDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add More Problems</DialogTitle>
            <DialogDescription>
              How many more problems would you like to add?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[1, 2, 3, 5].map((count) => (
              <Button
                key={count}
                variant="outline"
                onClick={() => handleAddMore(count)}
                className="h-16 text-lg"
              >
                +{count} {count === 1 ? "problem" : "problems"}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      <RatingModal
        problem={ratingProblem}
        open={showRatingModal}
        onClose={handleRatingClose}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}

// Helper component for the Upcoming tab
// Shows a compact row with position, problem info, and due date
const difficultyColors = {
  Easy: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusColors: Record<string, string> = {
  learning: "text-yellow-500",
  review: "text-blue-500",
  mastered: "text-green-500",
};

function UpcomingProblemRow({
  problem,
  position,
}: {
  problem: UpcomingProblem;
  position: number;
}) {
  // Format the next review date in a human-readable way
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return "Not scheduled";

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays < 7) return `Due in ${diffDays} days`;
    if (diffDays < 30) return `Due in ${Math.ceil(diffDays / 7)} weeks`;
    return `Due in ${Math.ceil(diffDays / 30)} months`;
  };

  const isDue = problem.nextReview
    ? new Date(problem.nextReview) <= new Date()
    : false;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      {/* Position number - like a rank in the queue */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
        {position}
      </div>

      {/* Problem info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {problem.leetcode_id && (
            <span className="text-muted-foreground text-sm">
              #{problem.leetcode_id}
            </span>
          )}
          <span className="font-medium truncate">{problem.title}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {problem.difficulty && (
            <Badge
              variant="outline"
              className={`text-xs ${difficultyColors[problem.difficulty]}`}
            >
              {problem.difficulty}
            </Badge>
          )}
          <span className={`text-xs ${statusColors[problem.status] ?? ""}`}>
            {problem.status}
          </span>
          <span className="text-xs text-muted-foreground">
            {problem.attemptCount} {problem.attemptCount === 1 ? "attempt" : "attempts"}
          </span>
        </div>
      </div>

      {/* Due date */}
      <div className={`text-sm ${isDue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
        {formatDueDate(problem.nextReview)}
      </div>
    </div>
  );
}
