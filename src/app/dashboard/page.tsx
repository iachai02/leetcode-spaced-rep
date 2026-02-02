"use client";

import { useEffect, useState } from "react";
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
}

export default function DashboardPage() {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [extraProblems, setExtraProblems] = useState(0);
  const [showAddMoreDialog, setShowAddMoreDialog] = useState(false);

  // Fetch data on mount and when extraProblems changes
  useEffect(() => {
    const fetchData = async () => {
      const [queueResponse, statsResponse] = await Promise.all([
        fetch(`/api/problems/queue?limit=20`),
        fetch("/api/stats"),
      ]);
      const queueJson = await queueResponse.json();
      const statsJson = await statsResponse.json();
      setQueueData(queueJson);
      setStatsData(statsJson);
      setLoading(false);
    };
    fetchData();
  }, [extraProblems]);

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
          <TabsTrigger value="problems">Problems</TabsTrigger>
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
    </div>
  );
}
