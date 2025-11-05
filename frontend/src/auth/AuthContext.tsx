import React, { useEffect, createContext, useState } from "react";
import { AuthService } from "./AuthService";
import { AuthState, ConfigState } from "./types";
import { config } from "../config";

interface AuthContextType {
  auth: AuthState | undefined;
  config: ConfigState | undefined;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function Loading(): JSX.Element {
  return <div>Loading...</div>;
}

function LoadingError(): JSX.Element {
  return <div>Loading error!</div>;
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export function AuthContextProvider({
  children,
}: AuthContextProviderProps): JSX.Element {
  const [auth, setAuth] = useState<AuthState | undefined>(undefined);
  const [configState, setConfigState] = useState<ConfigState | undefined>(
    undefined
  );

  useEffect(() => {
    // Fetch CSRF token by making a GET request to a safe endpoint on the backend
    // This ensures Django sets the csrftoken cookie with the correct domain
    const fetchCSRFToken = async () => {
      try {
        await fetch(`${config.appHost}/_allauth/browser/v1/config/`, {
          method: "GET",
          credentials: "include",
        });
      } catch (err) {
        console.warn("Failed to fetch CSRF token:", err);
        // Continue anyway - not critical if this fails
      }
    };

    function onAuthChanged(e: CustomEvent<AuthState>) {
      setAuth((prevAuth) => {
        if (typeof prevAuth === "undefined") {
          console.log("Authentication status loaded");
        } else {
          console.log("Authentication status updated");
        }

        return e.detail;
      });
    }

    // First fetch CSRF token, then load auth
    fetchCSRFToken().then(() => {
      document.addEventListener(
        "allauth.auth.change",
        onAuthChanged as EventListener
      );
      AuthService.getAuth()
        .then((data) => setAuth(data))
        .catch((e) => {
          console.error(e);
          setAuth({ status: 500, data: undefined, meta: undefined }); // Set an error state
        });
      AuthService.getConfig()
        .then((data) => setConfigState(data))
        .catch((e) => {
          console.error(e);
        });
    });

    return () => {
      document.removeEventListener(
        "allauth.auth.change",
        onAuthChanged as EventListener
      );
    };
  }, []);

  const isLoading = typeof auth === "undefined" || configState?.status !== 200;
  const hasError = auth?.status === 500; // Assuming 500 indicates an error state

  return (
    <AuthContext.Provider value={{ auth, config: configState }}>
      {isLoading ? <Loading /> : hasError ? <LoadingError /> : children}
    </AuthContext.Provider>
  );
}
