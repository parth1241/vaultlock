'use client';

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { cn } from '@/lib/utils';

const teamMembers = [
  { name: 'Alex Nakamoto', role: 'CEO & Co-Founder', bio: 'Former fintech lead at Stripe. Passionate about decentralized payments.', color: 'indigo', initial: 'A' },
  { name: 'Sarah Chen', role: 'CTO', bio: 'Full-stack engineer with 10+ years in blockchain. Previously at Stellar Foundation.', color: 'indigo', initial: 'S' },
  { name: 'Marcus Johnson', role: 'Head of Design', bio: 'Product designer crafting beautiful DeFi experiences. Ex-Figma.', color: 'violet', initial: 'M' },
  { name: 'Priya Sharma', role: 'Head of Business', bio: 'MBA from Wharton. Building partnerships with freelance platforms globally.', color: 'cyan', initial: 'P' },
];

const borderMap: Record<string, string> = {
  indigo: 'border-indigo-500/20 hover:border-indigo-500/40',
  violet: 'border-violet-500/20 hover:border-violet-500/40',
  cyan: 'border-cyan-500/20 hover:border-cyan-500/40',
};

const bgMap: Record<string, string> = {
  indigo: '#6366f1', violet: '#8b5cf6', cyan: '#06b6d4',
};

export default function TeamPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-violet mb-4 inline-block">Our Team</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">The People Behind VaultLock</h1>
            <p className="text-slate-400 max-w-lg mx-auto">A small team of builders passionate about trustless payments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {teamMembers.map((m, i) => (
              <div key={i} className={cn('card-surface card-hover p-6 border transition-all duration-300', borderMap[m.color])}>
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-black"
                    style={{ backgroundColor: bgMap[m.color] }}
                  >
                    {m.initial}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">{m.name}</h3>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{m.bio}</p>
                <div className="flex space-x-3 mt-4">
                  <span className="text-xs text-slate-600 hover:text-indigo-400 cursor-pointer transition-colors">Twitter</span>
                  <span className="text-xs text-slate-600 hover:text-indigo-400 cursor-pointer transition-colors">LinkedIn</span>
                  <span className="text-xs text-slate-600 hover:text-violet-400 cursor-pointer transition-colors">GitHub</span>
                </div>
              </div>
            ))}
          </div>

          {/* Join card */}
          <div className="card-surface p-8 text-center border-indigo-500/20">
            <h3 className="text-xl font-bold text-slate-100 mb-2">Join Our Team</h3>
            <p className="text-sm text-slate-400 mb-4">We&apos;re always looking for talented builders who share our vision</p>
            <a href="mailto:careers@vaultlock.io" className="btn-primary text-sm px-6 py-2 rounded-xl inline-block">
              See Open Positions
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
