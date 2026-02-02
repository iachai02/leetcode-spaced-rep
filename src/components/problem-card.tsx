"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  onSkip?: () => void;
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

export function ProblemCard({ problem, onStart, onSkip, onReset }: ProblemCardProps) {
  const [resetting, setResetting] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  // Show 2 tags by default, rest are expandable
  const visibleTagCount = 2;
  const visibleTags = problem.tags?.slice(0, visibleTagCount) ?? [];
  const hiddenTags = problem.tags?.slice(visibleTagCount) ?? [];
  const hasMoreTags = hiddenTags.length > 0;

  const handleStart = () => {
    // Store timer start in localStorage
    localStorage.setItem(
      `timer_${problem.id}`,
      JSON.stringify({
        startTime: Date.now(),
        problemId: problem.id,
      })
    );

    // Store active problem for rating modal
    localStorage.setItem("active_problem_id", problem.id);

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
      <CardHeader className="py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Title row */}
            <CardTitle className="text-base flex items-center gap-2">
              {problem.leetcode_id && (
                <span className="text-muted-foreground text-sm">#{problem.leetcode_id}</span>
              )}
              <span className="truncate">{problem.title}</span>
            </CardTitle>

            {/* Badges + Tags row */}
            <div className="flex items-center gap-2 flex-wrap">
              {problem.difficulty && (
                <Badge
                  variant="outline"
                  className={`text-xs ${difficultyColors[problem.difficulty]}`}
                >
                  {problem.difficulty}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {statusLabels[problem.status] || problem.status}
              </Badge>

              {/* Separator */}
              {visibleTags.length > 0 && (
                <span className="text-muted-foreground">·</span>
              )}

              {/* Tags */}
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}

              {/* Expand button */}
              {hasMoreTags && (
                <button
                  onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  +{hiddenTags.length}
                  {tagsExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>

            {/* Expanded tags */}
            {tagsExpanded && hiddenTags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {hiddenTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {onSkip && (
              <Button onClick={onSkip} variant="ghost" size="sm">
                Skip
              </Button>
            )}
            <Button onClick={handleStart} size="sm">
              Start
            </Button>
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
        </div>
      </CardHeader>
    </Card>
  );
}
