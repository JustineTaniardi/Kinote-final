"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  isOpen: boolean;
  mode: "focus" | "break";
  title: string;
  duration: number;
  repetition?: number;
  onClose: () => void;
  onFinish: (seconds: number) => void;
}

function formatTime(s: number) {
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0)
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function StreakTimerWidget({
  isOpen,
  mode,
  title,
  duration,
  repetition = 1,
  onClose,
  onFinish,
}: Props) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const intervalRef = useRef<number | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000
      );
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleFinish = () => {
    setRunning(false);
    onFinish(seconds);
    onClose();
  };

  if (!isOpen) return null;

  const isFocus = mode === "focus";

  return (
    <motion.div
      ref={widgetRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 40,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`w-72 rounded-lg shadow-2xl overflow-hidden select-none ${
        isFocus
          ? "bg-blue-50 border-2 border-blue-200"
          : "bg-orange-50 border-2 border-orange-200"
      }`}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        className={`p-4 cursor-move ${
          isFocus ? "bg-blue-100" : "bg-orange-100"
        } flex items-center justify-between`}
      >
        <div className="flex-1">
          <div
            className={`text-xs font-semibold ${
              isFocus ? "text-blue-600" : "text-orange-600"
            }`}
          >
            Mode : {isFocus ? "Focus" : "Break"}
          </div>
          <div
            className={`text-lg font-bold ${
              isFocus ? "text-blue-900" : "text-orange-900"
            } mt-1`}
          >
            {title}
          </div>
        </div>
        <button
          onClick={onClose}
          className={`text-2xl font-bold ${
            isFocus
              ? "text-blue-600 hover:text-blue-800"
              : "text-orange-600 hover:text-orange-800"
          }`}
        >
          ⏸
        </button>
      </div>

      {/* Timer Display */}
      <div
        className={`p-6 text-center ${
          isFocus ? "bg-blue-900" : "bg-orange-900"
        }`}
      >
        <div className="text-5xl font-mono font-extrabold text-white tracking-wider">
          {formatTime(seconds)}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-3">
        <div>
          <div
            className={`text-xs font-semibold ${
              isFocus ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {isFocus ? "Focus" : "Break"}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {duration} Minutes
          </div>
        </div>

        <div>
          <div
            className={`text-xs font-semibold ${
              isFocus ? "text-blue-600" : "text-orange-600"
            }`}
          >
            Break Sessions
          </div>
          <div className="text-sm text-gray-700">Session {repetition}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
            isFocus
              ? `${
                  running
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`
              : `${
                  running
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`
          }`}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleFinish}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition text-white ${
            isFocus
              ? "bg-green-600 hover:bg-green-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Finish
        </button>
      </div>
    </motion.div>
  );
}
