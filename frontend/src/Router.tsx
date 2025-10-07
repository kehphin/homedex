// @ts-nocheck
import { useState, useEffect } from "react";
import { AnonymousRoute, AuthenticatedRoute } from "./auth";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./auth/user/Login";
import Logout from "./auth/user/Logout";
import Signup from "./auth/user/Signup";
import ProviderSignup from "./auth/social/ProviderSignup";
import ProviderCallback from "./auth/social/ProviderCallback";
import ChangeEmail from "./auth/user/ChangeEmail";
import ManageProviders from "./auth/social/ManageProviders";
import VerifyEmail, {
  loader as verifyEmailLoader,
} from "./auth/user/VerifyEmail";
import VerificationEmailSent from "./auth/user/VerificationEmailSent";
import RequestPasswordReset from "./auth/user/RequestPasswordReset";
import ChangePassword from "./auth/user/ChangePassword";
import MFAOverview, {
  loader as mfaOverviewLoader,
} from "./auth/mfa/MFAOverview";
import ActivateTOTP, {
  loader as activateTOTPLoader,
} from "./auth/mfa/ActivateTOTP";
import DeactivateTOTP from "./auth/mfa/DeactivateTOTP";
import RecoveryCodes, {
  loader as recoveryCodesLoader,
} from "./auth/mfa/RecoveryCodes";
import GenerateRecoveryCodes, {
  loader as generateRecoveryCodesLoader,
} from "./auth/mfa/GenerateRecoveryCodes";
import ResetPassword, {
  loader as resetPasswordLoader,
} from "./auth/user/ResetPassword";
import AuthenticateTOTP from "./auth/mfa/AuthenticateTOTP";
import AuthenticateRecoveryCodes from "./auth/mfa/AuthenticateRecoveryCodes";
import ReauthenticateRecoveryCodes from "./auth/mfa/ReauthenticateRecoveryCodes";
import ReauthenticateTOTP from "./auth/mfa/ReauthenticateTOTP";
import { Reauthenticate } from "./auth/user/Reauthenticate";
import Sessions from "./auth/user/Sessions";
import PaymentSuccess from "./payments/PaymentSuccess";
import PaymentCancel from "./payments/PaymentCancel";
import PaymentHistory from "./payments/PaymentHistory";

import Root from "./Root";
import ActiveSubscriptions from "./payments/ActiveSubscriptions";
import SampleProtectedFile from "./samples/SampleProtectedFile";
import SampleProtectedSubscription from "./samples/SampleRequiresSubscription";
import AskDex from "./dex/AskDex";

function RedirectToAstro() {
  useEffect(() => {
    window.location.href = "/";
  }, []);
  return null;
}

function createRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "/",
          element: <RedirectToAstro />,
        },
        {
          path: "/account/dashboard",
          element: (
            <AuthenticatedRoute>
              <Dashboard />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/dex",
          element: (
            <AuthenticatedRoute>
              <AskDex />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/login",
          element: <Login />,
        },
        {
          path: "/account/email",
          element: (
            <AuthenticatedRoute>
              <ChangeEmail />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/logout",
          element: <Logout />,
        },
        {
          path: "/account/provider/callback",
          element: <ProviderCallback />,
        },
        {
          path: "/account/provider/signup",
          element: (
            <AnonymousRoute>
              <ProviderSignup />
            </AnonymousRoute>
          ),
        },
        {
          path: "/account/providers",
          element: (
            <AuthenticatedRoute>
              <ManageProviders />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/signup",
          element: <Signup />,
        },
        {
          path: "/account/verify-email",
          element: <VerificationEmailSent />,
        },
        {
          path: "/account/verify-email/:key",
          element: <VerifyEmail />,
          loader: verifyEmailLoader,
        },
        {
          path: "/account/password/reset",
          element: <RequestPasswordReset />,
        },
        {
          path: "/account/password/reset/key/:key",
          element: <ResetPassword />,
          loader: resetPasswordLoader,
        },
        {
          path: "/account/password/change",
          element: (
            <AuthenticatedRoute>
              <ChangePassword />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/2fa",
          element: (
            <AuthenticatedRoute>
              <MFAOverview />
            </AuthenticatedRoute>
          ),
          loader: mfaOverviewLoader,
        },
        {
          path: "/account/reauthenticate",
          element: (
            <AuthenticatedRoute>
              <Reauthenticate />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/reauthenticate/totp",
          element: (
            <AuthenticatedRoute>
              <ReauthenticateTOTP />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/reauthenticate/recovery-codes",
          element: (
            <AuthenticatedRoute>
              <ReauthenticateRecoveryCodes />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/authenticate/totp",
          element: <AuthenticateTOTP />,
        },
        {
          path: "/account/authenticate/recovery-codes",
          element: <AuthenticateRecoveryCodes />,
        },
        {
          path: "/account/2fa/totp/activate",
          element: (
            <AuthenticatedRoute>
              <ActivateTOTP />
            </AuthenticatedRoute>
          ),
          loader: activateTOTPLoader,
        },
        {
          path: "/account/2fa/totp/deactivate",
          element: (
            <AuthenticatedRoute>
              <DeactivateTOTP />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/2fa/recovery-codes",
          element: (
            <AuthenticatedRoute>
              <RecoveryCodes />
            </AuthenticatedRoute>
          ),
          loader: recoveryCodesLoader,
        },
        {
          path: "/account/2fa/recovery-codes/generate",
          element: (
            <AuthenticatedRoute>
              <GenerateRecoveryCodes />
            </AuthenticatedRoute>
          ),
          loader: generateRecoveryCodesLoader,
        },
        {
          path: "/account/sessions",
          element: (
            <AuthenticatedRoute>
              <Sessions />
            </AuthenticatedRoute>
          ),
        },

        // If the user is authenticated when they make the purchases, you can
        // use the account routes instead of the payment routes to route to
        // the dashboard as the callback
        {
          path: "/account/success",
          element: (
            <AuthenticatedRoute>
              <PaymentSuccess />
            </AuthenticatedRoute>
          ),
        },
        // Unauthenticated version
        {
          path: "/payment/success",
          element: (
            <AnonymousRoute>
              <PaymentSuccess />
            </AnonymousRoute>
          ),
        },
        {
          path: "/payment/cancel",
          element: (
            <AnonymousRoute>
              <PaymentCancel />
            </AnonymousRoute>
          ),
        },
        {
          path: "/account/payment/history",
          element: (
            <AuthenticatedRoute>
              <PaymentHistory />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/payment/subscriptions",
          element: (
            <AuthenticatedRoute>
              <ActiveSubscriptions />
            </AuthenticatedRoute>
          ),
        },

        // SAMPLE ROUTES
        {
          path: "/account/sample/protected_file",
          element: (
            <AuthenticatedRoute>
              <SampleProtectedFile />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/sample/protected_subscription",
          element: (
            <AuthenticatedRoute>
              <SampleProtectedSubscription />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "*",
          element: <RedirectToAstro />, // Handle 404s with redirect to home.
        },
      ],
    },
  ]);
}

export default function Router() {
  // If we create the router globally, the loaders of the routes already trigger
  // even before the <AuthContext/> trigger the initial loading of the auth.
  // state.
  const [router, setRouter] = useState(null);
  useEffect(() => {
    setRouter(createRouter());
  }, []);
  return router ? <RouterProvider router={router} /> : null;
}
