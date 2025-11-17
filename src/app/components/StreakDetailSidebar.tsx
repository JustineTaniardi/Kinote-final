"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import SidebarWrapper from "./SidebarWrapper";
import { StreakEntry, ProgressStep } from "./StreakTypes";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { CATEGORIES, SUBCATEGORIES } from "./ActivityCategories";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entry: StreakEntry | null;
  onDelete?: (id: number) => void;
  onEdit?: (updated: StreakEntry) => void;
}

export default function StreakDetailSidebar({
  isOpen,
  onClose,
  entry,
  onDelete,
  onEdit,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState(entry?.title || "");
  const [editCategory, setEditCategory] = useState(entry?.category ?? "");
  const [editSubcategory, setEditSubcategory] = useState(
    entry?.subcategory ?? ""
  );
  const [editDays, setEditDays] = useState<string[]>(entry?.days || []);
  const [editTotalTime, setEditTotalTime] = useState(
    String(entry?.totalMinutes || "") || ""
  );
  const [editBreakTime, setEditBreakTime] = useState(entry?.breakTime || "");
  const [editDescription, setEditDescription] = useState(
    entry?.description || ""
  );

  useEffect(() => {
    if (isOpen) {
      // Batch all state updates - this pattern is valid for UI transitions
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      setIsEditing(false);
      if (entry) {
        setEditTitle(entry.title);
        setEditCategory(entry.category ?? "");
        setEditSubcategory(entry.subcategory ?? "");
        setEditDays(entry.days || []);
        setEditTotalTime(String(entry.totalMinutes || ""));
        setEditBreakTime(entry.breakTime || "");
        setEditDescription(entry.description || "");
      }
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, entry]);

  if (!mounted || !entry) return null;

  const availableSubcategories = editCategory
    ? SUBCATEGORIES[editCategory as keyof typeof SUBCATEGORIES] || []
    : [];

  // Mock history data
  const historyCount = 7;
  const historyDate = "12/11/2025";
  const historyTime = "10:34 - 11:44";

  // Mock progress steps template data
  const mockProgressSteps: ProgressStep[] = entry.progressSteps || [
    {
      id: "step-1",
      title: "Environment Setup",
      description:
        "Set up React development environment with Create React App and installed necessary dependencies like React Router and Axios for API calls.",
      image:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Crect fill='%2361dafb' x='100' y='80' width='200' height='140' rx='10'/%3E%3Ctext x='200' y='155' font-size='48' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-weight='bold'%3EReact%3C/text%3E%3C/svg%3E",
      createdAt: "2025-11-10T08:30:00Z",
    },
    {
      id: "step-2",
      title: "Component Structure",
      description:
        "Created modular component architecture with reusable components. Implemented proper component hierarchy and prop drilling patterns for data flow management.",
      image:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e0e7ff' width='400' height='300'/%3E%3Crect fill='%234f46e5' x='50' y='60' width='80' height='80' rx='8'/%3E%3Crect fill='%234f46e5' x='160' y='60' width='80' height='80' rx='8'/%3E%3Crect fill='%234f46e5' x='270' y='60' width='80' height='80' rx='8'/%3E%3Crect fill='%23818cf8' x='105' y='180' width='190' height='80' rx='8'/%3E%3C/svg%3E",
      createdAt: "2025-11-11T10:15:00Z",
    },
    {
      id: "step-3",
      title: "State Management Implementation",
      description:
        "Implemented Redux store with actions and reducers. Set up middleware for async operations and connected components with Redux hooks.",
      image:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23fef3c7' width='400' height='300'/%3E%3Ccircle cx='100' cy='100' r='40' fill='%23fbbf24'/%3E%3Ccircle cx='200' cy='150' r='40' fill='%23fbbf24'/%3E%3Ccircle cx='300' cy='100' r='40' fill='%23fbbf24'/%3E%3Cline x1='140' y1='85' x2='160' y2='135' stroke='%23f59e0b' stroke-width='3'/%3E%3Cline x1='240' y1='135' x2='260' y2='85' stroke='%23f59e0b' stroke-width='3'/%3E%3C/svg%3E",
      createdAt: "2025-11-12T14:45:00Z",
    },
  ];

  const handleDelete = () => {
    if (
      window.confirm(`Delete "${entry.title}"? This action cannot be undone.`)
    ) {
      onDelete?.(entry.id);
      onClose();
    }
  };

  const handleSave = () => {
    const updated: StreakEntry = {
      ...entry,
      title: editTitle,
      category: editCategory,
      subcategory: editSubcategory,
      days: editDays,
      totalMinutes: parseInt(editTotalTime) || 0,
      breakTime: editBreakTime,
      description: editDescription,
    };
    onEdit?.(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(entry.title);
    setEditCategory(entry.category ?? "");
    setEditSubcategory(entry.subcategory ?? "");
    setEditDays(entry.days || []);
    setEditTotalTime(String(entry.totalMinutes || ""));
    setEditBreakTime(entry.breakTime || "");
    setEditDescription(entry.description || "");
    setIsEditing(false);
  };

  return (
    <SidebarWrapper isOpen={isOpen} onClose={onClose} width="420px">
      {/* Header Section with Title */}
      <div className="px-6 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
                  placeholder="Activity Name"
                />
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 truncate">
                    {entry.title}
                  </h2>
                  <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full shrink-0 border border-gray-300">
                    <Image
                      src="/img/add-activity/streak_icon.png"
                      width={16}
                      height={16}
                      alt="streak"
                    />
                    <span className="text-sm font-bold text-gray-900">8</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 shrink-0"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-6 flex-1 space-y-4 overflow-y-auto">
        {/* Category */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <Image
            src="/img/add-activity/category_icon.png"
            width={20}
            height={20}
            alt="category"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Category</p>
                <select
                  value={editCategory}
                  onChange={(e) => {
                    setEditCategory(e.target.value);
                    setEditSubcategory("");
                  }}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-semibold text-gray-900">
                  {entry.category || "Academic"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Sub Category */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <Image
            src="/img/add-activity/subcategory_icon.png"
            width={20}
            height={20}
            alt="subcategory"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Sub Category</p>
                <select
                  value={editSubcategory}
                  onChange={(e) => setEditSubcategory(e.target.value)}
                  disabled={!editCategory}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1 disabled:opacity-50"
                >
                  <option value="">Select Sub Category</option>
                  {availableSubcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Sub Category</p>
                <p className="text-sm font-semibold text-gray-900">
                  {entry.subcategory || "Programming"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Days */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <Image
            src="/img/add-activity/hari_icon.png"
            width={20}
            height={20}
            alt="days"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Days</p>
                <input
                  type="text"
                  value={editDays?.join(", ") || ""}
                  onChange={(e) =>
                    setEditDays(e.target.value.split(",").map((d) => d.trim()))
                  }
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1"
                  placeholder="Saturday, Sunday"
                />
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Days</p>
                <p className="text-sm font-semibold text-gray-900">
                  {entry.days?.join(", ") || "Saturday, Sunday"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Repeat - removed as it doesn't exist in StreakEntry */}

        {/* Total Time */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <Image
            src="/img/add-activity/total_time_icon.png"
            width={20}
            height={20}
            alt="total time"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Total Time</p>
                <input
                  type="number"
                  value={editTotalTime}
                  onChange={(e) => setEditTotalTime(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1"
                  placeholder="0"
                />
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Total Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {entry.totalMinutes || 0} menit
                </p>
              </>
            )}
          </div>
        </div>

        {/* Break */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <Image
            src="/img/add-activity/break_icon.png"
            width={20}
            height={20}
            alt="break"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Break</p>
                <input
                  type="text"
                  value={editBreakTime}
                  onChange={(e) => setEditBreakTime(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1"
                  placeholder="10 menit"
                />
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Break</p>
                <p className="text-sm font-semibold text-gray-900">
                  {entry.breakTime || "10 menit"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 pt-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Description
          </p>
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-900 outline-none border border-gray-200 focus:border-gray-400 resize-none"
              rows={4}
              placeholder="Add description..."
            />
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 h-24 border border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                {entry.description || "No description added"}
              </p>
            </div>
          )}
        </div>

        {/* History Section - Clickable Button */}
        <div className="mt-6 pt-4">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="w-full bg-gray-50 rounded-2xl p-4 flex items-start gap-3 hover:bg-gray-100 transition border border-gray-200 cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg shrink-0 mt-0.5 border border-gray-200">
              <Image
                src="/img/add-activity/streak_icon.png"
                width={20}
                height={20}
                alt="streak"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">History</p>
                <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-full border border-gray-300">
                  {historyCount}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Tanggal :</span> {historyDate}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Waktu :</span> {historyTime}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {}}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-not-allowed"
              >
                Start
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0">
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg border border-red-200/50 hover:bg-red-100 transition-colors font-medium text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* History Modal - Progress Steps */}
      {showHistoryModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShowHistoryModal(false)}
          />
          {/* Modal - Full Screen Overlay */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Progress & Documentation
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition p-2 shrink-0 hover:bg-gray-100 rounded-lg"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-8 py-8">
                {/* Progress Steps List */}
                <div className="space-y-4 mb-8">
                  {!mockProgressSteps || mockProgressSteps.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-500 font-medium">
                        No progress steps yet
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Add your first step to document your progress
                      </p>
                    </div>
                  ) : (
                    mockProgressSteps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => setSelectedStep(index)}
                        className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 transition group"
                      >
                        <div className="flex gap-4 p-4">
                          {/* Step Image */}
                          <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                            {step.image ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={step.image}
                                  alt={step.title}
                                  className="w-full h-full object-cover"
                                  style={{ width: "100%", height: "100%" }}
                                />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Step Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {step.title}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {step.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(step.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {/* Chevron */}
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl sticky bottom-0 flex gap-3">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step Detail Modal */}
      {selectedStep !== null &&
        mockProgressSteps &&
        mockProgressSteps[selectedStep] && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setSelectedStep(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Step Header */}
                <div className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Step {selectedStep + 1}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">View & Edit</p>
                  </div>
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="text-gray-400 hover:text-gray-600 transition p-2 shrink-0 hover:bg-gray-100 rounded-lg"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Step Content */}
                <div className="px-8 py-8">
                  {/* Step Image with Upload */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Step Photo
                    </label>
                    <div className="relative group">
                      <div className="w-full h-72 bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                        {mockProgressSteps[selectedStep].image ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={mockProgressSteps[selectedStep].image}
                              alt="Step"
                              className="w-full h-full object-cover"
                            />
                          </>
                        ) : (
                          <div className="text-center">
                            <svg
                              className="w-16 h-16 text-gray-400 mx-auto mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-sm text-gray-500">
                              No image uploaded
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Upload Button Overlay */}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition rounded-2xl cursor-pointer">
                        <div className="text-center opacity-0 group-hover:opacity-100 transition">
                          <svg
                            className="w-10 h-10 text-white mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <p className="text-sm font-medium text-white">
                            Change Photo
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && selectedStep !== null) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const updatedSteps = [...mockProgressSteps];
                                updatedSteps[selectedStep] = {
                                  ...updatedSteps[selectedStep],
                                  image: event.target?.result as string,
                                };
                                onEdit?.({
                                  ...entry,
                                  progressSteps: updatedSteps,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Step Title */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Step Title
                    </label>
                    <input
                      type="text"
                      defaultValue={mockProgressSteps[selectedStep].title}
                      onChange={(e) => {
                        if (selectedStep !== null) {
                          const updatedSteps = [...mockProgressSteps];
                          updatedSteps[selectedStep] = {
                            ...updatedSteps[selectedStep],
                            title: e.target.value,
                          };
                          onEdit?.({
                            ...entry,
                            progressSteps: updatedSteps,
                          });
                        }
                      }}
                      placeholder="e.g., First Implementation"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {/* Step Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Description
                    </label>
                    <textarea
                      defaultValue={mockProgressSteps[selectedStep].description}
                      onChange={(e) => {
                        if (selectedStep !== null) {
                          const updatedSteps = [...mockProgressSteps];
                          updatedSteps[selectedStep] = {
                            ...updatedSteps[selectedStep],
                            description: e.target.value,
                          };
                          onEdit?.({
                            ...entry,
                            progressSteps: updatedSteps,
                          });
                        }
                      }}
                      placeholder="Describe this step, what you did, and what you learned..."
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Step Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl sticky bottom-0 flex gap-3">
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
    </SidebarWrapper>
  );
}
