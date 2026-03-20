import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const coolvetica = localFont({
  src: "./fonts/coolvetica-rg.woff2",
  variable: "--font-coolvetica",
  display: "swap",
  weight: "400",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#e5e5e5",
};

export const metadata: Metadata = {
  title: "Eissa Salehi",
  description: "Presets & Music Video Tools",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eissa Salehi",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Eissa Salehi",
    description: "Presets & Music Video Tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${coolvetica.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
