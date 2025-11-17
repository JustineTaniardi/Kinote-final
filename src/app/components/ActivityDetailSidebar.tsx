"use client";

import React, { useEffect, useState } from "react";
import SidebarWrapper from "./SidebarWrapper";

interface ActivityItem {
  id: number;
  status: string;
  judul: string;
  kategori?: string;
  subcategory?: string;
  days?: string[];
  totalTime?: string;
  repeatCount?: string;
  breakTime?: string;
  deadline?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ActivityItem | null;
  onDelete?: (id: number) => void;
  onEdit?: (updated: ActivityItem) => void;
}

export default function ActivityDetailSidebar({
  isOpen,
  onClose,
  item,
  onDelete,
  onEdit,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isOpen) {
      t = setTimeout(() => setMounted(true), 10); // small delay to avoid sync setState
    } else {
      t = setTimeout(() => setMounted(false), 260);
    }
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!mounted || !item) return null;

  const handleDelete = () => {
    if (confirm("Delete this activity?")) {
      onDelete && onDelete(item.id);
      onClose();
    }
  };

  return (
    <SidebarWrapper isOpen={isOpen} onClose={onClose} width="400px">
      {/* Header with Activity Title (Read-Only) */}
      <div className="px-6 py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Read-only Title Display in Header */}
            <div className="text-lg font-semibold text-gray-900 truncate">
              {item.judul}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {item.kategori}
              {item.subcategory && ` | ${item.subcategory}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl leading-none transition shrink-0"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="px-6 py-6 flex-1 space-y-5 overflow-y-auto">
        {/* Display Activity Information - Read Only */}

        {/* Category - moved to content area for consistency with form layout */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Category
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.kategori || "-"}
          </div>
        </div>

        {/* Sub Category */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Sub Category
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.subcategory || "-"}
          </div>
        </div>

        {/* Days */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Days
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.days && item.days.length > 0 ? item.days.join(", ") : "-"}
          </div>
        </div>

        {/* Repeat */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Repeat
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.repeatCount || "-"}
          </div>
        </div>

        {/* Total Time */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Total Time (minutes)
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.totalTime || "-"}
          </div>
        </div>

        {/* Break */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Break (minutes)
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.breakTime || "-"}
          </div>
        </div>

        {/* Status Section */}
        {item.status && (
          <div className="pt-2 border-t border-gray-200 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Status
              </label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
                {item.status}
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        {item.createdAt && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </div>
              {item.updatedAt && (
                <div>
                  Updated: {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
        <button
          onClick={handleDelete}
          className="flex-1 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
        >
          Delete
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          Close
        </button>
      </div>
    </SidebarWrapper>
  );
}
