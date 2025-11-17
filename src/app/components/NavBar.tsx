"use client";

import React from "react";

interface NavBarProps {
  onScrollTo: (id: string) => void;
  activeSection: string;
}

export default function NavBar({ onScrollTo, activeSection }: NavBarProps) {
  const items = [
    { id: "home", label: "Home" },
    { id: "feature", label: "Feature" },
    { id: "about", label: "About Us" },
  ];

  return (
    <nav className="hidden md:flex bg-white rounded-full px-10 py-3 items-center h-12 shadow-[0_4px_32px_rgba(0,0,0,0.10)] gap-20">
      {items.map((nav) => (
        <button
          key={nav.id}
          onClick={() => onScrollTo(nav.id)}
          className="relative text-gray-700 hover:text-gray-900 font-medium text-sm transition"
        >
          <span className="relative inline-block pb-[4px]">
            {nav.label}
            <span
              className={`absolute left-0 bottom-0 h-[2px] bg-gray-900 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
                activeSection === nav.id ? "w-full opacity-100" : "w-0 opacity-0"
              }`}
            />
          </span>
        </button>
      ))}
    </nav>
  );
}
