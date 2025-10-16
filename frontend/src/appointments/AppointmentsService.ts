import { config } from "../config";

const API_BASE = `${config.appHost}/api/v1/owner`;

interface AppointmentData {
  service_id: string;
  service_name: string;
  service_category: string;
  service_duration: number;
  appointment_date: string; // ISO date string (YYYY-MM-DD)
  appointment_time: string; // Time string (HH:MM)
  notes?: string;
}

interface Appointment extends AppointmentData {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailableTimesResponse {
  date: string;
  available_times: string[];
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
 * Fetch all appointments for the authenticated user
 */
export async function getAppointments(): Promise<Appointment[]> {
  const response = await fetch(`${API_BASE}/appointments/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return await response.json();
}

/**
 * Fetch a single appointment by ID
 */
export async function getAppointment(id: string): Promise<Appointment> {
  const response = await fetch(`${API_BASE}/appointments/${id}/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch appointment");
  }

  return await response.json();
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  data: AppointmentData
): Promise<Appointment> {
  const response = await fetch(`${API_BASE}/appointments/`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create appointment");
  }

  return await response.json();
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
  id: string,
  data: Partial<AppointmentData>
): Promise<Appointment> {
  const response = await fetch(`${API_BASE}/appointments/${id}/`, {
    method: "PATCH",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update appointment");
  }

  return await response.json();
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: string): Promise<Appointment> {
  const response = await fetch(`${API_BASE}/appointments/${id}/cancel/`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to cancel appointment");
  }

  return await response.json();
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/appointments/${id}/`, {
    method: "DELETE",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete appointment");
  }
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableTimes(
  date: string
): Promise<AvailableTimesResponse> {
  const response = await fetch(
    `${API_BASE}/appointments/available-times/?date=${date}`,
    {
      method: "GET",
      credentials: "include",
      headers: buildHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch available times");
  }

  return await response.json();
}

export type { Appointment, AppointmentData, TimeSlot, AvailableTimesResponse };
