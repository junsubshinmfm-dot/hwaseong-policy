import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { VisitorTracker } from "@/components/shared/VisitorTracker";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import Footer from "@/components/shared/Footer";
import { TimelineProvider } from "@/hooks/useTimeline";

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
  title: "정명근 | 시민제안으로 만드는 2030 약속",
  description: "시민제안으로 만드는 2030 정명근의 약속",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://xn--6i0bs1vgmi4zcca6b558c.kr"),
  openGraph: {
    title: "정명근 | 시민제안으로 만드는 2030 약속",
    description: "시민제안으로 만드는 2030 정명근의 약속",
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
        <TimelineProvider>
          {children}
          <Footer />
        </TimelineProvider>
      </body>
    </html>
  );
}
