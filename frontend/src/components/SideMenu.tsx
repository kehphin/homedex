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
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";

export default function SideMenu({
  openFeedbackModal,
}: {
  openFeedbackModal?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const user = useUser();
  const config = useConfig();
  const location = useLocation();

  const sections = [
    {
      title: "",
      items: [
        { to: "/account/dashboard", icon: HomeIcon, name: "Dashboard" },
        { to: "/account/dex", icon: SparklesIcon, name: "Ask Dex™" },
      ],
    },
    // {
    //   title: "Maintenance",
    //   items: [
    //     {
    //       to: "/account/appointments",
    //       icon: CalendarDaysIcon,
    //       name: "Appointments",
    //     },
    //     {
    //       to: "/account/appointment",
    //       icon: CalendarDaysIcon,
    //       name: "Schedule appointment",
    //     },
    //     {
    //       to: "/account/payment/history",
    //       icon: BanknotesIcon,
    //       name: "Payments",
    //     },
    //   ],
    // },
    {
      title: "My Home",
      items: [
        {
          to: "/account/tasks",
          icon: ClipboardDocumentListIcon,
          name: "Tasks",
        },
        {
          to: "/account/home-profile",
          icon: HomeIcon,
          name: "Home Profile",
        },
        {
          to: "/account/maintenance",
          icon: DocumentArrowDownIcon,
          name: "Maintenance History",
        },
        {
          to: "/account/contractors",
          icon: UserGroupIcon,
          name: "Contractors",
        },
        {
          to: "/account/components",
          icon: PuzzlePieceIcon,
          name: "Home Components",
        },
        {
          to: "/account/documents",
          icon: DocumentTextIcon,
          name: "Documents",
        },
      ],
    },
    {
      title: "User",
      items: [
        { to: "/account/email", icon: EnvelopeIcon, name: "Change Email" },
        {
          to: "/account/password/change",
          icon: LockClosedIcon,
          name: "Change Password",
        },
        // ...(config?.data.socialaccount
        //   ? [
        //       {
        //         to: "/account/providers",
        //         icon: UserGroupIcon,
        //         name: "Providers",
        //       },
        //     ]
        //   : []),
        // ...(config?.data.mfa
        //   ? [
        //       {
        //         to: "/account/2fa",
        //         icon: ShieldCheckIcon,
        //         name: "Two-Factor Authentication",
        //       },
        //     ]
        //   : []),
        // ...(config?.data.usersessions
        //   ? [
        //       {
        //         to: "/account/sessions",
        //         icon: RocketLaunchIcon,
        //         name: "Sessions",
        //       },
        //     ]
        //   : []),
        {
          to: "/account/payment/subscriptions",
          icon: CalendarIcon,
          name: "Subscription",
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

  if (!user) return null;

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 btn btn-primary btn-circle"
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
                        className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                          location.pathname === item.to
                            ? "bg-primary text-white shadow-md"
                            : "hover:bg-primary hover:bg-opacity-50 text-base-content"
                        }`}
                        onClick={() =>
                          window.innerWidth < 1024 && setIsOpen(false)
                        }
                      >
                        <item.icon className="h-5 w-5 mr-2" />
                        {item.name}
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
    </>
  );
}
