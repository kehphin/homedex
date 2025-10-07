import { useContext, } from 'react';
import { AuthContext } from './AuthContext';
import { AuthState, ConfigState, AuthInfo, User } from './types';

export function useAuth(): AuthState | undefined {
  return useContext(AuthContext)?.auth;
}

export function useConfig(): ConfigState | undefined {
  return useContext(AuthContext)?.config;
}

export function useUser(): User | null {
  const auth = useContext(AuthContext)?.auth;
  return auth ? authInfo(auth).user : null;
}

export function useAuthInfo(): AuthInfo {
  const auth = useContext(AuthContext)?.auth;
  return auth ? authInfo(auth) : { isAuthenticated: false, requiresReauthentication: false, user: null, pendingFlow: undefined };
}

function authInfo(auth: AuthState): AuthInfo {
  const isAuthenticated = auth.status === 200 || (auth.status === 401 && auth.meta?.is_authenticated === true);
  const requiresReauthentication = isAuthenticated && auth.status === 401;
  const pendingFlow = auth.data?.flows?.find(flow => flow.is_pending);
  return { 
    isAuthenticated, 
    requiresReauthentication, 
    user: isAuthenticated ? auth.data?.user ?? null : null,
    pendingFlow
  };
}

export function useAuthStatus(): [AuthState | undefined, AuthInfo] {
  const auth = useAuth();
  return [auth, auth ? authInfo(auth) : { isAuthenticated: false, requiresReauthentication: false, user: null, pendingFlow: undefined }];
}