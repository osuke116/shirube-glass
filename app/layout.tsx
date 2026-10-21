import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "しるべ",
  description: "開いたら、すぐ記録。気づき・制作物・資料を、自分だけのタイムラインに。",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "しるべ", statusBarStyle: "default" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
