"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import AddToDo from "./AddToDo";
import ToDoDetailSidebar from "./ToDoDetailSidebar";
import { useTasks } from "@/lib/hooks/useTasks";
import type { Task } from "@/lib/hooks/useTasks";

// Interface for ToDo item
interface ToDoItem {
  id: number;
  status: string;
  title: string;
  category: string;
  priority: string;
  deadline: string;
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
  category: string;
  priority: string;
  date: string;
  description: string;
}

// CSS untuk split strike-through animation
const strikeStyles = `
  .row-transition {
    transition: all 0.35s cubic-bezier(.2,.8,.2,1);
  }
  /* Full-row single-line strike (appears across the entire row) */
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
  // Inject CSS for animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = strikeStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // State untuk sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for edit cell
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: "status" | "category" | "priority";
  } | null>(null);

  // Click outside handler untuk close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check jika click di luar dropdown
      if (!target.closest(".dropdown-cell")) {
        setEditingCell(null);
      }
    };

    if (editingCell) {
      // Gunakan timeout agar tidak langsung close saat baru dibuka
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingCell]);

  // State for todos
  const [todos, setTodos] = useState<ToDoItem[]>([
    {
      id: 1,
      status: "Not Started",
      title: "Oil Change",
      category: "Maintenance",
      priority: "Medium",
      deadline: "Friday, November 14, 2025",
      description: "Change oil and check tire pressure",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      status: "Not Started",
      title: "Oil Change",
      category: "Maintenance",
      priority: "Medium",
      deadline: "Friday, November 14, 2025",
      description: "Change oil and check tire pressure",
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      status: "Not Started",
      title: "Oil Change",
      category: "Maintenance",
      priority: "Medium",
      deadline: "Friday, November 14, 2025",
      description: "Change oil and check tire pressure",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(true);

  // Fetch tasks from API
  const { data: tasks } = useTasks();

  // Memoize converted todos from API data
  const convertedTodos = useMemo(() => {
    if (tasks && tasks.length > 0) {
      return tasks.map((task: Task) => ({
        id: task.id,
        status: task.status || "Not Started",
        title: task.title,
        category: task.category || "",
        priority: task.priority || "Medium",
        deadline: task.deadline
          ? new Date(task.deadline).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
        description: task.description || "",
        subcategory: task.subcategory || "",
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));
    }
    return null;
  }, [tasks]);

  // Use API todos if available, otherwise use manual todos
  const displayTodos =
    convertedTodos && convertedTodos.length > 0 ? convertedTodos : todos;

  // Handler untuk checkbox individual
  const handleSelectItem = (id: number) => {
    const isCurrentlySelected = selectedItems.includes(id);

    // Update selected items
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    // Move completed item to bottom and update status
    if (!isCurrentlySelected) {
      setTodos((prev) => {
        const selectedItem = prev.find((item) => item.id === id);
        if (!selectedItem) return prev;
        const remaining = prev.filter((item) => item.id !== id);
        // Update status to 'Completed' when marked as complete and set updatedAt
        const completedItem = {
          ...selectedItem,
          status: "Completed",
          updatedAt: new Date().toISOString(),
        };
        return [...remaining, completedItem];
      });
    } else {
      // Restore status to 'Not Started' when unchecked and clear updatedAt
      setTodos((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "Not Started", updatedAt: undefined }
            : item
        )
      );
    }
  };

  // Helper function untuk warna priority
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

  // Handler for submit form from AddToDo
  const handleSubmitToDo = (data: ToDoFormData) => {
    console.log("New ToDo Data:", data);
    const newToDo: ToDoItem = {
      id: todos.length + 1,
      status: "Not Started",
      title: data.title,
      category: data.category,
      priority: data.priority,
      deadline: data.date,
      description: data.description,
      createdAt: new Date().toISOString(),
    };
    setTodos([...todos, newToDo]);
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

  // Modal state for viewing activity details
  const [selectedActivity, setSelectedActivity] = useState<ToDoItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setSelectedItems((prev) => prev.filter((sid) => sid !== id));
  };

  const handleEditActivity = (updated: unknown) => {
    // Convert from ToDoDetailSidebar format to ToDoItem format
    const updatedData = updated as ToDoItem;
    const convertedItem: ToDoItem = {
      ...selectedActivity!,
      title: updatedData.title,
      category: updatedData.category,
      priority: updatedData.priority,
      deadline: updatedData.deadline,
      description: updatedData.description,
      status: updatedData.status,
      updatedAt: updatedData.updatedAt,
    };
    setTodos((prev) =>
      prev.map((t) =>
        t.id === convertedItem.id ? { ...t, ...convertedItem } : t
      )
    );
    // keep selected state and ordering as-is; checkbox remains the only trigger for completion
    setSelectedActivity(convertedItem);
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Header section - fixed at top */}
      <div className="shrink-0 bg-white border-b border-gray-200 p-6">
        {/* Search Bar */}
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
            placeholder="Search for anything.."
            className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
          />
        </div>

        {/* Filter & Sort Buttons */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#161D36] border border-[#161D36] rounded-lg text-sm text-white hover:bg-[#1a2140] transition">
            <span className="text-lg">+</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#161D36] border border-[#161D36] rounded-lg text-sm text-white hover:bg-[#1a2140] transition">
            <span className="text-lg">+</span>
            Sort
          </button>
        </div>
      </div>

      {/* Main content area - scrollable */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {/* Container dengan Background untuk Table */}
        <div className="bg-[#F8FAFB] rounded-xl p-0">
          {/* All Section */}
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
                {/* Table Header - Hidden on Mobile */}
                <div className="hidden md:grid grid-cols-[40px_1fr_120px_120px_120px_180px_1fr] gap-4 px-4 py-4 bg-[#161D36] border-b-2 border-[#161D36] text-xs font-bold text-white uppercase tracking-wide sticky top-0 z-10">
                  <div className="flex items-center" />
                  <div className="flex items-center">Status</div>
                  <div className="flex items-center">Title</div>
                  <div className="flex items-center">Date</div>
                  <div className="flex items-center">Category</div>
                  <div className="flex items-center">Priority</div>
                  <div className="flex items-center">Description</div>
                </div>

                {/* Desktop Table Body */}
                <div className="hidden md:block">
                  {displayTodos.map((item) => (
                    <motion.div
                      layout
                      transition={{ layout: { duration: 0.28 } }}
                      key={item.id}
                      onClick={() => openActivityModal(item)}
                      className={`row-transition grid grid-cols-[40px_1fr_120px_120px_120px_180px_1fr] gap-4 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 text-sm ${
                        selectedItems.includes(item.id)
                          ? "bg-gray-200 row-completed text-gray-700"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer accent-black"
                        />
                      </div>

                      {/* Status - Text Only (Non-Editable) */}
                      <div className="relative text-gray-700">
                        <span className="inline-block px-3 py-1.5 rounded bg-gray-100">
                          {item.status}
                        </span>
                      </div>

                      <div className="text-gray-700">{item.title}</div>
                      <div className="text-gray-700">{item.deadline}</div>

                      {/* Category - Editable (disabled when completed) */}
                      <div
                        className={`relative dropdown-cell ${
                          selectedItems.includes(item.id) ? "" : ""
                        }`}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedItems.includes(item.id))
                              setEditingCell({
                                id: item.id,
                                field: "category",
                              });
                          }}
                          className={`cursor-pointer hover:bg-gray-200 bg-gray-100 px-3 py-1.5 rounded transition inline-block ${
                            selectedItems.includes(item.id) ? "opacity-70" : ""
                          }`}
                        >
                          {item.category}
                        </div>
                        {editingCell?.id === item.id &&
                          editingCell?.field === "category" && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 w-48 max-h-100 overflow-y-auto">
                              <div className="py-1 text-xs text-gray-500 px-2 border-b">
                                Choose one
                              </div>
                              {categoryOptions.map((option) => (
                                <button
                                  key={option}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateCell(
                                      item.id,
                                      "category",
                                      option
                                    );
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Priority - Editable (disabled when completed) */}
                      <div className="relative dropdown-cell">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedItems.includes(item.id))
                              setEditingCell({
                                id: item.id,
                                field: "priority",
                              });
                          }}
                          className="cursor-pointer inline-block"
                        >
                          <span
                            className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${getPriorityColor(
                              item.priority
                            )} hover:opacity-80 transition ${
                              selectedItems.includes(item.id)
                                ? "opacity-70"
                                : ""
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        {editingCell?.id === item.id &&
                          editingCell?.field === "priority" && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 min-w-max">
                              <div className="py-1 text-xs text-gray-500 px-2 border-b whitespace-nowrap">
                                Choose one
                              </div>
                              {priorityOptions.map((option) => (
                                <button
                                  key={option}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateCell(
                                      item.id,
                                      "priority",
                                      option
                                    );
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100"
                                >
                                  <span
                                    className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${getPriorityColor(
                                      option
                                    )}`}
                                  >
                                    {option}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>

                      <div
                        className={`truncate ${
                          selectedItems.includes(item.id)
                            ? "text-gray-700"
                            : "text-gray-600"
                        }`}
                      >
                        {item.description}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3 p-4">
                  {displayTodos.map((item) => (
                    <motion.div
                      layout
                      transition={{ layout: { duration: 0.28 } }}
                      key={item.id}
                      onClick={() => openActivityModal(item)}
                      className={`row-transition p-4 rounded-lg border-2 ${
                        selectedItems.includes(item.id)
                          ? "bg-gray-200 border-gray-300 row-completed"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Checkbox + Title Row */}
                      <div className="flex items-start gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 cursor-pointer accent-[#161D36] mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-sm ${
                              selectedItems.includes(item.id)
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {item.title}
                          </h3>
                          <span
                            className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                              selectedItems.includes(item.id)
                                ? "bg-gray-300 text-gray-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div
                        className={`space-y-2 text-sm ${
                          selectedItems.includes(item.id)
                            ? "text-gray-700"
                            : "text-gray-600"
                        }`}
                      >
                        {/* Date */}
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Date:</span>
                          <span>{item.deadline}</span>
                        </div>

                        {/* Category */}
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Category:</span>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!selectedItems.includes(item.id))
                                setEditingCell({
                                  id: item.id,
                                  field: "category",
                                });
                            }}
                            className={`cursor-pointer px-2 py-1 rounded text-xs font-medium ${
                              selectedItems.includes(item.id)
                                ? "bg-gray-300 text-gray-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {item.category}
                            {editingCell?.id === item.id &&
                              editingCell?.field === "category" && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 w-48 max-h-100 overflow-y-auto">
                                  <div className="py-1 text-xs text-gray-500 px-2 border-b">
                                    Choose one
                                  </div>
                                  {categoryOptions.map((option) => (
                                    <button
                                      key={option}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateCell(
                                          item.id,
                                          "category",
                                          option
                                        );
                                      }}
                                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100"
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Priority */}
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Priority:</span>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!selectedItems.includes(item.id))
                                setEditingCell({
                                  id: item.id,
                                  field: "priority",
                                });
                            }}
                            className="cursor-pointer"
                          >
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </span>
                            {editingCell?.id === item.id &&
                              editingCell?.field === "priority" && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 min-w-max">
                                  <div className="py-1 text-xs text-gray-500 px-2 border-b whitespace-nowrap">
                                    Choose one
                                  </div>
                                  {priorityOptions.map((option) => (
                                    <button
                                      key={option}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateCell(
                                          item.id,
                                          "priority",
                                          option
                                        );
                                      }}
                                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100"
                                    >
                                      <span
                                        className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${getPriorityColor(
                                          option
                                        )}`}
                                      >
                                        {option}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p
                          className={`text-xs leading-relaxed ${
                            selectedItems.includes(item.id)
                              ? "text-gray-700"
                              : "text-gray-500"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section - add button */}
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
