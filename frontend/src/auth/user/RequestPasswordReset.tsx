import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormErrors from "../../components/FormErrors";
import { AuthService } from "../AuthService";
import { AuthState } from "../types";

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [response, setResponse] = useState<{
    fetching: boolean;
    content: AuthState | null;
  }>({
    fetching: false,
    content: null,
  });

  const submit = async () => {
    setResponse((r) => ({ ...r, fetching: true }));
    try {
      const content = await AuthService.requestPasswordReset(email);
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
    <div className="min-h-screen bg-base-100 flex items-center">
      <div className="card mx-auto w-full max-w-sm bg-base-100 m-10">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-2">
            Reset Password
          </h1>

          {response.content?.status === 200 ? (
            <div className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Password reset email sent.</span>
            </div>
          ) : (
            <>
              <p className="text-center mb-4">
                Remember your password?{" "}
                <Link to="/account/login" className="link link-primary">
                  Back to login.
                </Link>
              </p>

              <FormErrors errors={response.content?.errors ?? []} />

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input input-bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FormErrors
                  param="email"
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
                  Reset Password
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
