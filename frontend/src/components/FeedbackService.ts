import { config } from "../config";
import { getCSRFToken } from "../auth/csrf";

const API_BASE = `${config.appHost}/api/v1`;

interface FeedbackData {
  name: string;
  email: string;
  message: string;
}

/**
 * Build request headers with CSRF token
 */
function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "X-CSRFToken": getCSRFToken() || "",
    "Content-Type": "application/json",
  };

  return headers;
}

/**
 * Send feedback to the contactus endpoint
 */
export async function sendFeedback(data: FeedbackData): Promise<void> {
  const response = await fetch(`${API_BASE}/contactus/`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to send feedback");
  }
}
