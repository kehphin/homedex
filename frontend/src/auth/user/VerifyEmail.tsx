import { useState, useEffect, useCallback } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { AuthService } from "../AuthService";
import { AuthState, EmailVerificationInfo } from "../types";
import { REDIRECT_URLs } from "../constants";
import { pathForPendingFlow } from "../routing";

interface LoaderData {
  key: string;
  verification: EmailVerificationInfo;
}

interface Response {
  fetching: boolean;
  content: AuthState | null;
}

export async function loader({
  params,
}: {
  params: { key: string };
}): Promise<LoaderData> {
  const key = params.key;
  const resp = await AuthService.getEmailVerification(key);
  return { key, verification: resp };
}

export default function VerifyEmail() {
  const { key, verification } = useLoaderData() as LoaderData;
  const [response, setResponse] = useState<Response>({
    fetching: false,
    content: null,
  });
  const navigate = useNavigate();

  const submit = useCallback(() => {
    setResponse((prevResponse) => ({ ...prevResponse, fetching: true }));

    AuthService.verifyEmail(key)
      .then((content) => {
        setResponse((r) => {
          return { ...r, content };
        });
        console.log("Verification response:", content);
        if (content.status === 200) {
          // Successful verification
          navigate(
            `${REDIRECT_URLs.LOGIN_URL}?email=${verification.data.email}`
          );
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
              console.error("No path found for pending flow:", pendingFlow);
            }
          }
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  }, [key, navigate]);

  useEffect(() => {
    // Automatically verify email if the verification info is valid
    if (verification.status === 200 && !response.content) {
      submit();
    }
  }, [verification.status, response.content, submit]);

  if ([200].includes(response.content?.status ?? 0)) {
    navigate(`${REDIRECT_URLs.LOGIN_URL}?email=${verification.data.email}`);

    return;
  }

  let body = null;
  if (verification.status === 200) {
    body = (
      <>
        <p className="mb-4">
          Verifying email address{" "}
          <a
            href={"mailto:" + verification.data.email}
            className="link link-primary"
          >
            {verification.data.email}
          </a>{" "}
          for user {verification.data.user.display}...
        </p>
        {response.fetching && (
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
      </>
    );
  } else if (!verification.data?.email) {
    body = (
      <div className="alert alert-error">
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
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Invalid verification link.</span>
      </div>
    );
  } else {
    body = (
      <div className="alert alert-warning">
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
          Unable to confirm email{" "}
          <a
            href={"mailto:" + verification.data.email}
            className="link link-primary"
          >
            {verification.data.email}
          </a>{" "}
          because it is already confirmed.
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card w-96 bg-base-100">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold mb-4">
            Confirm Email Address
          </h1>
          {body}
        </div>
      </div>
    </div>
  );
}
