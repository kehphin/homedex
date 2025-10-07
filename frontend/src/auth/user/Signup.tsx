import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import FormErrors from "../../components/FormErrors";
import { AuthService } from "../AuthService";
import { useConfig } from "../../auth";
import ProviderList from "../social/ProviderList";
import { SignUpData, AuthState, ConfigState, ApiError } from "../types";
import { pathForPendingFlow } from "../../auth/routing";
import { REDIRECT_URLs } from "../constants";
import { useAuthStatus } from "../hooks";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [password2Errors, setPassword2Errors] = useState<ApiError[]>([]);
  const [emailProvided, setEmailProvided] = useState<boolean>(false);
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
  const location = useLocation();
  const navigate = useNavigate();
  const [, auth] = useAuthStatus();
  if (auth.isAuthenticated) {
    navigate(REDIRECT_URLs.LOGIN_REDIRECT_URL);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      setEmailProvided(true);
    }
  }, [location]);

  const submit = async () => {
    if (password2 !== password1) {
      setPassword2Errors([
        { param: "password2", message: "Password does not match." },
      ]);
      return;
    }
    setPassword2Errors([]);
    setResponse({ ...response, fetching: true });

    try {
      const signUpData: SignUpData = { email, password: password1 };
      const content: AuthState = await AuthService.signUp(signUpData);
      setResponse((r) => ({ ...r, content }));
      console.log("Signup response:", content);

      if (content.status === 200) {
        // Successful signup
        navigate(REDIRECT_URLs.LOGIN_REDIRECT_URL);
      } else if (content.status === 401) {
        // Check for pending flow
        const pendingFlow = content.data?.flows?.find(
          (flow) => flow.is_pending
        );
        if (pendingFlow) {
          const path = pathForPendingFlow(content);
          if (path) {
            navigate(path);
          } else {
            console.error("Unknown path for pending flow:", pendingFlow);
          }
        }
      } else {
        // Handle errors
        console.error("Signup failed:", content);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        window.alert(e.message);
      }
    } finally {
      setResponse((r) => ({ ...r, fetching: false }));
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center">
      <div className="card mx-auto w-full max-w-sm bg-base-100 mt-16">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-2">Sign Up</h1>
          <p className="text-center mb-4">
            Already have an account?{" "}
            <Link to="/account/login" className="link link-primary">
              Login here.
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
              disabled={emailProvided}
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
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              autoComplete="new-password"
              required
            />
            <FormErrors
              param="password"
              errors={response.content?.errors ?? []}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              placeholder="confirm password"
              className="input input-bordered"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            <FormErrors param="password2" errors={password2Errors} />
          </div>
          <div className="form-control mt-6">
            <button
              className={`btn btn-primary ${
                response.fetching ? "loading" : ""
              }`}
              onClick={submit}
              disabled={response.fetching}
            >
              Sign Up
            </button>
          </div>

          {hasProviders && !emailProvided && (
            <>
              <div className="divider">Or sign up with a third-party</div>
              <ProviderList callbackURL="/account/provider/callback" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
