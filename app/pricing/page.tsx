'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { CheckCircle2, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free', price: '$0', period: '/month', color: 'violet',
    features: ['0% platform fee', 'Up to 3 active escrows', 'Basic milestones', 'Community support'],
    cta: 'Start Free', popular: false,
  },
  {
    name: 'Pro', price: '1%', period: 'per transaction', color: 'amber',
    features: ['1% platform fee', 'Unlimited escrows', 'Dispute protection', 'Priority support', 'Analytics dashboard', 'CSV export'],
    cta: 'Go Pro', popular: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', color: 'indigo',
    features: ['Custom fee structure', 'White-label solution', 'SLA guarantee', 'Dedicated support', 'API access', 'Custom integrations'],
    cta: 'Contact Sales', popular: false,
  },
];

const faqs = [
  { q: 'What happens if there\'s a dispute?', a: 'Both parties can flag a milestone or escrow as disputed. Our built-in dispute resolution process involves reviewing the submitted work against the milestone requirements. In the future, we plan to add third-party arbitration.' },
  { q: 'Can I cancel an escrow after funding?', a: 'You can cancel a draft escrow at any time. Once an escrow is active and funded, cancellation is only possible if both parties agree or through the dispute process. Funds remain locked on-chain until resolution.' },
  { q: 'What currencies are supported?', a: 'Currently, VaultLock operates exclusively with XLM (Stellar Lumens) on the Stellar testnet. We plan to support USDC on Stellar and other Stellar-based assets in future releases.' },
  { q: 'How long does payment take to arrive?', a: 'Once a milestone is approved and a claimable balance is created, the freelancer can claim their XLM instantly. Stellar transactions settle in 3-5 seconds with fees under $0.001.' },
  { q: 'Is my money safe if VaultLock shuts down?', a: 'Yes. All funds are held on the Stellar blockchain, not on VaultLock servers. Escrow wallets are Stellar accounts with keys encrypted and stored securely. Even if our platform goes offline, funds can be recovered using the Stellar network directly.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-amber mb-4 inline-block">Pricing</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Simple, Transparent Pricing</h1>
            <p className="text-slate-400">No hidden fees. Pay only for what you use.</p>
          </div>

          {/* Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={cn(
                  'card-surface p-8 border relative transition-all duration-300 hover:-translate-y-1',
                  tier.popular
                    ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)]'
                    : tier.color === 'violet'
                    ? 'border-violet-500/20'
                    : 'border-indigo-500/20'
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-amber px-3 py-1 text-xs">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{tier.name}</h3>
                <div className="flex items-baseline space-x-1 mb-6">
                  <span className="text-3xl font-bold gradient-text">{tier.price}</span>
                  {tier.period && <span className="text-sm text-slate-500">{tier.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, fi) => (
                    <li key={fi} className="flex items-center space-x-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className={cn('shrink-0',
                        tier.color === 'amber' ? 'text-amber-500' :
                        tier.color === 'indigo' ? 'text-indigo-500' : 'text-violet-500'
                      )} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={cn(
                    'block w-full text-center py-3 rounded-xl font-medium transition-all',
                    tier.popular ? 'btn-primary' : 'btn-secondary'
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">FAQ</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="card-surface border border-amber-900/10">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm font-medium text-slate-200">{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'text-slate-500 transition-transform shrink-0 ml-4',
                        openFaq === i && 'rotate-180'
                      )}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-slate-400">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
