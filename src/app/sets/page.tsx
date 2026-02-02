"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProblemSet {
  id: string;
  name: string;
  description: string;
  problemCount: number;
  isActive: boolean;
}

export default function SetsPage() {
  const [sets, setSets] = useState<ProblemSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchSets = useCallback(async () => {
    const response = await fetch("/api/sets");
    const data = await response.json();
    setSets(data.sets || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const handleToggle = async (setId: string) => {
    setToggling(setId);

    const response = await fetch(`/api/sets/${setId}/toggle`, {
      method: "POST",
    });

    if (response.ok) {
      const { isActive } = await response.json();
      setSets((prev) =>
        prev.map((s) => (s.id === setId ? { ...s, isActive } : s))
      );
    }

    setToggling(null);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Problem Sets</h1>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Problem Sets</h1>
      <p className="text-muted-foreground mb-6">
        Choose which problem sets you want to practice. Problems from active sets will appear in your daily queue.
      </p>

      <div className="grid gap-4">
        {sets.map((set) => (
          <Card key={set.id} className={set.isActive ? "border-primary" : ""}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {set.name}
                  {set.isActive && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </CardTitle>
                <CardDescription>{set.description}</CardDescription>
              </div>
              <Switch
                checked={set.isActive}
                onCheckedChange={() => handleToggle(set.id)}
                disabled={toggling === set.id}
              />
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {set.problemCount} problems
              </p>
              <Link href={`/sets/${set.id}`}>
                <Button variant="ghost" size="sm">
                  View Problems
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {sets.every((s) => !s.isActive) && (
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">
            No problem sets selected. Toggle at least one set to start practicing.
          </p>
        </div>
      )}
    </div>
  );
}
