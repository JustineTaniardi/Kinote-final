"use client";

import { useApi, UseApiResponse } from "./useApi";
import { useCallback } from "react";

/**
 * Streak types
 */
export interface Streak {
  id: number;
  userId: number;
  name: string;
  description?: string;
  category: string;
  focusMinutes: number;
  breakMinutes: number;
  breakRepetitions: number;
  totalTime: number;
  breakTime: number;
  breakCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StreakHistory {
  id: number;
  streakId: number;
  focusDuration: number;
  totalBreakTime: number;
  breakCount: number;
  duration: number;
  description?: string;
  startTime: string;
  endTime: string;
}

/**
 * Hook for fetching all streaks
 */
export function useStreaks(): UseApiResponse<Streak[]> {
  return useApi<Streak[]>("/api/streaks");
}

/**
 * Hook for fetching a single streak
 */
export function useStreak(streakId: number | null): UseApiResponse<Streak> {
  const url = streakId ? `/api/streaks/${streakId}` : null;
  return useApi<Streak>(url);
}

/**
 * Hook for fetching streak history
 */
export function useStreakHistory(
  streakId: number | null
): UseApiResponse<StreakHistory[]> {
  const url = streakId ? `/api/streaks/${streakId}/history` : null;
  return useApi<StreakHistory[]>(url);
}

/**
 * Hook for creating/updating streaks
 */
export function useStreakMutation() {
  const createStreak = useCallback(async (data: Partial<Streak>) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/streaks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create streak: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const updateStreak = useCallback(
    async (streakId: number, data: Partial<Streak>) => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/streaks/${streakId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update streak: ${response.statusText}`);
      }

      return response.json();
    },
    []
  );

  const deleteStreak = useCallback(async (streakId: number) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/streaks/${streakId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete streak: ${response.statusText}`);
    }

    return response.json();
  }, []);

  return { createStreak, updateStreak, deleteStreak };
}

/**
 * Hook for streak session management (start/end/complete)
 */
export function useStreakSession() {
  const startSession = useCallback(async (streakId: number) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/streaks/${streakId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to start session: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const endSession = useCallback(async (streakId: number) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/streaks/${streakId}/end-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ confirm: "END" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to end session: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const completeSession = useCallback(
    async (
      streakId: number,
      data: {
        focusSeconds: number;
        breakRepetitionsUsed: number;
        breakSessions: Array<{
          startTime: number;
          endTime?: number;
          duration: number;
          focusTimeBeforeBreak: number;
          type: "completed" | "skipped";
        }>;
        description?: string;
      }
    ) => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/streaks/${streakId}/complete-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to complete session: ${response.statusText}`);
      }

      return response.json();
    },
    []
  );

  return { startSession, endSession, completeSession };
}
