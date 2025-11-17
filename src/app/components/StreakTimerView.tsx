"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  initialSeconds?: number;
  onClose: () => void;
  onFinish: (seconds: number) => void; // called when finished
}

function formatTime(s: number) {
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function StreakTimerView({ initialSeconds = 0, onClose, onFinish }: Props) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [running]);

  const handleFinish = () => {
    setRunning(false);
    onFinish(seconds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-[420px]">
        <div className="text-sm text-gray-500">Mode : <span className="font-semibold">Fokus</span></div>
        <div className="text-2xl font-semibold mt-2">Belajar Koding</div>

        <div className="mt-6 bg-gray-100 rounded-lg p-6 text-center">
          <div className="text-6xl font-mono font-extrabold">{formatTime(seconds)}</div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => setRunning(r => !r)} className="flex-1 px-4 py-3 border rounded-lg text-sm">{running ? 'Pause' : 'Start'}</button>
          <button onClick={handleFinish} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm">Finish</button>
        </div>
      </div>
    </div>
  );
}
