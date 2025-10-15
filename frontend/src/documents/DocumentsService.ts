import { config } from "../config";

const API_BASE = `${config.appHost}/api/v1/owner`;

interface DocumentData {
  name: string;
  category: string;
  description?: string;
  document_date?: string;
  year?: string;
  tags?: string[];
}

interface Document extends DocumentData {
  id: string;
  file_type: string;
  file_size: number;
  file_url: string;
  upload_date: string;
  uploaded_at: string;
  updated_at: string;
}

interface DocumentStats {
  total: number;
  this_year: number;
  categories: number;
  total_size: number;
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
 * Fetch all documents for the authenticated user
 */
export async function getDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_BASE}/documents/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }

  return await response.json();
}

/**
 * Fetch a single document by ID
 */
export async function getDocument(id: string): Promise<Document> {
  const response = await fetch(`${API_BASE}/documents/${id}/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document");
  }

  return await response.json();
}

/**
 * Create a new document
 */
export async function createDocument(
  data: DocumentData,
  file: File
): Promise<Document> {
  const formData = new FormData();

  // Add document data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "tags" && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  // Add file
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/documents/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create document");
  }

  return await response.json();
}

/**
 * Update an existing document
 */
export async function updateDocument(
  id: string,
  data: Partial<DocumentData>,
  file?: File
): Promise<Document> {
  const formData = new FormData();

  // Add document data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "tags" && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  // Add file if provided
  if (file) {
    formData.append("file", file);
  }

  const response = await fetch(`${API_BASE}/documents/${id}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update document");
  }

  return await response.json();
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${id}/`, {
    method: "DELETE",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
}

/**
 * Get document statistics
 */
export async function getDocumentStats(): Promise<DocumentStats> {
  const response = await fetch(`${API_BASE}/documents/stats/`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document stats");
  }

  return await response.json();
}

export type { Document, DocumentData, DocumentStats };
