"use client";

import TimeColumn from "./TimeColumn";
import DayColumn from "./DayColumn";
import { TaskItem, ViewMode } from "./types";
import { getWeekDays, isCurrentDay, formatDayLabel } from "./utils/date";

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
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col h-full">
      {/* Header Row */}
      <div className="flex flex-shrink-0 border-b border-gray-200 bg-white">
        {/* Time column header */}
        <div style={{ width: '80px' }} className="flex-shrink-0 h-16 flex items-center justify-center border-r border-gray-200 bg-white">
          <span className="text-xs text-gray-400 font-medium">Jam</span>
        </div>

        {/* Day column headers */}
        <div className="flex flex-1 gap-0">
          {displayDays.map((date, idx) => {
            const isToday = isCurrentDay(date);
            return (
              <div
                key={`header-${date.toISOString()}`}
                style={{ flex: 1 }}
                className={`h-16 flex items-center justify-center font-semibold text-sm border-r ${
                  idx === displayDays.length - 1 ? 'border-r-0' : 'border-r-gray-200'
                } ${isToday ? "bg-blue-50 text-blue-900" : "text-gray-900 bg-white"}`}
              >
                {formatDayLabel(date)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="flex gap-0">
          {/* Time column */}
          <div style={{ width: '80px' }} className="flex-shrink-0 bg-white border-r border-gray-200">
            <TimeColumn />
          </div>

          {/* Day columns */}
          <div className="flex flex-1 gap-0">
            {displayDays.map((date, idx) => (
              <div
                key={date.toISOString()}
                style={{ flex: 1 }}
                className={`border-r ${idx === displayDays.length - 1 ? 'border-r-0' : 'border-r-gray-200'} bg-white`}
              >
                <DayColumn date={date} events={events} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
