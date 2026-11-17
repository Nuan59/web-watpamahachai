# วัดป่ามหาไชย — เว็บไซต์และระบบหลังบ้าน

Next.js app เดียว มีสองฝั่ง:

- **หน้าเว็บสาธารณะ** (`/`): หน้าแรก, ประวัติวัด, แนวทางปฏิบัติธรรม, ตารางกิจวัตร, กิจกรรม (ลงทะเบียนออนไลน์ได้), ข่าวสาร, เสียงธรรมและโอวาท, คลังภาพ, คำถามที่พบบ่อย, ร่วมทำบุญ, ติดต่อ/แผนที่ (มีฟอร์มส่งข้อความ), หน้าเนื้อหาที่สร้างเอง (`/p/...`), sitemap และ robots
- **ระบบหลังบ้าน** (`/admin`): ภาพรวม, ผู้ลงทะเบียน (ยืนยัน/ยกเลิก, ดาวน์โหลด CSV เปิดใน Excel ได้), ข้อความติดต่อ, ข่าวสาร (Markdown + ดูตัวอย่าง + รูปปก), กิจกรรม (จำนวนรับ, เปิด/ปิดลงทะเบียน), ตารางกิจวัตร, เสียงธรรม (อัปโหลดไฟล์หรือใส่ลิงก์ Google Drive) และโอวาทธรรม, คลังภาพ (อัปโหลดทีละหลายภาพ), คำถามที่พบบ่อย, หน้าเนื้อหา, ข้อมูลวัด, ผู้ใช้และสิทธิ์รายส่วน, ประวัติการใช้งาน

Stack: Next.js 15 (App Router) + TypeScript + Tailwind 4 + Prisma 6 (SQLite, ย้ายไป Postgres ได้) + vitest เหมือนโปรเจกต์ EzyRide และ NP AI POS

## วิธีรัน

```bash
npm install
cp .env.example .env          # ตั้ง SESSION_SECRET เป็นข้อความสุ่มยาว ๓๒ ตัวขึ้นไป และ SITE_URL
npx prisma db push            # สร้าง prisma/dev.db
npm run seed                  # ข้อมูลตั้งต้น (ไม่ยอมรันถ้ามีบัญชีอยู่แล้ว; SEED_RESET=1 = ล้างแล้วใส่ใหม่)
# หรือแทนสามบรรทัดบน: npm run setup
npm run dev                   # http://localhost:3030   (หรือ npm run build && npm start)
```

## ติดตั้งบนคอมพิวเตอร์ของตัวเอง (Windows / Mac / Linux)

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 20 ขึ้นไป (เลือก LTS) และ Git

```bash
git clone https://github.com/Nuan59/web-watpamahachai.git
cd web-watpamahachai
git checkout claude/quirky-bell-f249rx
npm install
npm run setup      # สร้าง .env + ฐานข้อมูล + ข้อมูลตั้งต้น (รันซ้ำได้ ไม่ลบข้อมูล)
npm run build
npm start          # เปิด http://localhost:3030
```

- เปิดจากมือถือหรือเครื่องอื่นในบ้าน/วัด (Wi-Fi เดียวกัน): ใช้ `http://<IP ของคอมเครื่องนี้>:3030` (ดู IP ด้วย `ipconfig` บน Windows หรือ `ipconfig getifaddr en0` บน Mac) ถ้าเปิดไม่ได้ ให้อนุญาต Node.js ใน Firewall
- ปิดหน้าต่าง terminal = เว็บหยุด ถ้าอยากให้รันค้างไว้ ใช้ `npx pm2 start npm --name wat -- start`
- สำรองข้อมูล: `npm run backup` (คัดลอกฐานข้อมูลและรูป/เสียงไปที่ `backups/`) แล้วเอาโฟลเดอร์นั้นไปเก็บที่อื่นด้วย
- อัปเดตโค้ดใหม่: `git pull` → `npm install` → `npm run setup` → `npm run build` → `npm start` (ข้อมูลเดิมไม่หาย)
- จะเปิดให้คนนอกเข้าทางอินเทอร์เน็ต ต้องมีโดเมนและ HTTPS ก่อน (เช่น Cloudflare Tunnel) แล้วลบบรรทัด `INSECURE_COOKIE=1` ใน `.env`

## บัญชีตั้งต้น (จาก seed)

รหัสผ่านทุกบัญชี: `mahachai1234` (เปลี่ยนได้ด้วย `SEED_PASSWORD=...` ตอน seed) — **เปลี่ยนรหัสผ่านทันทีหลังติดตั้งจริง** ที่เมนู “เปลี่ยนรหัสผ่าน”

