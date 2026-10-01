import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"], // The design strictly enforces only 400 and 700 weights
});

export const metadata: Metadata = {
  title: "YourDrive",
  description: "Unlimited cloud storage powered by Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-warm-canvas text-charcoal">
        {children}
      </body>
    </html>
  );
}
