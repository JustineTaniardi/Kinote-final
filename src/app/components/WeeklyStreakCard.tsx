"use client";

import React from "react";

interface Props {
  day: string;
  totalMinutes: number;
  progress: number; // 0-100
  onOpen?: (day: string) => void;
}

function formatMinutes(mins: number) {
  if (!mins) return "0 min";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs} hr` : `${hrs} hr ${rem} min`;
}

export default function WeeklyStreakCard({ day, totalMinutes, progress, onOpen }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 w-full transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-800">{day}</div>
        <div className="text-sm text-gray-600">{formatMinutes(totalMinutes)}</div>
      </div>
      <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-3 bg-[#161D36] rounded-full" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
      </div>
      <button onClick={() => onOpen && onOpen(day)} className="mt-3 text-sm text-[#161D36] hover:opacity-70">View</button>
    </div>
  );
}
