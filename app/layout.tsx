import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Noto_Serif_SC, DM_Sans, Newsreader } from "next/font/google";
import "./globals.css";

// UI 正文：干净、可读、含中文字形（作为中日文回退）
const sansSC = Noto_Sans_SC({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// 衬线展示：译文 / 回译 —— 含中日文字形，承担“手写校对”的文学感
const serifSC = Noto_Serif_SC({
  variable: "--font-serif-sc",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

// 拉丁文 UI：DM Sans（中日文字形自动回退到 Noto Sans SC）
const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// editorial 斜体衬线：仅用于拉丁文字标/标题（Newsreader italic）
const newsreader = Newsreader({
  variable: "--font-news",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tonebridge · 地道语气翻译",
  description:
    "把中文心里话翻成地道的外语，并附上回译校验，让你确认对方读到的语气——为跨国恋爱、商务、朋友与家人而做。",
  applicationName: "Tonebridge",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1714" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${sansSC.variable} ${serifSC.variable} ${dmSans.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
