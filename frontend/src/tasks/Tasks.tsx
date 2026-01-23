import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import * as TasksService from "./TasksService";
import type { Task as APITask } from "./TasksService";
import * as ComponentsService from "../components/ComponentsService";
import type { HomeComponent } from "../components/ComponentsService";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "dismissed";
  dueDate: string;
  createdAt: string;
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
  recurrenceInterval?: number;
  recurrenceDaysOfWeek?: (string | number)[]; // For weekly recurrence
  recurrenceDaysOfMonth?: (
    | number
    | { type: string; week: string; day: string }
  )[]; // For monthly recurrence
  recurrenceEndDate?: string | null;
  parentTask?: string | null;
  homeComponent?: string | null;
  homeComponentName?: string | null;
}

const CATEGORIES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Landscaping",
  "Painting",
  "Roofing",
  "Flooring",
  "Appliances",
  "General Maintenance",
  "Other",
];

const PRIORITY_COLORS = {
  low: "badge-info",
  medium: "badge-warning",
  high: "badge-error",
};

const STATUS_COLORS = {
  pending: "badge-ghost",
  "in-progress": "badge-primary",
  completed: "badge-success",
  dismissed: "badge-warning",
};

/**
 * Convert API response to frontend format
 */
function convertAPIToFrontend(apiTask: APITask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || "",
    category: apiTask.category,
    priority: apiTask.priority,
    status: apiTask.status,
    dueDate: apiTask.due_date,
    createdAt: apiTask.created_at,
    isRecurring: apiTask.is_recurring || false,
    recurrencePattern: apiTask.recurrence_pattern || undefined,
    recurrenceInterval: apiTask.recurrence_interval || 1,
    recurrenceDaysOfWeek: apiTask.recurrence_days_of_week || [],
    recurrenceDaysOfMonth: apiTask.recurrence_days_of_month || [],
    recurrenceEndDate: apiTask.recurrence_end_date || null,
    parentTask: apiTask.parent_task || null,
    homeComponent: apiTask.home_component || null,
    homeComponentName: apiTask.home_component_name || null,
  };
}

/**
 * Get the day of week (0-6) for a given date string
 */
function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr);
  return date.getDay();
}

/**
 * Get the day of month for a given date string
 */
