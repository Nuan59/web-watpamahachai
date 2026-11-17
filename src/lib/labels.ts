export const ROLE: Record<string, string> = { OWNER: "เจ้าของระบบ", ADMIN: "เจ้าหน้าที่วัด", EDITOR: "อาสาสมัครดูแลเนื้อหา" };
export const EVENT_KIND: Record<string, string> = { CEREMONY: "วันสำคัญ/งานบุญ", RETREAT: "ปฏิบัติธรรม", ORDINATION: "บวช", OTHER: "อื่น ๆ" };
export const REG_STATUS: Record<string, string> = { NEW: "รอติดต่อกลับ", CONFIRMED: "ยืนยันแล้ว", CANCELLED: "ยกเลิก" };
export const GENDER: Record<string, string> = { MALE: "ชาย", FEMALE: "หญิง", "": "ไม่ระบุ" };
export const TOPIC: Record<string, string> = {
  GENERAL: "สอบถามทั่วไป", PRACTICE: "มาปฏิบัติธรรม", ORDINATION: "บวช / บวชชีพราหมณ์", DONATION: "ร่วมทำบุญ", GROUP: "มาเป็นหมู่คณะ",
};
export const label = (map: Record<string, string>, k: string) => map[k] ?? k;
