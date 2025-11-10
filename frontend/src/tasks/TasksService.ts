import { config } from "../config";

const API_BASE = `${config.appHost}/api/v1/owner`;

interface TaskData {
  title: string;
  description?: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  due_date: string;
  is_recurring?: boolean;
  recurrence_pattern?: "daily" | "weekly" | "monthly" | "yearly" | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
}

interface Task extends TaskData {
  id: string;
  created_at: string;
  updated_at: string;
  parent_task?: string | null;
}

interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  recurring?: {
    total_recurring: number;
    active_recurring: number;
    inactive_recurring: number;
  };
}

/**
 * Get CSRF token from cookie
 */
function getCSRFToken(): string | null {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

/**
 * Build request headers with CSRF token
 */
function buildHeaders(includeContentType: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    "X-CSRFToken": getCSRFToken() || "",
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

/**
 * Fetch all tasks for the authenticated user
 */
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/tasks/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return await response.json();
}

/**
 * Fetch a single task by ID
 */
export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch task");
  }

  return await response.json();
}

/**
 * Create a new task
 */
export async function createTask(data: TaskData): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create task");
  }

  return await response.json();
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  data: Partial<TaskData>
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "PATCH",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update task");
  }

  return await response.json();
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "DELETE",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
}

/**
 * Get task statistics
 */
export async function getTaskStats(): Promise<TaskStats> {
  const response = await fetch(`${API_BASE}/tasks/stats/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch task stats");
  }

  return await response.json();
}

export type { Task, TaskData, TaskStats };
