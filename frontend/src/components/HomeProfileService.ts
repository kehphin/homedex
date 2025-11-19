import { config } from "../config";
import { getCSRFToken } from "../auth/csrf";

const API_BASE = `${config.appHost}/api/v1/owner`;

export interface HomeProfile {
  id?: string;
  address: string;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  ac: boolean;
  ac_type?: string;
  heat: boolean;
  heat_type?: string;
  heating_source?: string;
  is_septic: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getHomeProfile(): Promise<HomeProfile | null> {
  try {
    const response = await fetch(`${API_BASE}/home-profile/`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch home profile: ${response.statusText}`);
    }

    const data = await response.json();
    // Handle both list response (array) and single object response
    return Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
  } catch (error) {
    console.error("Error fetching home profile:", error);
    throw error;
  }
}

export async function createOrUpdateHomeProfile(
  profile: HomeProfile
): Promise<HomeProfile> {
  try {
    const csrfToken = getCSRFToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    const response = await fetch(`${API_BASE}/home-profile/`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error(`Failed to save home profile: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving home profile:", error);
    throw error;
  }
}
