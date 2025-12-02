"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import AddToDo from "./AddToDo";
import ToDoDetailSidebar from "./ToDoDetailSidebar";
import { useTasks, useTaskMutation } from "@/lib/hooks/useTasks";
import { showSuccess, showError } from "@/lib/toast";
import type { Task } from "@/lib/hooks/useTasks";

// Item
interface ToDoItem {
  id: number;
  status: string;
  title: string;
  category: string;
  priority: string;
  deadline: string;
  deadlineRaw?: string; // ISO
  startTime?: string;
  endTime?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  subcategory?: string;
  days?: string[];
  totalTime?: string;
  repeatCount?: string;
  breakTime?: string;
}

interface ToDoFormData {
  title: string;
  categoryId?: number | null;
  priority: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  status?: string;
}

// Animations
const strikeStyles = `
  .row-transition {
    transition: all 0.35s cubic-bezier(.2,.8,.2,1);
  }
  .row-completed {
    position: relative;
  }
  .row-completed::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    top: 50%;
    height: 2px;
    background-color: rgba(0,0,0,0.18);
    transform: translateY(-50%);
    pointer-events: none;
  }
`;

const ToDoContent: React.FC = () => {
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Inject
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = strikeStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: "status" | "category" | "priority";
  } | null>(null);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ToDoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<string | null>(null);

  // Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortOpen(false);
      }
    };

    if (sortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortOpen]);

  // API
  const { data: tasks, refetch } = useTasks();
  const { deleteTask, updateTask } = useTaskMutation();

  // Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-cell")) {
        setEditingCell(null);
      }
    };

    if (editingCell) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingCell]);

  // Sort
  const getSortedTodos = (items: ToDoItem[]) => {
    if (!currentSort) return items;

    const sorted = [...items];
    switch (currentSort) {
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "difficulty-easy-hard":
        const difficultyOrder = { low: 0, medium: 1, high: 2 };
        return sorted.sort(
          (a, b) =>
            (difficultyOrder[a.priority.toLowerCase() as keyof typeof difficultyOrder] || 0) -
            (difficultyOrder[b.priority.toLowerCase() as keyof typeof difficultyOrder] || 0)
        );
      case "deadline-nearest":
        return sorted.sort((a, b) => {
          // Use raw ISO format deadline for accurate sorting with time
          let dateTimeA: Date;
          let dateTimeB: Date;
          
          if (a.deadlineRaw && a.startTime) {
            // Combine
            const dateOnly = a.deadlineRaw.split('T')[0];
            dateTimeA = new Date(`${dateOnly}T${a.startTime}`);
          } else if (a.deadlineRaw) {
            dateTimeA = new Date(a.deadlineRaw);
          } else {
            dateTimeA = new Date(9999, 0, 0);
          }
          
          if (b.deadlineRaw && b.startTime) {
            const dateOnly = b.deadlineRaw.split('T')[0];
            dateTimeB = new Date(`${dateOnly}T${b.startTime}`);
          } else if (b.deadlineRaw) {
            dateTimeB = new Date(b.deadlineRaw);
          } else {
            dateTimeB = new Date(9999, 0, 0);
          }
          
          return dateTimeA.getTime() - dateTimeB.getTime();
        });
      case "deadline-farthest":
        return sorted.sort((a, b) => {
          // Use raw ISO format deadline for accurate sorting with time
          let dateTimeA: Date;
          let dateTimeB: Date;
          
          if (a.deadlineRaw && a.startTime) {
            const dateOnly = a.deadlineRaw.split('T')[0];
            dateTimeA = new Date(`${dateOnly}T${a.startTime}`);
          } else if (a.deadlineRaw) {
            dateTimeA = new Date(a.deadlineRaw);
          } else {
            dateTimeA = new Date(0);
          }
          
          if (b.deadlineRaw && b.startTime) {
            const dateOnly = b.deadlineRaw.split('T')[0];
            dateTimeB = new Date(`${dateOnly}T${b.startTime}`);
          } else if (b.deadlineRaw) {
            dateTimeB = new Date(b.deadlineRaw);
          } else {
            dateTimeB = new Date(0);
          }
          
          return dateTimeB.getTime() - dateTimeA.getTime();
        });
      default:
        return sorted;
    }
  };

  // Memoize
  const convertedTodos = useMemo(() => {
    if (tasks && tasks.length > 0) {
      return tasks.map((task: Task) => {
        // Extract status
        const statusName = typeof task.status === 'object' && task.status !== null && 'name' in task.status
          ? (task.status as any).name
          : task.status || "Not Started";
        
        // Extract cat
        const categoryName = typeof (task as any).category === 'object' && (task as any).category !== null && 'name' in (task as any).category
          ? (task as any).category.name
          : (task as any).category || "";
        
        const convertedItem = {
          id: task.id,
          status: statusName,
          title: task.title,
          category: categoryName,
          priority: task.priority || "medium",
          deadline: task.deadline
            ? new Date(task.deadline).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "",
          deadlineRaw: task.deadline || undefined, // Store raw ISO format for sorting
          description: task.description || "",
          subcategory: (task as any).subcategory || "",
          startTime: (task as any).startTime || "08:00",
          endTime: (task as any).endTime || "09:00",
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        };
        
        // Debug
        console.log(`[DEBUG] Task: ${convertedItem.title}, Status: "${convertedItem.status}", ID: ${task.id}`);
        
        return convertedItem;
      });
    }
    return null;
  }, [tasks]);

  // API
  const baseTodos =
    convertedTodos && convertedTodos.length > 0 ? convertedTodos : todos;

  // Sort
  const sortByStatus = (todosToSort: ToDoItem[]): ToDoItem[] => {
    const pending = todosToSort.filter((item) => {
      const statusLower = item.status?.toLowerCase() || "";
      return statusLower !== "completed";
    });
    const completed = todosToSort.filter((item) => {
      const statusLower = item.status?.toLowerCase() || "";
      return statusLower === "completed";
    });
    return [...pending, ...completed];
  };

  // Apply
  const displayTodos = useMemo(
    () => sortByStatus(getSortedTodos(baseTodos)),
    [baseTodos, currentSort]
  );

  // Checkbox
  const handleSelectItem = async (id: number) => {
    console.log(`[DEBUG] handleSelectItem called for ID: ${id}`);
    const item = baseTodos.find((t) => t.id === id);
    if (!item) {
      console.log(`[DEBUG] Item not found with ID: ${id}`);
      return;
    }

    console.log(`[DEBUG] Item found:`, item);

    const isCompleted = item.status && 
      (item.status.toLowerCase() === "completed");

    console.log(`[DEBUG] isCompleted: ${isCompleted}, current status: "${item.status}"`);

    try {
      if (!isCompleted) {
        console.log(`[DEBUG] Marking task as completed`);
        // Status ID
        const statusResponse = await fetch("/api/status", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const statuses = await statusResponse.json();
        console.log(`[DEBUG] Available statuses:`, statuses);
        
        const completedStatus = statuses.find((s: any) => s.name.toLowerCase() === "completed");
        console.log(`[DEBUG] Completed status:`, completedStatus);
        
        if (completedStatus) {
          // Update task status to completed in database
          console.log(`[DEBUG] Updating task ${id} with statusId ${completedStatus.id}`);
          try {
            const updateResponse = await updateTask(id, { statusId: completedStatus.id });
            console.log(`[DEBUG] Update response:`, updateResponse);
            console.log(`[DEBUG] Update successful, new status ID: ${updateResponse?.statusId}`);
            
            // Wait a bit then refetch to ensure database is updated
            console.log(`[DEBUG] Waiting before refetch...`);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log(`[DEBUG] Calling refetch...`);
            await refetch();
            console.log(`[DEBUG] Refetch completed`);
            
            showSuccess("Task marked as Done");
          } catch (updateErr) {
            console.error("[DEBUG] Update error:", updateErr);
            showError("Failed to update task");
            throw updateErr;
          }
        } else {
          console.log(`[DEBUG] Completed status not found`);
          showError("Status not found");
        }
      } else {
        console.log(`[DEBUG] Marking task as pending`);
        // Pending ID
        const statusResponse = await fetch("/api/status", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const statuses = await statusResponse.json();
        console.log(`[DEBUG] Available statuses:`, statuses);
        
        const pendingStatus = statuses.find((s: any) => s.name.toLowerCase() === "pending");
        console.log(`[DEBUG] Pending status:`, pendingStatus);
        
        if (pendingStatus) {
          // Update task status back to pending
          console.log(`[DEBUG] Updating task ${id} with statusId ${pendingStatus.id}`);
          try {
            const updateResponse = await updateTask(id, { statusId: pendingStatus.id });
            console.log(`[DEBUG] Update response:`, updateResponse);
            console.log(`[DEBUG] Update successful, new status ID: ${updateResponse?.statusId}`);
            
            // Wait a bit then refetch to ensure database is updated
            console.log(`[DEBUG] Waiting before refetch...`);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log(`[DEBUG] Calling refetch...`);
            await refetch();
            console.log(`[DEBUG] Refetch completed`);
            
            showSuccess("Task marked as Pending");
          } catch (updateErr) {
            console.error("[DEBUG] Update error:", updateErr);
            showError("Failed to update task");
            throw updateErr;
          }
        } else {
          console.log(`[DEBUG] Pending status not found`);
          showError("Status not found");
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error updating task status:", errorMessage);
      console.error("Full error:", error);
      // Don't show error twice if already shown in catch block
      if (!error) {
        showError("Failed to update task status: " + errorMessage);
      }
    }
  };

  // Helper function to check if item is completed
  const isItemCompleted = (item: ToDoItem): boolean => {
    return !!(item.status && item.status.toLowerCase() === "completed");
  };

  // Helper function for priority/difficulty color
  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case "high":
      case "tinggi":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-blue-100 text-blue-700";
      case "low":
      case "rendah":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Helper function for difficulty color badge
  const getDifficultyColor = (difficulty: string): string => {
    const normalized = difficulty.toLowerCase();
    if (normalized === "high" || normalized === "tinggi" || normalized === "hard") {
      return "bg-red-100 text-red-700";
    }
    switch (normalized) {
      case "medium":
        return "bg-blue-100 text-blue-700";
      case "low":
      case "easy":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Helper function to truncate text longer than 16 characters
  const truncateText = (text: string, maxLength: number = 16): string => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Handler for submit form
  const handleSubmitToDo = async (data: ToDoFormData) => {
    try {
      // Fetch difficulty and status to get correct IDs
      const difficultyResponse = await fetch("/api/difficulty", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const statusResponse = await fetch("/api/status", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!difficultyResponse.ok || !statusResponse.ok) {
        showError("Failed to fetch difficulty or status data");
        return;
      }

      const difficulties = await difficultyResponse.json();
      const statuses = await statusResponse.json();

      // Map priority to difficulty ID based on actual data
      const priorityMap: Record<string, string> = {
        "Low": "Easy",
        "Medium": "Medium",
        "High": "Hard",
      };
      const difficultyName = priorityMap[data.priority];
      const difficulty = difficulties.find((d: any) => d.name === difficultyName);
      const difficultyId = difficulty?.id || 2;

      // Find "pending" status
      const status = statuses.find((s: any) => s.name === "pending");
      const statusId = status?.id || 1;

      // Combine date and startTime for deadline
      const deadline = new Date(`${data.date}T${data.startTime}`);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          deadline: deadline.toISOString(),
          startTime: data.startTime,
          endTime: data.endTime,
          priority: data.priority.toLowerCase(),
          difficultyId,
          statusId,
          categoryId: data.categoryId,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        const categoryName = newTask.category?.name || "";
        const newToDo: ToDoItem = {
          id: newTask.id,
          status: "Not Started",
          title: newTask.title,
          category: categoryName,
          priority: data.priority,
          deadline: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          description: newTask.description || "",
          createdAt: newTask.createdAt,
          updatedAt: newTask.updatedAt,
        };
        setTodos([...todos, newToDo]);
        refetch();
        showSuccess("ToDo created successfully!");
        console.log("ToDo created successfully:", newToDo);
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error occurred" }));
        const errorMessage = errorData.message || "Failed to create todo";
        console.error("Failed to create todo:", errorMessage);
        showError("Failed to create todo: " + errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating todo:", errorMessage);
      showError("Error creating todo: " + errorMessage);
    }
  };

  // Handler to update cell value
  const handleUpdateCell = (
    id: number,
    field: "status" | "category" | "priority",
    value: string
  ) => {
    setTodos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setEditingCell(null);
  };

  // Options for dropdown
  const priorityOptions = ["Low", "Medium", "High"];
  const categoryOptions = [
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

  const openActivityModal = (item: ToDoItem) => {
    setSelectedActivity(item);
    setIsModalOpen(true);
  };

  const closeActivityModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleDeleteActivity = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    showSuccess("Task deleted successfully");
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleEditActivity = (updated: unknown) => {
    const updatedData = updated as ToDoItem;
    const convertedItem: ToDoItem = {
      ...selectedActivity!,
      title: updatedData.title,
      category: updatedData.category,
      priority: updatedData.priority,
      deadline: updatedData.deadline,
      startTime: updatedData.startTime,
      endTime: updatedData.endTime,
      description: updatedData.description,
      status: updatedData.status,
      updatedAt: updatedData.updatedAt,
    };
    setTodos((prev) =>
      prev.map((t) =>
        t.id === convertedItem.id ? { ...t, ...convertedItem } : t
      )
    );
    // Refetch to ensure database is in sync with UI
    setTimeout(() => {
      refetch();
    }, 100);
    setSelectedActivity(convertedItem);
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Header section */}
      <div className="shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex gap-3">
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortOpen
                  ? "bg-[#161D36] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-base">🔀</span>
              <span>Sort</span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-300 ${
                  sortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[240px] overflow-hidden">
                <button
                  onClick={() => {
                    setCurrentSort("name-asc");
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition text-sm ${
                    currentSort === "name-asc"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  ↑↓ Sort by Name (A → Z)
                </button>
                <button
                  onClick={() => {
                    setCurrentSort("difficulty-easy-hard");
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition text-sm ${
                    currentSort === "difficulty-easy-hard"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  📊 Difficulty (Easy → Hard)
                </button>
                <button
                  onClick={() => {
                    setCurrentSort("deadline-nearest");
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition text-sm ${
                    currentSort === "deadline-nearest"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  📅 Nearest → Farthest
                </button>
                <button
                  onClick={() => {
                    setCurrentSort("deadline-farthest");
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition text-sm ${
                    currentSort === "deadline-farthest"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  📅 Farthest → Nearest
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {displayTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-4 text-5xl">📋</div>
              <h3 className="text-gray-600 font-semibold mb-2">No tasks yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Create your first task to get started
              </p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-6 py-2 bg-[#161D36] text-white rounded-lg text-sm font-medium hover:bg-[#1a2140] transition"
              >
                Add Activity
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#F8FAFB] rounded-xl p-0">
            <div className="mb-6">
              <button
                onClick={() => setIsAllExpanded(!isAllExpanded)}
                className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700"
              >
                <span
                  className={`transition-transform ${
                    isAllExpanded ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
                All
                <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                  {displayTodos.length}
                </span>
              </button>

              {isAllExpanded && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <div className="hidden md:grid grid-cols-[40px_90px_140px_110px_110px_100px_110px_1fr] gap-4 px-6 py-5 bg-[#161D36] border-b-2 border-[#161D36] text-sm font-bold text-white uppercase tracking-wide sticky top-0 z-10">
                    <div className="flex items-center" />
                    <div className="flex items-center">Status</div>
                    <div className="flex items-center">Title</div>
                    <div className="flex items-center">Date</div>
                    <div className="flex items-center">Category</div>
                    <div className="flex items-center">Time</div>
                    <div className="flex items-center">Difficulty</div>
                    <div className="flex items-center">Description</div>
                  </div>

                  <div className="hidden md:block">
                    {displayTodos.map((item) => (
                      <motion.div
                        layout
                        transition={{ layout: { duration: 0.28 } }}
                        key={item.id}
                        onClick={() => openActivityModal(item)}
                        className={`row-transition grid grid-cols-[40px_90px_140px_110px_110px_100px_110px_1fr] gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 text-sm ${
                          isItemCompleted(item)
                            ? "bg-gray-200 row-completed text-gray-700"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-start">
                          <input
                            type="checkbox"
                            checked={isItemCompleted(item)}
                            onChange={() => handleSelectItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 cursor-pointer accent-black"
                          />
                        </div>

                        <div className="flex items-center">
                          <span className="inline-block px-2 py-1 rounded bg-gray-100 text-sm font-medium whitespace-nowrap">
                            {isItemCompleted(item) ? "Done" : "Pending"}
                          </span>
                        </div>

                        <div className="flex items-center truncate text-sm" title={item.title}>
                          <span className="truncate max-w-[120px]">{truncateText(item.title, 14)}</span>
                        </div>

                        <div className="flex items-center text-sm">
                          {item.deadline ? item.deadline.split(",")[0] : "-"}
                        </div>

                        <div className="relative dropdown-cell truncate flex items-center" title={item.category}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isItemCompleted(item))
                                setEditingCell({
                                  id: item.id,
                                  field: "category",
                                });
                            }}
                            className="cursor-pointer hover:bg-gray-200 bg-gray-100 px-2 py-1 rounded transition inline-block text-sm"
                          >
                            {truncateText(item.category, 16)}
                          </div>
                        </div>

                        <div className="flex items-center text-sm">
                          {item.startTime && item.endTime ? `${item.startTime}-${item.endTime}` : "-"}
                        </div>

                        <div className="flex items-center">
                          <span className={`inline-block px-2 py-1 rounded text-sm font-medium whitespace-nowrap ${getDifficultyColor(item.priority)}`}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center truncate text-sm" title={item.description}>
                          {truncateText(item.description, 16)}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="md:hidden space-y-3 p-4">
                    {displayTodos.map((item) => (
                      <motion.div
                        layout
                        transition={{ layout: { duration: 0.28 } }}
                        key={item.id}
                        onClick={() => openActivityModal(item)}
                        className={`row-transition p-4 rounded-lg border-2 ${
                          isItemCompleted(item)
                            ? "bg-gray-200 border-gray-300 row-completed"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={isItemCompleted(item)}
                            onChange={() => handleSelectItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 cursor-pointer accent-[#161D36] mt-0.5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold text-base ${
                                isItemCompleted(item)
                                  ? "text-gray-700"
                                  : "text-gray-900"
                              }`}
                              title={item.title}
                            >
                              {truncateText(item.title, 16)}
                            </h3>
                            <span
                              className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                                isItemCompleted(item)
                                  ? "bg-gray-300 text-gray-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isItemCompleted(item) ? "Done" : "Pending"}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`space-y-2 text-base ${
                            isItemCompleted(item)
                              ? "text-gray-700"
                              : "text-gray-600"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Date:</span>
                            <span className="text-sm">{item.deadline ? item.deadline.split(",")[0] : "-"}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="font-medium">Category:</span>
                            <div className="cursor-pointer px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700" title={item.category}>
                              {truncateText(item.category, 16)}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="font-medium">Time:</span>
                            <span className="text-sm">{item.startTime && item.endTime ? `${item.startTime}-${item.endTime}` : "-"}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="font-medium">Difficulty:</span>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(item.priority)}`}>
                              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p
                            className={`text-sm leading-relaxed ${
                              isItemCompleted(item)
                                ? "text-gray-700"
                                : "text-gray-500"
                            }`}
                            title={item.description}
                          >
                            {truncateText(item.description, 16)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-6">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-full bg-white rounded-lg border border-gray-200 px-6 py-4 flex items-center gap-3 text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm cursor-pointer"
        >
          <span className="text-xl font-light text-gray-400">+</span>
          <span className="font-normal">Add Activity</span>
        </button>
      </div>

      {/* Add ToDo Sidebar */}
      <AddToDo
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSubmit={handleSubmitToDo}
        onSuccess={refetch}
      />

      {/* ToDo Detail Sidebar */}
      <ToDoDetailSidebar
        isOpen={isModalOpen}
        onClose={closeActivityModal}
        item={selectedActivity}
        onDelete={(id: number) => {
          handleDeleteActivity(id);
          closeActivityModal();
        }}
        onEdit={(updated) => {
          handleEditActivity(updated as unknown);
        }}
      />
    </div>
  );
};

export default ToDoContent;
