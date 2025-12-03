"use client";

import React, { useState, useEffect } from "react";
import { StreakEntry } from "./StreakTypes";
import { useAuth } from "@/lib/hooks/useAuth";

export default function CoachAiContent() {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<StreakEntry[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streaksLoading, setStreaksLoading] = useState(true);

  // Fetch streaks
  useEffect(() => {
    const fetchStreaks = async () => {
      if (!user) return;
      try {
        setStreaksLoading(true);
        const token = localStorage.getItem("authToken");

        const response = await fetch("/api/ai/career/streaks", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json() as Array<{
            id: number;
            title: string;
            category?: { name: string } | string;
            totalTime?: number;
            breakTime?: number;
            description?: string;
            updatedAt: string;
            verified: boolean;
            historyCount?: number;
          }>;

          const formattedStreaks = (data || []).map((streak) => ({
            id: streak.id,
            title: streak.title,
            category:
              typeof streak.category === "object"
                ? streak.category?.name || "Unknown"
                : streak.category || "Unknown",
            subcategory: "",
            totalMinutes: streak.totalTime || 0,
            breakTime: `${streak.breakTime || 0} mins`,
            description: streak.description || "",
            lastUpdated: streak.updatedAt,
            status: streak.verified ? "Verified" : "Pending",
            days: [],
            historyCount: streak.historyCount || 0,
          }));

          setStreaks(formattedStreaks);
        }
      } catch (error) {
        console.error("Error fetching streaks:", error);
      } finally {
        setStreaksLoading(false);
      }
    };

    fetchStreaks();
  }, [user]);

  // Toggle streak selection (single selection only)
  const toggleActivitySelection = (id: number) => {
    setSelectedActivity(selectedActivity === id ? null : id);
  };

  // Start AI Analysis
  const handleStartAI = async () => {
    if (selectedActivity === null) return;

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setAiResponse("ERROR: Request timeout. OpenAI API sedang lambat, silahkan coba lagi dalam beberapa saat.");
        setIsLoading(false);
      }
    }, 120000); // 2 minutes timeout

    try {
      const token = localStorage.getItem("authToken");
      const controller = new AbortController();
      const timeoutController = setTimeout(() => controller.abort(), 120000);

      const response = await fetch("/api/ai/career/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streakIds: [selectedActivity],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutController);

      if (response.ok) {
        const data = await response.json();

        // Handle the API response which contains analysis object
        if (data.analysis) {
          // Format the analysis object as JSON string for display
          setAiResponse(JSON.stringify(data.analysis, null, 2));
        } else if (typeof data === "string") {
          setAiResponse(data);
        } else {
          setAiResponse(JSON.stringify(data, null, 2));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.details || "Failed to generate AI analysis. Please try again.";
        setAiResponse(
          `ERROR: ${errorMessage}`
        );
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred while generating analysis. Please try again.';
      if (errorMsg.includes('AbortError')) {
        setAiResponse("ERROR: Request timeout. OpenAI API sedang lambat, silahkan coba lagi dalam beberapa saat.");
      } else {
        setAiResponse(`ERROR: ${errorMsg}`);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const canStartAI = selectedActivity !== null;

  // Loading Screen
  if (streaksLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#0f1a31] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Coach AI</h1>
        <p className="text-sm text-gray-600">
          Select your streak to get personalized insights
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {/* Streaks */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select a Streak
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({selectedActivity ? "1 selected" : "0 selected"})
            </span>
          </h2>

          {streaks.length === 0 ? (
            <p className="text-gray-500">
              No streaks found with at least 10 history records. Create and complete more streak sessions first!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streaks.map((streak) => {
                const isSelected = selectedActivity === streak.id;

                return (
                  <button
                    key={streak.id}
                    onClick={() => toggleActivitySelection(streak.id)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-[#161D36] bg-[#161D36]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-4 right-4">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-white border-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-[#161D36]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="pr-8">
                      <h3
                        className={`font-semibold mb-1 ${
                          isSelected ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {streak.title}
                      </h3>
                      <p
                        className={`text-sm mb-3 ${
                          isSelected ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        {streak.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isSelected ? "bg-white text-[#161D36]" : "bg-gray-100 text-gray-700"
                        }`}>
                          {String(streak.category)}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isSelected ? "bg-white text-[#161D36]" : "bg-gray-100 text-gray-700"
                        }`}>
                          {streak.totalMinutes} min
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isSelected ? "bg-white text-[#161D36]" : "bg-blue-100 text-blue-700"
                        }`}>
                          {typeof streak === 'object' && streak !== null && 'historyCount' in streak ? String((streak as Record<string, unknown>).historyCount) : '0'} sessions
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Result */}
        {aiResponse && (
          <div className="mt-12">
            {aiResponse.startsWith("ERROR:") ? (
              <div className="bg-red-50 rounded-xl p-8 border border-red-200">
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  ⚠️ Analisis Gagal
                </h2>
                <p className="text-red-700 mb-4">
                  {aiResponse.replace("ERROR: ", "")}
                </p>
                <p className="text-sm text-red-600">
                  Silakan periksa:
                </p>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  <li>API Key OpenAI sudah valid di environment variables</li>
                  <li>Koneksi internet stabil</li>
                  <li>Coba lagi dalam beberapa saat</li>
                </ul>
              </div>
            ) : (
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🤖 Analisis Pembelajaran AI Coach
                </h2>

              {(() => {
                try {
                  const parsed = JSON.parse(String(aiResponse));
                  return (
                    <div className="space-y-6">
                      {/* Learning Conclusion */}
                      {parsed.learning_conclusion && (
                        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            📖 Kesimpulan Pembelajaran Anda
                          </h3>
                          <p className="text-gray-700">{parsed.learning_conclusion}</p>
                        </div>
                      )}

                      {/* Strengths */}
                      {parsed.strengths && Array.isArray(parsed.strengths) && (
                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            💪 Kekuatan Anda
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {parsed.strengths.map((strength: string, idx: number) => (
                              <li key={idx} className="text-gray-700">
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Areas to Improve */}
                      {parsed.areas_to_improve && Array.isArray(parsed.areas_to_improve) && (
                        <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            🎯 Area untuk Ditingkatkan
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {parsed.areas_to_improve.map((area: string, idx: number) => (
                              <li key={idx} className="text-gray-700">
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tips and Tricks */}
                      {parsed.tips_and_tricks && Array.isArray(parsed.tips_and_tricks) && (
                        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            ✨ Tips & Tricks Penting
                          </h3>
                          <ul className="list-disc list-inside space-y-2">
                            {parsed.tips_and_tricks.map((tip: string, idx: number) => (
                              <li key={idx} className="text-gray-700 whitespace-pre-wrap">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                } catch {
                  // If JSON parsing fails, show raw response
                  return (
                    <div className="bg-white rounded-lg p-4">
                      <pre className="text-sm text-gray-700 overflow-auto max-h-96 whitespace-pre-wrap break-words">
                        {String(aiResponse)}
                      </pre>
                    </div>
                  );
                }
              })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
        <div className="shrink-0 bg-white border-t border-gray-200 p-6">
        <div className="flex gap-3">
          {(selectedActivity !== null ||
            aiResponse) && (
            <button
              onClick={() => {
                setSelectedActivity(null);
                setAiResponse(null);
              }}
              className="px-6 py-4 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition shadow-sm"
            >
              Clear All
            </button>
          )}          <button
            onClick={handleStartAI}
            disabled={!canStartAI || isLoading}
            className={`flex-1 px-6 py-4 rounded-lg font-medium transition flex items-center justify-center gap-3 shadow-sm ${
              canStartAI && !isLoading
                ? "bg-[#161D36] text-white hover:bg-[#2a3050]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm">Analyzing... (ini membutuhkan waktu ~20-30 detik)</span>
              </>
            ) : (
              <>
                <span className="text-xl font-light">+</span>
                <span className="font-normal">Start AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
