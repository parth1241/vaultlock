import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "VaultLock | On-Chain Escrow & Milestone Payments",
  description: "Secure, milestone-based payments built on the Stellar blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.variable,
          jetbrainsMono.variable,
          "antialiased selection:bg-amber-500/30 selection:text-amber-200"
        )}
      >
        <Providers>
          <div className="ambient-blobs">
            <div className="blob-amber" />
            <div className="blob-indigo" />
            <div className="blob-violet" />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
