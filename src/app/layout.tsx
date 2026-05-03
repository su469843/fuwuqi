import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小说编写平台",
  description: "AI 辅助小说编写平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
