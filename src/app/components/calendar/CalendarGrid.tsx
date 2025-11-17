"use client";

import TimeColumn from "./TimeColumn";
import DayColumn from "./DayColumn";
import { TaskItem, ViewMode } from "./types";
import { getWeekDays, isCurrentDay } from "./utils/date";

interface CalendarGridProps {
  weekStart: Date;
  events: TaskItem[];
  viewMode: ViewMode;
}

export default function CalendarGrid({
  weekStart,
  events,
  viewMode,
}: CalendarGridProps) {
  const weekDays = getWeekDays(weekStart);
  const today = new Date();

  let displayDays: Date[] = [];

  if (viewMode === "week") {
    displayDays = weekDays;
  } else if (viewMode === "today") {
    displayDays = [today];
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Container with horizontal and vertical scroll */}
      <div className="flex h-[calc(100vh-280px)] overflow-auto">
        {/* Time column - sticky */}
        <TimeColumn />

        {/* Day columns */}
        <div className="flex flex-1">
          {displayDays.map((date) => (
            <DayColumn key={date.toISOString()} date={date} events={events} />
          ))}
        </div>
      </div>
    </div>
  );
}
