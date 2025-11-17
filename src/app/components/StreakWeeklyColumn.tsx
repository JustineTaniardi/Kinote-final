"use client";

import React from "react";
import ActivityItem from "./ActivityItem";
import { StreakEntry } from "./StreakTypes";

interface Props {
  day: string;
  activities: StreakEntry[];
  onOpen: (entry: StreakEntry) => void;
  onStart: (entry: StreakEntry) => void;
}

export default function StreakWeeklyColumn({ day, activities, onOpen, onStart }: Props) {
  return (
    <div className="flex flex-col" style={{ minWidth: "220px", flexShrink: 0 }}>
      {/* Activities Column - vertical stacking with consistent spacing */}
      <div className="flex flex-col gap-4">
        {activities.length > 0 ? (
          activities.map((entry) => (
            <div
              key={entry.id}
              style={{ width: "100%", aspectRatio: "1 / 1" }}
            >
              <ActivityItem
                entry={entry}
                onOpen={onOpen}
                onStart={onStart}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 text-xs">No activities</div>
        )}
      </div>
    </div>
  );
}
