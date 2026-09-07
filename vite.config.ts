```ts
// @lovable.dev/vite-tanstack-config already includes the required
// TanStack Start, React, Tailwind, Nitro, path aliases, and other plugins.

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
```
