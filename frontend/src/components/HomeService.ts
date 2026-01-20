import { config } from "../config";
import { getCSRFToken } from "../auth/csrf";

const API_BASE = `${config.appHost}/api/v1/owner`;

export interface Home {
  id: number;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  ac: boolean;
  ac_type?: string;
  heat: boolean;
  heat_type?: string;
  heating_source?: string;
  is_septic: boolean;
  year_built?: number;
  is_active: boolean;
  is_current: boolean;
  is_primary: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export async function getHomes(): Promise<Home[]> {
  try {
    const response = await fetch(`${API_BASE}/homes/`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch homes: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching homes:", error);
    throw error;
  }
}

export async function getCurrentHome(): Promise<Home | null> {
  try {
    const response = await fetch(`${API_BASE}/homes/current/`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch current home: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching current home:", error);
    throw error;
  }
}

export async function createHome(home: Partial<Home>): Promise<Home> {
  try {
    const csrfToken = getCSRFToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    const response = await fetch(`${API_BASE}/homes/`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(home),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to create home: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating home:", error);
    throw error;
  }
}

export async function updateHome(
  id: number,
  home: Partial<Home>,
): Promise<Home> {
  try {
    const csrfToken = getCSRFToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    const response = await fetch(`${API_BASE}/homes/${id}/`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(home),
    });

    if (!response.ok) {
      throw new Error(`Failed to update home: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating home:", error);
    throw error;
  }
}

export async function switchHome(id: number): Promise<Home> {
  try {
    const csrfToken = getCSRFToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    const response = await fetch(`${API_BASE}/homes/${id}/switch/`, {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to switch home: ${response.statusText}`);
    }

    const data = await response.json();
    return data.home;
  } catch (error) {
    console.error("Error switching home:", error);
    throw error;
  }
}

export async function setPrimaryHome(id: number): Promise<void> {
  try {
    const csrfToken = getCSRFToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    const response = await fetch(`${API_BASE}/homes/${id}/set_primary/`, {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to set primary home: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error setting primary home:", error);
    throw error;
  }
}
