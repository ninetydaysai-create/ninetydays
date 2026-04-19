import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "NinetyDays — From Service Company to Product Company in 90 Days",
    template: "%s | NinetyDays",
  },
  description:
    "AI-powered career transition platform for developers at TCS, Infosys, Wipro, and other service companies. Resume analysis, gap engine, 12-week roadmap, and AI mentor — all in one place.",
  keywords: ["career transition", "service company to product company", "FAANG prep", "resume analyzer", "AI career coach", "TCS Infosys to product company"],
  authors: [{ name: "NinetyDays" }],
  openGraph: {
    title: "NinetyDays — Land Your Product Company Role in 90 Days",
    description: "AI resume analysis, gap engine, 12-week roadmap, and a mentor that knows your exact profile. Built for engineers at service companies.",
    type: "website",
    url: APP_URL,
    siteName: "NinetyDays",
    images: [
      {
        url: "/og-image.png",  // place a 1200×630 image in /public/og-image.png
        width: 1200,
        height: 630,
        alt: "NinetyDays — From Service Company to Product Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NinetyDays — Land Your Product Company Role in 90 Days",
    description: "AI-guided 90-day career transition for service company engineers.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
