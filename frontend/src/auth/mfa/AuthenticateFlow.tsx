import { Link, Navigate } from "react-router-dom";
import { pathForFlow } from "../../auth";
import { Flows, AuthenticatorType } from "../constants";
import { useAuthInfo } from "../hooks";

const labels: Record<string, string> = {
  [AuthenticatorType.TOTP]: "Use your authenticator app",
  [AuthenticatorType.RECOVERY_CODES]: "Use a recovery code",
  [AuthenticatorType.WEBAUTHN]: "Use security key",
};

export default function AuthenticateFlow(props: { children: React.ReactNode }) {
  const authInfo = useAuthInfo();

  if (authInfo?.pendingFlow?.id !== Flows.MFA_AUTHENTICATE) {
    return <Navigate to="/" />;
  }
  const flow = authInfo.pendingFlow;

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card w-96 bg-base-100 m-10">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold text-center mb-4">
            Two-Factor Authentication
          </h1>

          <div className="alert alert-info mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Your account is protected by two-factor authentication.</span>
          </div>

          <div className="mb-6">{props.children}</div>

          {flow.types && flow.types.length > 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Alternative Options
              </h2>
              <ul className="menu bg-base-100 rounded-box w-full">
                {flow.types.map((typ) => (
                  <li key={typ}>
                    <Link
                      replace
                      to={pathForFlow(flow, typ)}
                      className="hover:bg-base-300"
                    >
                      {labels[typ]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
