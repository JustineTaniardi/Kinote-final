"use client";

import React from "react";
import { StreakEntry } from "./StreakTypes";

interface Props {
  entry: StreakEntry;
  onOpen: (entry: StreakEntry) => void;
  onStart?: (entry: StreakEntry) => void;
}

function formatMinutes(mins: number) {
  if (!mins) return "0 min";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs} hr` : `${hrs} hr ${rem} min`;
}

export default function ActivityStreakBlogCard({ entry, onOpen, onStart }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-w-sm w-full transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold text-gray-900">{entry.title}</div>
          <div className="text-sm text-gray-500 mt-1">{entry.category}{entry.subcategory ? ` • ${entry.subcategory}` : ''}</div>
        </div>
        <div className="text-sm text-gray-600 text-right">
          <div className="font-medium">{formatMinutes(entry.totalMinutes)}</div>
          <div className="text-xs text-gray-500">{entry.lastUpdated ? new Date(entry.lastUpdated).toLocaleString() : '-'}</div>
        </div>
      </div>

      <div className="mt-4 text-gray-700 text-sm min-h-14">{entry.description || 'Please add your description here. Keep it short and simple :)'}</div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => onOpen(entry)} className="px-4 py-2 border border-[#161D36] rounded-lg text-sm text-[#161D36] hover:bg-[#161D36] hover:bg-opacity-5">Detail</button>
        <button onClick={() => onStart && onStart(entry)} className="px-4 py-2 bg-[#161D36] text-white rounded-lg text-sm hover:bg-[#1a2140]">Start</button>
      </div>
    </div>
  );
}
