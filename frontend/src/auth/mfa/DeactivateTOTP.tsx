import { useState } from "react";
import { AuthService } from "../AuthService";
import { Navigate } from "react-router-dom";
import { StatusMessageResponse } from "../types";

interface Response {
  fetching: boolean;
  content: StatusMessageResponse | null;
}

export default function DeactivateTOTP() {
  const [response, setResponse] = useState<Response>({
    fetching: false,
    content: null,
  });

  function submit() {
    setResponse({ ...response, fetching: true });
    AuthService.deactivateTOTPAuthenticator()
      .then((content) => {
        setResponse((r) => {
          return { ...r, content };
        });
      })
      .catch((e) => {
        console.error(e);
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  }

  if (response.content?.status === 200) {
    return <Navigate to="/account/2fa" />;
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold text-center mb-4">
            Deactivate Authenticator App
          </h1>

          <div className="alert alert-warning mb-4">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              You are about to deactivate authenticator app based
              authentication. Are you sure?
            </span>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              className="btn btn-ghost"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              className={`btn btn-error ${response.fetching ? "loading" : ""}`}
              onClick={() => submit()}
              disabled={response.fetching}
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
