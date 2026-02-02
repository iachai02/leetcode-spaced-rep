"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

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

interface ProblemCardProps {
  problem: Problem;
  onStart: () => void;
  onReset?: () => void;
}

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  new: "New",
  learning: "Learning",
  review: "Review",
  mastered: "Mastered",
};

export function ProblemCard({ problem, onStart, onReset }: ProblemCardProps) {
  const [resetting, setResetting] = useState(false);

  const handleStart = () => {
    // Store timer start in localStorage
    localStorage.setItem(
      `timer_${problem.id}`,
      JSON.stringify({
        startTime: Date.now(),
        problemId: problem.id,
      })
    );

    // Open LeetCode in new tab
    if (problem.url) {
      window.open(problem.url, "_blank");
    }

    onStart();
  };

  const handleReset = async () => {
    setResetting(true);

    const response = await fetch("/api/progress/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: problem.id }),
    });

    if (response.ok) {
      onReset?.();
    }

    setResetting(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {problem.leetcode_id && (
                <span className="text-muted-foreground">#{problem.leetcode_id}</span>
              )}
              {problem.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {problem.difficulty && (
                <Badge
                  variant="outline"
                  className={difficultyColors[problem.difficulty]}
                >
                  {problem.difficulty}
                </Badge>
              )}
              <Badge variant="secondary">
                {statusLabels[problem.status] || problem.status}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleReset}
                disabled={resetting || problem.status === "new"}
                className="text-red-500 focus:text-red-500"
              >
                Reset Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-4">
          {problem.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {problem.tags && problem.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{problem.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleStart} className="flex-1">
            Start
          </Button>
          <Link href={`/review/${problem.id}`}>
            <Button variant="outline">Rate</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
