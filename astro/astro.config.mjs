import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost/",
  integrations: [tailwind(), react(), mdx()],
  server: {
    host: true,
    // This is needed to access the server from outside the container
    port: 4321, // Make sure this matches the port you've exposed in Docker
  },
  vite: {
    server: {
      watch: {
        usePolling: true, // This might be necessary in some Docker setups
      },
    },
    preview: {
      host: true,
      port: 4321,
      strictPort: true,
    },
  },
  devToolbar: {
    enabled: false,
  },
});
