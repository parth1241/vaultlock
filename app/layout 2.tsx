import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Vote } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PollChain | Decentralized Voting",
  description: "Secure, transparent voting on the Stellar Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg group-hover:rotate-12 transition-transform">
                <Vote className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter gradient-text">
                POLLCHAIN
              </span>
            </Link>
            
            <div className="flex gap-6">
              <Link href="/polls/create" className="text-sm font-medium hover:text-primary transition-colors">
                Create Poll
              </Link>
              <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/50">
                Stellar Testnet
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
