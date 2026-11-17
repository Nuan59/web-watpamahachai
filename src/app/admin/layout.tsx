import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "ระบบหลังบ้าน วัดป่ามหาไชย", template: "%s · หลังบ้านวัดป่ามหาไชย" },
  robots: { index: false, follow: false },
  icons: { icon: "/logo.webp" },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-cream/60">{children}</body>
    </html>
  );
}
