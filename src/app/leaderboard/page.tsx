"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trophy,
  Users,
  UserPlus,
  Copy,
  Check,
  Flame,
  Crown,
  Medal,
  Award,
} from "lucide-react";

interface LeaderboardEntry {
  position: number;
  userId: string;
  displayName: string;
  totalXP: number;
  rankName: string;
  rankColor: string;
  rankBadge: string | null;
  streak: number;
  isCurrentUser: boolean;
}

interface PendingRequest {
  friendshipId: string;
  userId: string;
  displayName: string;
  createdAt: string;
}

export default function LeaderboardPage() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pendingReceived, setPendingReceived] = useState<PendingRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<PendingRequest[]>([]);
  const [friendCode, setFriendCode] = useState<string>("");
  const [userGlobalRank, setUserGlobalRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addFriendCode, setAddFriendCode] = useState("");
  const [addFriendEmail, setAddFriendEmail] = useState("");
  const [addingFriend, setAddingFriend] = useState(false);
  const [addFriendError, setAddFriendError] = useState<string | null>(null);
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);

  const fetchData = useCallback(async () => {
    const [globalRes, friendsRes, friendsDataRes] = await Promise.all([
      fetch("/api/leaderboard?type=global&limit=50"),
      fetch("/api/leaderboard?type=friends&limit=50"),
      fetch("/api/friends"),
    ]);

    if (globalRes.ok) {
      const data = await globalRes.json();
      setGlobalLeaderboard(data.leaderboard);
      setUserGlobalRank(data.userRank);
    }

    if (friendsRes.ok) {
      const data = await friendsRes.json();
      setFriendsLeaderboard(data.leaderboard);
    }

    if (friendsDataRes.ok) {
      const data = await friendsDataRes.json();
      setPendingReceived(data.pendingReceived || []);
      setPendingSent(data.pendingSent || []);
      setFriendCode(data.friendCode || "");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyFriendCode = () => {
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = async () => {
    if (!addFriendCode && !addFriendEmail) return;

    setAddingFriend(true);
    setAddFriendError(null);

    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        friendCode: addFriendCode || undefined,
        email: addFriendEmail || undefined,
      }),
    });

    if (res.ok) {
      setAddFriendCode("");
      setAddFriendEmail("");
      setShowAddFriendDialog(false);
      fetchData();
    } else {
      const data = await res.json();
      setAddFriendError(data.error || "Failed to send friend request");
    }

    setAddingFriend(false);
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, action: "accept" }),
    });
    fetchData();
  };

  const handleRejectRequest = async (friendshipId: string) => {
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, action: "reject" }),
    });
    fetchData();
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-muted-foreground">{position}</span>;
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-4">
                <div className="h-12 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        {userGlobalRank && (
          <Badge variant="outline" className="text-sm">
            Your Global Rank: #{userGlobalRank}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="global">
        <TabsList className="mb-4">
          <TabsTrigger value="global" className="gap-2">
            <Trophy className="h-4 w-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="friends" className="gap-2">
            <Users className="h-4 w-4" />
            Friends
            {pendingReceived.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingReceived.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Global Leaderboard */}
        <TabsContent value="global">
          {globalLeaderboard.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No one on the leaderboard yet</p>
                <p className="text-muted-foreground">
                  Be the first to enable leaderboard visibility in Settings!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {globalLeaderboard.map((entry) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  getPositionIcon={getPositionIcon}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Friends Leaderboard */}
        <TabsContent value="friends">
          {/* Friend Code & Add Friend */}
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Friend Code</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-3 py-1 rounded text-lg font-mono">
                      {friendCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyFriendCode}
                      className="h-8 w-8 p-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Dialog open={showAddFriendDialog} onOpenChange={setShowAddFriendDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Friend
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a Friend</DialogTitle>
                      <DialogDescription>
                        Enter their friend code or search by email/name
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium">Friend Code</label>
                        <Input
                          placeholder="e.g., ABC12345"
                          value={addFriendCode}
                          onChange={(e) => setAddFriendCode(e.target.value.toUpperCase())}
                          className="mt-1 font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email or Name</label>
                        <Input
                          placeholder="friend@example.com"
                          value={addFriendEmail}
                          onChange={(e) => setAddFriendEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      {addFriendError && (
                        <p className="text-sm text-red-500">{addFriendError}</p>
                      )}
                      <Button
                        onClick={handleAddFriend}
                        disabled={addingFriend || (!addFriendCode && !addFriendEmail)}
                        className="w-full"
                      >
                        {addingFriend ? "Sending..." : "Send Friend Request"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Pending Friend Requests */}
          {pendingReceived.length > 0 && (
            <Card className="mb-4 border-yellow-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-500">
                  Pending Friend Requests ({pendingReceived.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingReceived.map((request) => (
                  <div
                    key={request.friendshipId}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="font-medium">{request.displayName}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.friendshipId)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.friendshipId)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friends Leaderboard */}
          {friendsLeaderboard.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No friends yet</p>
                <p className="text-muted-foreground mb-4">
                  Share your friend code or add friends to compete!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {friendsLeaderboard.map((entry) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  getPositionIcon={getPositionIcon}
                />
              ))}
            </div>
          )}

          {/* Pending Sent */}
          {pendingSent.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Requests Sent ({pendingSent.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {pendingSent.map((r) => r.displayName).join(", ")}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeaderboardRow({
  entry,
  getPositionIcon,
}: {
  entry: LeaderboardEntry;
  getPositionIcon: (position: number) => React.ReactNode;
}) {
  return (
    <Card className={entry.isCurrentUser ? "border-primary" : ""}>
      <CardContent className="py-3">
        <div className="flex items-center gap-4">
          {/* Position */}
          <div className="w-8 flex justify-center">
            {getPositionIcon(entry.position)}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium truncate ${entry.isCurrentUser ? "text-primary" : ""}`}>
                {entry.displayName}
                {entry.isCurrentUser && " (You)"}
              </span>
              {entry.rankBadge ? (
                // Special badge image for LeetCode Legend
                <div className="flex items-center gap-1 shrink-0">
                  <Image
                    src={entry.rankBadge}
                    alt={entry.rankName}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: entry.rankColor }}
                  >
                    {entry.rankName}
                  </span>
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs shrink-0"
                  style={{ borderColor: entry.rankColor, color: entry.rankColor }}
                >
                  {entry.rankName}
                </Badge>
              )}
            </div>
          </div>

          {/* Streak */}
          {entry.streak > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">{entry.streak}</span>
            </div>
          )}

          {/* XP */}
          <div className="text-right min-w-[80px]">
            <span className="font-bold">{entry.totalXP.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm ml-1">XP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
