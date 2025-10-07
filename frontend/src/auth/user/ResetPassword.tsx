import React, { useState } from "react";
import { Navigate, Link, useLoaderData } from "react-router-dom";
import FormErrors from "../../components/FormErrors";
import { AuthService } from "../AuthService";
import {
  PasswordResetResponse,
  ApiError,
  ResetPasswordData,
  AuthState,
} from "../types";

interface LoaderData {
  key: string;
  keyResponse: PasswordResetResponse;
}

export async function loader({
  params,
}: {
  params: { key: string };
}): Promise<LoaderData> {
  const key = params.key;
  const resp = await AuthService.getPasswordReset(key);
  return { key, keyResponse: resp };
}

const ResetPassword: React.FC = () => {
  const { key, keyResponse } = useLoaderData() as LoaderData;

  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [password2Errors, setPassword2Errors] = useState<ApiError[]>([]);

  const [response, setResponse] = useState<{
    fetching: boolean;
    content: AuthState | null;
  }>({
    fetching: false,
    content: null,
  });

  const submit = async () => {
    if (password2 !== password1) {
      setPassword2Errors([
        { param: "password2", message: "Password does not match." },
      ]);
      return;
    }
    setPassword2Errors([]);
    setResponse((r) => ({ ...r, fetching: true }));

    try {
      const resetData: ResetPasswordData = { key, password: password1 };
      const resp = await AuthService.resetPassword(resetData);
      setResponse((r) => ({ ...r, content: resp }));
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        window.alert(e.message);
      }
    } finally {
      setResponse((r) => ({ ...r, fetching: false }));
    }
  };

  if ([200, 401].includes(response.content?.status ?? 0)) {
    return <Navigate to="/account/login" />;
  }

  let body;
  if (keyResponse.status !== 200) {
    body = <FormErrors param="key" errors={keyResponse.errors ?? []} />;
  } else {
    body = (
      <>
        <div className="form-control">
          <label className="label">
            <span className="label-text">New Password</span>
          </label>
          <input
            type="password"
            placeholder="New password"
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
            <span className="label-text">Confirm New Password</span>
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="input input-bordered"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          <FormErrors param="password2" errors={password2Errors} />
        </div>
        <div className="form-control mt-6">
          <button
            className={`btn btn-primary ${response.fetching ? "loading" : ""}`}
            onClick={submit}
            disabled={response.fetching}
          >
            Reset Password
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center">
      <div className="card mx-auto w-full max-w-sm shadow-2xl bg-base-100 border border-gray-200">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-2">
            Reset Password
          </h1>
          <p className="text-center mb-4">
            Remember your password?{" "}
            <Link to="/account/login" className="link link-primary">
              Back to login.
            </Link>
          </p>
          {body}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
