import React, { useState, useEffect } from "react";
import { useUser, useConfig } from "../auth";
import { Link, useLocation } from "react-router-dom";
import { getAssetUrl } from "../lib/assetUtils";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  CalendarIcon,
  HomeIcon,
  SparklesIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  PuzzlePieceIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  BellIcon,
  BuildingOfficeIcon,
  PlusIcon,
  CheckIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import NotificationCenter from "../notifications/NotificationCenter";
import * as NotificationsService from "../notifications/NotificationsService";
import * as HomeService from "./HomeService";
import type { Home } from "./HomeService";

export default function SideMenu({
  openFeedbackModal,
}: {
  openFeedbackModal?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [homes, setHomes] = useState<Home[]>([]);
  const [currentHome, setCurrentHome] = useState<Home | null>(null);
  const [showHomeSelector, setShowHomeSelector] = useState(false);
  const [showCreateHome, setShowCreateHome] = useState(false);
  const [newHomeAddress, setNewHomeAddress] = useState("");
  const [newHomeName, setNewHomeName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const user = useUser();
  const config = useConfig();
  const location = useLocation();

  // Load notification summary on mount and poll every 30 seconds
  useEffect(() => {
    const loadNotificationSummary = async () => {
      try {
        const data = await NotificationsService.getNotificationSummary();
        setNotificationCount(data.total || 0);
      } catch (error) {
        console.error("Failed to load notification summary:", error);
      }
    };

    loadNotificationSummary();
    const interval = setInterval(loadNotificationSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load homes on mount
  useEffect(() => {
    const loadHomes = async () => {
      if (!user?.is_superuser) return;

      try {
        const [homesData, currentHomeData] = await Promise.all([
          HomeService.getHomes(),
          HomeService.getCurrentHome(),
        ]);
        setHomes(homesData);
        setCurrentHome(currentHomeData);
      } catch (error) {
        console.error("Failed to load homes:", error);
      }
    };

    loadHomes();
  }, [user]);

  const handleSwitchHome = async (homeId: number) => {
    try {
      const home = await HomeService.switchHome(homeId);
      setCurrentHome(home);
      setShowHomeSelector(false);
      // Reload the page to refresh all data for the new home
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch home:", error);
    }
  };

  const handleCreateHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newHomeAddress.trim()) {
      setCreateError("Address is required");
      return;
    }

    try {
      setIsCreating(true);
      const home = await HomeService.createHome({
        name: newHomeName.trim() || `${newHomeAddress}`,
        address: newHomeAddress.trim(),
        ac: false,
        heat: true,
        is_septic: false,
        is_active: true,
      });

      // Reload homes
      const homesData = await HomeService.getHomes();
      setHomes(homesData);
      setCurrentHome(home);

      // Reset form
      setNewHomeAddress("");
      setNewHomeName("");
      setShowCreateHome(false);
      setShowHomeSelector(false);

      // Reload page to refresh all data
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to create home:", error);
      setCreateError(error.message || "Failed to create home");
    } finally {
      setIsCreating(false);
    }
  };

  const sections = [
    {
      title: "",
      items: [
        { to: "/account/dashboard", icon: HomeIcon, name: "Dashboard" },
        { to: "/account/dex", icon: SparklesIcon, name: "Ask Dex™" },
        { to: "/account/notifications", icon: BellIcon, name: "Notifications" },
      ],
    },
    {
      title: "My Home",
      items: [
        ...(!user?.is_superuser
          ? [
              {
                to: "/account/tasks",
                icon: ClipboardDocumentListIcon,
                name: "Tasks",
              },
            ]
          : []),
        {
          to: "/account/home-profile",
          icon: HomeIcon,
          name: "Home Profile",
        },
        {
          to: "/account/components",
          icon: PuzzlePieceIcon,
          name: "Home Components",
        },
        {
          to: "/account/maintenance",
          icon: DocumentArrowDownIcon,
          name: "Maintenance History",
        },
        {
          to: "/account/documents",
          icon: DocumentTextIcon,
          name: "Documents",
        },
        ...(!user?.is_superuser
          ? [
              {
                to: "/account/contractors",
                icon: UserGroupIcon,
                name: "Contractors",
              },
            ]
          : []),
      ],
    },
    {
      title: "Maintenance",
      items: [
        {
          to: "/account/appointments",
          icon: CalendarDaysIcon,
          name: "Service Appointments",
        },
        {
          to: "/account/payment/history",
          icon: BanknotesIcon,
          name: "Payments",
        },
      ],
    },
    {
      title: "User",
      items: [
        {
          to: "/account/settings",
          icon: CogIcon,
          name: "Settings",
        },
      ],
    },
    {
      title: "",
      items: [
        {
          to: "/account/logout",
          icon: ArrowRightOnRectangleIcon,
          name: "Logout",
        },
      ],
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once to set initial state

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Top bar with notification center */}
      <div className="fixed top-0 right-0 z-50 lg:relative lg:z-0 p-4">
        <NotificationCenter />
      </div>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-40 btn btn-primary btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Side Menu */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:z-30 lg:top-0 lg:pt-0
      `}
      >
        <div className="h-full flex flex-col py-2">
          {/* Logo */}
          <div className="flex justify-center items-center">
            <Link to="/">
              <img
                src={getAssetUrl("assets/homedex_h.png")}
                alt="Homedex"
                className="h-20"
              />
            </Link>
          </div>

          {/* Home Selector for Superusers */}
          {user?.is_superuser && (
            <div className="px-4 pt-2 pb-4 border-b border-slate-200">
              {homes.length > 0 ? (
                <>
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Current Home
                  </div>
                  <button
                    onClick={() => setShowHomeSelector(!showHomeSelector)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BuildingOfficeIcon className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-left min-w-0">
                        <div className="font-medium text-sm truncate">
                          {currentHome?.name || "Select Home"}
                        </div>
                        {currentHome?.address && (
                          <div className="text-xs text-slate-500 truncate">
                            {currentHome.address}
                          </div>
                        )}
                      </div>
                    </div>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${
                        showHomeSelector ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Home Selector Dropdown */}
                  {showHomeSelector && (
                    <div className="mt-2 bg-slate-50 rounded-lg p-2 max-h-64 overflow-y-auto">
                      {homes.map((home) => (
                        <button
                          key={home.id}
                          onClick={() => handleSwitchHome(home.id)}
                          className={`w-full flex items-center justify-between p-2 rounded hover:bg-white transition-colors mb-1 ${
                            home.is_current
                              ? "bg-white ring-2 ring-primary"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <HomeIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div className="text-left min-w-0">
                              <div className="text-sm font-medium truncate">
                                {home.name}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {home.address}
                              </div>
                            </div>
                          </div>
                          {home.is_current && (
                            <CheckIcon className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}

                      {/* Add New Home Button */}
                      <button
                        onClick={() => {
                          setShowCreateHome(true);
                          setShowHomeSelector(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 mt-2 rounded bg-primary text-primary-content hover:bg-primary-focus transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Add New Home
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* No homes yet - show add button */}
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Current Home
                  </div>
                  <button
                    onClick={() => setShowCreateHome(true)}
                    className="w-full flex items-center gap-2 p-3 rounded-lg bg-primary text-primary-content hover:bg-primary-focus transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Add Home</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Menu */}
          <div className="overflow-y-auto flex-1">
            <ul className="menu px-4 w-full">
              {sections.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  <li
                    className={`menu-title ${sectionIndex > 0 ? "mt-4" : ""}`}
                  >
                    <span className="text-neutral">{section.title}</span>
                  </li>
                  {section.items.map((item, itemIndex) => (
                    <li key={`section-${sectionIndex}-item-${itemIndex}`}>
                      <Link
                        to={item.to}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${
                          location.pathname === item.to
                            ? "bg-primary text-white shadow-md"
                            : "hover:bg-primary hover:bg-opacity-50 text-base-content"
                        }`}
                        onClick={() =>
                          window.innerWidth < 1024 && setIsOpen(false)
                        }
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 mr-2" />
                          {item.name}
                        </div>
                        {item.name === "Notifications" &&
                          notificationCount > 0 && (
                            <span
                              className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                                location.pathname === item.to
                                  ? "bg-white text-red-600"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {notificationCount}
                            </span>
                          )}
                      </Link>
                    </li>
                  ))}
                </React.Fragment>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4">
            <button
              className="btn btn-ghost btn-sm w-full h-16 text-xs"
              onClick={openFeedbackModal}
            >
              <span>
                Made with{" "}
                <HeartIcon className="-mt-0.5 inline-block h-4 w-4 text-pink-500" />{" "}
                in Boston
              </span>
              <span>Got feedback? Let us know!</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Home Modal */}
      {showCreateHome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add New Home</h3>
            <form onSubmit={handleCreateHome}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Address <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={newHomeAddress}
                    onChange={(e) => setNewHomeAddress(e.target.value)}
                    placeholder="123 Main St, City, State"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Name (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={newHomeName}
                    onChange={(e) => setNewHomeName(e.target.value)}
                    placeholder="My Home"
                    className="input input-bordered w-full"
                  />
                  <label className="label">
                    <span className="label-text-alt text-slate-500">
                      If not provided, address will be used as name
                    </span>
                  </label>
                </div>

                {createError && (
                  <div className="alert alert-error">
                    <span className="text-sm">{createError}</span>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateHome(false);
                      setCreateError(null);
                      setNewHomeAddress("");
                      setNewHomeName("");
                    }}
                    className="btn btn-ghost"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Home"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
