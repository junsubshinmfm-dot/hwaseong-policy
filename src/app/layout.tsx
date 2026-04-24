import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { VisitorTracker } from "@/components/shared/VisitorTracker";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";

const pretendard = localFont({
  src: [
    { path: "./fonts/PretendardVariable.subset.woff2", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  preload: true,
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0D1F4D",
};

export const metadata: Metadata = {
  title: "정명근 | 화성특례시 100대 공약",
  description: "100가지 약속, 화성의 미래",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://policy.jmg2026.kr"),
  openGraph: {
    title: "정명근 | 화성특례시 100대 공약",
    description: "100가지 약속으로 화성의 미래를 만듭니다",
    images: ["/images/og-default.jpg"],
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased safe-top safe-bottom">
        <VisitorTracker />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
