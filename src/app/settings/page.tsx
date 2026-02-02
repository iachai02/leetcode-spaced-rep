"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const [dailyGoal, setDailyGoal] = useState(3);
  const [originalGoal, setOriginalGoal] = useState(3);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [originalShowOnLeaderboard, setOriginalShowOnLeaderboard] = useState(false);
  const [friendCode, setFriendCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    const response = await fetch("/api/profile");
    if (response.ok) {
      const data = await response.json();
      setDailyGoal(data.dailyGoal);
      setOriginalGoal(data.dailyGoal);
      setShowOnLeaderboard(data.showOnLeaderboard);
      setOriginalShowOnLeaderboard(data.showOnLeaderboard);
      setFriendCode(data.friendCode);
      setEmail(data.email);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyGoal, showOnLeaderboard }),
    });

    if (response.ok) {
      setOriginalGoal(dailyGoal);
      setOriginalShowOnLeaderboard(showOnLeaderboard);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
  };

  const copyFriendCode = () => {
    if (friendCode) {
      navigator.clipboard.writeText(friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasChanges = dailyGoal !== originalGoal || showOnLeaderboard !== originalShowOnLeaderboard;

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card className="max-w-lg">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6 max-w-lg">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{email}</p>
          </CardContent>
        </Card>

        {/* Daily Goal */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Goal</CardTitle>
            <CardDescription>
              How many problems would you like to review per day?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDailyGoal(Math.max(1, dailyGoal - 1))}
                disabled={dailyGoal <= 1}
              >
                -
              </Button>
              <span className="text-3xl font-bold w-12 text-center">
                {dailyGoal}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDailyGoal(Math.min(20, dailyGoal + 1))}
                disabled={dailyGoal >= 20}
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground">
                problems per day
              </span>
            </div>

            {/* Quick select buttons */}
            <div className="flex gap-2 flex-wrap">
              {[1, 3, 5, 10].map((value) => (
                <Button
                  key={value}
                  variant={dailyGoal === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDailyGoal(value)}
                >
                  {value}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {saved && (
                <span className="text-sm text-green-500">Saved!</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>
              Control your visibility on the global leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Show on Global Leaderboard</label>
                <p className="text-xs text-muted-foreground">
                  When enabled, your rank and XP will be visible to everyone
                </p>
              </div>
              <Switch
                checked={showOnLeaderboard}
                onCheckedChange={setShowOnLeaderboard}
              />
            </div>

            {friendCode && (
              <div className="pt-2 border-t">
                <label className="text-sm font-medium">Your Friend Code</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Share this code with friends so they can add you
                </p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 py-2 rounded text-lg font-mono flex-1">
                    {friendCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyFriendCode}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {hasChanges && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                {saved && (
                  <span className="text-sm text-green-500">Saved!</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
