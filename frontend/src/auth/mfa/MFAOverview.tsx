import { Link, useLoaderData } from "react-router-dom";
import { AuthService } from "../AuthService";
import { Authenticator, RecoveryCodesData } from "../types";
import { AuthenticatorType } from "../constants";

interface LoaderData {
  authenticators: (Authenticator | RecoveryCodesData)[];
}

export async function loader({ params }: { [key: string]: string }) {
  const resp = await AuthService.getAuthenticators();
  return { authenticators: resp.data };
}

export default function MFAOverview() {
  const { authenticators } = useLoaderData() as LoaderData;
  // Use type guard to check if an authenticator is of type TOTP
  const totp = authenticators.find(
    (authenticator): authenticator is Authenticator =>
      authenticator.type === AuthenticatorType.TOTP
  );

  // Use type guard to check if an authenticator is of type RECOVERY_CODES
  const recoveryCodes = authenticators.find(
    (authenticator): authenticator is RecoveryCodesData =>
      authenticator.type === AuthenticatorType.RECOVERY_CODES
  );

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6">Two-Factor Authentication</h1>

        <div className="space-y-8">
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title">Authenticator App</h2>
              {totp ? (
                <>
                  <p className="text-success">
                    Authentication using an authenticator app is active.
                  </p>
                  <div className="card-actions justify-end">
                    <Link
                      to="/account/2fa/totp/deactivate"
                      className="btn btn-sm btn-outline btn-error"
                    >
                      Deactivate
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-warning">
                    An authenticator app is not active.
                  </p>
                  <div className="card-actions justify-end">
                    <Link
                      to="/account/2fa/totp/activate"
                      className="btn btn-sm btn-primary"
                    >
                      Activate
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title">Recovery Codes</h2>
              {!recoveryCodes ? (
                <>
                  <p className="text-warning">No recovery codes set up.</p>
                  <div className="card-actions justify-end">
                    <Link
                      to="/account/2fa/recovery-codes/generate"
                      className="btn btn-sm btn-primary"
                    >
                      Generate
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-success">
                    There are {recoveryCodes.unused_code_count} out of{" "}
                    {recoveryCodes.total_code_count} recovery codes available.
                  </p>
                  <div className="card-actions justify-end">
                    <Link
                      to="/account/2fa/recovery-codes"
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      View
                    </Link>
                    <Link
                      to="/account/2fa/recovery-codes/generate"
                      className="btn btn-sm btn-primary"
                    >
                      Regenerate
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
