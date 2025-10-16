import { getCSRFToken } from "./csrf";
import { URLs, AuthProcess } from "./constants";
import { request } from "../lib/apiUtils";
import {
  AuthState,
  ConfigState,
  LoginData,
  SignUpData,
  PasswordData,
  ProviderSignupData,
  PasswordResetData,
  AuthProcessType,
  ProviderAccountsResponse,
  EmailAddressesResponse,
  EmailVerificationInfo,
  SessionsResponse,
  AuthenticatorsResponse,
  TOTPAuthenticatorResponse,
  RecoveryCodesResponse,
  PasswordResetResponse,
  StatusMessageResponse,
} from "./types";

export class AuthService {
  static async login(data: LoginData): Promise<AuthState> {
    return await request("POST", URLs.LOGIN, data);
  }

  static async reauthenticate(data: PasswordData): Promise<AuthState> {
    return await request("POST", URLs.REAUTHENTICATE, data);
  }

  static async logout(): Promise<StatusMessageResponse> {
    return await request("POST", URLs.LOGOUT);
  }

  static async signUp(data: SignUpData): Promise<AuthState> {
    return await request("POST", URLs.SIGNUP, data);
  }

  static async providerSignup(data: ProviderSignupData): Promise<AuthState> {
    return await request("POST", URLs.PROVIDER_SIGNUP, data);
  }

  static async getProviderAccounts(): Promise<ProviderAccountsResponse> {
    return await request("GET", URLs.PROVIDERS);
  }

  static async disconnectProviderAccount(
    providerId: string,
    accountUid: string
  ): Promise<ProviderAccountsResponse> {
    return await request("DELETE", URLs.PROVIDERS, {
      provider: providerId,
      account: accountUid,
    });
  }

  static async requestPasswordReset(
    email: string
  ): Promise<StatusMessageResponse> {
    return await request("POST", URLs.REQUEST_PASSWORD_RESET, { email });
  }

  static async requestLoginCode(email: string): Promise<StatusMessageResponse> {
    return await request("POST", URLs.REQUEST_LOGIN_CODE, { email });
  }

  static async confirmLoginCode(code: string): Promise<AuthState> {
    return await request("POST", URLs.CONFIRM_LOGIN_CODE, { code });
  }

  static async getEmailVerification(
    key: string
  ): Promise<EmailVerificationInfo> {
    return await request("GET", URLs.VERIFY_EMAIL, undefined, {
      "X-Email-Verification-Key": key,
    });
  }

  static async getEmailAddresses(): Promise<EmailAddressesResponse> {
    return await request("GET", URLs.EMAIL);
  }

  static async getSessions(): Promise<SessionsResponse> {
    return await request("GET", URLs.SESSIONS);
  }

  static async endSessions(ids: string[]): Promise<SessionsResponse> {
    return await request("DELETE", URLs.SESSIONS, { sessions: ids });
  }

  static async getAuthenticators(): Promise<
    AuthenticatorsResponse | RecoveryCodesResponse
  > {
    return await request("GET", URLs.AUTHENTICATORS);
  }

  static async getTOTPAuthenticator(): Promise<TOTPAuthenticatorResponse> {
    return await request("GET", URLs.TOTP_AUTHENTICATOR);
  }

  static async mfaAuthenticate(code: string): Promise<AuthState> {
    return await request("POST", URLs.MFA_AUTHENTICATE, { code });
  }

  static async mfaReauthenticate(code: string): Promise<AuthState> {
    return await request("POST", URLs.MFA_REAUTHENTICATE, { code });
  }

  static async activateTOTPAuthenticator(
    code: string
  ): Promise<TOTPAuthenticatorResponse> {
    return await request("POST", URLs.TOTP_AUTHENTICATOR, { code });
  }

  static async deactivateTOTPAuthenticator(): Promise<TOTPAuthenticatorResponse> {
    return await request("DELETE", URLs.TOTP_AUTHENTICATOR);
  }

  static async getRecoveryCodes(): Promise<RecoveryCodesResponse> {
    return await request("GET", URLs.RECOVERY_CODES);
  }

  static async generateRecoveryCodes(): Promise<RecoveryCodesResponse> {
    return await request("POST", URLs.RECOVERY_CODES);
  }

  static async getConfig(): Promise<ConfigState> {
    return await request("GET", URLs.CONFIG);
  }

  static async addEmail(email: string): Promise<EmailAddressesResponse> {
    return await request("POST", URLs.EMAIL, { email });
  }

  static async deleteEmail(email: string): Promise<EmailAddressesResponse> {
    return await request("DELETE", URLs.EMAIL, { email });
  }

  static async markEmailAsPrimary(
    email: string
  ): Promise<EmailAddressesResponse> {
    return await request("PATCH", URLs.EMAIL, { email, primary: true });
  }

  static async requestEmailVerification(
    email: string
  ): Promise<StatusMessageResponse> {
    return await request("PUT", URLs.EMAIL, { email });
  }

  static async verifyEmail(key: string): Promise<AuthState> {
    return await request(
      "POST",
      URLs.VERIFY_EMAIL,
      { key },
      { "X-Email-Verification-Key": key }
    );
  }

  static async getPasswordReset(key: string): Promise<PasswordResetResponse> {
    return await request("GET", URLs.RESET_PASSWORD, undefined, {
      "X-Password-Reset-Key": key,
    });
  }

  static async resetPassword(data: PasswordResetData): Promise<AuthState> {
    return await request("POST", URLs.RESET_PASSWORD, data);
  }

  static async changePassword(
    data: PasswordResetData
  ): Promise<StatusMessageResponse> {
    return await request("POST", URLs.CHANGE_PASSWORD, data);
  }

  static async getAuth(): Promise<AuthState> {
    return await request("GET", URLs.SESSION);
  }

  static async authenticateByToken(
    providerId: string,
    token: string,
    process: AuthProcessType = AuthProcess.LOGIN
  ): Promise<AuthState> {
    return await request("POST", URLs.PROVIDER_TOKEN, {
      provider: providerId,
      token,
      process,
    });
  }

  static redirectToProvider(
    providerId: string,
    callbackURL: string,
    process: AuthProcessType = AuthProcess.LOGIN
  ): void {
    postForm(URLs.REDIRECT_TO_PROVIDER, {
      provider: providerId,
      process,
      callback_url: callbackURL,
      csrfmiddlewaretoken: getCSRFToken() || "",
    });
  }
}

function postForm(action: string, data: Record<string, string>): void {
  const f = document.createElement("form");
  f.method = "POST";
  f.action = action;

  for (const key in data) {
    const d = document.createElement("input");
    d.type = "hidden";
    d.name = key;
    d.value = data[key];
    f.appendChild(d);
  }
  document.body.appendChild(f);
  f.submit();
}
