// User related types
export interface User {
    id: string;
    display: string;
    has_usable_password: boolean;
  }
  
  // Auth Flow types
  export interface AuthFlow {
    id: string;
    is_pending: boolean;
    types?: string[];
  }

  export interface ApiError {
    param: string | null;
    message: string;
    code?: string;
  }
  
  
  // Auth State types
  export interface AuthState {
    status: number;
    data?: {
      user: User;
      flows?: AuthFlow[];
      methods?: string[];
    };
    meta?: {
      is_authenticated: boolean;
      session_token?: string;
      access_token?: string;
    };
    errors?: ApiError[];
  }
  
  // Auth Info type
  export interface AuthInfo {
    isAuthenticated: boolean;
    requiresReauthentication: boolean;
    user: User | null;
    pendingFlow: AuthFlow | undefined;
  }
  
  // Config State types
  export interface ConfigState {
    status: number;
    data: {
      socialaccount: {
        providers: Provider[];
      };
      mfa: boolean;
      usersessions: {
        track_activity: boolean;
      };
    };
  }
  export interface EmailVerificationInfo {
    status: number;
    data: {
      email: string;
      user: User;
    };
    meta: {
      is_authenticating: boolean;
    };
  }

  export interface Provider {
    id: string;
    name: string;
    client_id?: string;
    flows: string[];
  }
  
  // Auth Change Event types
  export enum AuthChangeEventType {
    LOGGED_OUT = 'LOGGED_OUT',
    LOGGED_IN = 'LOGGED_IN',
    REAUTHENTICATED = 'REAUTHENTICATED',
    REAUTHENTICATION_REQUIRED = 'REAUTHENTICATION_REQUIRED',
    FLOW_UPDATED = 'FLOW_UPDATED'
  }
  
  // Request and Response types
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface SignUpData {
    email: string;
    password: string;
  }
  
  export interface ProviderSignupData {
    email: string;
  }
  
  export interface PasswordResetData {
    key: string;
    password: string;
  }
  
  export interface EmailData {
    email: string;
  }
  
  export interface CodeData {
    code: string;
  }
  
  export interface SessionData {
    sessions: string[];
  }
 
  export interface PasswordData {
    password: string;
  }
  // Utility types
  export type AuthProcessType = 'login' | 'connect';
  
  export type URLType = string;
  
  export type AuthenticatorType = 'totp' | 'recovery_codes' | 'webauthn';
  

// Provider Account types
export interface ProviderAccount {
  id: string;
  provider: Provider;
  display: string;
  uid: string;
  last_login: string;
  date_joined: string;
  extra_data: Record<string, any>;
}

export interface ProviderAccountsResponse {
  status: number;
  data: ProviderAccount[];
  errors?: ApiError[];
}


export interface EmailAddressesResponse {
  status: number;
  data: EmailAddress[];
  errors?: ApiError[];
}

// Session types
export interface Session {
  id: string;
  ip: string;
  user_agent: string;
  created_at: string;
  is_current: boolean;
  last_seen_at: string;
}

export interface SessionsResponse {
  status: number;
  data: Session[];
  errors?: ApiError[];
}

// Authenticator types
export interface Authenticator {
  id: string;
  type: string;
  name: string;
}

export interface AuthenticatorsResponse {
  status: number;
  data: Authenticator[];
  errors?: ApiError[];
}

// TOTP Authenticator types
export interface TOTPAuthenticator {
  last_used_at: string;
  type: string;
  created_at: string;
}

export interface TOTPAuthenticatorResponse {
  status: number;
  data? : TOTPAuthenticator;
  errors?: ApiError[];
  meta?: {
    secret: string;
  };
}

export interface RecoveryCodesData {
  unused_codes: string[];
  total_code_count: number;
  unused_code_count: number;
  type: string;
  last_generated_at: string;
  last_used_at: string;
}

export interface RecoveryCodesResponse {
  status: number;
  data?: RecoveryCodesData;
  errors?: ApiError[];
}

// Password Reset types
export interface PasswordResetResponse {
  status: number;
  data?: User;
  errors?: ApiError[];
}

export interface EmailAddress {
  email: string;
  verified: boolean;
  primary: boolean;
}
// Generic Response
export interface StatusMessageResponse {
  status: number;
  detail?: string;
  errors?: ApiError[];
}

export interface ResetPasswordData {
  key: string;
  password: string;
}