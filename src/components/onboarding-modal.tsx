"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (displayName: string | null) => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = displayName.trim();

    // Validate if name is provided
    if (trimmedName && (trimmedName.length < 2 || trimmedName.length > 30)) {
      setError("Must be 2-30 characters");
      return;
    }

    setSaving(true);
    setError(null);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: trimmedName || null }),
    });

    if (response.ok) {
      onComplete(trimmedName || null);
    } else {
      const data = await response.json();
      setError(data.error || "Failed to save");
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    // Mark onboarding as complete without setting a name
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: null }),
    });
    onComplete(null);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to LeetCode Spaced Rep!</DialogTitle>
          <DialogDescription>
            Set up your profile to get started. You can always change this later in Settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Display Name</label>
            <p className="text-xs text-muted-foreground mb-2">
              This is how you&apos;ll appear on the leaderboard.
            </p>
            <Input
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !saving) {
                  handleSubmit();
                }
              }}
              placeholder="Enter your name"
              maxLength={30}
              disabled={saving}
              className={error ? "border-red-500" : ""}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={saving}>
            Skip for now
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
