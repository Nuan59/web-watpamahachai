// Starter content. Refuses to run on a database that already has accounts unless SEED_RESET=1
// (then it WIPES everything). Sample events are marked "(ตัวอย่าง)" so the temple replaces them.
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/session";
import { day, isoDay } from "../src/lib/dates";
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { keyToPath } from "../src/lib/storage";

const prisma = new PrismaClient();
const PW = process.env.SEED_PASSWORD || "mahachai1234";
const plus = (n: number) => day(isoDay(new Date(Date.now() + n * 86400000)));

async function main() {
  if ((await prisma.user.count()) > 0) {
    if (process.env.SEED_RESET !== "1") throw new Error("Database already has accounts. Run with SEED_RESET=1 to wipe and reseed.");
    for (const m of ["activityLog", "registration", "event", "post", "photo", "album", "audioTrack", "quote", "faq", "page", "message", "scheduleItem", "setting", "homeSlide", "user"] as const) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma[m] as any).deleteMany();
    }
  }
  const hash = await hashPassword(PW);
  const owner = await prisma.user.create({ data: { email: "owner@watpamahachai.test", name: "ผู้ดูแลระบบ", role: "OWNER", passwordHash: hash } });
  await prisma.user.create({ data: { email: "office@watpamahachai.test", name: "สำนักงานวัด", role: "ADMIN", passwordHash: hash } });
  await prisma.user.create({ data: { email: "editor@watpamahachai.test", name: "อาสาสมัครเว็บไซต์", role: "EDITOR", passwordHash: hash } });

  const schedule: [string, string, string][] = [
    ["กิจวัตรประจำวัน", "04:00 น.", "ตื่นนอน ทำวัตรเช้า สวดมนต์"], ["กิจวัตรประจำวัน", "05:00 น.", "นั่งสมาธิ / เดินจงกรม"],
    ["กิจวัตรประจำวัน", "06:15–07:15 น.", "ออกรับบิณฑบาต (วันพฤหัสบดีออกรับบิณฑบาตที่ตลาดมหาชัย)"], ["กิจวัตรประจำวัน", "07:30 น.", "รับประทานอาหารเช้า ทำความสะอาดบริเวณวัด"],
    ["กิจวัตรประจำวัน", "09:00 น.", "ฟังธรรมบรรยาย และปฏิบัติธรรม"], ["กิจวัตรประจำวัน", "11:00 น.", "ถวายภัตตาหารเพล / รับประทานอาหาร"],
    ["กิจวัตรประจำวัน", "13:00 น.", "ปฏิบัติธรรม เดินจงกรม-นั่งสมาธิ"], ["กิจวัตรประจำวัน", "18:00 น.", "ทำวัตรเย็น สวดมนต์ ฟังธรรม"],
    ["กิจวัตรประจำวัน", "21:00 น.", "พักผ่อนตามอัธยาศัย"],
    ["วันพระ", "ช่วงเช้า", "ทำบุญตักบาตร ถวายภัตตาหาร"], ["วันพระ", "ช่วงสาย", "รับศีล ฟังพระธรรมเทศนา"], ["วันพระ", "ช่วงค่ำ", "ทำวัตรเย็น สวดมนต์ และปฏิบัติธรรมร่วมกัน"],
  ];
  await prisma.scheduleItem.createMany({ data: schedule.map(([category, time, title], sort) => ({ category, time, title, sort })) });

  const faqs: [string, string, string][] = [
    ["ทั่วไป", "มาปฏิบัติธรรมที่วัดต้องเสียค่าใช้จ่ายไหม?", "ไม่มีค่าใช้จ่าย ผู้มาปฏิบัติธรรมร่วมทำบุญตามกำลังศรัทธาได้ตามความสมัครใจ"],
    ["ทั่วไป", "ไม่เคยนั่งสมาธิมาก่อน มาปฏิบัติได้ไหม?", "ได้ วัดยินดีต้อนรับผู้เริ่มต้น ช่วงแรกจะแนะนำวิธีสวดมนต์ เดินจงกรม และนั่งสมาธิเบื้องต้น ค่อย ๆ ฝึกตามกำลังของตนเอง"],
    ["การสมัคร", "ต้องสมัครล่วงหน้าหรือไม่?", "โครงการอุปสมบทหมู่และบวชชีพราหมณ์ ต้องสมัครด้วยตนเองที่วัดพร้อมบัตรประชาชน กิจกรรมที่เปิดลงทะเบียนออนไลน์ กรอกชื่อได้ที่หน้ากิจกรรม ส่วนการมาปฏิบัติธรรมทั่วไป แนะนำให้โทรสอบถามก่อน"],
    ["การเตรียมตัว", "ต้องเตรียมอะไรมาบ้าง?", "ชุดขาวสุภาพ ๒–๓ ชุด ของใช้ส่วนตัว ยาประจำตัว บัตรประชาชน และยากันยุง ดูรายการเต็มได้ที่หน้า “แนวทางปฏิบัติ”"],
    ["การเตรียมตัว", "การแต่งกายมาวัดควรเป็นอย่างไร?", "ผู้มาปฏิบัติธรรมแต่งชุดขาว ผู้มาทำบุญทั่วไปแต่งกายสุภาพ งดเสื้อแขนกุด กางเกงขาสั้น และกระโปรงสั้น"],
    ["การเตรียมตัว", "ใช้โทรศัพท์มือถือระหว่างปฏิบัติได้ไหม?", "ควรปิดเครื่องหรือฝากไว้ระหว่างปฏิบัติ เพื่อไม่ให้รบกวนตนเองและผู้อื่น ใช้ติดต่อธุระจำเป็นได้ในเวลาพัก"],
    ["ทั่วไป", "มาเป็นหมู่คณะหรือหน่วยงานได้หรือไม่?", "ได้ กรุณาติดต่อวัดล่วงหน้าเพื่อนัดหมายวันเวลาและจำนวนผู้เข้าร่วม"],
    ["ทั่วไป", "อยู่ไกล ไม่สะดวกมาวัด ศึกษาธรรมได้อย่างไร?", "ฟังเสียงธรรมได้ที่หน้า “เสียงธรรม” อ่านหนังสือธรรมะฟรีที่ห้องสมุดธรรมะออนไลน์ และติดตามข่าวสารทางเพจ Facebook ของวัด"],
  ];
  await prisma.faq.createMany({ data: faqs.map(([category, question, answer], sort) => ({ category, question, answer, sort })) });

  await prisma.quote.create({ data: { text: "ศึกษาธรรม นำปฏิบัติ พัฒนาจิต คิดค้นทางพ้นทุกข์", author: "โอวาทธรรม พระครูสิริสุตวราภรณ์" } });

  await prisma.event.createMany({
    data: [
      {
        slug: "ทำบุญวันพระ-ตัวอย่าง", title: "ทำบุญตักบาตรวันพระ (ตัวอย่าง)", kind: "CEREMONY", startDate: plus(6), endDate: plus(6), timeText: "เริ่ม 07:00 น.",
        summary: "ร่วมทำบุญตักบาตร รับศีล และฟังพระธรรมเทศนา", body: "## กำหนดการ\n\n- 07:00 น. ทำบุญตักบาตร\n- 09:00 น. รับศีล ฟังพระธรรมเทศนา\n- 11:00 น. ถวายภัตตาหารเพล\n\nแต่งกายสุภาพ สีขาวหรือสีสุภาพ",
      },
      {
        slug: "ปฏิบัติธรรมวันหยุด-ตัวอย่าง", title: "ปฏิบัติธรรมวันหยุด ๓ วัน ๒ คืน (ตัวอย่าง)", kind: "RETREAT", startDate: plus(17), endDate: plus(19), timeText: "รายงานตัว 08:00 น. วันแรก",
        summary: "ฝึกสวดมนต์ เดินจงกรม และนั่งสมาธิ พักค้างที่วัด เหมาะสำหรับผู้เริ่มต้น", signupOpen: true, capacity: 40,
        body: "## สิ่งที่ต้องเตรียม\n\n- ชุดขาว ๓ ชุด\n- ของใช้ส่วนตัว ยาประจำตัว\n- บัตรประชาชน\n\n## ระเบียบ\n\nผู้เข้าร่วมถือศีล ๘ ตลอดการปฏิบัติ งดใช้โทรศัพท์ระหว่างปฏิบัติ\n\nลงทะเบียนแล้ว ทางวัดจะโทรยืนยันอีกครั้ง",
      },
      { slug: "ทอดกฐินสามัคคี-ตัวอย่าง", title: "ทอดกฐินสามัคคี (ตัวอย่าง)", kind: "CEREMONY", startDate: plus(-20), endDate: plus(-20), timeText: "เริ่ม 09:00 น.", summary: "ร่วมเป็นเจ้าภาพถวายผ้ากฐิน" },
    ],
  });

  await prisma.post.create({
    data: {
      slug: "เว็บไซต์ใหม่ของวัด", title: "เว็บไซต์ใหม่ของวัดป่ามหาไชย", status: "PUBLISHED", publishedAt: new Date(), authorId: owner.id,
      excerpt: "ดูกิจกรรม ลงทะเบียนปฏิบัติธรรม ฟังเสียงธรรม และติดต่อวัดได้ในที่เดียว",
      body: "วัดป่ามหาไชยเปิดเว็บไซต์ใหม่ เพื่อให้ญาติโยมติดตามข่าวสารของวัดได้สะดวกขึ้น\n\n## ทำอะไรได้บ้าง\n\n- ดู [กิจกรรมที่จะมาถึง](/events) และลงทะเบียนออนไลน์สำหรับรอบที่เปิดรับ\n- ฟัง [เสียงธรรม](/dhamma) ได้ทุกที่\n- ดู [ตารางกิจวัตร](/schedule) และ [แนวทางการปฏิบัติธรรม](/practice)\n- [ส่งข้อความถึงวัด](/contact) เมื่อมีคำถาม\n\nอนุโมทนาบุญทุกท่าน",
    },
  });
  // Home slideshow: photos from the temple's current website (watpamahachai.org).
  const slides: [string, string, string, string][] = [
    ["alms-round.webp", "ออกรับบิณฑบาตโปรดญาติโยมทุกวัน", "เวลา ๐๖.๑๕–๐๗.๑๕ น. (วันพฤหัสบดีออกรับบิณฑบาตที่ตลาดมหาชัย)", "/schedule"],
    ["temple.webp", "วัดป่ามหาไชย", "สำนักปฏิบัติธรรมประจำจังหวัดสมุทรสาคร (ธรรมยุต) แห่งที่ ๑", "/about"],
    ["dhamma-talk.webp", "ฟังธรรม ปฏิบัติธรรม", "ศึกษาธรรม นำปฏิบัติ พัฒนาจิต คิดค้นทางพ้นทุกข์", "/practice"],
  ];
  for (const [n, [file, title, caption, linkUrl]] of slides.entries()) {
    const key = `public/home/seed-${file}`;
    mkdirSync(path.dirname(keyToPath(key)), { recursive: true });
    copyFileSync(path.join(__dirname, "seed-images", file), keyToPath(key));
    await prisma.homeSlide.create({ data: { imageKey: key, title, caption, linkUrl, sort: n } });
  }

  console.log(`Seeded. Logins (password "${PW}"): owner@ / office@ / editor@watpamahachai.test`);
}

main().finally(() => prisma.$disconnect());
