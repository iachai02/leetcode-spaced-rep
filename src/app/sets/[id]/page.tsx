"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Problem {
  id: string;
  leetcode_id: number | null;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  url: string | null;
  tags: string[] | null;
  status: string;
}

interface ProblemSet {
  id: string;
  name: string;
  description: string;
  is_preset: boolean;
}

interface Stats {
  total: number;
  new: number;
  learning: number;
  review: number;
  mastered: number;
}

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusColors: Record<string, string> = {
  new: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  learning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  review: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  mastered: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function SetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.id as string;

  const [problemSet, setProblemSet] = useState<ProblemSet | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchData = useCallback(async () => {
    const response = await fetch(`/api/sets/${setId}`);
    if (response.ok) {
      const data = await response.json();
      setProblemSet(data.problemSet);
      setProblems(data.problems);
      setStats(data.stats);
    }
    setLoading(false);
  }, [setId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetAll = async () => {
    if (!confirm("Are you sure you want to reset all progress for this set?")) {
      return;
    }

    setResetting(true);

    const response = await fetch("/api/progress/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemSetId: setId }),
    });

    if (response.ok) {
      fetchData();
    }

    setResetting(false);
  };

  if (loading) {
    return (
      <div>
        <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
        <div className="grid gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!problemSet) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Problem set not found.</p>
        <Button onClick={() => router.push("/sets")}>Back to Sets</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{problemSet.name}</h1>
          <p className="text-muted-foreground">{problemSet.description}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleResetAll}
          disabled={resetting || stats?.new === stats?.total}
          className="text-red-500 border-red-500/50 hover:bg-red-500/10"
        >
          Reset All Progress
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-gray-500">{stats.new}</p>
              <p className="text-xs text-muted-foreground">New</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.learning}</p>
              <p className="text-xs text-muted-foreground">Learning</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.review}</p>
              <p className="text-xs text-muted-foreground">Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.mastered}</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Problem list */}
      <div className="space-y-2">
        {problems.map((problem) => (
          <Card key={problem.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="py-3 flex items-center gap-4">
              <span className="text-muted-foreground w-10 text-sm">
                #{problem.leetcode_id}
              </span>
              <span className="flex-1 font-medium">{problem.title}</span>
              <div className="flex gap-2">
                {problem.difficulty && (
                  <Badge
                    variant="outline"
                    className={difficultyColors[problem.difficulty]}
                  >
                    {problem.difficulty}
                  </Badge>
                )}
                <Badge variant="outline" className={statusColors[problem.status]}>
                  {problem.status.charAt(0).toUpperCase() + problem.status.slice(1)}
                </Badge>
              </div>
              {problem.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(problem.url!, "_blank")}
                >
                  Open
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
