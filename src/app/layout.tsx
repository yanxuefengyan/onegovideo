import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneGoVideo - AI一键生成短视频",
  description: "基于AI的一键短视频生成平台，输入文字即可生成包含字幕、音乐和特效的短视频",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
