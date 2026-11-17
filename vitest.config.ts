import { defineConfig } from "vitest/config";
import path from "node:path";

// One throwaway SQLite file per test run.
const TEST_DB = (process.env.TEST_DB_FILE ??= `test-${process.pid}.db`);

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src"), "server-only": path.resolve(__dirname, "src/lib/empty.ts") } },
  test: {
    env: { DATABASE_URL: `file:./${TEST_DB}`, SESSION_SECRET: "test-secret-test-secret-test-secret", UPLOAD_DIR: `prisma/${TEST_DB}-uploads` },
    globalSetup: "./vitest.setup.ts",
    fileParallelism: false,
  },
});
