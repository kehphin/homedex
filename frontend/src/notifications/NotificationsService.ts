import { config } from "../config";

const API_BASE = `${config.appHost}/api/v1/owner`;

export interface Notification {
  id: string;
  task: string;
  task_title: string;
  task_due_date: string;
  notification_type: "overdue" | "due_today" | "due_soon";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationSummary {
  overdue: number;
  due_today: number;
  due_soon: number;
  total: number;
}

export interface NotificationPreference {
  id: string;
  email_overdue_tasks: boolean;
  email_due_soon_tasks: boolean;
  email_frequency: "daily" | "weekly" | "never";
  inapp_overdue_tasks: boolean;
  inapp_due_soon_tasks: boolean;
  last_email_sent: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get CSRF token from cookie
 */
function getCSRFToken(): string | null {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key.trim() === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Fetch all notifications for the current user
 */
export async function getNotifications(
  limit: number = 10,
  offset: number = 0
): Promise<Notification[]> {
  const response = await fetch(
    `${API_BASE}/notifications/?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<{
  unread_count: number;
}> {
  const response = await fetch(`${API_BASE}/notifications/unread_count/`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch unread count");
  }

  return response.json();
}

/**
 * Get notification summary (counts by type)
 */
export async function getNotificationSummary(): Promise<NotificationSummary> {
  const response = await fetch(`${API_BASE}/notifications/summary/`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notification summary");
  }

  return response.json();
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  const response = await fetch(
    `${API_BASE}/notifications/${notificationId}/mark_as_read/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken() || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
}

/**
 * Mark a notification as unread
 */
export async function markNotificationAsUnread(
  notificationId: string
): Promise<Notification> {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: JSON.stringify({ is_read: false, read_at: null }),
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as unread");
  }

  return response.json();
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{
  updated_count: number;
}> {
  const response = await fetch(`${API_BASE}/notifications/mark_all_as_read/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken() || "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }

  return response.json();
}

/**
 * Get notification preferences for current user
 */
export async function getNotificationPreferences(): Promise<NotificationPreference> {
  const response = await fetch(`${API_BASE}/notification-preferences/`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notification preferences");
  }

  const data = await response.json();
  // Handle both list and object responses
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Update notification preferences for current user
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreference>
): Promise<NotificationPreference> {
  const response = await fetch(`${API_BASE}/notification-preferences/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error("Failed to update notification preferences");
  }

  return response.json();
}
