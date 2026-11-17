import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <p className="eyebrow">ไม่พบหน้านี้</p>
      <h1 className="mt-2 text-3xl">หน้าที่คุณหาอาจถูกย้ายหรือลบไปแล้ว</h1>
      <Link href="/" className="btn btn-primary mt-8">กลับหน้าแรก</Link>
    </div>
  );
}
