// One-time setup for running on your own computer (Windows, macOS or Linux):
//   npm run setup
// Creates .env with a random secret if it is missing, creates/updates the database, and adds the
// starter content only when the database has no accounts yet. Safe to run again.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

if (!existsSync(".env")) {
  const env = readFileSync(".env.example", "utf8")
    .replace(/SESSION_SECRET=.*/, `SESSION_SECRET="${randomBytes(32).toString("hex")}"`)
    .replace(/# INSECURE_COOKIE=1/, "INSECURE_COOKIE=1");
  writeFileSync(".env", env);
  console.log("✓ สร้างไฟล์ .env แล้ว");
} else {
  console.log("• มีไฟล์ .env อยู่แล้ว ใช้ของเดิม");
}

run("npx prisma db push --skip-generate");
run("npx prisma generate");

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
const users = await prisma.user.count();
await prisma.$disconnect();
if (users === 0) {
  run("npx tsx prisma/seed.ts");
  console.log("✓ ใส่ข้อมูลตั้งต้นแล้ว — เข้าหลังบ้านด้วย owner@watpamahachai.test / mahachai1234 แล้วเปลี่ยนรหัสผ่านทันที");
} else {
  console.log(`• ฐานข้อมูลมีบัญชีอยู่แล้ว ${users} บัญชี ไม่ใส่ข้อมูลตั้งต้นซ้ำ`);
}
console.log("\nขั้นต่อไป: npm run build แล้ว npm start → เปิด http://localhost:3030");
