import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { DialogProvider } from "@/context/DialogContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "700"],
});

const cabinetGrotesk = localFont({
  src: [
    { path: "./fonts/CabinetGrotesk-Thin.woff", weight: "100", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Extralight.woff", weight: "200", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Light.woff", weight: "300", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Regular.woff", weight: "400", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Medium.woff", weight: "500", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Bold.woff", weight: "700", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Extrabold.woff", weight: "800", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Black.woff", weight: "900", style: "normal" },
  ],
  variable: "--font-cabinet-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ONYX | Cyber-Industrial URL Shortener",
    template: "%s | ONYX"
  },
  description: "Advanced, privacy-focused URL shortener with real-time analytics and industrial-grade reliability.",
  keywords: ["url shortener", "link shortener", "analytics", "privacy", "cyberpunk", "industrial design"],
  authors: [{ name: "ONYX Team" }],
  creator: "ONYX",
  publisher: "ONYX",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://onyx.bapp.fun",
    title: "ONYX | Cyber-Industrial URL Shortener",
    description: "Shorten links with style. Real-time analytics, privacy-first, and a cyber-industrial aesthetic.",
    siteName: "ONYX Shortener",
  },
  twitter: {
    card: "summary_large_image",
    title: "ONYX | Cyber-Industrial URL Shortener",
    description: "Shorten links with style. Real-time analytics, privacy-first, and a cyber-industrial aesthetic.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // Assuming this might exist or will be added
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} ${cabinetGrotesk.variable} antialiased bg-black text-white min-h-screen`}
      >
        <ToastProvider>
           <DialogProvider>
            {children}
           </DialogProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
