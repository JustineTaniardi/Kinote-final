"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
}

export default function Header() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const HEADER_OFFSET = 80;
  const lastSection = useRef("home");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // === Check if user is logged in ===
  useEffect(() => {
    const initUser = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsed = JSON.parse(userData);
          // Validate parsed data has required fields
          if (
            parsed &&
            typeof parsed === "object" &&
            parsed.name &&
            parsed.email
          ) {
            setUser(parsed);
          } else {
            // Invalid data structure
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            setUser(null);
          }
        } catch (error) {
          // JSON parse error - clear invalid data
          console.error("Failed to parse user data from localStorage:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initUser();
  }, []);

  // === Handle logout ===
  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false);
    router.push("/");
  }, [router]);

  // === Close dropdown on click outside ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If click is on a link, let it navigate and close dropdown after
      const link = (event.target as HTMLElement).closest("a[href]");
      if (
        link &&
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        // Use requestAnimationFrame to ensure navigation completes before closing
        requestAnimationFrame(() => {
          setIsDropdownOpen(false);
        });
        return;
      }

      // If click is on logout button, let it handle logout
      if (
        (event.target as HTMLElement).closest("button") &&
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }

      // Close dropdown if click is outside
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside, false);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, [isDropdownOpen]);
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section")
    ).filter((s) => ["home", "feature", "about"].includes(s.id));

    let scrollTimeout: number | undefined;

    const handleScroll = () => {
      if (scrollTimeout) window.clearTimeout(scrollTimeout);

      scrollTimeout = window.setTimeout(() => {
        const top = window.scrollY;
        let current = lastSection.current;
        for (const section of sections) {
          const offset = section.offsetTop - HEADER_OFFSET - 1;
          const height = section.offsetHeight;
          if (top >= offset && top < offset + height) {
            current = section.id;
            break;
          }
        }

        if (current !== lastSection.current) {
          lastSection.current = current;
          setActiveSection(current);
        }
      }, 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      if (scrollTimeout) window.clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // === smooth scroll to section ===
  const handleScrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    setActiveSection(id);
    window.scrollTo({
      top: target.offsetTop - HEADER_OFFSET,
      behavior: "smooth",
    });
  };

  // === Render Header ===
  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">
        {/* Logo */}
        <div className="flex items-center h-full">
          <Image
            src="/img/landing-page/header_logo_kinote.png"
            alt="Kinote Logo"
            width={130}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex bg-white  px-10 py-3 gap-24 items-center  ">
          {[
            { id: "home", label: "Home" },
            { id: "feature", label: "Feature" },
            { id: "about", label: "About Us" },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => handleScrollTo(nav.id)}
              className="relative text-gray-700 hover:text-gray-900 font-medium text-sm transition"
            >
              <span className="relative inline-block pb-1">
                {nav.label}
                <span
                  className={`absolute left-0 bottom-0 h-0.5 bg-[#161D36] rounded-full transition-[width,opacity] duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
                    activeSection === nav.id
                      ? "w-full opacity-100"
                      : "w-0 opacity-0"
                  }`}
                />
              </span>
            </button>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-2 h-full">
          {!isLoading && user ? (
            <>
              {/* User Profile Dropdown - Desktop */}
              <div ref={dropdownRef} className="hidden md:block relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-10 h-10 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                    isDropdownOpen
                      ? "bg-blue-100 border-blue-300 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-1 ring-blue-200">
                    <span className="text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-transparent rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-white shrink-0">
                          <span className="text-sm font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-2 py-2">
                      {/* Feature Links */}
                      <div className="border-b border-gray-100 mb-2">
                        <Link
                          href="/todo"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            ></path>
                          </svg>
                          <span>To-Do List</span>
                        </Link>
                        <Link
                          href="/streak"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            ></path>
                          </svg>
                          <span>Streak</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown - Mobile */}
              <div ref={dropdownRef} className="md:hidden relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-9 h-9 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                    isDropdownOpen
                      ? "bg-blue-100 border-blue-300 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-1 ring-blue-200">
                    <span className="text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-transparent rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-white shrink-0">
                          <span className="text-xs font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-2 py-2">
                      {/* Feature Links */}
                      <div className="border-b border-gray-100 mb-2">
                        <Link
                          href="/todo"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            ></path>
                          </svg>
                          <span>To-Do List</span>
                        </Link>
                        <Link
                          href="/streak"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            ></path>
                          </svg>
                          <span>Streak</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2.5 bg-[#161D36] text-white rounded-md shadow text-sm font-medium hover:bg-[#1a2140] transition h-10 flex items-center justify-center"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2.5 border border-[#161D36] rounded-md text-[#161D36] hover:bg-[#161D36] hover:text-white text-sm font-medium transition h-10 flex items-center justify-center"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
