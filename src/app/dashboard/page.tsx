"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [limit, setLimit] = useState(3);

  const fetchQueue = useCallback(async (currentLimit: number) => {
    const response = await fetch(`/api/problems/queue?limit=${currentLimit}`);
    const data = await response.json();
    setQueueData(data);
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const response = await fetch("/api/stats");
    const data = await response.json();
    setStatsData(data);
  }, []);

  useEffect(() => {
    fetchQueue(limit);
    fetchStats();
  }, [fetchQueue, fetchStats, limit]);

  const handleAddMore = () => {
    const newLimit = limit + 3;
    setLimit(newLimit);
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

  const completedDaily =
    (queueData?.reviewedToday ?? 0) >= (queueData?.dailyGoal ?? 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {queueData?.reviewedToday ?? 0} / {queueData?.dailyGoal ?? 3} today
        </div>
      </div>

      <Tabs defaultValue="problems">
        <TabsList className="mb-4">
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="problems">
          {queueData?.problems.length === 0 ? (
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
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {queueData?.problems.map((problem) => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    onStart={() => {}}
                  />
                ))}
              </div>

              {completedDaily && queueData?.hasMoreProblems && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Daily goal completed! Want to keep going?
                  </p>
                  <Button variant="outline" onClick={handleAddMore}>
                    Add More Problems
                  </Button>
                </div>
              )}

              {!completedDaily && queueData?.hasMoreProblems && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={handleAddMore}>
                    Show More
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
    </div>
  );
}
