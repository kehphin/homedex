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

import ManageProviders from "./auth/social/ManageProviders";
import VerifyEmail, {
  loader as verifyEmailLoader,
} from "./auth/user/VerifyEmail";
import VerificationEmailSent from "./auth/user/VerificationEmailSent";
import RequestPasswordReset from "./auth/user/RequestPasswordReset";
import Settings from "./auth/user/Settings";
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
import SampleProtectedFile from "./samples/SampleProtectedFile";
import SampleProtectedSubscription from "./samples/SampleRequiresSubscription";
import AskDex from "./dex/AskDex";
import ScheduleAppointment from "./appointments/ScheduleAppointment";
import Appointments from "./appointments/Appointments";
import Tasks from "./tasks/Tasks";
import HomeComponents from "./components/HomeComponents";
import Documents from "./documents/Documents";
import MaintenanceHistory from "./maintenance/MaintenanceHistory";
import Contractors from "./contractors/Contractors";
import HomeProfilePage from "./components/HomeProfile";
import Notifications from "./notifications/Notifications";
import { Navigate } from "react-router-dom";

function createRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "/",
          element: <Navigate to="/account/dashboard" replace />,
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
          path: "/account/home-profile",
          element: (
            <AuthenticatedRoute>
              <HomeProfilePage />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/appointments",
          element: (
            <AuthenticatedRoute>
              <Appointments />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/appointment",
          element: (
            <AuthenticatedRoute>
              <ScheduleAppointment />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/tasks",
          element: (
            <AuthenticatedRoute>
              <Tasks />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/notifications",
          element: (
            <AuthenticatedRoute>
              <Notifications />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/components",
          element: (
            <AuthenticatedRoute>
              <HomeComponents />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/documents",
          element: (
            <AuthenticatedRoute>
              <Documents />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/maintenance",
          element: (
            <AuthenticatedRoute>
              <MaintenanceHistory />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/contractors",
          element: (
            <AuthenticatedRoute>
              <Contractors />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/login",
          element: <Login />,
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
          path: "/account/settings",
          element: (
            <AuthenticatedRoute>
              <Settings />
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

        // SAMPLE ROUTES
        {
          path: "/account/owner/protected_file",
          element: (
            <AuthenticatedRoute>
              <SampleProtectedFile />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "/account/owner/protected_subscription",
          element: (
            <AuthenticatedRoute>
              <SampleProtectedSubscription />
            </AuthenticatedRoute>
          ),
        },
        {
          path: "*",
          element: <Navigate to="/account/dashboard" replace />, // Handle 404s with redirect to dashboard.
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
