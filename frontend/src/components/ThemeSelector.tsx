import React, { useState, useEffect } from "react";

const themes: string[] = [
  "homedex",
  "memeratio",
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

const ThemeSelector: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>(
    localStorage.getItem("theme") ||
      document.documentElement.getAttribute("data-theme") ||
      "homedex"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
  };

  return <div></div>;

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost rounded-btn bg-base-100 normal-case"
      >
        Theme
        <svg
          width="12px"
          height="12px"
          className="ml-1 h-3 w-3 fill-current opacity-60 inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] p-2 shadow-2xl bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto"
      >
        {themes.map((theme) => (
          <li
            key={theme}
            className="mb-2"
            onClick={() => handleThemeChange(theme)}
          >
            <div
              className={`cursor-pointer rounded-lg p-2 ${
                currentTheme === theme ? "bg-primary" : "bg-base-100"
              }`}
              data-theme={theme}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-base-content ${
                    currentTheme === theme ? "text-primary-content" : ""
                  }`}
                >
                  {currentTheme === theme && <span className="mr-2">✓</span>}
                  {theme}
                </span>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <div className="w-4 h-4 rounded-full bg-secondary" />
                  <div className="w-4 h-4 rounded-full bg-accent" />
                  <div className="w-4 h-4 rounded-full bg-neutral" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeSelector;