function getDayOfMonth(dateStr: string): number {
  const date = new Date(dateStr);
  return date.getDate();
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [homeComponents, setHomeComponents] = useState<HomeComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General Maintenance",
    priority: "medium" as "low" | "medium" | "high",
    status: "pending" as "pending" | "in-progress" | "completed" | "dismissed",
    dueDate: "",
    isRecurring: false,
    recurrencePattern: "daily" as "daily" | "weekly" | "monthly" | "yearly",
    recurrenceInterval: 1,
    recurrenceDaysOfWeek: [] as (string | number)[],
    recurrenceDaysOfMonth: [] as (
      | number
      | { type: string; week: string; day: string }
    )[],
    recurrenceDaysOfMonthType: "absolute" as "absolute" | "relative", // Toggle between absolute days and relative weeks
    recurrenceEndDate: "",
    homeComponent: "",
  });

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, componentsData] = await Promise.all([
        TasksService.getTasks(),
        ComponentsService.getComponents(),
      ]);
      setTasks(tasksData.map(convertAPIToFrontend));
      setHomeComponents(componentsData);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        isRecurring: task.isRecurring || false,
        recurrencePattern: task.recurrencePattern || "daily",
        recurrenceInterval: task.recurrenceInterval || 1,
        recurrenceDaysOfWeek: task.recurrenceDaysOfWeek || [],
        recurrenceDaysOfMonth: task.recurrenceDaysOfMonth || [],
        recurrenceDaysOfMonthType: task.recurrenceDaysOfMonth?.some(
          (d) => typeof d === "object",
        )
          ? "relative"
          : "absolute",
        recurrenceEndDate: task.recurrenceEndDate || "",
        homeComponent: task.homeComponent || "",
      });
    } else {
      setEditingTask(null);
      const today = new Date().toISOString().split("T")[0];
      const todayDayOfWeek = getDayOfWeek(today);
      const todayDayOfMonth = getDayOfMonth(today);

      setFormData({
        title: "",
        description: "",
        category: "General Maintenance",
        priority: "medium",
        status: "pending",
        dueDate: today,
        isRecurring: false,
        recurrencePattern: "daily",
        recurrenceInterval: 1,
        recurrenceDaysOfWeek: [todayDayOfWeek], // Default to current day of week
        recurrenceDaysOfMonth: [todayDayOfMonth], // Default to current day of month
        recurrenceDaysOfMonthType: "absolute",
        recurrenceEndDate: "",
        homeComponent: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Please select a due date");
      return;
    }

    // Recurring task validation
    if (formData.isRecurring) {
      if (
        formData.recurrencePattern === "weekly" &&
        formData.recurrenceDaysOfWeek.length === 0
      ) {
        toast.error("Please select at least one day of the week");
        return;
      }
      if (
        formData.recurrencePattern === "monthly" &&
        formData.recurrenceDaysOfMonth.length === 0
      ) {
        toast.error("Please select days for monthly recurrence");
        return;
      }
    }

    setLoading(true);

    try {
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.dueDate,
        is_recurring: formData.isRecurring,
        recurrence_pattern: formData.isRecurring
          ? formData.recurrencePattern
          : null,
        recurrence_interval: formData.isRecurring
          ? formData.recurrenceInterval
          : 1,
        recurrence_days_of_week:
          formData.isRecurring && formData.recurrencePattern === "weekly"
            ? formData.recurrenceDaysOfWeek
            : [],
        recurrence_days_of_month:
          formData.isRecurring && formData.recurrencePattern === "monthly"
            ? formData.recurrenceDaysOfMonth
            : [],
        recurrence_end_date:
          formData.isRecurring && formData.recurrenceEndDate
            ? formData.recurrenceEndDate
            : null,
        home_component: formData.homeComponent || null,
      };

      if (editingTask) {
        // Update existing task
        const updated = await TasksService.updateTask(editingTask.id, taskData);
        setTasks(
          tasks.map((task) =>
            task.id === editingTask.id ? convertAPIToFrontend(updated) : task,
          ),
        );
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        const created = await TasksService.createTask(taskData);
        setTasks([convertAPIToFrontend(created), ...tasks]);
        toast.success("Task created successfully!");
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save task:", err);
      toast.error("Failed to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await TasksService.deleteTask(id);
      setTasks(tasks.filter((task) => task.id !== id));
      toast.success("Task deleted successfully!");
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const updated = await TasksService.updateTask(task.id, {
        status: newStatus,
      });
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? convertAPIToFrontend(updated) : t,
        ),
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Failed to update task status. Please try again.");
    }
  };

  const handleDismiss = async (task: Task) => {
    try {
      const updated = await TasksService.updateTask(task.id, {
        status: "dismissed",
      });
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? convertAPIToFrontend(updated) : t,
        ),
      );
    } catch (err) {
      console.error("Failed to dismiss task:", err);
      alert("Failed to dismiss task. Please try again.");
    }
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;

    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;

    const matchesCategory =
      filterCategory === "all" || task.category === filterCategory;

    let matchesMonth = true;
    if (filterMonth !== "all" && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const [year, month] = filterMonth.split("-");
      matchesMonth =
        taskDate.getFullYear().toString() === year &&
        (taskDate.getMonth() + 1).toString().padStart(2, "0") === month;
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory &&
      matchesMonth
    );
  });

  // Sort tasks: by due date (ascending), completed tasks last
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;

    // Then by due date (ascending)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <ClipboardDocumentListIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Home Tasks</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Task
            </button>
          </div>
          <p className="text-base-content/70">
            Manage your home maintenance and improvement tasks
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="btn btn-ghost btn-sm"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && tasks.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => setFilterStatus("pending")}
                className={`card rounded-box border border-gray-200 cursor-pointer transition-all ${
                  filterStatus === "pending"
                    ? "bg-base-300 border-gray-500"
                    : "bg-base-100 hover:bg-base-200"
                }`}
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">Active</p>
                      <p className="text-3xl font-bold text-gray-500">
                        {stats.pending}
                      </p>
                    </div>
                    <ClipboardDocumentListIcon className="h-10 w-10 text-gray-500/30" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFilterStatus("in-progress")}
                className={`card rounded-box border border-gray-200 cursor-pointer transition-all ${
                  filterStatus === "in-progress"
                    ? "bg-base-300 border-primary"
                    : "bg-base-100 hover:bg-base-200"
                }`}
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        In Progress
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {stats.inProgress}
                      </p>
                    </div>
                    <ArrowPathIcon className="h-10 w-10 text-primary/30" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFilterStatus("completed")}
                className={`card rounded-box border border-gray-200 cursor-pointer transition-all ${
                  filterStatus === "completed"
                    ? "bg-base-300 border-success"
                    : "bg-base-100 hover:bg-base-200"
                }`}
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">Completed</p>
                      <p className="text-3xl font-bold text-success">
                        {stats.completed}
                      </p>
                    </div>
                    <CheckCircleSolidIcon className="h-10 w-10 text-success/30" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFilterStatus("all")}
                className={`card rounded-box border border-gray-200 cursor-pointer transition-all ${
                  filterStatus === "all"
                    ? "bg-base-300 border-primary"
                    : "bg-base-100 hover:bg-base-200"
                }`}
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Total Tasks
                      </p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <Square3Stack3DIcon className="h-10 w-10 text-base-content/30" />
                  </div>
                </div>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="card bg-base-100 rounded-box border border-gray-200 mb-6">
              <div className="card-body">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="input input-bordered w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter Toggle */}
                  <button
                    className="btn btn-outline gap-2"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <FunnelIcon className="h-5 w-5" />
                    Filters
                    {(filterStatus !== "all" ||
                      filterPriority !== "all" ||
                      filterCategory !== "all" ||
                      filterMonth !== "all") && (
                      <span className="badge badge-primary badge-sm badge-light">
                        Active
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter Options */}
                {isFilterOpen && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Status
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Priority
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                        >
                          <option value="all">All Priorities</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Category
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Month
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={filterMonth}
                          onChange={(e) => setFilterMonth(e.target.value)}
                        >
                          <option value="all">All Months</option>
                          {(() => {
                            const now = new Date();
                            const months = [];
                            for (let i = 0; i < 12; i++) {
                              const date = new Date(
                                now.getFullYear(),
                                now.getMonth() - i,
                                1,
                              );
                              const year = date.getFullYear();
                              const month = (date.getMonth() + 1)
                                .toString()
                                .padStart(2, "0");
                              const label = date.toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                              });
                              months.push(
                                <option
                                  key={`${year}-${month}`}
                                  value={`${year}-${month}`}
                                >
                                  {label}
                                </option>,
                              );
                            }
                            return months;
                          })()}
                        </select>
                      </div>
                    </div>

                    {(filterStatus !== "all" ||
                      filterPriority !== "all" ||
                      filterCategory !== "all" ||
                      filterMonth !== "all") && (
                      <button
                        className="btn btn-ghost btn-sm mt-4"
                        onClick={() => {
                          setFilterStatus("all");
                          setFilterPriority("all");
                          setFilterCategory("all");
                          setFilterMonth("all");
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {sortedTasks.length === 0 ? (
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body text-center py-12">
                    <ClipboardDocumentListIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No tasks found
                    </h3>
                    <p className="text-base-content/60 mb-4">
                      {searchQuery ||
                      filterStatus !== "all" ||
                      filterPriority !== "all" ||
                      filterCategory !== "all" ||
                      filterMonth !== "all"
                        ? "Try adjusting your search or filters"
                        : "Get started by creating your first task"}
                    </p>
                    {!searchQuery &&
                      filterStatus === "all" &&
                      filterPriority === "all" &&
                      filterCategory === "all" &&
                      filterMonth === "all" && (
                        <button
                          onClick={() => handleOpenModal()}
                          className="btn btn-primary gap-2 mx-auto"
                        >
                          <PlusIcon className="h-5 w-5" />
                          Create Task
                        </button>
                      )}
                  </div>
                </div>
              ) : (
                sortedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`card bg-base-100 rounded-box border border-gray-200 hover:shadow-lg transition-shadow ${
                      task.status === "completed" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="card-body">
                      <div className="flex items-start gap-4">
                        {/* Checkbox and Dismiss button */}
                        <div className="flex flex-col items-center gap-y-4">
                          <button
                            onClick={() => handleToggleComplete(task)}
                            className="mt-1 tooltip"
                            data-tip={
                              task.status === "completed"
                                ? "Mark as incomplete"
                                : "Mark as complete"
                            }
                          >
                            {task.status === "completed" ? (
                              <CheckCircleSolidIcon className="h-6 w-6 text-success" />
                            ) : (
                              <CheckCircleIcon className="h-6 w-6 text-base-content/30 hover:text-success" />
                            )}
                          </button>

                          {/* Dismiss button for recurring tasks */}
                          {task.isRecurring && (
                            <button
                              onClick={() => handleDismiss(task)}
                              className="tooltip"
                              data-tip="Dismiss this recurring task"
                            >
                              <XMarkIcon className="h-5 w-5 text-base-content/30 hover:text-warning" />
                            </button>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3
                              className={`text-lg font-semibold ${
                                task.status === "completed"
                                  ? "line-through text-base-content/60"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal(task)}
                                className="btn btn-ghost btn-sm btn-circle"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="btn btn-ghost btn-sm btn-circle text-error"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-base-content/70 mb-3">
                            {task.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <span className="badge badge-outline">
                              {task.category}
                            </span>
                            <span
                              className={`badge badge-light ${
                                PRIORITY_COLORS[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span
                              className={`badge badge-light ${STATUS_COLORS[task.status]}`}
                            >
                              {task.status}
                            </span>
                            {task.isRecurring && (
                              <span className="badge badge-info badge-light">
                                Recurring ({task.recurrencePattern})
                              </span>
                            )}
                            <span className="badge badge-ghost">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {task.homeComponentName && (
                              <span className="badge badge-neutral">
                                {task.homeComponentName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="modal modal-open">
                <div className="modal-box max-w-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      {editingTask ? "Edit Task" : "Create New Task"}
                    </h3>
                    <button
                      onClick={handleCloseModal}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Title *
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Replace air filter"
                        className="input input-bordered w-full"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Description
                        </span>
                      </label>
                      <textarea
                        placeholder="Add task details..."
                        className="textarea textarea-bordered w-full h-24"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Category and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Category *
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          required
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Priority *
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: e.target.value as
                                | "low"
                                | "medium"
                                | "high",
                            })
                          }
                          required
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    {/* Status and Due Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Status *
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as
                                | "pending"
                                | "in-progress"
                                | "completed",
                            })
                          }
                          required
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            Due Date *
                          </span>
                        </label>
                        <DatePicker
                          selected={
                            formData.dueDate ? new Date(formData.dueDate) : null
                          }
                          onChange={(date) =>
                            setFormData({
                              ...formData,
                              dueDate: date
                                ? date.toISOString().split("T")[0]
                                : "",
                            })
                          }
                          dateFormat="yyyy-MM-dd"
                          className="input input-bordered w-full"
                          placeholderText="Select a date"
                          required
                        />
                      </div>
                    </div>

                    {/* Home Component */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Related Component
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={formData.homeComponent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            homeComponent: e.target.value,
                          })
                        }
                      >
                        <option value="">None</option>
                        {homeComponents.map((component) => (
                          <option key={component.id} value={component.id}>
                            {component.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Recurring Task Options */}
                    <div className="border-t border-slate-200 shadow-sm pt-4">
                      <label className="label cursor-pointer">
                        <span className="label-text font-semibold">
                          Make this a recurring task
                        </span>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={formData.isRecurring}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isRecurring: e.target.checked,
                            })
                          }
                        />
                      </label>

                      {formData.isRecurring && (
                        <div className="space-y-4 mt-4 p-4 bg-base-200 rounded-lg">
                          {/* Recurrence Pattern Selection */}
                          <div>
                            <label className="label">
                              <span className="label-text font-semibold">
                                Recurrence Pattern *
                              </span>
                            </label>
                            <select
                              className="select select-bordered w-full"
                              value={formData.recurrencePattern}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  recurrencePattern: e.target.value as
                                    | "daily"
                                    | "weekly"
                                    | "monthly"
                                    | "yearly",
                                  recurrenceInterval: 1,
                                  recurrenceDaysOfWeek: [],
                                  recurrenceDaysOfMonth: [],
                                  recurrenceDaysOfMonthType: "absolute",
                                })
                              }
                              required
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>

                          {/* DAILY - Repeat every X days */}
                          {formData.recurrencePattern === "daily" && (
                            <div>
                              <label className="label">
                                <span className="label-text font-semibold">
                                  Repeat Every X Days *
                                </span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="365"
                                className="input input-bordered w-full"
                                value={formData.recurrenceInterval}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    recurrenceInterval:
                                      parseInt(e.target.value) || 1,
                                  })
                                }
                                required
                              />
                            </div>
                          )}

                          {/* WEEKLY - Repeat every X weeks on specific days */}
                          {formData.recurrencePattern === "weekly" && (
                            <>
                              <div>
                                <label className="label">
                                  <span className="label-text font-semibold">
                                    Repeat Every X Weeks *
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="52"
                                  className="input input-bordered w-full"
                                  value={formData.recurrenceInterval}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      recurrenceInterval:
                                        parseInt(e.target.value) || 1,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="label">
                                  <span className="label-text font-semibold">
                                    Days of Week *
                                  </span>
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                  {[
                                    { value: 0, label: "Sun" },
                                    { value: 1, label: "Mon" },
                                    { value: 2, label: "Tue" },
                                    { value: 3, label: "Wed" },
                                    { value: 4, label: "Thu" },
                                    { value: 5, label: "Fri" },
                                    { value: 6, label: "Sat" },
                                  ].map((day) => (
                                    <label
                                      key={day.value}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm"
                                        checked={formData.recurrenceDaysOfWeek.includes(
                                          day.value,
                                        )}
                                        onChange={(e) => {
                                          const days =
                                            formData.recurrenceDaysOfWeek || [];
                                          if (e.target.checked) {
                                            setFormData({
                                              ...formData,
                                              recurrenceDaysOfWeek: [
                                                ...days,
                                                day.value,
                                              ],
                                            });
                                          } else {
                                            setFormData({
                                              ...formData,
                                              recurrenceDaysOfWeek: days.filter(
                                                (d) => d !== day.value,
                                              ),
                                            });
                                          }
                                        }}
                                      />
                                      <span className="text-sm">
                                        {day.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          {/* MONTHLY - Choice between absolute and relative */}
                          {formData.recurrencePattern === "monthly" && (
                            <>
                              <div>
                                <label className="label">
                                  <span className="label-text font-semibold">
                                    Repeat Every X Months *
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="12"
                                  className="input input-bordered w-full"
                                  value={formData.recurrenceInterval}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      recurrenceInterval:
                                        parseInt(e.target.value) || 1,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="label">
                                  <span className="label-text font-semibold">
                                    Days Pattern *
                                  </span>
                                </label>
                                <div className="flex gap-2 mb-3">
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      formData.recurrenceDaysOfMonthType ===
                                      "absolute"
                                        ? "btn-primary"
                                        : "btn-outline"
                                    }`}
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        recurrenceDaysOfMonthType: "absolute",
                                        recurrenceDaysOfMonth: [],
                                      })
                                    }
                                  >
                                    Specific Days (1-31)
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      formData.recurrenceDaysOfMonthType ===
                                      "relative"
                                        ? "btn-primary"
                                        : "btn-outline"
                                    }`}
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        recurrenceDaysOfMonthType: "relative",
                                        recurrenceDaysOfMonth: [],
                                      })
                                    }
                                  >
                                    Relative (e.g., First Monday)
                                  </button>
                                </div>

                                {/* Absolute: Days of Month */}
                                {formData.recurrenceDaysOfMonthType ===
                                  "absolute" && (
                                  <div className="grid grid-cols-5 gap-2">
                                    {Array.from(
                                      { length: 31 },
                                      (_, i) => i + 1,
                                    ).map((day) => (
                                      <label
                                        key={day}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          className="checkbox checkbox-sm"
                                          checked={formData.recurrenceDaysOfMonth.includes(
                                            day,
                                          )}
                                          onChange={(e) => {
                                            const days =
                                              formData.recurrenceDaysOfMonth ||
                                              [];
                                            if (e.target.checked) {
                                              setFormData({
                                                ...formData,
                                                recurrenceDaysOfMonth: [
                                                  ...days.filter(
                                                    (d) =>
                                                      typeof d === "number",
                                                  ),
                                                  day,
                                                ],
                                              });
                                            } else {
                                              setFormData({
                                                ...formData,
                                                recurrenceDaysOfMonth:
                                                  days.filter((d) => d !== day),
                                              });
                                            }
                                          }}
                                        />
                                        <span className="text-xs">{day}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}

                                {/* Relative: Week and Day */}
                                {formData.recurrenceDaysOfMonthType ===
                                  "relative" && (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="label">
                                        <span className="label-text text-sm">
                                          Week of Month
                                        </span>
                                      </label>
                                      <select
                                        className="select select-bordered select-sm w-full"
                                        value={
                                          (
                                            formData
                                              .recurrenceDaysOfMonth?.[0] as any
                                          )?.week || "first"
                                        }
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            recurrenceDaysOfMonth: [
                                              {
                                                type: "relative",
                                                week: e.target.value,
                                                day:
                                                  (
                                                    formData
                                                      .recurrenceDaysOfMonth?.[0] as any
                                                  )?.day || "Monday",
                                              },
                                            ],
                                          })
                                        }
                                      >
                                        <option value="first">First</option>
                                        <option value="second">Second</option>
                                        <option value="third">Third</option>
                                        <option value="fourth">Fourth</option>
                                        <option value="fifth">Fifth</option>
                                        <option value="last">Last</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="label">
                                        <span className="label-text text-sm">
                                          Day
                                        </span>
                                      </label>
                                      <select
                                        className="select select-bordered select-sm w-full"
                                        value={
                                          (
                                            formData
                                              .recurrenceDaysOfMonth?.[0] as any
                                          )?.day || "Monday"
                                        }
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            recurrenceDaysOfMonth: [
                                              {
                                                type: "relative",
                                                week:
                                                  (
                                                    formData
                                                      .recurrenceDaysOfMonth?.[0] as any
                                                  )?.week || "first",
                                                day: e.target.value,
                                              },
                                            ],
                                          })
                                        }
                                      >
                                        <option value="day">Day</option>
                                        <option value="Sunday">Sunday</option>
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">
                                          Wednesday
                                        </option>
                                        <option value="Thursday">
                                          Thursday
                                        </option>
                                        <option value="Friday">Friday</option>
                                        <option value="Saturday">
                                          Saturday
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {/* YEARLY - Repeat every X years */}
                          {formData.recurrencePattern === "yearly" && (
                            <div>
                              <label className="label">
                                <span className="label-text font-semibold">
                                  Repeat Every X Years *
                                </span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                className="input input-bordered w-full"
                                value={formData.recurrenceInterval}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    recurrenceInterval:
                                      parseInt(e.target.value) || 1,
                                  })
                                }
                                required
                              />
                            </div>
                          )}

                          {/* End Date (common for all patterns) */}
                          <div>
                            <label className="label">
                              <span className="label-text font-semibold">
                                End Date (Optional)
                              </span>
                            </label>
                            <DatePicker
                              selected={
                                formData.recurrenceEndDate
                                  ? new Date(formData.recurrenceEndDate)
                                  : null
                              }
                              onChange={(date) =>
                                setFormData({
                                  ...formData,
                                  recurrenceEndDate: date
                                    ? date.toISOString().split("T")[0]
                                    : "",
                                })
                              }
                              dateFormat="yyyy-MM-dd"
                              className="input input-bordered w-full"
                              placeholderText="Select a date (optional)"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="modal-action">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingTask ? "Update Task" : "Create Task"}
                      </button>
                    </div>
                  </form>
                </div>
                <div
                  className="modal-backdrop"
                  onClick={handleCloseModal}
                ></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
