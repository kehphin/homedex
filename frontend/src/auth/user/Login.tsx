import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../AuthService";
import { pathForPendingFlow, useConfig } from "../../auth";
import ProviderList from "../social/ProviderList";
import FormErrors from "../../components/FormErrors";
import { LoginData, AuthState, ConfigState } from "../types";
import { REDIRECT_URLs } from "../constants";
import { useAuthStatus } from "../hooks";
import { getAssetUrl } from "../../lib/assetUtils";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [response, setResponse] = useState<{
    fetching: boolean;
    content: AuthState | null;
  }>({
    fetching: false,
    content: null,
  });

  const config: ConfigState | undefined = useConfig();
  const hasProviders: boolean =
    (config?.data?.socialaccount?.providers?.length ?? 0) > 0;
  const navigate = useNavigate();
  const [, auth] = useAuthStatus();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location.search]);

  if (auth.isAuthenticated) {
    navigate(REDIRECT_URLs.LOGIN_REDIRECT_URL);
  }

  const submit = async () => {
    setResponse({ ...response, fetching: true });
    try {
      const loginData: LoginData = { email, password };
      const content: AuthState = await AuthService.login(loginData);
      setResponse({ fetching: false, content });

      if (content.status === 200) {
        // Successful login
        navigate(REDIRECT_URLs.LOGIN_REDIRECT_URL);
      } else if (content.status === 401) {
        // Check for pending flow
        const pendingFlow = content.data?.flows?.find(
          (flow) => flow.is_pending,
        );
        if (pendingFlow) {
          const path = pathForPendingFlow(content);
          if (path) {
            navigate(path);
          } else {
            console.error("No path found for pending flow:", pendingFlow);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setResponse((r) => ({
        ...r,
        fetching: false,
        content: {
          status: 400,
          errors: [{ param: null, message: "An error occurred during login." }],
        },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center">
      <div className="card mx-auto w-full max-w-sm bg-base-100 m-10">
        <div className="card-body">
          <div className="flex justify-center mb-6">
            <img
              src={getAssetUrl("assets/homedex_h.png")}
              alt="HomeDex Logo"
              className="h-32"
            />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
          <p className="text-center mb-4">
            No account?{" "}
            <Link to="/account/signup" className="link link-primary">
              Sign up here.
            </Link>
          </p>

          <FormErrors errors={response.content?.errors ?? []} />

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="email"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormErrors param="email" errors={response.content?.errors ?? []} />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="password"
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="label">
              <Link
                to="/account/password/reset"
                className="label-text-alt link link-primary"
              >
                Forgot password?
              </Link>
            </label>
            <FormErrors
              param="password"
              errors={response.content?.errors ?? []}
            />
          </div>
          <div className="form-control mt-6">
            <button
              className={`btn btn-primary ${
                response.fetching ? "loading" : ""
              }`}
              onClick={submit}
              disabled={response.fetching}
            >
              Login
            </button>
          </div>

          {hasProviders && (
            <>
              <div className="divider">Or use a third-party</div>
              <ProviderList callbackURL="/account/provider/callback" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
