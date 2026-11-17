// Copies the database and uploaded files to backups/<date-time>/ (npm run backup).
import { cpSync, existsSync, mkdirSync } from "node:fs";

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const dir = `backups/${stamp}`;
mkdirSync(dir, { recursive: true });
if (existsSync("prisma/dev.db")) cpSync("prisma/dev.db", `${dir}/dev.db`);
if (existsSync("uploads")) cpSync("uploads", `${dir}/uploads`, { recursive: true });
console.log(`✓ สำรองข้อมูลไว้ที่ ${dir} — คัดลอกโฟลเดอร์นี้ไปเก็บที่อื่นด้วย (เช่น แฟลชไดรฟ์ หรือ Google Drive)`);
