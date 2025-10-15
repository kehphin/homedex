import React, { useEffect } from "react";

const ThemeSelector: React.FC = () => {
  useEffect(() => {
    // Always set and enforce homedex theme
    document.documentElement.setAttribute("data-theme", "homedex");
    localStorage.setItem("theme", "homedex");
  }, []);

  // Component doesn't render anything since theme is fixed
  return null;
};

export default ThemeSelector;
