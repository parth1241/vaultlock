'use client';

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Lock, Eye, Zap, Scale, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const values = [
  { icon: Lock, color: 'amber', title: 'Trustless', desc: 'Code enforces the contract, not lawyers. Smart escrow means no middleman.' },
  { icon: Eye, color: 'indigo', title: 'Transparent', desc: 'Every transaction publicly verifiable on the Stellar blockchain.' },
  { icon: Zap, color: 'violet', title: 'Instant', desc: 'Stellar settles in 3-5 seconds. No waiting days for bank transfers.' },
  { icon: Scale, color: 'cyan', title: 'Fair', desc: 'Disputes resolved without bias through structured milestone verification.' },
];

const colorMap: Record<string, string> = {
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
};

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
            <span className="badge-amber mb-4 inline-block">About VaultLock</span>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-100 mb-6">
              Payments should be <span className="gradient-text">trustless</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              VaultLock was born at a hackathon from a simple frustration: why do freelancers still wait 30-60 days
              to get paid? We built an on-chain escrow system on Stellar that locks funds before work starts and
              releases them the moment milestones are approved.
            </p>
          </div>

          {/* Mission */}
          <div className="card-surface p-8 mb-16 border-amber-500/20">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed">
              To make freelancer payments instant, secure, and trustless. No banks. No middlemen.
              No 30-day invoices. Just code-enforced contracts on the Stellar blockchain. We believe
              every freelancer deserves guaranteed payment for completed work, and every client
              deserves assurance that funds are only released when they&apos;re satisfied.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className={cn('card-surface card-hover p-6 border', `border-${v.color}-500/20`)}>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border mb-4', colorMap[v.color])}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-400">{v.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Stellar */}
          <div className="card-surface p-8 text-center mb-16 border-indigo-500/20">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Built on Stellar</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-6">
              We chose Stellar for its speed, low fees, and built-in claimable balance feature —
              perfect for escrow use cases. Transactions settle in 3-5 seconds with fees under $0.001.
            </p>
            <div className="flex items-center justify-center space-x-6 text-slate-500 text-sm font-mono">
              <span>3-5s Settlement</span>
              <span>•</span>
              <span>&lt; $0.001 Fees</span>
              <span>•</span>
              <span>400M+ Accounts</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/signup" className="btn-primary inline-flex items-center space-x-2 px-8 py-3 rounded-xl">
              <span>Get Started</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
