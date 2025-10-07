import { useState } from "react";
import { Navigate, useLoaderData } from "react-router-dom";
import FormErrors from "../../components/FormErrors";
import QRCode from "react-qr-code";
import { AuthService } from "../AuthService";
import { TOTPAuthenticatorResponse } from "../types";
import { useUser } from "../hooks";

// this will be visibile in the authenticator app
const EXAMPLE_APP_NAME = "Example";

interface LoaderData {
  totp: TOTPAuthenticatorResponse;
}

interface Response {
  fetching: boolean;
  content: TOTPAuthenticatorResponse | null;
}

export async function loader({
  params,
}: {
  [key: string]: any;
}): Promise<LoaderData> {
  const resp = await AuthService.getTOTPAuthenticator();
  return { totp: resp };
}

export default function ActivateTOTP() {
  const { totp } = useLoaderData() as LoaderData;
  const [code, setCode] = useState("");
  const [response, setResponse] = useState<Response>({
    fetching: false,
    content: null,
  });
  // This grabs the display name of the user for the auth app.
  const user = useUser();

  function submit() {
    setResponse({ ...response, fetching: true });
    AuthService.activateTOTPAuthenticator(code)
      .then((content) => {
        setResponse((r) => {
          return { ...r, content };
        });
      })
      .catch((e) => {
        console.error(e);
        window.alert(e);
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  }

  if (totp.status === 200 || response.content?.status === 200) {
    return <Navigate to="/account/2fa" />;
  }

  // Assuming the TOTP URI is provided in the format: 'otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example'
  const totpUri = `otpauth://totp/${EXAMPLE_APP_NAME}:${user?.display}?secret=${totp.meta?.secret}&issuer=${EXAMPLE_APP_NAME}`;

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="card bg-base-100 border border-gray-200">
          <div className="card-body">
            <h1 className="card-title text-2xl font-bold mb-6">
              Use an Authenticator App
            </h1>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">1. Scan QR Code</h2>
              <div className="flex justify-center bg-white p-4">
                <QRCode value={totpUri} size={200} />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                2. Or enter secret manually
              </h2>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Authenticator secret:</span>
                </label>
                <input
                  type="text"
                  value={totp.meta?.secret}
                  className="input input-bordered"
                  readOnly
                />
                <label className="label">
                  <span className="label-text-alt">
                    You can store this secret and use it to reinstall your
                    authenticator app later.
                  </span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                3. Enter Authenticator Code
              </h2>
              <div className="form-control">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code"
                  className="input input-bordered"
                />
                <FormErrors
                  param="code"
                  errors={response.content?.errors ?? []}
                />
              </div>
            </div>

            <div className="card-actions justify-end">
              <button
                className={`btn btn-primary ${
                  response.fetching ? "loading" : ""
                }`}
                onClick={() => submit()}
                disabled={response.fetching}
              >
                Activate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
