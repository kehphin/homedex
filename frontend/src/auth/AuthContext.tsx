import React, { useEffect, createContext, useState } from 'react';
import { AuthService } from './AuthService';
import { AuthState, ConfigState } from './types';

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

export function AuthContextProvider({ children }: AuthContextProviderProps): JSX.Element {
  const [auth, setAuth] = useState<AuthState | undefined>(undefined);
  const [config, setConfig] = useState<ConfigState | undefined>(undefined);

  useEffect(() => {
    function onAuthChanged(e: CustomEvent<AuthState>) {
      setAuth((prevAuth) => {
        if (typeof prevAuth === 'undefined') {
          console.log('Authentication status loaded');
        } else {
          console.log('Authentication status updated');
        }
        
        return e.detail;
      });
    }

    document.addEventListener('allauth.auth.change', onAuthChanged as EventListener);
    AuthService.getAuth()
      .then((data) => setAuth(data))
      .catch((e) => {
        console.error(e);
        setAuth({ status: 500, data: undefined, meta: undefined }); // Set an error state
      });
    AuthService.getConfig()
      .then((data) => setConfig(data))
      .catch((e) => {
        console.error(e);
      });
    return () => {
      document.removeEventListener('allauth.auth.change', onAuthChanged as EventListener);
    };
  }, []);

  const isLoading = typeof auth === 'undefined' || config?.status !== 200;
  const hasError = auth?.status === 500; // Assuming 500 indicates an error state

  return (
    <AuthContext.Provider value={{ auth, config }}>
      {isLoading ? (
        <Loading />
      ) : hasError ? (
        <LoadingError />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}