import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";

import PWARegistration from "@/components/PWARegistration";
import IdleLogout from "@/components/IdleLogout";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Kotukotu - スマート家計簿",
  description: "毎月の出費をスマートに管理する家計簿アプリ",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon_Kotukotu.png?v=1",
    shortcut: "/favicon_Kotukotu.png?v=1",
    apple: "/favicon_Kotukotu.png?v=1",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kotukotu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/" afterSignInUrl="/">
      <html lang="ja">
        <head>
          <link rel="apple-touch-icon" href="/favicon_Kotukotu.png?v=1" />
        </head>
        <body className={inter.className}>
          <ThemeProvider>
            <IdleLogout />
            {children}
          </ThemeProvider>
          <PWARegistration />
        </body>
      </html>
    </ClerkProvider>
  );
}
