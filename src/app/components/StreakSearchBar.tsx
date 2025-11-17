"use client";

import React from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function StreakSearchBar({ value, onChange, placeholder = "Search for anything.." }: Props) {
  return (
    <div className="w-full bg-[#F4F6F9] rounded-lg px-6 py-3 shadow-sm mb-6 flex items-center">
      <svg
        className="w-4 h-4 text-gray-400 mr-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
      />
    </div>
  );
}
