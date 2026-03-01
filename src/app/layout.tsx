import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "财务仪表盘",
  description: "全球金融市场快速概览",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className="dark">
      <body style={{ background: "var(--bg)", color: "var(--text)" }}>
        <Sidebar />
        <main className="ml-[68px] min-h-screen p-6 max-w-[1400px]">
          {children}
        </main>
      </body>
    </html>
  );
}
