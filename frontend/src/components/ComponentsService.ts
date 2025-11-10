import { config } from "../config";

const API_BASE = `${config.appHost}/api/v1/owner`;

interface ComponentData {
  name: string;
  category: string;
  brand?: string;
  model?: string;
  sku?: string;
  year_installed?: string;
  purchase_date?: string;
  purchase_price?: string;
  warranty_expiration?: string;
  location?: string;
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  last_maintenance?: string;
  next_maintenance?: string;
}

interface HomeComponent extends ComponentData {
  id: string;
  images: Array<{
    id: string;
    url: string;
    uploaded_at: string;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    file_type: string;
    file_size: number;
    url: string;
    uploaded_at: string;
  }>;
  documents?: Array<{
    id: string;
    name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    upload_date: string;
    document_date?: string;
    category: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface ComponentStats {
  total: number;
  needs_maintenance: number;
  under_warranty: number;
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
 * Fetch all home components for the authenticated user
 */
export async function getComponents(): Promise<HomeComponent[]> {
  const response = await fetch(`${API_BASE}/components/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch components");
  }

  return await response.json();
}

/**
 * Fetch a single component by ID
 */
export async function getComponent(id: string): Promise<HomeComponent> {
  const response = await fetch(`${API_BASE}/components/${id}/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch component");
  }

  return await response.json();
}

/**
 * Create a new home component
 */
export async function createComponent(
  data: ComponentData,
  images?: File[],
  attachments?: File[]
): Promise<HomeComponent> {
  const formData = new FormData();

  // Add component data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value.toString());
    }
  });

  // Add images
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append("image_files", image);
    });
  }

  // Add attachments
  if (attachments && attachments.length > 0) {
    attachments.forEach((attachment) => {
      formData.append("attachment_files", attachment);
    });
  }

  const response = await fetch(`${API_BASE}/components/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create component");
  }

  return await response.json();
}

/**
 * Update an existing home component
 */
export async function updateComponent(
  id: string,
  data: Partial<ComponentData>,
  newImages?: File[],
  newAttachments?: File[]
): Promise<HomeComponent> {
  const formData = new FormData();

  // Add component data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value.toString());
    }
  });

  // Add new images
  if (newImages && newImages.length > 0) {
    newImages.forEach((image) => {
      formData.append("image_files", image);
    });
  }

  // Add new attachments
  if (newAttachments && newAttachments.length > 0) {
    newAttachments.forEach((attachment) => {
      formData.append("attachment_files", attachment);
    });
  }

  const response = await fetch(`${API_BASE}/components/${id}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update component");
  }

  return await response.json();
}

/**
 * Delete a home component
 */
export async function deleteComponent(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/components/${id}/`, {
    method: "DELETE",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete component");
  }
}

/**
 * Delete an image from a component
 */
export async function deleteComponentImage(
  componentId: string,
  imageId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/components/${componentId}/images/${imageId}/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: buildHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete image");
  }
}

/**
 * Delete an attachment from a component
 */
export async function deleteComponentAttachment(
  componentId: string,
  attachmentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/components/${componentId}/attachments/${attachmentId}/`,
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
 * Get component statistics
 */
export async function getComponentStats(): Promise<ComponentStats> {
  const response = await fetch(`${API_BASE}/components/stats/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch component stats");
  }

  return await response.json();
}

export type { HomeComponent, ComponentData, ComponentStats };
