import React, { useState } from "react";
import FormErrors from "../../components/FormErrors";
import { AuthService } from "../AuthService";
import { Flows, AuthenticatorType } from "../constants";
import { Link, useLocation } from "react-router-dom";
import { pathForFlow } from "../../auth";
import { AuthState, AuthFlow } from "../types";

interface FlowLabels {
  [key: string]: string;
}

const flowLabels: FlowLabels = {
  [Flows.REAUTHENTICATE]: "Use your password",
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.TOTP}`]:
    "Use your authenticator app",
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.RECOVERY_CODES}`]:
    "Use a recovery code",
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.WEBAUTHN}`]:
    "Use security key",
};

interface Method {
  label: string;
  id: string;
  path: string;
}

function flowsToMethods(flows: AuthFlow[]): Method[] {
  const methods: Method[] = [];
  flows.forEach((flow) => {
    if (flow.id === Flows.MFA_REAUTHENTICATE) {
      flow.types?.forEach((typ) => {
        const id = `${flow.id}:${typ}`;
        methods.push({
          label: flowLabels[id] || id,
          id,
          path: pathForFlow(flow, typ),
        });
      });
    } else {
      methods.push({
        label: flowLabels[flow.id] || flow.id,
        id: flow.id,
        path: pathForFlow(flow),
      });
    }
  });
  return methods;
}

interface ReauthenticateFlowProps {
  children: React.ReactNode;
  method?: string;
}

export function ReauthenticateFlow({
  children,
  method,
}: ReauthenticateFlowProps) {
  const location = useLocation();
  const reauth = location.state?.reauth as AuthState | undefined;

  const methods = reauth?.data?.flows ? flowsToMethods(reauth.data.flows) : [];

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="card bg-base-100">
          <div className="card-body">
            <h1 className="card-title text-2xl font-bold mb-4">
              Confirm Access
            </h1>
            <p className="mb-6">
              Please reauthenticate to safeguard your account.
            </p>
            <div className="mb-6">{children}</div>

            {methods.length > 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Alternative Options
                </h2>
                <ul className="menu bg-base-100 rounded-box">
                  {methods
                    .filter((m) => m.id !== method)
                    .map((m) => (
                      <li key={m.id}>
                        <Link
                          replace
                          state={location.state}
                          to={m.path + location.search}
                          className="hover:bg-base-300"
                        >
                          {m.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Reauthenticate() {
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState<{
    fetching: boolean;
    content: AuthState | null;
  }>({
    fetching: false,
    content: null,
  });

  const submit = async () => {
    setResponse({ ...response, fetching: true });
    try {
      const content = await AuthService.reauthenticate({ password });
      setResponse((r) => ({ ...r, content }));
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
    <ReauthenticateFlow method={Flows.REAUTHENTICATE}>
      <div className="space-y-4">
        <FormErrors errors={response.content?.errors ?? []} />

        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FormErrors
            param="password"
            errors={response.content?.errors ?? []}
          />
        </div>

        <button
          className={`btn btn-primary w-full ${
            response.fetching ? "loading" : ""
          }`}
          disabled={response.fetching}
          onClick={submit}
        >
          Confirm
        </button>
      </div>
    </ReauthenticateFlow>
  );
}
