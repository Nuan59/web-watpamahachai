import { prisma } from "./db";

// Values known from the temple's current website. Empty ones are shown as "สอบถามทางวัด" on the site
// until the temple fills them in Admin → ข้อมูลวัด (see STATUS.md "ต้องให้ทางวัดยืนยัน").
export const SETTING_DEFAULTS = {
  templeName: "วัดป่ามหาไชย",
  tagline: "สำนักปฏิบัติธรรมประจำจังหวัดสมุทรสาคร (ธรรมยุต) แห่งที่ ๑",
  motto: "ศึกษาธรรม นำปฏิบัติ พัฒนาจิต คิดค้นทางพ้นทุกข์",
  mottoBy: "โอวาทธรรม พระครูสิริสุตวราภรณ์",
  abbotName: "พระมหาประกอบ ธมฺมชีโว",
  abbotRole: "เจ้าอาวาส ตั้งแต่วันที่ ๒๙ มิถุนายน พ.ศ. ๒๕๓๓ — ปัจจุบัน",
  abbotPhoto: "", // storage key
  history:
    "“มหาไชย” เป็นมงคลนามของวัด เป็นสถานที่ที่ก่อตั้งขึ้นเพื่อเป็นสำนักปฏิบัติธรรมประจำจังหวัดสมุทรสาคร ให้พุทธศาสนิกชนได้มีที่พึ่งทางใจ ศึกษาและปฏิบัติธรรมตามแนวทางของพระพุทธศาสนา\n\nตลอดหลายสิบปีที่ผ่านมา วัดป่ามหาไชยได้เป็นสถานที่จัดกิจกรรมปฏิบัติธรรม อุปสมบทหมู่ และบวชชีพราหมณ์ให้กับพุทธศาสนิกชนในพื้นที่และใกล้เคียงอย่างต่อเนื่อง\n\nแนวทางของวัดเน้นความเรียบง่ายแบบวัดป่า ใช้ชีวิตอย่างพอเพียง รักษาศีล เจริญสติ และอยู่ร่วมกันด้วยความเมตตา เพื่อให้ผู้ที่เข้ามาได้รับความสงบและนำธรรมะกลับไปใช้ในชีวิตประจำวันได้จริง",
  address: "50/3 หมู่ 7 ต.บ้านเกาะ อ.เมือง จ.สมุทรสาคร 74000",
  phone: "085-379-5589",
  email: "mahachaiwatpa@gmail.com",
  facebook: "https://www.facebook.com/Watpamahachai/",
  lineId: "",
  hours: "",
  mapsQuery: "วัดป่ามหาไชย สมุทรสาคร",
  travelCar: "ค้นหา “วัดป่ามหาไชย สมุทรสาคร” ใน Google Maps แล้วกดนำทาง จากกรุงเทพฯ ใช้ถนนพระราม ๒ มุ่งหน้าจังหวัดสมุทรสาคร",
  travelPublic: "เดินทางเข้าตัวเมืองสมุทรสาคร (มหาชัย) แล้วต่อรถรับจ้างหรือแท็กซี่ไปยังตำบลบ้านเกาะ แจ้งชื่อวัดกับคนขับ",
  libraryUrl: "https://nuan59.github.io/wat-mahachai-library/",
  bankName: "",
  bankAccount: "",
  bankAccountName: "",
  donateQr: "", // storage key
};
export type Settings = typeof SETTING_DEFAULTS;
export type SettingKey = keyof Settings;
export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS) as SettingKey[];

/** Fields the temple still has to supply; the settings page highlights them. */
export const MUST_CONFIRM: SettingKey[] = ["lineId", "hours", "bankName", "bankAccount", "bankAccountName", "abbotPhoto"];
export const missing = (s: Settings) => MUST_CONFIRM.filter((k) => !s[k]);

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany();
  const saved = Object.fromEntries(rows.filter((r) => r.key in SETTING_DEFAULTS).map((r) => [r.key, r.value]));
  return { ...SETTING_DEFAULTS, ...saved };
}

export async function saveSettings(values: Partial<Settings>) {
  const entries = Object.entries(values).filter(([k, v]) => k in SETTING_DEFAULTS && typeof v === "string");
  await prisma.$transaction(entries.map(([key, value]) => prisma.setting.upsert({ where: { key }, create: { key, value: value as string }, update: { value: value as string } })));
}

export const mapsEmbed = (q: string) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=14&output=embed`;
export const mapsLink = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
