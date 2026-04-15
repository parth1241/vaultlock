'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ChevronLeft, Calendar, Clock, User } from 'lucide-react';

const articles: Record<string, any> = {
  'stellar-claimable-balances': {
    title: 'How Stellar Claimable Balances Work',
    author: 'Sarah Chen', authorRole: 'CTO at VaultLock',
    date: 'March 15, 2026', readTime: '8 min read',
    category: 'Education', color: 'indigo',
    content: `
## What Are Claimable Balances?

Claimable balances are a powerful feature of the Stellar network that allows an account to create a payment that can be claimed by a specific recipient at any time. Unlike traditional payments that are instant and irreversible, claimable balances sit on the ledger until the recipient decides to claim them.

## Why VaultLock Uses Claimable Balances

At VaultLock, we use claimable balances as the core mechanism for our milestone payment system. When a client approves a completed milestone, the escrow wallet creates a claimable balance for the freelancer's wallet address. The freelancer can then claim this balance at their convenience.

### The Flow

1. **Client funds escrow** — XLM is sent from the client's wallet to the escrow wallet
2. **Milestone approved** — When the client approves work, a claimable balance is created
3. **Freelancer claims** — The freelancer signs a transaction to claim the balance to their wallet

## Technical Implementation

The Stellar SDK provides a straightforward API for creating claimable balances:

\`\`\`javascript
Operation.createClaimableBalance({
  asset: Asset.native(),
  amount: milestoneAmount.toString(),
  claimants: [
    new Claimant(
      freelancerWallet,
      Claimant.predicateUnconditional()
    )
  ]
})
\`\`\`

## Benefits Over Direct Payments

1. **Reversibility window** — Until claimed, the balance can be reclaimed if there's a dispute
2. **Recipient control** — Freelancers claim when ready, not when the system pushes
3. **On-chain proof** — Every claimable balance is verifiable on Stellar Explorer
4. **Gas efficiency** — Claimable balances are more gas-efficient than multi-sig wallets

## Conclusion

Claimable balances are what make VaultLock possible. They provide the perfect primitive for escrow payments — locked until approved, claimable by the intended recipient, and fully transparent on-chain.
    `,
  },
  'escrow-vs-net30': {
    title: 'Why Escrow Beats Net-30 Payment Terms',
    author: 'Marcus Johnson', authorRole: 'Head of Design at VaultLock',
    date: 'March 8, 2026', readTime: '6 min read',
    category: 'Business', color: 'indigo',
    content: `
## The Problem with Net-30

If you've freelanced for more than a month, you know the drill: complete the work, send an invoice, wait 30 days (or more), follow up, wait some more. Net-30 payment terms create an asymmetric risk where the freelancer does all the work before seeing any money.

## How On-Chain Escrow Fixes This

With VaultLock's escrow system, funds are locked before work begins. This simple change transforms the entire dynamic:

### For Freelancers
- **Guaranteed payment** — Funds are already locked on-chain
- **Milestone-based** — Get paid as you complete work, not all at the end
- **Instant settlement** — XLM arrives in your wallet within seconds of claiming

### For Clients
- **Quality assurance** — Payment only releases when you approve the work
- **Budget control** — Break large projects into manageable milestones
- **No overpayment** — Claimable balances are created per milestone, not the full amount

## The Numbers

| Metric | Net-30 | VaultLock Escrow |
|--------|--------|-----------------|
| Average payment time | 37 days | < 5 seconds |
| Non-payment rate | 12% | 0% |
| Dispute resolution | Weeks | Built-in |
| Transaction fees | 2-3% | < $0.001 |

## The Future is Trustless

Net-30 was designed for a world of paper invoices and bank checks. We live in a world of instant digital payments. It's time our payment terms caught up.
    `,
  },
  'building-vaultlock': {
    title: 'Building VaultLock: Our Hackathon Story',
    author: 'Alex Nakamoto', authorRole: 'CEO & Co-Founder',
    date: 'February 28, 2026', readTime: '10 min read',
    category: 'Behind The Scenes', color: 'violet',
    content: `
## The 48 Hours That Started It All

VaultLock started as a hackathon project at StellarHacks 2025. The challenge was simple: "Build something that solves a real problem using Stellar's claimable balances." We had 48 hours.

## The Problem We Chose

Our team of four had all been freelancers at some point. We'd all experienced late payments, ghosted invoices, and the anxiety of starting work without knowing if we'd get paid. We decided to build an escrow system that used Stellar's claimable balances to guarantee payment.

## Day 1: The Prototype

We split into teams. Sarah and I handled the Stellar integration while Marcus worked on the UI and Priya drafted the user flows. By midnight, we had a working demo: fund an escrow wallet, create a claimable balance, and claim it from another account.

## Day 2: Making It Real

The second day was about polish. We added milestone tracking, invite links, and a full authentication system. Marcus's dark-themed UI with indigo accents became our signature look. We shipped at 11:58 PM — two minutes before the deadline.

## The Result

We won second place. But more importantly, we realized this wasn't just a hackathon project — it was a real product. Freelancers needed this. Clients wanted this. Stellar made it possible.

## What's Next

Today, VaultLock handles thousands of escrows. We've processed over $1.2M in XLM, with a 99.8% success rate. We're just getting started. Our roadmap includes multi-currency support, dispute arbitration, and integration with major freelance platforms.

## Thank You

To everyone who believed in VaultLock from that first hackathon demo to today — thank you. We're building the future of freelance payments, one milestone at a time.
    `,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = articles[slug];

  if (!article) {
    return notFound();
  }

  const relatedSlugs = Object.keys(articles).filter((s) => s !== slug);

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          <Link href="/blog" className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors">
            <ChevronLeft size={16} />
            <span>Back to Blog</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <span className={`badge-${article.color} mb-4 inline-block`}>{article.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center space-x-1"><User size={14} /><span>{article.author}</span></span>
              <span className="flex items-center space-x-1"><Calendar size={14} /><span>{article.date}</span></span>
              <span className="flex items-center space-x-1"><Clock size={14} /><span>{article.readTime}</span></span>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose prose-invert prose-indigo max-w-none
              prose-headings:text-slate-100 prose-p:text-slate-400 prose-a:text-indigo-400
              prose-strong:text-slate-200 prose-code:text-indigo-400 prose-code:bg-[#120f00]
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-[#0a0800] prose-pre:border prose-pre:border-indigo-900/10
              prose-li:text-slate-400 prose-table:text-sm
              prose-th:text-slate-300 prose-td:text-slate-400 prose-td:border-indigo-900/10
              prose-th:border-indigo-900/10"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content) }}
          />

          {/* Author card */}
          <div className="mt-12 card-surface p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold shrink-0">
              {article.author[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-100">{article.author}</p>
              <p className="text-sm text-slate-500">{article.authorRole}</p>
            </div>
          </div>

          {/* Related */}
          <div className="mt-12">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedSlugs.map((s) => (
                <Link key={s} href={`/blog/${s}`} className="card-surface card-hover p-4 text-sm text-slate-200 hover:text-indigo-400 transition-colors">
                  {articles[s].title}
                </Link>
              ))}
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </main>
  );
}

// Simple markdown-to-HTML converter
function formatMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`);
      return `<tr>${cells.join('')}</tr>`;
    })
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huplto])/gm, '')
    .replace(/<p><(h[123])/g, '<$1')
    .replace(/<\/(h[123])><\/p>/g, '</$1>');
}
