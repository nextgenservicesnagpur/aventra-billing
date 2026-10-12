import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "@", replacement: path.join(root, "src") },
      // Mirror the bundler's `react-server` condition so server-only
      // modules load their empty variant under Vitest, exactly as they
      // do inside Server Components. Production behavior is unchanged.
      {
        find: /^server-only$/,
        replacement: path.join(root, "node_modules", "server-only", "empty.js"),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
