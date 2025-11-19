import { config } from "../config";

const API_BASE = `${config.appHost}/api/v1/owner`;

interface MaintenanceData {
  name: string;
  date: string;
  home_component?: string | null;
  contractor?: string | null;
  price: string;
  notes?: string;
}

interface MaintenanceHistory extends MaintenanceData {
  id: string;
  component_name?: string;
  contractor_name?: string;
  created_at: string;
  updated_at: string;
  attachments: MaintenanceAttachment[];
}

interface MaintenanceAttachment {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  url: string;
  uploaded_at: string;
}

interface MaintenanceStats {
  total: number;
  total_cost: number;
  average_cost: number;
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
 * Fetch all maintenance history records for the authenticated user
 */
export async function getMaintenanceHistory(): Promise<MaintenanceHistory[]> {
  const response = await fetch(`${API_BASE}/maintenance/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch maintenance history");
  }

  return await response.json();
}

/**
 * Fetch a single maintenance record by ID
 */
export async function getMaintenanceRecord(
  id: string
): Promise<MaintenanceHistory> {
  const response = await fetch(`${API_BASE}/maintenance/${id}/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch maintenance record");
  }

  return await response.json();
}

/**
 * Create a new maintenance history record
 */
export async function createMaintenanceRecord(
  data: MaintenanceData,
  attachments?: File[]
): Promise<MaintenanceHistory> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("date", data.date);
  if (data.home_component) {
    formData.append("home_component", data.home_component);
  }
  if (data.contractor) {
    formData.append("contractor", data.contractor);
  }
  formData.append("price", data.price);
  if (data.notes) {
    formData.append("notes", data.notes);
  }

  // Add attachments
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append("attachment_files", file);
    });
  }

  const response = await fetch(`${API_BASE}/maintenance/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create maintenance record");
  }

  return await response.json();
}

/**
 * Update an existing maintenance record
 */
export async function updateMaintenanceRecord(
  id: string,
  data: Partial<MaintenanceData>,
  attachments?: File[]
): Promise<MaintenanceHistory> {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.date) formData.append("date", data.date);
  if (data.home_component !== undefined) {
    if (data.home_component) {
      formData.append("home_component", data.home_component);
    }
  }
  if (data.contractor !== undefined) {
    if (data.contractor) {
      formData.append("contractor", data.contractor);
    }
  }
  if (data.price) formData.append("price", data.price);
  if (data.notes !== undefined) formData.append("notes", data.notes || "");

  // Add attachments
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append("attachment_files", file);
    });
  }

  const response = await fetch(`${API_BASE}/maintenance/${id}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update maintenance record");
  }

  return await response.json();
}

/**
 * Delete a maintenance record
 */
export async function deleteMaintenanceRecord(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/maintenance/${id}/`, {
    method: "DELETE",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete maintenance record");
  }
}

/**
 * Delete an attachment from a maintenance record
 */
export async function deleteAttachment(
  maintenanceId: string,
  attachmentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/maintenance/${maintenanceId}/attachments/${attachmentId}/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: buildHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete attachment");
  }
}

/**
 * Get maintenance statistics
 */
export async function getMaintenanceStats(): Promise<MaintenanceStats> {
  const response = await fetch(`${API_BASE}/maintenance/stats/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch maintenance stats");
  }

  return await response.json();
}

export type {
  MaintenanceHistory,
  MaintenanceData,
  MaintenanceAttachment,
  MaintenanceStats,
};
