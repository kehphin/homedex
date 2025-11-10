import { config } from "../config";

const API_BASE = `${config.appHost}/api/v1/owner`;

interface ContractorData {
  name: string;
  company_name?: string;
  email?: string;
  website?: string;
  phone?: string;
  notes?: string;
}

interface MaintenanceRecord {
  id: string;
  name: string;
  date: string;
  price: number;
  component_name: string;
}

interface Contractor extends ContractorData {
  id: string;
  maintenance_count: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

interface ContractorDetail extends Contractor {
  maintenance_histories: MaintenanceRecord[];
}

interface ContractorStats {
  total: number;
  total_spent: number;
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
 * Fetch all contractors for the authenticated user
 */
export async function getContractors(): Promise<Contractor[]> {
  const response = await fetch(`${API_BASE}/contractors/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contractors");
  }

  return await response.json();
}

/**
 * Fetch a single contractor by ID with maintenance history
 */
export async function getContractor(id: string): Promise<ContractorDetail> {
  const response = await fetch(`${API_BASE}/contractors/${id}/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contractor");
  }

  return await response.json();
}

/**
 * Create a new contractor
 */
export async function createContractor(
  data: ContractorData
): Promise<Contractor> {
  const response = await fetch(`${API_BASE}/contractors/`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create contractor");
  }

  return await response.json();
}

/**
 * Update an existing contractor
 */
export async function updateContractor(
  id: string,
  data: Partial<ContractorData>
): Promise<Contractor> {
  const response = await fetch(`${API_BASE}/contractors/${id}/`, {
    method: "PATCH",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update contractor");
  }

  return await response.json();
}

/**
 * Delete a contractor
 */
export async function deleteContractor(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/contractors/${id}/`, {
    method: "DELETE",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete contractor");
  }
}

/**
 * Get contractor statistics
 */
export async function getContractorStats(): Promise<ContractorStats> {
  const response = await fetch(`${API_BASE}/contractors/stats/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contractor stats");
  }

  return await response.json();
}

export type {
  Contractor,
  ContractorData,
  ContractorDetail,
  ContractorStats,
  MaintenanceRecord,
};
