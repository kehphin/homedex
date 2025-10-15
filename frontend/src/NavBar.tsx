import { useState, useEffect, useRef } from "react";
import { useUser } from "./auth";
import { useLocation, Link } from "react-router-dom";
import ThemeSelector from "./components/ThemeSelector";
import { KeyIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { getAssetUrl } from "./lib/assetUtils";

function NavBarItem({
  to,
  href,
  icon: Icon,
  name,
}: {
  to?: any;
  href?: string;
  icon: any;
  name: string;
}) {
  const location = useLocation();
  const isActive =
    (href && location.pathname.startsWith(href)) ||
    (to && location.pathname.startsWith(to));
  const cls = `flex items-center px-4 py-2 hover:bg-base-100 ${
    isActive ? "text-primary font-bold" : ""
  }`;

  return (
    <li>
      {href ? (
        <a className={cls} href={href}>
          <Icon className="w-5 h-5 mr-2" /> {name}
        </a>
      ) : (
        <Link className={cls} to={to}>
          <Icon className="w-5 h-5 mr-2" /> {name}
        </Link>
      )}
    </li>
  );
}

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useUser();
  const dropdownRef = useRef(null) as any;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const anonNav = [
    { to: "/account/login", icon: KeyIcon, name: "Login" },
    { to: "/account/signup", icon: UserPlusIcon, name: "Signup" },
  ];

  /// These are example navigation items for people who are authenticated.
  const authNav: any[] = [
    // { to: '/account/email', icon: EnvelopeIcon, name: 'Change Email' },
    // { to: '/account/password/change', icon: LockClosedIcon, name: 'Change Password' },
    // ...(config.data.socialaccount ? [{ to: '/account/providers', icon: UserGroupIcon, name: 'Providers' }] : []),
    // ...(config.data.mfa ? [{ to: '/account/2fa', icon: ShieldCheckIcon, name: 'Two-Factor Authentication' }] : []),
    // ...(config.data.usersessions ? [{ to: '/account/sessions', icon: RocketLaunchIcon, name: 'Sessions' }] : []),
    // { to: '/account/logout', icon: ArrowRightOnRectangleIcon, name: 'Logout' },
  ];

  const navItems = user ? authNav : anonNav;

  return (
    <div className="navbar bg-base-100 fixed top-0 right-0 z-50 border-b border-gray-200 !p-0">
      <div className="navbar-start">
        <div className="dropdown" ref={dropdownRef}>
          {navItems.length > 0 && (
            <>
              <label
                tabIndex={0}
                className="btn btn-ghost lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </label>
              {isMenuOpen && (
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                >
                  {navItems.map((item: any, index: any) => (
                    <NavBarItem key={index} {...item} />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        <Link to="/" className="">
          <img
            src={getAssetUrl("assets/homedex_h.png")}
            alt="Homedex"
            className="h-16 ml-2"
          />
        </Link>
      </div>
      <div className="navbar-end hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {navItems.map((item: any, index: any) => (
            <NavBarItem key={index} {...item} />
          ))}
        </ul>
        <ThemeSelector />
      </div>
    </div>
  );
}
