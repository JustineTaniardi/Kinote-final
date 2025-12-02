"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface StreakHistory {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  photoUrl: string | null;
  createdAt: string;
}

interface ShareData {
  streak: {
    id: number;
    title: string;
    description: string;
    category: string;
    streakCount: number;
    createdAt: string;
    user: {
      id: number;
      name: string;
    };
  };
  month: number;
  year: number;
  histories: StreakHistory[];
  totalSessions: number;
  totalDuration: number;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function SharePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [copyLink, setCopyLink] = useState("📋 Copy Link");

  // Get current and past years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!token) return;
    fetchShareData();
  }, [token, selectedMonth, selectedYear]);

  const fetchShareData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/share/${token}?month=${selectedMonth}&year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch share data");
      }

      const shareData = await response.json();
      setData(shareData);
    } catch (err) {
      console.error("Error fetching share data:", err);
      setError("Share not found or expired");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopyLink("✓ Copied!");
    setTimeout(() => setCopyLink("📋 Copy Link"), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-red-600 mb-4 text-lg font-medium">{error || "No data available"}</p>
          <p className="text-gray-600 mb-6">This share link may be expired or invalid.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-[#0f1a31] text-white rounded-lg hover:bg-[#1a2847] transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Get photos from histories
  const photos = data.histories
    .filter((h) => h.photoUrl)
    .map((h) => ({
      url: h.photoUrl!,
      date: new Date(h.startTime),
      title: h.title,
    }));

  const selectedPhoto = photos[selectedPhotoIndex] || null;

  // Safe date parsing helper
  const parseDate = (dateString?: string): Date => {
    if (!dateString) return new Date();
    try {
      return new Date(dateString);
    } catch {
      return new Date();
    }
  };

  // Calculate streak start and end dates
  const streakStartDate = parseDate(data.streak.createdAt);
  const streakEndDate = new Date();
  
  // Safe streak count
  const streakCount = data.streak.streakCount || data.histories?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {data.streak.user && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0f1a31]/10 text-[#0f1a31] rounded-full text-sm font-medium mb-3">
                👤 Shared by {data.streak.user.name}
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{data.streak.title}</h1>
            {(() => {
              const categoryName = typeof data.streak.category === 'string' 
                ? data.streak.category 
                : typeof data.streak.category === 'object' && data.streak.category && 'name' in data.streak.category
                ? (data.streak.category as any).name
                : null;
              return categoryName ? <p className="text-gray-600 mt-1">{categoryName}</p> : null;
            })()}
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              copyLink === "✓ Copied!"
                ? "bg-green-600 text-white"
                : "bg-[#0f1a31] text-white hover:bg-[#1a2847]"
            }`}
          >
            {copyLink}
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photos Section - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Photo */}
            {selectedPhoto ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                    {selectedPhoto.date.toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{selectedPhoto.title}</h3>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg aspect-video flex items-center justify-center">
                <p className="text-gray-500">No photos available</p>
              </div>
            )}

            {/* Photo Gallery - Scrollable Thumbnail */}
            {photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Gallery</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-3 pb-2">
                    {photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition ${
                          selectedPhotoIndex === idx
                            ? "border-[#0f1a31]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={`photo-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""} in total
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Info */}
          <div className="space-y-4">
            {/* Streak Stats */}
            <div className="bg-gradient-to-br from-[#0f1a31] to-[#1a2847] rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl">🔥</span>
              </div>
              <div className="text-center">
                <p className="text-gray-300 text-sm font-medium">Streak Count</p>
                <p className="text-5xl font-bold text-orange-400">{streakCount}</p>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📅</span>
                <h3 className="font-semibold text-gray-900">Period</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                    <span>📍</span> Start Date
                  </p>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {streakStartDate.toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                    <span>🏁</span> End Date
                  </p>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {streakEndDate.toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filter</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f1a31] focus:border-transparent"
                  >
                    {monthNames.map((month, idx) => (
                      <option key={idx} value={idx + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f1a31] focus:border-transparent"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {data.streak.description && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{data.streak.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
