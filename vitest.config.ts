import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["packages/**/test/**/*.test.ts", "scripts/test/**/*.test.mjs"],
    exclude: ["**/node_modules/**", "**/dist/**"]
  }
})
