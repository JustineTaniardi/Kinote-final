"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import SidebarWrapper from "./SidebarWrapper";
import { CATEGORIES, SUBCATEGORIES } from "./ActivityCategories";
import { useStreakMutation } from "@/lib/hooks/useStreaks";

interface AddActivityProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (payload: NewActivityPayload) => void;
  onSuccess?: () => void;
}

interface NewActivityPayload {
  name: string;
  category: string;
  subcategory?: string;
  focusMinutes: number;
  breakMinutes: number;
  breakRepetitions: number;
  description?: string;
}

export default function AddActivity({
  isOpen,
  onClose,
  onSave,
  onSuccess,
}: AddActivityProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { createStreak } = useStreakMutation();

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [hari, setHari] = useState("");
  const [repeat, setRepeat] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [description, setDescription] = useState("");

  // Get subcategories for selected category
  const availableSubcategories = category
    ? SUBCATEGORIES[category as keyof typeof SUBCATEGORIES] || []
    : [];

  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategory("");
  }, [category]);

  // Handle mount/unmount
  useEffect(() => {
    if (isOpen) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const clearAll = () => {
    setTitle("");
    setCategory("");
    setSubcategory("");
    setHari("");
    setRepeat("");
    setTotalTime("");
    setBreakTime("");
    setDescription("");
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      setError("Activity name is required");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: NewActivityPayload = {
        name: title,
        category,
        subcategory: subcategory || undefined,
        description: description || undefined,
        focusMinutes: parseInt(totalTime) || 0,
        breakMinutes: parseInt(breakTime) || 0,
        breakRepetitions: parseInt(repeat) || 0,
      };

      // Call API to create streak
      await createStreak(payload);

      // Show success message
      setSuccessMessage(`Streak "${title}" created successfully! 🎉`);

      // Call onSave callback if provided (for local state updates)
      if (onSave) {
        onSave(payload);
      }

      // Call onSuccess callback to refresh streak list
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        clearAll();
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create streak";
      setError(errorMessage);
      console.error("Error creating streak:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <SidebarWrapper
      isOpen={isOpen}
      onClose={() => {
        clearAll();
        onClose();
      }}
      width="400px"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Activity Name"
              disabled={isLoading}
              className="w-full truncate border-none bg-transparent p-0 text-lg font-semibold text-gray-900 outline-none placeholder-gray-400 disabled:opacity-50"
            />
            <div className="mt-1 text-sm text-gray-500">Create a new activity</div>
          </div>
          <button
            onClick={() => {
              clearAll();
              onClose();
            }}
            disabled={isLoading}
            className="shrink-0 text-2xl leading-none text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Category */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3">
          <Image
            src="/img/add-activity/category_icon.png"
            width={20}
            height={20}
            alt="category"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            className="flex-1 border-none bg-transparent text-sm outline-none focus:ring-0 disabled:opacity-50"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3">
          <Image
            src="/img/add-activity/subcategory_icon.png"
            width={20}
            height={20}
            alt="subcategory"
          />
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={!category || isLoading}
            className="flex-1 border-none bg-transparent text-sm outline-none focus:ring-0 disabled:opacity-50"
          >
            <option value="">Select Sub Category</option>
            {availableSubcategories.map((subcat) => (
              <option key={subcat} value={subcat}>
                {subcat}
              </option>
            ))}
          </select>
        </div>

        {/* Days */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3">
          <Image
            src="/img/add-activity/hari_icon.png"
            width={20}
            height={20}
            alt="days"
          />
          <input
            type="number"
            min="0"
            value={hari}
            onChange={(e) => setHari(e.target.value)}
            disabled={isLoading}
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder-gray-400 focus:ring-0 disabled:opacity-50"
            placeholder="Day(s)"
          />
        </div>

        {/* Repeat */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3">
          <Image
            src="/img/add-activity/repeat_icon.png"
            width={20}
            height={20}
            alt="repeat"
          />
          <input
            type="number"
            min="0"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            disabled={isLoading}
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder-gray-400 focus:ring-0 disabled:opacity-50"
            placeholder="Repeat Count"
          />
        </div>

        {/* Total Time */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3">
          <Image
            src="/img/add-activity/total_time_icon.png"
            width={20}
            height={20}
            alt="total time"
          />
          <input
            type="number"
            min="0"
            value={totalTime}
            onChange={(e) => setTotalTime(e.target.value)}
            disabled={isLoading}
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder-gray-400 focus:ring-0 disabled:opacity-50"
            placeholder="Total Time (minutes)"
          />
        </div>

        {/* Break Time */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3">
          <Image
            src="/img/add-activity/break_icon.png"
            width={20}
            height={20}
            alt="break"
          />
          <input
            type="number"
            min="0"
            value={breakTime}
            onChange={(e) => setBreakTime(e.target.value)}
            disabled={isLoading}
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder-gray-400 focus:ring-0 disabled:opacity-50"
            placeholder="Break Time (minutes)"
          />
        </div>

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
          placeholder="Description"
          rows={4}
        />
      </div>

      {/* Footer Buttons */}
      <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4">
        <button
          onClick={() => {
            clearAll();
            onClose();
          }}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </SidebarWrapper>
  );
}
