// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app may break with duplicate plugins:
// - TanStack devtools
// - tanstackStart
// - viteReact
// - tailwindcss
// - tsConfigPaths
// - nitro
// - VITE_* env injection
// - @ path alias
// - React/TanStack dedupe
// - error logger plugins
// - sandbox detection

import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  tanstackStart: {
    // Run EzePro as a client-side SPA so it can be hosted
    // on static hosting such as GitHub Pages.
    spa: {
      enabled: true,
    },

    // Keep the existing Lovable/TanStack server entry.
    server: {
      entry: "server",
    },
  },

  vite: {
    plugins: [mcpPlugin()],
  },
});
