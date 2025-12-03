/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx,jsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        homedex: {
          primary: "#528050",
          "primary-focus": "#1daf8b",
          "primary-content": "#ffffff",

          secondary: "#2F4C2E",
          "secondary-focus": "#bd0091",
          "secondary-content": "#ffffff",

          accent: "#37cdbe",
          "accent-focus": "#2ba69a",
          "accent-content": "#ffffff",

          neutral: "#3b424e",
          "neutral-focus": "#2a2e37",
          "neutral-content": "#ffffff",

          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#ced3d9",
          "base-content": "#1e2734",

          info: "#1c92f2",
          success: "#009485",
          warning: "#ff9900",
          error: "#ff5724",

          "--rounded-box": "1rem",
          "--rounded-btn": ".5rem",
          "--rounded-badge": "1.9rem",

          "--animation-btn": ".25s",
          "--animation-input": ".2s",

          "--btn-text-case": "uppercase",
          "--navbar-padding": ".5rem",
          "--border-btn": "1px",
        },
      },
    ],
    darkMode: false,
  },
};
