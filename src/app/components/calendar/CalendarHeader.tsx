"use client";

import { useState, useEffect, useRef } from "react";
import { addWeeks, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ViewMode } from "./types";
import { showError, showSuccess } from "@/lib/toast";

interface CalendarHeaderProps {
  weekStart: Date;
  onWeekChange: (date: Date) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddTaskClick: () => void;
  isLoading?: boolean;
}

export default function CalendarHeader({
  weekStart,
  onWeekChange,
  viewMode,
  onViewModeChange,
  onAddTaskClick,
  isLoading = false,
}: CalendarHeaderProps) {
  const handlePrevWeek = () => {
    onWeekChange(addWeeks(weekStart, -1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(weekStart, 1));
  };

  const handleToday = () => {
    const today = new Date();
    onWeekChange(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const weekEnd = addWeeks(weekStart, 1);

  return (
    <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3">
      {/* Navigation and View Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-1.5 hover:bg-gray-100 rounded-md transition text-gray-600"
            title="Minggu sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1.5 hover:bg-gray-100 rounded-md transition text-gray-600"
            title="Minggu berikutnya"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={handleToday}
            className="ml-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition inline-flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Hari Ini
          </button>
          <div className="text-xs text-gray-600 font-medium ml-3">
            {format(weekStart, "dd MMM")} - {format(weekEnd, "dd MMM yyyy")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.25rem center",
              backgroundSize: "1.2em 1.2em",
              paddingRight: "1.75rem",
            }}
          >
            <option value="week">Minggu</option>
            <option value="today">Hari Ini</option>
          </select>

          {/* Add Task Button */}
          <button
            onClick={onAddTaskClick}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-md text-sm transition whitespace-nowrap flex-shrink-0"
          >
            + Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