| บทบาท | อีเมล | ทำอะไรได้ |
|---|---|---|
| เจ้าของระบบ (OWNER) | owner@watpamahachai.test | ทุกอย่าง รวมข้อมูลวัด บัญชีผู้ใช้ และสิทธิ์ |
| เจ้าหน้าที่วัด (ADMIN) | office@watpamahachai.test | เนื้อหาทั้งหมด ผู้ลงทะเบียน ข้อความติดต่อ ไม่เข้าข้อมูลวัดและบัญชีผู้ใช้ |
| อาสาสมัครดูแลเนื้อหา (EDITOR) | editor@watpamahachai.test | เขียนข่าว อัปโหลดภาพและเสียงธรรม ดูกิจกรรม ลบอะไรไม่ได้ |

เจ้าของระบบปรับสิทธิ์ ดู/เพิ่ม/แก้ไข/ลบ ของแต่ละบัญชีรายส่วนได้ที่ **ผู้ใช้และสิทธิ์** ทุกหน้าและทุก server action ในหลังบ้านตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ (`requirePerm`) และ `src/lib/rbac-coverage.test.ts` จะล้มถ้ามีหน้าไหนลืมตรวจ

## ตรวจงาน

```bash
npm run typecheck
npm run lint
npm test                      # vitest ใช้ไฟล์ SQLite ชั่วคราวของตัวเองทุกครั้ง
npm run build && npm start    # production บน :3030
npm run e2e                   # เดินทดสอบด้วยเบราว์เซอร์กับ :3030 (ต้อง seed แล้ว)
```

## การติดตั้งใช้งานจริง (deploy)

แอปนี้เก็บข้อมูลใน **SQLite** และไฟล์อัปโหลด (รูป, เสียงธรรม) ใน **โฟลเดอร์ `uploads/`** จึงต้องรันบนเซิร์ฟเวอร์ที่มีดิสก์ถาวร เช่น VPS, Railway/Render/Fly.io ที่มี volume หรือเครื่องของวัดเอง

- **ไม่เหมาะกับ Vercel/Netlify แบบ serverless** ตามที่เป็นอยู่ เพราะไฟล์ฐานข้อมูลและไฟล์อัปโหลดจะหายทุกครั้งที่ deploy ถ้าจะใช้ Vercel ต้องเปลี่ยนเป็น Postgres (เปลี่ยน `provider` ใน `prisma/schema.prisma`) และย้ายไฟล์ไปเก็บที่ object storage (แก้ที่ `src/lib/storage.ts` ไฟล์เดียว)
- **GitHub Pages ใช้ไม่ได้** เพราะเป็นเว็บแบบมีเซิร์ฟเวอร์และฐานข้อมูล
- ตั้ง `SESSION_SECRET`, `SITE_URL` (เช่น `https://watpamahachai.org`) และ `DATABASE_URL` ก่อน `npm run build`
- สำรองไฟล์ `prisma/dev.db` และโฟลเดอร์ `uploads/` เป็นประจำ
- รันหลัง reverse proxy ที่มี HTTPS (คุกกี้เข้าสู่ระบบตั้ง `secure` ใน production) ถ้าต้องทดสอบ production ผ่าน http ธรรมดา ตั้ง `INSECURE_COOKIE=1`

## หมายเหตุ

- วันที่ทั้งหมดเป็นเวลาไทย (Asia/Bangkok) แสดงเป็น พ.ศ.
- เนื้อหาที่เขียนในหลังบ้านใช้ Markdown; HTML ดิบจะถูกแสดงเป็นข้อความ และลิงก์ได้เฉพาะ http(s)/mailto/tel/ลิงก์ภายในเว็บ (`src/lib/text.ts`)
- ไฟล์อัปโหลดทุกไฟล์เป็นเนื้อหาสาธารณะ (`/files/public/...`) ข้อมูลส่วนตัวของผู้ลงทะเบียนอยู่ในฐานข้อมูลเท่านั้น เห็นได้เฉพาะบัญชีที่มีสิทธิ์ “ผู้ลงทะเบียน”
- ลงทะเบียนพร้อมกันหลายคน: นับที่ว่างในทรานแซกชันเดียวกับที่บันทึก จึงไม่เกินจำนวนรับ (`src/lib/events.test.ts`)
- ดู `STATUS.md` สำหรับสิ่งที่ทำเสร็จ วิธีตรวจ และข้อมูลที่ทางวัดต้องยืนยัน
- เว็บเดิมแบบไฟล์เดียว (`index.html` + `admin.html` ต่อ Google Sheets) ยังอยู่ในประวัติ git ก่อน commit นี้
