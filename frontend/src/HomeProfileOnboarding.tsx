import React, { useState, useEffect } from "react";
import { useUser } from "./auth";
import { useLocation, useNavigate } from "react-router-dom";
import * as HomeProfileService from "./components/HomeProfileService";
import { HomeIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function HomeProfileOnboardingCheck() {
  const user = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkHomeProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Don't show modal on certain pages
      const hideOnPages = [
        "/account/home-profile",
        "/account/logout",
        "/account/login",
      ];
      if (hideOnPages.some((page) => location.pathname === page)) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await HomeProfileService.getHomeProfile();
        if (profile) {
          setHasProfile(true);
          setIsLoading(false);
        } else {
          // User has no profile yet
          setHasProfile(false);
          setIsOpen(true);
          setIsLoading(false);
        }
      } catch (error) {
        // Error checking profile, don't block user
        console.error("Error checking home profile:", error);
        setIsLoading(false);
      }
    };

    checkHomeProfile();
  }, [user, location.pathname]);

  const handleNavigateToProfile = () => {
    setIsOpen(false);
    navigate("/account/home-profile");
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  if (isLoading || hasProfile || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <HomeIcon className="h-6 w-6 text-primary-content" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome to Homedex!</h2>
              <p className="text-sm text-gray-600 mt-1">
                Let's get your home set up
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-3">
          <p className="text-gray-700">
            To get started, we need some basic information about your home. This
            will help us provide you with better recommendations and insights.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>What we'll collect:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 ml-2 space-y-1">
              <li>• Address and basic home details</li>
              <li>• Number of bedrooms and bathrooms</li>
              <li>• Heating and cooling systems</li>
              <li>• Year your home was built</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleDismiss} className="btn btn-ghost flex-1">
            I'll do this later
          </button>
          <button
            onClick={handleNavigateToProfile}
            className="btn btn-primary flex-1"
          >
            Set up now
          </button>
        </div>
      </div>
    </div>
  );
}
