"use client";

import React from "react";
import ActivityItem from "./ActivityItem";
import { StreakEntry } from "./StreakTypes";

interface Props {
  day: string;
  activities: StreakEntry[];
  onOpen: (entry: StreakEntry) => void;
  onStart: (entry: StreakEntry) => void;
  refreshTrigger?: number;
}

export default function StreakWeeklyColumn({ day, activities, onOpen, onStart, refreshTrigger }: Props) {
  return (
    <div className="flex-shrink-0 flex flex-col" style={{ width: "160px", minWidth: "160px" }}>
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
                refreshTrigger={refreshTrigger}
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
