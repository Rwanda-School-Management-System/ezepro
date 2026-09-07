import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
    },

    server: {
      entry: "server",
    },
  },

  vite: {
    plugins: [mcpPlugin()],
  },
});
