

const Client = {
  APP: 'app',
  BROWSER: 'browser'
} as const;

type ClientType = typeof Client[keyof typeof Client];

const CLIENT: ClientType = Client.BROWSER;

const BASE_URL = `/_allauth/${CLIENT}/v1`;

export const AuthProcess = {
  LOGIN: 'login',
  CONNECT: 'connect'
} as const;

export type AuthProcessType = typeof AuthProcess[keyof typeof AuthProcess];

export const Flows = {
  VERIFY_EMAIL: 'verify_email',
  LOGIN: 'login',
  LOGIN_BY_CODE: 'login_by_code',
  SIGNUP: 'signup',
  PROVIDER_REDIRECT: 'provider_redirect',
  PROVIDER_SIGNUP: 'provider_signup',
  MFA_AUTHENTICATE: 'mfa_authenticate',
  REAUTHENTICATE: 'reauthenticate',
  MFA_REAUTHENTICATE: 'mfa_reauthenticate'
} as const;

export type FlowType = typeof Flows[keyof typeof Flows];

export const URLs = {
  CONFIG: `${BASE_URL}/config`,
  CHANGE_PASSWORD: `${BASE_URL}/account/password/change`,
  EMAIL: `${BASE_URL}/account/email`,
  PROVIDERS: `${BASE_URL}/account/providers`,
  AUTHENTICATORS: `${BASE_URL}/account/authenticators`,
  RECOVERY_CODES: `${BASE_URL}/account/authenticators/recovery-codes`,
  TOTP_AUTHENTICATOR: `${BASE_URL}/account/authenticators/totp`,
  LOGIN: `${BASE_URL}/auth/login`,
  LOGOUT: '/api/v1/user_auth/logout/',
  REQUEST_LOGIN_CODE: `${BASE_URL}/auth/code/request`,
  CONFIRM_LOGIN_CODE: `${BASE_URL}/auth/code/confirm`,
  SESSION: `${BASE_URL}/auth/session`,
  REAUTHENTICATE: `${BASE_URL}/auth/reauthenticate`,
  REQUEST_PASSWORD_RESET: `${BASE_URL}/auth/password/request`,
  RESET_PASSWORD: `${BASE_URL}/auth/password/reset`,
  SIGNUP: `${BASE_URL}/auth/signup`,
  VERIFY_EMAIL: `${BASE_URL}/auth/email/verify`,
  MFA_AUTHENTICATE: `${BASE_URL}/auth/2fa/authenticate`,
  MFA_REAUTHENTICATE: `${BASE_URL}/auth/2fa/reauthenticate`,
  PROVIDER_SIGNUP: `${BASE_URL}/auth/provider/signup`,
  REDIRECT_TO_PROVIDER: `${BASE_URL}/auth/provider/redirect`,
  PROVIDER_TOKEN: `${BASE_URL}/auth/provider/token`,
  SESSIONS: `${BASE_URL}/auth/sessions`,
} as const;

export const REDIRECT_URLs = Object.freeze({
  LOGIN_URL: '/account/login',
  LOGIN_REDIRECT_URL: '/account/dashboard',
  LOGOUT_REDIRECT_URL: '/'
});


export type URLType = typeof URLs[keyof typeof URLs];

export const AuthenticatorType = {
  TOTP: 'totp',
  RECOVERY_CODES: 'recovery_codes',
  WEBAUTHN: 'webauthn'
} as const;

export type AuthenticatorTypeType = typeof AuthenticatorType[keyof typeof AuthenticatorType];