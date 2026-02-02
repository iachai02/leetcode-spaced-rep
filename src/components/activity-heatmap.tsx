"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ActivityHeatmap - A GitHub-style contribution graph for problem reviews.
 *
 * How it works:
 * 1. Data is passed as props (fetched with stats to avoid extra request)
 * 2. Generate a grid of 53 columns (weeks) x 7 rows (days)
 * 3. Color intensity is based on how many problems were done that day
 *
 * Color scheme (blue):
 * - No activity: bg-muted (gray)
 * - Low: blue-200
 * - Medium: blue-400
 * - High: blue-600
 * - Very high: blue-800
 *
 * The grid reads left-to-right, top-to-bottom, with the most recent
 * week on the right side (like GitHub).
 *
 * Why props instead of fetching?
 * - Avoids a separate network request (faster initial load)
 * - Data comes bundled with stats (one fetch for everything)
 * - No loading spinner delay for the heatmap
 */

interface ActivityHeatmapProps {
  activity: Record<string, number>;
  maxCount: number;
}

export function ActivityHeatmap({ activity, maxCount }: ActivityHeatmapProps) {
  // If no data yet (stats still loading), show nothing
  // The parent handles the loading state
  if (!activity) {
    return null;
  }

  // Generate the grid of dates
  // We want 53 weeks (columns) ending with today
  const today = new Date();
  const grid = generateGrid(today, activity, maxCount);
  const monthPositions = getMonthPositions(today);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {/* Spacer for day labels */}
          <div className="w-8 shrink-0" />

          {/* Month labels - positioned relative to grid */}
          <div className="relative h-5 mb-1 flex-1">
            {monthPositions.map((month, i) => (
              <span
                key={i}
                className="absolute text-xs text-muted-foreground"
                style={{ left: month.startWeek * 15 }} // 15px = 12px cell + 3px gap
              >
                {month.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="w-8 shrink-0 flex flex-col justify-around text-xs text-muted-foreground">
            <span className="h-3 leading-3">Mon</span>
            <span className="h-3 leading-3">Wed</span>
            <span className="h-3 leading-3">Fri</span>
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${day.color}`}
                    title={day.date ? `${day.date}: ${day.count} problems` : ""}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-blue-200" />
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <div className="w-3 h-3 rounded-sm bg-blue-600" />
          <div className="w-3 h-3 rounded-sm bg-blue-800" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface DayCell {
  date: string | null;
  count: number;
  color: string;
}

/**
 * Calculate the start date for the heatmap grid.
 * We go back ~52 weeks from today, then adjust to start on Sunday.
 * This is shared between grid generation and month labels.
 */
function getGridStartDate(today: Date): Date {
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364); // Go back ~52 weeks
  // Adjust to the previous Sunday (day 0)
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);
  return startDate;
}

/**
 * Generate the grid of day cells for the heatmap.
 *
 * The grid is 53 columns (weeks) x 7 rows (days of week).
 * We start from 52 weeks ago and go to today.
 * Empty cells at the start/end are filled with placeholder data.
 */
function generateGrid(
  today: Date,
  activity: Record<string, number>,
  maxCount: number
): DayCell[][] {
  const grid: DayCell[][] = [];
  const startDate = getGridStartDate(today);

  // Generate 53 weeks
  const currentDate = new Date(startDate);
  for (let week = 0; week < 53; week++) {
    const weekCells: DayCell[] = [];

    for (let day = 0; day < 7; day++) {
      // Use local date string to avoid timezone issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dayNum = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${dayNum}`;

      const count = activity[dateStr] ?? 0;
      const isAfterToday = currentDate > today;

      weekCells.push({
        date: isAfterToday ? null : dateStr,
        count,
        color: isAfterToday ? "bg-transparent" : getColorClass(count, maxCount),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    grid.push(weekCells);
  }

  return grid;
}

/**
 * Determine the color class based on activity count.
 *
 * We use 5 levels:
 * 0: gray (no activity)
 * 1-25% of max: lightest blue
 * 25-50%: light blue
 * 50-75%: medium blue
 * 75%+: dark blue
 */
function getColorClass(count: number, maxCount: number): string {
  if (count === 0) return "bg-muted";
  if (maxCount === 0) return "bg-muted";

  const ratio = count / maxCount;

  if (ratio <= 0.25) return "bg-blue-200";
  if (ratio <= 0.5) return "bg-blue-400";
  if (ratio <= 0.75) return "bg-blue-600";
  return "bg-blue-800";
}

/**
 * Get month label positions for the heatmap.
 * Returns the week index where each month starts.
 *
 * We position labels at the START of each month (the first week
 * where that month appears). This matches how GitHub's heatmap works.
 */
function getMonthPositions(today: Date): { name: string; startWeek: number }[] {
  const months: { name: string; startWeek: number }[] = [];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const startDate = getGridStartDate(today);
  let lastMonth = -1;

  // Find the first week where each month appears
  const date = new Date(startDate);
  for (let week = 0; week < 53; week++) {
    const month = date.getMonth();

    // When we see a new month, record its starting position
    if (month !== lastMonth) {
      months.push({ name: monthNames[month], startWeek: week });
      lastMonth = month;
    }

    date.setDate(date.getDate() + 7);
  }

  return months;
}
