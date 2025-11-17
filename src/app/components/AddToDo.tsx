"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import SidebarWrapper from "./SidebarWrapper";

interface AddToDoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ToDoFormData) => void;
}

export interface ToDoFormData {
  title: string;
  category: string;
  priority: string;
  date: string;
  time: string;
  description: string;
  status?: string;
}

const AddToDo: React.FC<AddToDoProps> = ({ isOpen, onClose, onSubmit }) => {
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      timerRef.current = setTimeout(() => setMounted(true), 0);
      document.body.style.overflow = "hidden";
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const handleClose = () => {
    setMounted(false);
    setTimeout(() => onClose(), 240);
  };

  const handleSubmit = () => {
    const payload: ToDoFormData = {
      title,
      category,
      priority,
      date,
      time,
      description,
      status: "Not Started",
    };
    if (onSubmit) onSubmit(payload);
    // Reset form
    setTitle("");
    setCategory("");
    setPriority("");
    setDate("");
    setTime("");
    setDescription("");
    handleClose();
  };

  const priorityOptions = ["Low", "Medium", "High"];
  const categories = [
    "Work",
    "Learning",
    "Personal",
    "Health",
    "Household",
    "Project",
    "Entertainment",
    "Sports",
    "Creativity",
    "Finance",
  ];

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
              className="w-full text-lg font-semibold text-gray-900 bg-transparent border-none outline-none placeholder-gray-400 truncate p-0"
            />
            <div className="text-sm text-gray-500 mt-1">
              Add a new to-do item
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900 text-2xl leading-none transition shrink-0"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="px-6 py-6 flex-1 space-y-5 overflow-y-auto">
        {/* 1. Category Dropdown */}
        <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white">
          <Image
            src="/img/add-activity/category_icon.png"
            width={20}
            height={20}
            alt="category"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 focus:ring-0"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Priority Dropdown */}
        <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white">
          <Image
            src="/img/add-activity/prioritas_icon.png"
            width={20}
            height={20}
            alt="priority"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 focus:ring-0"
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
        <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white">
          <Image
            src="/img/add-activity/calendar_icon.png"
            width={20}
            height={20}
            alt="calendar"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Select Date"
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 focus:ring-0"
          />
        </div>

        {/* 4. Time Input */}
        <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white">
          <Image
            src="/img/add-activity/jam_icon.png"
            width={20}
            height={20}
            alt="time"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Select Time"
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 focus:ring-0"
          />
        </div>

        {/* 5. Description Textarea */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
          placeholder="Description"
          rows={4}
        />
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
