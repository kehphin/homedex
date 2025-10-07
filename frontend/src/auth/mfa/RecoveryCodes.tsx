import { useLoaderData } from "react-router-dom";
import { AuthService } from "../AuthService";
import { RecoveryCodesResponse } from "../types";

interface LoaderData {
  recoveryCodes: RecoveryCodesResponse;
}
export async function loader({
  params,
}: {
  params: { key: string };
}): Promise<LoaderData> {
  const resp = await AuthService.getRecoveryCodes();
  return { recoveryCodes: resp };
}

export default function RecoveryCodes() {
  const { recoveryCodes } = useLoaderData() as LoaderData;

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="card bg-base-100 shadow-xl border border-gray-200">
          <div className="card-body">
            <h1 className="card-title text-2xl font-bold mb-4">
              Recovery Codes
            </h1>

            {recoveryCodes.status === 200 && recoveryCodes.data ? (
              <>
                <div className="alert alert-info mb-4">
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
                  <span>
                    There are {recoveryCodes.data.unused_code_count} out of{" "}
                    {recoveryCodes.data.total_code_count} recovery codes
                    available.
                  </span>
                </div>
                <div className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {recoveryCodes.data.unused_codes.join("\n")}
                  </pre>
                </div>
                <div className="alert alert-warning mt-4">
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
                    Keep these codes safe and secure. They are your backup
                    method for account recovery.
                  </span>
                </div>
              </>
            ) : (
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
                <span>No recovery codes set up.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
