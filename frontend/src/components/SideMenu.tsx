import React, { useState, useEffect } from "react";
import { useUser, useConfig } from "../auth";
import { Link, useLocation } from "react-router-dom";
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

    {
      title: "Maintenance",
      items: [
        {
          to: "/account/appointments",
          icon: CalendarDaysIcon,
          name: "Appointments",
        },
        {
          to: "/account/appointment",
          icon: CalendarDaysIcon,
          name: "Schedule appointment",
        },
        {
          to: "/account/payment/history",
          icon: BanknotesIcon,
          name: "Payments",
        },
      ],
    },
    {
      title: "My Home",
      items: [
        {
          to: "/account/tasks",
          icon: ClipboardDocumentListIcon,
          name: "Tasks",
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
        ...(config?.data.mfa
          ? [
              {
                to: "/account/2fa",
                icon: ShieldCheckIcon,
                name: "Two-Factor Authentication",
              },
            ]
          : []),
        ...(config?.data.usersessions
          ? [
              {
                to: "/account/sessions",
                icon: RocketLaunchIcon,
                name: "Sessions",
              },
            ]
          : []),
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
        fixed inset-y-0 left-0 z-50 w-64 bg-base-100 border-r border-gray-200 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:z-30 lg:top-16 lg:pt-8
      `}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          <ul className="menu p-4 w-full">
            {sections.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <li className={`menu-title ${sectionIndex > 0 ? "mt-4" : ""}`}>
                  <span className="text-neutral">{section.title}</span>
                </li>
                {section.items.map((item, itemIndex) => (
                  <li key={`section-${sectionIndex}-item-${itemIndex}`}>
                    <Link
                      to={item.to}
                      className={`flex items-center p-2 hover:bg-base-300 rounded-lg ${
                        location.pathname === item.to
                          ? "bg-base-300 text-primary"
                          : ""
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
          <div className="mt-auto p-4">
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
