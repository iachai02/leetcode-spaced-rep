"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface StreakData {
  current: number;
  longest: number;
  isNewRecord: boolean;
}

interface XPData {
  earned: number;
  total: number;
  rank: string;
  rankColor: string;
  rankUp: string | null;
  progress: number;
  nextRank: string | null;
  xpToNext: number;
}

interface WeekDay {
  day: string;
  date: string;
  completed: boolean;
  count: number;
  isToday: boolean;
  isFuture: boolean;
}

interface StreakModalProps {
  open: boolean;
  onClose: () => void;
  streak: StreakData | null;
  xp?: XPData | null;
  weeklyActivity?: WeekDay[];
}

export function StreakModal({
  open,
  onClose,
  streak,
  xp,
  weeklyActivity,
}: StreakModalProps) {
  if (!streak) return null;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogPrimitive.Portal>
        {/* Dark overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal content - always dark theme */}
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex gap-4">
            {/* Left side - Streak flame */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-800/50 px-6 py-4 min-w-[140px]">
              {/* Glowing flame */}
              <div className="relative mb-2">
                {/* Glow effect */}
                <div className="absolute inset-0 blur-xl bg-rose-500/40 rounded-full scale-150" />
                {/* Flame SVG */}
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="relative z-10"
                >
                  <path
                    d="M12 2C12 2 8 6 8 10C8 12 9.5 14 12 14C14.5 14 16 12 16 10C16 6 12 2 12 2Z"
                    fill="url(#flame-gradient)"
                  />
                  <path
                    d="M12 8C12 8 10 10 10 12C10 13.5 11 14 12 14C13 14 14 13.5 14 12C14 10 12 8 12 8Z"
                    fill="#FFF5F5"
                    fillOpacity="0.8"
                  />
                  <defs>
                    <linearGradient
                      id="flame-gradient"
                      x1="12"
                      y1="2"
                      x2="12"
                      y2="14"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FB7185" />
                      <stop offset="1" stopColor="#E11D48" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Streak count */}
              <DialogPrimitive.Title className="text-3xl font-bold text-white">
                {streak.current}{" "}
                <span className="text-lg font-normal text-zinc-400">
                  day{streak.current !== 1 ? "s" : ""}
                </span>
              </DialogPrimitive.Title>
              <p className="text-sm text-zinc-500">
                {streak.isNewRecord ? "New record!" : "Practice streak"}
              </p>
            </div>

            {/* Right side - XP and Weekly */}
            <div className="flex-1 flex flex-col gap-3">
              {/* XP Progress */}
              {xp && (
                <div className="rounded-xl bg-zinc-800/50 p-4">
                  {/* XP earned badge */}
                  {xp.earned > 0 && (
                    <div className="text-xs text-emerald-400 font-medium mb-2">
                      +{xp.earned} XP earned
                    </div>
                  )}

                  {/* Total XP and progress to next rank */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-white">
                      {xp.total.toLocaleString()}
                    </span>
                    {xp.nextRank && (
                      <span className="text-sm text-zinc-500">
                        / {(xp.total + xp.xpToNext).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${xp.progress}%`,
                        background:
                          "linear-gradient(90deg, #A855F7 0%, #EC4899 100%)",
                        boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)",
                      }}
                    />
                  </div>

                  {/* Rank info */}
                  <div className="flex justify-between text-xs">
                    <span style={{ color: xp.rankColor }} className="font-medium">
                      {xp.rank}
                    </span>
                    {xp.nextRank && (
                      <span className="text-zinc-500">
                        {xp.xpToNext.toLocaleString()} XP to {xp.nextRank}
                      </span>
                    )}
                  </div>

                  {/* Rank up celebration */}
                  {xp.rankUp && (
                    <div className="mt-2 text-center py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <span className="text-sm font-medium text-purple-300">
                        Ranked up to {xp.rankUp}!
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Weekly Activity */}
              {weeklyActivity && (
                <div className="rounded-xl bg-zinc-800/50 p-3">
                  <div className="flex justify-between">
                    {weeklyActivity.map((day) => (
                      <div
                        key={day.day}
                        className="flex flex-col items-center gap-1"
                      >
                        {/* Circle with check or empty */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            day.completed
                              ? "bg-rose-500 text-white"
                              : day.isFuture
                              ? "bg-zinc-700/50"
                              : day.isToday
                              ? "bg-zinc-700 border-2 border-zinc-500"
                              : "bg-zinc-700"
                          }`}
                        >
                          {day.completed && <Check className="w-4 h-4" />}
                        </div>
                        {/* Day label */}
                        <span
                          className={`text-xs ${
                            day.isToday
                              ? "text-white font-medium"
                              : "text-zinc-500"
                          }`}
                        >
                          {day.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Continue button */}
          <Button
            onClick={onClose}
            className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white border-0"
          >
            Continue
          </Button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
