import React, { ReactNode, useState } from "react";
import { useUser } from "./auth";
import SideMenu from "./components/SideMenu";
import { Outlet, useLocation } from "react-router-dom";
import { FeedbackModal } from "./components/FeedbackModal";
import { HomeProfileOnboardingCheck } from "./HomeProfileOnboarding";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LayoutProps {
  children: ReactNode;
  toggleFeedbackModal?: () => void;
}

const AuthenticatedLayout: React.FC<LayoutProps> = ({
  children,
  toggleFeedbackModal,
}) => (
  <div className="flex flex-1 bg-slate-100">
    <SideMenu openFeedbackModal={toggleFeedbackModal} />
    <main className="lg:ml-64 flex-1 p-6">{children}</main>
  </div>
);

const DefaultLayout: React.FC<LayoutProps> = ({ children }) => (
  <main className="flex-1 bg-slate-100">{children}</main>
);

const isAuthenticatedRoute = (pathname: string): boolean => {
  return (
    pathname.startsWith("/account") &&
    pathname !== "/account/login" &&
    pathname !== "/account/signup" &&
    pathname !== "/account/password/reset"
  );
};

export default function Root() {
  const user = useUser();
  const location = useLocation();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const toggleFeedbackModal = () => {
    setIsFeedbackModalOpen(!isFeedbackModalOpen);
  };

  const Layout =
    user && isAuthenticatedRoute(location.pathname)
      ? AuthenticatedLayout
      : DefaultLayout;

  return (
    <div
      className="flex flex-col min-h-screen bg-slate-100"
      data-theme="homedex"
    >
      <Layout toggleFeedbackModal={toggleFeedbackModal}>
        <Outlet />
      </Layout>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={toggleFeedbackModal}
      />
      <HomeProfileOnboardingCheck />
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
