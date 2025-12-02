"use client";

import React, { useEffect, useState, useRef } from "react";
import SidebarWrapper from "./SidebarWrapper";
import { showError } from "@/lib/toast";
import {
  XMarkIcon,
  Bars3Icon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: number;
  name: string;
}

interface AddToDoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ToDoFormData) => void;
  onSuccess?: () => void;
}

export interface ToDoFormData {
  title: string;
  categoryId: number | null;
  priority: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  status?: string;
}

const AddToDo: React.FC<AddToDoProps> = ({ isOpen, onClose, onSubmit, onSuccess }) => {
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [duration, setDuration] = useState("1j 0m");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Calculate duration whenever times change
  useEffect(() => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    let diffMinutes = endMinutes - startMinutes;
    
    // Validasi 1: Jika endTime < startTime, berarti ada pergantian hari (tidak diizinkan)
    if (diffMinutes < 0) {
      setTimeError("⚠️ Waktu tidak boleh melewati tengah malam. Pilih waktu dalam hari yang sama (mis: 08:00 - 23:59)");
      setDuration("0j 0m");
      return;
    }
    
    // Validasi 2: Jika waktu sama (0 menit), harus minimal 1 menit
    if (diffMinutes === 0) {
      setTimeError("⚠️ Waktu mulai dan selesai tidak boleh sama. Harus ada durasi minimal 1 menit");
      setDuration("0j 0m");
      return;
    }

    // Clear error jika valid
    setTimeError(null);

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours === 0 && minutes === 0) {
      setDuration("0j 0m");
    } else if (minutes === 0) {
      setDuration(`${hours}j`);
    } else if (hours === 0) {
      setDuration(`${minutes}m`);
    } else {
      setDuration(`${hours}j ${minutes}m`);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (isOpen) {
      timerRef.current = setTimeout(() => setMounted(true), 0);
      document.body.style.overflow = "hidden";
      // Fetch categories from API
      fetchCategories();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const token = localStorage.getItem("authToken");
      const headers: HeadersInit = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/categories", { headers });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else if (response.status === 401) {
        showError("Please login to access categories");
      } else {
        showError("Failed to load categories");
      }
    } catch (error) {
      
      showError("Error loading categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleClose = () => {
    setMounted(false);
    setTimeout(() => onClose(), 240);
  };

  const handleSubmit = () => {
    if (!title || categoryId === null || !priority || !date || !startTime || !endTime) {
      showError("Please fill in all required fields");
      return;
    }
    
    // Validasi date - tanggal tidak boleh lebih kecil dari hari ini
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      showError("⚠️ Tanggal tidak boleh lebih kecil dari hari ini");
      return;
    }
    
    // Validasi time range - waktu harus dalam hari yang sama
    if (timeError) {
      showError(timeError);
      return;
    }
    
    const payload: ToDoFormData = {
      title,
      categoryId,
      priority,
      date,
      startTime,
      endTime,
      description,
      status: "Not Started",
    };
    if (onSubmit) onSubmit(payload);
    if (onSuccess) onSuccess();
    // Reset form
    setTitle("");
    setCategoryId(null);
    setPriority("");
    setDate("");
    setStartTime("08:00");
    setEndTime("09:00");
    setDescription("");
    setTimeError(null);
    handleClose();
  };

  const priorityOptions = ["Low", "Medium", "High"];

  if (!mounted) return null;

  return (
    <SidebarWrapper isOpen={isOpen} onClose={handleClose} width="400px">
      {/* Header with Editable Title */}
      <div className="px-6 py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Editable Title Input in Header */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="To-Do Title"
              className="w-full text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent truncate"
            />
            <div className="text-sm text-gray-500 mt-2">
              Add a new to-do item
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900 transition shrink-0"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 flex-1 space-y-5 overflow-y-auto">
        {/* 1. Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">Select Category</option>
            {loadingCategories ? (
              <option disabled>Loading categories...</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 2. Priority Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">Select Priority</option>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Select Date"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 4. Time Range Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-600 mb-1 block">From</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <span className="text-gray-400 mt-4">→</span>
            <div className="flex-1">
              <label className="text-xs text-gray-600 mb-1 block">To</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {timeError && (
            <div className="text-xs text-red-600 mt-2 font-medium">
              {timeError}
            </div>
          )}
          {!timeError && (
            <div className="text-xs text-gray-500 mt-2 text-right font-medium">
              Duration: {duration}
            </div>
          )}
        </div>

        {/* 6. Description Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            placeholder="Description"
            rows={4}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
        <button
          onClick={handleClose}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          Save
        </button>
      </div>
    </SidebarWrapper>
  );
};

export default AddToDo;
