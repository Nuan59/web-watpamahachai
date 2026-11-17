// Browser walk against a running production server (npm run build && npm start) with the seeded DB.
// BASE=http://localhost:3030 node e2e/sweep.mjs
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE ?? "http://localhost:3030";
const PW = process.env.SEED_PASSWORD ?? "mahachai1234";
const results = [];
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? "✓" : "✗"} ${name}${extra ? ` — ${extra}` : ""}`); };
mkdirSync("e2e/out", { recursive: true });

const PUBLIC = ["/", "/about", "/practice", "/schedule", "/events", "/news", "/dhamma", "/gallery", "/faq", "/donate", "/contact", "/library", "/monks", "/videos", "/news/เว็บไซต์ใหม่ของวัด", "/events/ปฏิบัติธรรมวันหยุด-ตัวอย่าง", "/sitemap.xml", "/robots.txt"];
const ADMIN = ["/admin", "/admin/home", "/admin/library", "/admin/monks", "/admin/news", "/admin/news/new", "/admin/events", "/admin/events/new", "/admin/registrations", "/admin/schedule", "/admin/dhamma", "/admin/gallery", "/admin/faq", "/admin/pages", "/admin/pages/new", "/admin/messages", "/admin/settings", "/admin/users", "/admin/users/new", "/admin/activity", "/admin/account"];

async function visit(page, path, width) {
  const errors = [];
  const onErr = (e) => errors.push(e.message);
  page.on("pageerror", onErr);
  const res = await page.goto(BASE + encodeURI(path), { waitUntil: "networkidle" });
  const overflow = /\.(xml|txt)$/.test(path) ? 0 : await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  page.off("pageerror", onErr);
  ok(`${width}px ${path}`, res.status() === 200 && !errors.length && overflow <= 0, `status ${res.status()}${errors.length ? ` errors: ${errors.join("; ")}` : ""}${overflow > 0 ? ` overflow ${overflow}px` : ""}`);
}

async function login(page, who) {
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[name="email"]', `${who}@watpamahachai.test`);
  await page.fill('input[name="password"]', PW);
  await Promise.all([page.waitForURL((u) => !u.pathname.endsWith("/login")), page.click('button[type="submit"]')]);
}

const browser = await chromium.launch();
try {
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const p of PUBLIC) await visit(page, p, width);
    await login(page, "owner");
    for (const p of ADMIN) await visit(page, p, width);
    await ctx.close();
  }

  // Phone menu opens as a full sheet and every link is reachable.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/contact`);
    await page.click('button[aria-controls="mobile-menu"]');
    const box = await page.locator("#mobile-menu").boundingBox();
    ok("phone menu covers the screen", box && box.height >= 800 && box.width >= 389, JSON.stringify(box));
    await page.click('#mobile-menu a[href="/events"]');
    await page.waitForURL(`${BASE}/events`);
    const closed = await page.locator("#mobile-menu").waitFor({ state: "detached", timeout: 5000 }).then(() => true, () => false);
    ok("phone menu link navigates and closes", closed);
    await ctx.close();
  }

  // Flow: office creates an event with sign-up → visitor signs up → office sees and confirms → CSV.
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const admin = await ctx.newPage();
    await login(admin, "office");
    await admin.goto(`${BASE}/admin/events/new`);
    const title = `ทดสอบปฏิบัติธรรม ${Date.now()}`;
    await admin.fill('input[name="title"]', title);
    const d = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
    await admin.fill('input[name="startDate"]', d);
    await admin.check('input[name="signupOpen"]');
    await admin.fill('input[name="capacity"]', "2");
    await Promise.all([admin.waitForURL(/\/admin\/events\/[^/]+\?ok=/), admin.click('form button[type="submit"]:has-text("บันทึก")')]);
    ok("office created an event with sign-up (capacity 2)", await admin.locator('text=บันทึกกิจกรรมแล้ว').count());
    const slug = await admin.inputValue('input[name="slug"]');

    const visitor = await (await browser.newContext({ viewport: { width: 390, height: 900 } })).newPage();
    await visitor.goto(`${BASE}/events/${encodeURIComponent(slug)}`);
    await visitor.fill('input[name="name"]', "ผู้ทดสอบ หนึ่ง");
    await visitor.fill('input[name="phone"]', "08x");
    await visitor.click('button:has-text("ลงทะเบียน")');
    await visitor.waitForSelector('[role="alert"]');
    const alertText = await visitor.locator('form [role="alert"]').textContent().catch(() => "none");
    ok("bad phone shows a clear error", alertText.includes("เบอร์โทรไม่ถูกต้อง"), alertText);
    ok("the name typed before the error is kept", (await visitor.inputValue('input[name="name"]')) === "ผู้ทดสอบ หนึ่ง");
    await visitor.fill('input[name="phone"]', "081-234-5678");
    await visitor.fill('input[name="people"]', "2");
    await visitor.click('button:has-text("ลงทะเบียน")');
    await visitor.waitForSelector('text=ลงทะเบียนเรียบร้อย');
    ok("visitor signed up 2 people", true);
    await visitor.reload();
    ok("event is now full and the form is gone", (await visitor.locator("text=ที่นั่งเต็มแล้ว").count()) === 1 && (await visitor.locator('input[name="name"]').count()) === 0);
    await visitor.screenshot({ path: "e2e/out/event-full-390.png", fullPage: true });

    await admin.goto(`${BASE}/admin/registrations`);
    ok("registration shows in the office list", await admin.locator("text=ผู้ทดสอบ หนึ่ง").count());
    await Promise.all([admin.waitForURL(/ok=/), admin.locator("tr", { hasText: "ผู้ทดสอบ หนึ่ง" }).locator('button:has-text("ยืนยัน")').click()]);
    ok("office confirmed the registration", await admin.locator("tr", { hasText: "ผู้ทดสอบ หนึ่ง" }).locator("text=ยืนยันแล้ว").count());
    const csv = await admin.request.get(`${BASE}/admin/registrations/export`);
    const body = await csv.text();
    ok("CSV export has the row", csv.status() === 200 && body.includes("ผู้ทดสอบ หนึ่ง") && body.includes("0812345678"));
    const anon = await (await browser.newContext()).request.get(`${BASE}/admin/registrations/export`, { maxRedirects: 0 });
    ok("CSV export needs a login", anon.status() >= 300 && anon.status() < 400, `status ${anon.status()}`);

    // A refused save keeps what was written
    await admin.goto(`${BASE}/admin/news/new`);
    await admin.fill('input[name="title"]', "ข่าวลิงก์ซ้ำ");
    await admin.fill('input[name="slug"]', "เว็บไซต์ใหม่ของวัด");
    await admin.fill('textarea[name="body"]', "เนื้อหายาวที่ไม่ควรหาย");
    await admin.click('button:has-text("บันทึก")');
    await admin.waitForSelector('[role="alert"]');
    ok("duplicate news link is refused and the text stays", (await admin.textContent('[role="alert"]')).includes("ใช้กับข่าว") && (await admin.inputValue('textarea[name="body"]')) === "เนื้อหายาวที่ไม่ควรหาย");

    // Contact message → inbox badge
    await visitor.goto(`${BASE}/contact`);
    await visitor.fill('input[name="name"]', "ผู้ทดสอบ สอง");
    await visitor.fill('input[name="contact"]', "0899999999");
    await visitor.fill('textarea[name="body"]', "อยากพาครอบครัวมาปฏิบัติธรรม");
    await visitor.click('button:has-text("ส่งข้อความ")');
    await visitor.waitForSelector("text=ส่งข้อความถึงวัดแล้ว");
    await admin.goto(`${BASE}/admin/messages`);
    ok("message arrives in the inbox", await admin.locator("text=อยากพาครอบครัวมาปฏิบัติธรรม").count());

    // Gallery: create album, upload a photo, public album shows it
    await admin.goto(`${BASE}/admin/gallery`);
    await admin.fill('input[name="title"]', `อัลบั้มทดสอบ ${Date.now()}`);
    await Promise.all([admin.waitForURL(/\/admin\/gallery\/[^/?]+\?ok=/), admin.click('button:has-text("สร้างอัลบั้ม")')]);
    await admin.setInputFiles('input[name="photos"]', ["public/og.jpg", "public/apple-icon.png"]);
    await admin.click('button:has-text("อัปโหลด")');
    ok("uploaded 2 photos", await admin.locator("text=เพิ่ม 2 ภาพแล้ว").waitFor().then(() => true, () => false));
    const aslug = await admin.inputValue('input[name="slug"]');
    await visitor.goto(`${BASE}/gallery/${encodeURIComponent(aslug)}`);
    await visitor.click("ul button >> nth=0");
    ok("public album opens the lightbox", await visitor.locator('[role="dialog"]').count());
    await visitor.keyboard.press("Escape");

    // Home slideshow: seeded photos show, a new upload joins them, hiding one removes it
    await visitor.goto(`${BASE}/`);
    const before = await visitor.locator('[aria-roledescription="slide"]').count();
    ok("home page shows the photo slideshow", before >= 3, `${before} slides`);
    await admin.goto(`${BASE}/admin/home`);
    await admin.setInputFiles('input[name="images"]', "public/og.jpg");
    await admin.fill('form:has(input[name="images"]) input[name="title"]', "ภาพทดสอบหน้าแรก");
    await admin.fill('form:has(input[name="images"]) input[name="linkUrl"]', "javascript:alert(1)");
    await admin.click('button:has-text("เพิ่มภาพ")');
    ok("unsafe slide link is refused", await admin.locator('[role="alert"]', { hasText: "ลิงก์ต้องขึ้นต้นด้วย" }).waitFor().then(() => true, () => false));
    await admin.setInputFiles('input[name="images"]', "public/og.jpg");
    await admin.fill('form:has(input[name="images"]) input[name="title"]', "ภาพทดสอบหน้าแรก");
    await admin.fill('form:has(input[name="images"]) input[name="linkUrl"]', "/events");
    await admin.click('button:has-text("เพิ่มภาพ")');
    await admin.locator("text=เพิ่ม 1 ภาพแล้ว").waitFor();
    await visitor.goto(`${BASE}/`);
    ok("new slide appears on the home page", (await visitor.locator('[aria-roledescription="slide"]').count()) === before + 1 && (await visitor.locator('text=ภาพทดสอบหน้าแรก').count()) === 1);
    await visitor.click('button[aria-label="ไปที่ภาพที่ 2"]');
    ok("slideshow dots move to the chosen photo", (await visitor.locator('[aria-roledescription="slide"][aria-hidden="false"]').getAttribute("aria-label")) === `ภาพที่ 2 จาก ${before + 1}`);
    const card = admin.locator("form", { has: admin.locator('input[value="ภาพทดสอบหน้าแรก"]') });
    await card.locator('input[name="active"]').uncheck();
    await Promise.all([admin.waitForURL(/ok=/), card.locator('button:has-text("บันทึก")').click()]);
    await visitor.goto(`${BASE}/`);
    ok("hidden slide is gone from the home page", (await visitor.locator('text=ภาพทดสอบหน้าแรก').count()) === 0);
    ok("home shows the latest gallery photos", (await visitor.locator('section:has-text("ภาพกิจกรรมล่าสุด") a[href^="/gallery/"]').count()) >= 2);

    // Audio: upload a small mp3-typed file and see it in the public playlist
    await admin.goto(`${BASE}/admin/dhamma`);
    writeFileSync("e2e/out/test.mp3", Buffer.from("ID3"));
    await admin.fill('form:has(input[name="file"]) input[name="title"] >> nth=0', "ธรรมบรรยายทดสอบ");
    await admin.setInputFiles('input[name="file"] >> nth=0', "e2e/out/test.mp3");
    await Promise.all([admin.waitForURL(/ok=/), admin.click('button:has-text("เพิ่มเสียงธรรม")')]);
    await visitor.goto(`${BASE}/dhamma`);
    ok("uploaded talk is in the public player", await visitor.locator("text=ธรรมบรรยายทดสอบ").count());
    const range = await visitor.request.get(`${BASE}${await admin.locator("audio").first().getAttribute("src")}`, { headers: { range: "bytes=0-1" } });
    ok("audio file answers Range requests", range.status() === 206);

    // Upgrades that bring back the old website's features
    {
      // Audio series: publish a seeded series, upload two talks, download one
      await admin.goto(`${BASE}/admin/dhamma`);
      await admin.click('a:has-text("ธรรมกำไรชีวิต")');
      await admin.waitForURL(/\/admin\/dhamma\/[^/]+$/);
      // Playwright can't read Thai file paths, so the files are handed over from memory with their Thai names.
      await admin.setInputFiles('input[name="files"]', [
        { name: "ตอนที่ 02 วจีทุจริต.mp3", mimeType: "audio/mpeg", buffer: Buffer.from("ID3b") },
        { name: "ตอนที่ 01 กายทุจริต.mp3", mimeType: "audio/mpeg", buffer: Buffer.from("ID3a") },
      ]);
      await admin.click('button:has-text("อัปโหลด")');
      await admin.waitForURL(/[?&](ok|error)=/);
      ok("series upload accepted", await admin.locator("text=เพิ่ม 2 ไฟล์แล้ว").waitFor().then(() => true, () => false));
      ok("series upload names talks from file names, in order", (await admin.locator("ol > li p.font-medium").allTextContents()).join("|").replace(/\s+/g, " ").includes("1. ตอนที่ 01 กายทุจริต|2. ตอนที่ 02 วจีทุจริต"));
      await admin.check('input[name="published"]');
      await Promise.all([admin.waitForURL(/ok=/), admin.click('form:has(input[name="zipUrl"]) button:has-text("บันทึก")')]);
      const sslug = await admin.inputValue('input[name="slug"]');
      await visitor.goto(`${BASE}/dhamma/${encodeURIComponent(sslug)}`);
      ok("published series page lists its talks", (await visitor.locator("text=ตอนที่ 01 กายทุจริต").count()) >= 1);
      const dl = await visitor.locator('a[aria-label^="ดาวน์โหลด ตอนที่ 01"]').getAttribute("href");
      const dres = await visitor.request.get(BASE + dl);
      ok("talk downloads as an attachment with its Thai title", dres.status() === 200 && (dres.headers()["content-disposition"] ?? "").includes(encodeURIComponent("ตอนที่ 01 กายทุจริต.mp3")));
      await visitor.goto(`${BASE}/`);
      ok("series shows in the เสียงธรรม menu and on the home page", (await visitor.locator(`a[href="/dhamma/${sslug}"]`).count()) >= 2);

      // Library: PDF to read and download
      await admin.goto(`${BASE}/admin/library`);
      await admin.setInputFiles('input[name="files"]', { name: "บทสวดมนต์ทำวัตร.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF\n") });
      await Promise.all([admin.waitForURL(/ok=/), admin.click('button:has-text("เพิ่ม")')]);
      await visitor.goto(`${BASE}/library?cat=${encodeURIComponent("หนังสือสวดมนต์")}`);
      ok("library lists the book under its category", (await visitor.locator("h3", { hasText: "บทสวดมนต์ทำวัตร" }).count()) === 1);
      const read = await visitor.request.get(BASE + (await visitor.locator('a:has-text("อ่าน")').first().getAttribute("href")));
      ok("PDF opens for reading", read.headers()["content-type"] === "application/pdf" && !read.headers()["content-disposition"]);
      ok("ห้องสมุด menu has the category", (await visitor.locator(`a[href="/library?cat=${encodeURIComponent("หนังสือสวดมนต์")}"]`).count()) >= 1);

      // Monks
      await admin.goto(`${BASE}/admin/monks`);
      await admin.fill('input[name="name"]', "พระทดสอบ ฐิตธมฺโม");
      await admin.fill('input[name="position"]', "พระลูกวัด");
      await admin.setInputFiles('input[name="photo"]', "public/apple-icon.png");
      await Promise.all([admin.waitForURL(/ok=/), admin.click('button:has-text("เพิ่ม")')]);
      await visitor.goto(`${BASE}/monks`);
      ok("monk list shows the new monk with a photo", (await visitor.locator("text=พระทดสอบ ฐิตธมฺโม").count()) === 1 && (await visitor.locator('img[alt="พระทดสอบ ฐิตธมฺโม"]').count()) === 1);
      ok("พระในสังกัด appears in the ประวัติ menu", (await visitor.locator('a[href="/monks"]').count()) >= 1);

      // A drafted old-menu page appears once published
      await admin.goto(`${BASE}/admin/pages`);
      await admin.click('a:has-text("อุปสมบทหมู่")');
      await admin.waitForURL(/\/admin\/pages\/[^/]+$/);
      await visitor.goto(`${BASE}/`);
      const pslug = await admin.inputValue('input[name="slug"]');
      ok("draft page is not in the menu", (await visitor.locator(`a[href="/p/${pslug}"]`).count()) === 0);
      // inline picture upload in the editor
      await admin.setInputFiles('input[aria-label="เลือกรูปที่จะแทรก"]', "public/og.jpg");
      await admin.waitForFunction(() => document.querySelector('textarea[name="body"]').value.includes("/files/public/content/"));
      ok("editor inserts an uploaded picture into the text", true);
      await admin.check('input[name="published"]');
      await admin.click('button:has-text("บันทึก")');
      await admin.waitForURL(/ok=/);
      await visitor.goto(`${BASE}/p/${encodeURIComponent(pslug)}`);
      ok("published page shows the inserted picture", (await visitor.locator('.prose-wat img[src^="/files/public/content/"]').count()) === 1);
      ok("published page appears in the ปฏิบัติธรรม menu", (await visitor.locator(`a[href="/p/${pslug}"]`).count()) >= 1);
    }

    // Settings: fill bank info → donate page shows it
    await ctx.clearCookies();
    await login(admin, "owner");
    await admin.goto(`${BASE}/admin/settings`);
    await admin.fill('input[name="bankName"]', "ธนาคารทดสอบ");
    await admin.fill('input[name="bankAccount"]', "000-0-00000-0");
    await admin.fill('input[name="bankAccountName"]', "วัดป่ามหาไชย (ทดสอบ)");
    await Promise.all([admin.waitForURL(/ok=/), admin.click('button:has-text("บันทึกข้อมูลวัด")')]);
    await visitor.goto(`${BASE}/donate`);
    ok("donate page shows the saved account", await visitor.locator("text=000-0-00000-0").count());
    // Radio and videos from the settings page
    await admin.goto(`${BASE}/admin/settings`);
    await admin.fill('input[name="radioUrl"]', "https://radio.invalid/live.mp3");
    await admin.fill('textarea[name="videos"]', "https://youtu.be/dQw4w9WgXcQ");
    await Promise.all([admin.waitForURL(/ok=/), admin.click('button:has-text("บันทึกข้อมูลวัด")')]);
    await visitor.goto(`${BASE}/`);
    ok("home shows the latest video", (await visitor.locator('iframe[src*="youtube-nocookie.com/embed/dQw4w9WgXcQ"]').count()) === 1);
    await visitor.click('button[aria-label="ฟังวิทยุ"]');
    ok("radio that cannot connect says it is off air", await visitor.locator("text=ขณะนี้ไม่ได้ออกอากาศ").waitFor({ timeout: 15000 }).then(() => true, () => false));
    ok("YouTube link in the top bar", (await visitor.locator('a[aria-label="YouTube ของวัด"]').count()) === 1);
    await visitor.goto(`${BASE}/videos`);
    ok("videos page embeds the clip", (await visitor.locator("iframe").count()) === 1);
    await admin.goto(`${BASE}/admin/settings`);
    await admin.fill('input[name="radioUrl"]', "http://plain.invalid/live.mp3");
    await Promise.all([admin.waitForURL(/error=/), admin.click('button:has-text("บันทึกข้อมูลวัด")')]);
    ok("radio link without https is refused", await admin.locator('[role="alert"]').count());
    await admin.goto(`${BASE}/admin/settings`);
    for (const k of ["bankName", "bankAccount", "bankAccountName", "radioUrl"]) await admin.fill(`input[name="${k}"]`, "");
    await admin.fill('textarea[name="videos"]', "");
    await Promise.all([admin.waitForURL(/ok=/), admin.click('button:has-text("บันทึกข้อมูลวัด")')]);
    await ctx.close();
  }

  // Roles: editor and office are kept out of owner pages; anonymous users go to login.
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, "editor");
    for (const p of ["/admin/registrations", "/admin/messages", "/admin/settings", "/admin/users"]) {
      await page.goto(BASE + p);
      ok(`editor denied ${p}`, page.url().includes("/admin/denied"));
    }
    await page.goto(`${BASE}/admin/news/new`);
    ok("editor can write news", page.url().endsWith("/admin/news/new"));
    const o = await (await browser.newContext()).newPage();
    await login(o, "office");
    for (const p of ["/admin/settings", "/admin/users"]) { await o.goto(BASE + p); ok(`office denied ${p}`, o.url().includes("/admin/denied")); }
    const anon = await (await browser.newContext()).newPage();
    await anon.goto(`${BASE}/admin/events`);
    ok("anonymous → login", anon.url().endsWith("/admin/login"));
    const priv = await anon.request.get(`${BASE}/files/../prisma/dev.db`);
    ok("file route refuses paths outside public/", priv.status() === 404);
  }

  // Screenshots for review
  for (const [name, path, w] of [["home-1280", "/", 1280], ["home-390", "/", 390], ["event-1280", "/events/ปฏิบัติธรรมวันหยุด-ตัวอย่าง", 1280], ["admin-1280", "/admin", 1280], ["admin-events-390", "/admin/events", 390]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    if (path.startsWith("/admin")) await login(page, "owner");
    await page.goto(BASE + encodeURI(path), { waitUntil: "networkidle" });
    await page.screenshot({ path: `e2e/out/${name}.png`, fullPage: true });
    await ctx.close();
  }
} finally {
  await browser.close();
}
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
