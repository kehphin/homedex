/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {},
    },
    plugins: [
      require('@tailwindcss/typography'),
      require('daisyui'),
    ],
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
          ],
    },
  }