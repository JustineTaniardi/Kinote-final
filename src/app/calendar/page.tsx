"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarGrid from "../components/calendar/CalendarGrid";
import CalendarAddTask from "../components/calendar/CalendarAddTask";
import { TaskItem, ViewMode } from "../components/calendar/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { showSuccess, showError } from "@/lib/toast";

export default function CalendarPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Initialize all state hooks first (before any conditional returns)
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      
      // Get month from weekStart
      const year = weekStart.getFullYear();
      const month = String(weekStart.getMonth() + 1).padStart(2, "0");
      const monthParam = `${year}-${month}`;
      
      const response = await fetch(`/api/calendar?month=${monthParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Convert backend tasks to TaskItem format
        const formattedTasks: TaskItem[] = (data || []).map((task: any) => {
          // Parse deadline date
          const deadlineDate = new Date(task.deadline);
          
          // Parse startTime (HH:mm format) and combine with deadline date
          let startDateTime = deadlineDate;
          if (task.startTime) {
            const [hours, minutes] = task.startTime.split(":").map(Number);
            startDateTime = new Date(deadlineDate);
            startDateTime.setHours(hours, minutes, 0, 0);
          }
          
          // Parse endTime (HH:mm format) and combine with deadline date
          let endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour after start
          if (task.endTime) {
            const [hours, minutes] = task.endTime.split(":").map(Number);
            endDateTime = new Date(deadlineDate);
            endDateTime.setHours(hours, minutes, 0, 0);
          }
          
          return {
            id: task.id.toString(),
            title: task.title,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            difficulty: task.difficulty?.name?.toLowerCase() || "medium",
            description: task.description,
            status: task.status?.name,
          };
        });
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, weekStart]);

  // Auth check with better error handling
  useEffect(() => {
    if (!authLoading && !user) {
      // Not authenticated - clear any stale data and redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchTasks();
    }
  }, [user, authLoading, fetchTasks]);

  const handleLogout = () => {
    console.log("User logging out");
    logout(); // This will clear localStorage and redirect to /login
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#0f1a31] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User not authenticated - show loading while redirecting
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#0f1a31] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleAddActivity = async (data: {
    title: string;
    categoryId: number | null;
    priority: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }) => {
    setIsLoading(true);
    try {
      const [startHour, startMin] = data.startTime.split(":").map(Number);

      const startDateTime = new Date(data.date);
      startDateTime.setHours(startHour, startMin, 0, 0);

      // Map priority to difficulty ID
      const priorityMap: Record<string, number> = {
        "Low": 1,
        "Medium": 2,
        "High": 3,
      };
      const difficultyId = priorityMap[data.priority] || 2;

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          deadline: startDateTime.toISOString(),
          description: data.description,
          priority: data.priority.toLowerCase(),
          startTime: data.startTime,
          endTime: data.endTime,
          difficultyId,
          statusId: 1,
          categoryId: data.categoryId,
        }),
      });

      if (response.ok) {
        showSuccess("Task berhasil ditambahkan");
        // Refetch all tasks from database to ensure consistency
        await fetchTasks();
      } else {
        console.error("Failed to create task:", response.statusText);
        throw new Error("Failed to create task");
      }
    } catch (error) {
      console.error("Error adding activity:", error);
      showError("Gagal menambahkan task");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Calendar Header with Controls */}
        <CalendarHeader
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddTaskClick={() => setIsAddTaskOpen(true)}
          isLoading={isLoading}
        />

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-6">
          <CalendarGrid
            weekStart={weekStart}
            events={tasks}
            viewMode={viewMode}
          />
        </div>
      </main>

      {/* Add Task Modal */}
      <CalendarAddTask
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleAddActivity}
        onSuccess={() => setIsAddTaskOpen(false)}
      />
    </div>
  );
}
