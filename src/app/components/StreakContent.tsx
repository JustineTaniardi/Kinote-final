"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import AddActivity from "./AddActivity";
import StreakSearchBar from "./StreakSearchBar";
import ActivityItem from "./ActivityItem";
import StreakWeeklyColumn from "./StreakWeeklyColumn";
import StreakTimerModal from "./StreakTimerModal";
import StreakDetailSidebar from "./StreakDetailSidebar";
import { StreakEntry } from "./StreakTypes";
import { useStreaks } from "@/lib/hooks/useStreaks";
import type { Streak } from "@/lib/hooks/useStreaks";

interface BreakSession {
  startTime: number;
  endTime?: number;
  duration: number;
  focusTimeBeforeBreak: number;
  type: "completed" | "skipped";
}

const sampleEntries: StreakEntry[] = [
  {
    id: 1,
    title: "Sports",
    category: "Sports",
    subcategory: "Basketball",
    totalMinutes: 30,
    breakTime: "10 mins",
    description: "Duration 30 min - Break 10 min - Streak 6",
    lastUpdated: new Date().toISOString(),
    status: "Not Started",
    days: ["Saturday", "Sunday"],
  },
];

interface StreakContentProps {
  onOpenAddActivity?: () => void;
}

export default function StreakContent({}: StreakContentProps) {
  const [tab, setTab] = useState<"blog" | "weekly">("blog");
  const [manualEntries, setManualEntries] =
    useState<StreakEntry[]>(sampleEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerFor, setTimerFor] = useState<StreakEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<StreakEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch streaks from API - optional integration
  const { data: streaks } = useStreaks();

  // Memoize converted entries from API data
  const apiEntries = useMemo(() => {
    if (streaks && streaks.length > 0) {
      return streaks.map((streak: Streak) => ({
        id: streak.id,
        title: streak.name,
        category: streak.category,
        subcategory: "",
        totalMinutes: streak.focusMinutes,
        breakTime: `${streak.breakMinutes} mins`,
        description: streak.description || "",
        lastUpdated: streak.updatedAt,
        status: streak.status,
        days: [],
      }));
    }
    return [];
  }, [streaks]);

  // Use API entries if available, otherwise manual entries
  // This avoids setState in effects
  const entries = apiEntries.length > 0 ? apiEntries : manualEntries;

  // Helper to update manual entries
  const setEntries = (updater: (prev: StreakEntry[]) => StreakEntry[]) => {
    setManualEntries(updater(manualEntries));
  };

  // Filter entries by search query
  const filteredEntries = useMemo(() => {
    return entries.filter((e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  // Group entries by day for weekly view
  const weeklyGrouped = useMemo(() => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const grouped: Record<string, StreakEntry[]> = {};

    days.forEach((day) => {
      grouped[day] = filteredEntries.filter((e) =>
        (e.days ?? []).includes(day)
      );
    });

    return days.map((day) => ({ day, activities: grouped[day] }));
  }, [filteredEntries]);

  const openDetail = (entry: StreakEntry) => {
    setDetailEntry(entry);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailEntry(null);
  };

  const parseBreakMinutes = (breakTime?: string): number => {
    if (!breakTime) return 5;
    const match = breakTime.match(/\d+/);
    return match ? parseInt(match[0], 10) : 5;
  };

  const handleStart = (entry: StreakEntry) => {
    setTimerFor(entry);
    setTimerOpen(true);
  };

  const handleFinishTimer = (
    seconds: number,
    breakRepetitionsUsed: number,
    breakSessions?: BreakSession[]
  ) => {
    const minutes = Math.round(seconds / 60);
    if (!timerFor) return;

    // If we have a streak ID, call the API to save session
    if (timerFor.id && typeof timerFor.id === "number") {
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        fetch(`/api/streaks/${timerFor.id}/complete-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            focusSeconds: seconds,
            breakRepetitionsUsed,
            breakSessions: breakSessions || [],
            description: `Session with ${breakRepetitionsUsed} breaks`,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Session saved:", data);
          })
          .catch((err) => {
            console.error("Failed to save session:", err);
          });
      }
    }

    const payload: StreakEntry = {
      id: entries.length + 1,
      title: timerFor.title,
      category: timerFor.category,
      subcategory: timerFor.subcategory,
      totalMinutes: minutes,
      breakTime: timerFor.breakTime,
      lastUpdated: new Date().toISOString(),
      description: `Completed ${minutes} min${
        breakRepetitionsUsed > 0 ? ` with ${breakRepetitionsUsed} breaks` : ""
      }`,
      date: new Date().toISOString(),
      status: "Completed",
      days: timerFor.days,
    };

    setEntries((prev) => [...prev, payload]);
    setTimerOpen(false);
    setTimerFor(null);
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleEdit = (updated: StreakEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  interface NewActivityPayload {
    title?: string;
    category?: string;
    subcategory?: string;
    totalTime?: number | string;
    breakTime?: string;
    description?: string;
    days?: string[];
  }

  const handleSaveActivity = (payload: NewActivityPayload) => {
    const minutes = Number(payload.totalTime ?? 0);
    const entry: StreakEntry = {
      id: entries.length + 1,
      title: payload.title ?? "Untitled",
      category: payload.category ?? "General",
      subcategory: payload.subcategory ?? "",
      totalMinutes: minutes,
      breakTime: payload.breakTime ?? "5 mins",
      lastUpdated: new Date().toISOString(),
      description: payload.description ?? "",
      date: new Date().toISOString(),
      status: "Not Started",
      days: payload.days ?? [],
    };
    setEntries((prev) => [...prev, entry]);
    setOpenAdd(false);
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Header section - fixed at top */}
      <div className="shrink-0 bg-white border-b border-gray-200 p-6">
        {/* Search Bar */}
        <StreakSearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setTab("blog")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === "blog"
                ? "bg-[#161D36] text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setTab("weekly")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === "weekly"
                ? "bg-[#161D36] text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Main content area - scrollable */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {/* Blog Tab - Responsive grid */}
        {tab === "blog" && (
          <div>
            {filteredEntries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    style={{ width: "100%", aspectRatio: "1 / 1" }}
                  >
                    <ActivityItem
                      entry={entry}
                      onOpen={openDetail}
                      onStart={handleStart}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No activities found</p>
              </div>
            )}
          </div>
        )}

        {/* Weekly Tab - Single scroll container with sticky header */}
        {tab === "weekly" && (
          <div className="overflow-x-auto flex-1">
            {/* Sticky day headers row - inside scroll container */}
            <div
              className="flex gap-6 pb-4 mb-4 border-b border-gray-300 bg-white"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 30,
                minWidth: "fit-content",
              }}
            >
              {weeklyGrouped.map(({ day }) => (
                <div
                  key={`header-${day}`}
                  className="text-center"
                  style={{ minWidth: "220px", flexShrink: 0 }}
                >
                  <h3 className="text-sm font-semibold text-gray-900">{day}</h3>
                </div>
              ))}
            </div>

            {/* Activities container - flex row, horizontally overflowing */}
            <div className="flex gap-6 pb-4">
              {weeklyGrouped.map(({ day, activities }) => (
                <StreakWeeklyColumn
                  key={day}
                  day={day}
                  activities={activities}
                  onOpen={openDetail}
                  onStart={handleStart}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom section - add button */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-6">
        <button
          onClick={() => setOpenAdd(true)}
          className="w-full bg-white rounded-lg border border-gray-200 px-6 py-4 flex items-center gap-3 text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm cursor-pointer"
        >
          <span className="text-xl font-light text-gray-400">+</span>
          <span className="font-normal">Add Activity</span>
        </button>
      </div>

      {/* Add Activity Sidebar */}
      <AnimatePresence>
        {openAdd && (
          <AddActivity
            isOpen={openAdd}
            onClose={() => setOpenAdd(false)}
            onSave={handleSaveActivity}
          />
        )}
      </AnimatePresence>

      {/* Floating Timer Modal */}
      <AnimatePresence>
        {timerOpen && timerFor && (
          <StreakTimerModal
            isOpen={timerOpen}
            onClose={() => setTimerOpen(false)}
            title={timerFor.title}
            focusMinutes={timerFor.totalMinutes}
            breakMinutes={parseBreakMinutes(timerFor.breakTime)}
            initialBreakRepetitions={1}
            streakId={timerFor.id}
            onComplete={handleFinishTimer}
          />
        )}
      </AnimatePresence>

      {/* Detail Sidebar */}
      <StreakDetailSidebar
        isOpen={detailOpen}
        onClose={closeDetail}
        entry={detailEntry}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
