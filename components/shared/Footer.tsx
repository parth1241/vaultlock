'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

// Inline SVG icons for brands (removed from lucide-react v1.7+)
const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46L20 4" />
  </svg>
);

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-[#120f00] border-t border-amber-900/10 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Shield className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight gradient-text">VaultLock</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Trustless escrow on Stellar blockchain. Secure, transparent, and automated payments for global collaboration.
            </p>
            <div className="flex items-center space-x-3">
              <Link href="#" className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-all border border-amber-500/20">
                <TwitterIcon size={16} />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                <GithubIcon size={16} />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 transition-all border border-violet-500/20">
                <LinkedinIcon size={16} />
              </Link>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/client/escrow/new" className="hover:text-amber-400 transition-colors">Create Escrow</Link></li>
              <li><Link href="/freelancer/dashboard" className="hover:text-amber-400 transition-colors">Find Work</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
              <li><Link href="/about/team" className="hover:text-amber-400 transition-colors">Team</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-amber-900/10 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} VaultLock. All escrow transactions recorded on Stellar blockchain.
          </p>
        </div>
      </div>
    </footer>
  );
}
