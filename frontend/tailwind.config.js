/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx,jsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
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
      "dim",
      "nord",
      "sunset",
      {
        homedex: {
          primary: "#088116",
          "primary-focus": "#1daf8b",
          "primary-content": "#ffffff",

          secondary: "#f000b8",
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
      {
        memeratio: {
          // Base colors
          "base-100": "oklch(98% 0.003 247.858)",
          "base-200": "oklch(96% 0.007 247.896)",
          "base-300": "oklch(92% 0.013 255.508)",
          "base-content": "oklch(20% 0.042 265.755)",

          // Primary
          primary: "oklch(55% 0.016 285.938)",
          "primary-content": "oklch(98% 0 0)",

          // Secondary
          secondary: "oklch(62% 0.265 303.9)",
          "secondary-content": "oklch(97% 0.014 308.299)",

          // Accent
          accent: "oklch(70% 0.14 182.503)",
          "accent-content": "oklch(98% 0.014 180.72)",

          // Neutral
          neutral: "oklch(27% 0.041 260.031)",
          "neutral-content": "oklch(98% 0.003 247.858)",

          // State colors
          info: "oklch(71% 0.143 215.221)",
          "info-content": "oklch(98% 0.019 200.873)",

          success: "oklch(76% 0.233 130.85)",
          "success-content": "oklch(98% 0.031 120.757)",

          warning: "oklch(70% 0.213 47.604)",
          "warning-content": "oklch(98% 0.016 73.684)",

          error: "oklch(64% 0.246 16.439)",
          "error-content": "oklch(96% 0.015 12.422)",

          // Optional custom vars
          "--radius-selector": "0.25rem",
          "--radius-field": "0.5rem",
          "--radius-box": "1rem",
          "--size-selector": "0.25rem",
          "--size-field": "0.25rem",
          "--border": "1px",
          "--depth": "1",
          "--noise": "1",
        },
      },
    ],
  },
};
