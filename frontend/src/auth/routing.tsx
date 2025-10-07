import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStatus } from './hooks';
import { Flows, AuthenticatorType, REDIRECT_URLs } from './constants';
import { AuthState, AuthFlow } from './types';

type FlowPath = {
  [key: string]: string;
};

const flow2path: FlowPath = {
  [Flows.LOGIN]: '/account/login',
  [Flows.LOGIN_BY_CODE]: '/account/login/code/confirm',
  [Flows.SIGNUP]: '/account/signup',
  [Flows.VERIFY_EMAIL]: '/account/verify-email',
  [Flows.PROVIDER_SIGNUP]: '/account/provider/signup',
  [Flows.REAUTHENTICATE]: '/account/reauthenticate',
  [`${Flows.MFA_AUTHENTICATE}`]: '/account/authenticate/totp',
  [`${Flows.MFA_AUTHENTICATE}:${AuthenticatorType.TOTP}`]: '/account/authenticate/totp',
  [`${Flows.MFA_AUTHENTICATE}:${AuthenticatorType.RECOVERY_CODES}`]: '/account/authenticate/recovery-codes',
  [`${Flows.MFA_AUTHENTICATE}:${AuthenticatorType.WEBAUTHN}`]: '/account/authenticate/webauthn',
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.TOTP}`]: '/account/reauthenticate/totp',
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.RECOVERY_CODES}`]: '/account/reauthenticate/recovery-codes',
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.WEBAUTHN}`]: '/account/reauthenticate/webauthn'
};

export function pathForFlow(flow: AuthFlow, typ?: string): string {
  let key = flow.id;
  if (typeof flow.types !== 'undefined') {
    typ = typ ?? flow.types[0];
    key = `${key}:${typ}`;
  }
  const path = flow2path[key] ?? flow2path[flow.id];
  if (!path) {
    throw new Error(`Unknown path for flow: ${flow.id}`);
  }
  return path;
}

export function pathForPendingFlow(auth: AuthState): string | null {
  const flow = auth.data?.flows?.find(flow => flow.is_pending);
  if (flow) {
    return pathForFlow(flow);
  }
  return null;
}

export function navigateToPendingFlow(auth: AuthState): JSX.Element | null {
  console.log('Navigating to pending flow', auth);

  const path = pathForPendingFlow(auth);
  if (path) {
    return <Navigate to={path} />;
  }
  return null;
}

interface RouteProps {
  children: React.ReactNode;
}

export function AuthenticatedRoute({ children }: RouteProps): JSX.Element {
  const location = useLocation();
  const [, status] = useAuthStatus();
  const next = `next=${encodeURIComponent(location.pathname + location.search)}`;
  if (status.isAuthenticated) {
    return <>{children}</>;
  } else {
    return <Navigate to={`${REDIRECT_URLs.LOGIN_URL}?${next}`} />;
  }
}

export function AnonymousRoute({ children }: RouteProps): JSX.Element {
  const [, status] = useAuthStatus();

  if (!status.isAuthenticated) {
    return <>{children}</>;
  } else {
    return <Navigate to={REDIRECT_URLs.LOGIN_REDIRECT_URL} />;
  }
}