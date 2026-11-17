import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const file = () => process.env.TEST_DB_FILE!;
const clean = () => {
  for (const f of [file(), `${file()}-journal`, `${file()}-uploads`]) rmSync(`prisma/${f}`, { force: true, recursive: true });
};

export default function setup() {
  clean();
  execSync("npx prisma db push --skip-generate", { env: { ...process.env, DATABASE_URL: `file:./${file()}` }, stdio: "ignore" });
  return clean; // teardown
}
