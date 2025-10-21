import React, { useState, useEffect } from "react";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import * as TasksService from "./TasksService";
import type { Task as APITask } from "./TasksService";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  createdAt: string;
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
  };
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General Maintenance",
    priority: "medium" as "low" | "medium" | "high",
    status: "pending" as "pending" | "in-progress" | "completed",
    dueDate: "",
  });

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TasksService.getTasks();
      setTasks(data.map(convertAPIToFrontend));
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
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        category: "General Maintenance",
        priority: "medium",
        status: "pending",
        dueDate: "",
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
    setLoading(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.dueDate,
      };

      if (editingTask) {
        // Update existing task
        const updated = await TasksService.updateTask(editingTask.id, taskData);
        setTasks(
          tasks.map((task) =>
            task.id === editingTask.id ? convertAPIToFrontend(updated) : task
          )
        );
      } else {
        // Create new task
        const created = await TasksService.createTask(taskData);
        setTasks([convertAPIToFrontend(created), ...tasks]);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save task:", err);
      alert("Failed to save task. Please try again.");
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
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const updated = await TasksService.updateTask(task.id, {
        status: newStatus,
      });
      setTasks(
        tasks.map((t) => (t.id === task.id ? convertAPIToFrontend(updated) : t))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Failed to update task status. Please try again.");
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

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort tasks: incomplete first, then by priority, then by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;

    // Then by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-base-100 p-6">
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
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Total Tasks
                      </p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <ClipboardDocumentListIcon className="h-10 w-10 text-base-content/30" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">Pending</p>
                      <p className="text-3xl font-bold text-gray-500">
                        {stats.pending}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
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
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
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
              </div>
            </div>

            {/* Search and Filter */}
            <div className="card bg-base-100 shadow-lg mb-6">
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
                    {(filterStatus !== "all" || filterPriority !== "all") && (
                      <span className="badge badge-primary badge-sm">
                        Active
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter Options */}
                {isFilterOpen && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    {(filterStatus !== "all" || filterPriority !== "all") && (
                      <button
                        className="btn btn-ghost btn-sm mt-4"
                        onClick={() => {
                          setFilterStatus("all");
                          setFilterPriority("all");
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
                      filterPriority !== "all"
                        ? "Try adjusting your search or filters"
                        : "Get started by creating your first task"}
                    </p>
                    {!searchQuery &&
                      filterStatus === "all" &&
                      filterPriority === "all" && (
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
                    className={`card bg-base-100 shadow-lg hover:shadow-xl transition-shadow ${
                      task.status === "completed" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="card-body">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className="mt-1"
                        >
                          {task.status === "completed" ? (
                            <CheckCircleSolidIcon className="h-6 w-6 text-success" />
                          ) : (
                            <CheckCircleIcon className="h-6 w-6 text-base-content/30 hover:text-success" />
                          )}
                        </button>

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
                              className={`badge ${
                                PRIORITY_COLORS[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span
                              className={`badge ${STATUS_COLORS[task.status]}`}
                            >
                              {task.status}
                            </span>
                            <span className="badge badge-ghost">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
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
                <div className="modal-box max-w-2xl">
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
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          value={formData.dueDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dueDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
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
