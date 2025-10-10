import { getCSRFToken } from "../auth/csrf";
import { URLs } from "../auth/constants";
import { config } from "../config";

interface RequestHeaders {
  [key: string]: string;
}

interface RequestOptions extends RequestInit {
  headers: RequestHeaders;
}

const ACCEPT_JSON: RequestHeaders = {
  accept: "application/json",
};

const tokenStorage = window.sessionStorage;

export async function request(
  method: string,
  path: string,
  data?: any,
  headers?: RequestHeaders
): Promise<any> {
  const options: RequestOptions = {
    method,
    headers: {
      ...ACCEPT_JSON,
      ...(headers || {}),
    },
    credentials: 'include', // Always include cookies for cross-origin requests
  };

  if (path !== URLs.CONFIG) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      options.headers["X-CSRFToken"] = csrfToken;
    } else {
      console.warn('CSRF token not found in cookies. This may cause 403 errors on POST requests.');
      console.log('Available cookies:', document.cookie);
    }
  }

  if (typeof data !== "undefined") {
    options.body = JSON.stringify(data);
    options.headers["Content-Type"] = "application/json";
  }

  // Prepend API host to the path if it's a relative URL
  const url = path.startsWith("http") ? path : `${config.appHost}${path}`;

  const resp = await fetch(url, options);
  const msg: any = await resp.json();

  if (msg.status === 410) {
    tokenStorage.removeItem("sessionToken");
  }

  if (
    [401, 410].includes(msg.status) ||
    (msg.status === 200 && msg.meta?.is_authenticated)
  ) {
    if (msg.meta?.session_token) {
      tokenStorage.setItem("sessionToken", msg.meta.session_token);
    }
    const event = new CustomEvent("allauth.auth.change", { detail: msg });

    document.dispatchEvent(event);
  }

  return msg;
}
