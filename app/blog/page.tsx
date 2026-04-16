'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { BookOpen, Briefcase, Code, ArrowRight, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = ['All', 'Education', 'Business', 'Behind The Scenes'] as const;

const articles = [
  {
    slug: 'stellar-claimable-balances',
    title: 'How Stellar Claimable Balances Work',
    excerpt: 'Deep dive into the Stellar feature that powers VaultLock\'s escrow system. Learn how claimable balances enable trustless milestone payments.',
    category: 'Education',
    author: 'Sarah Chen',
    date: 'Mar 15, 2026',
    readTime: '8 min read',
    color: 'indigo',
    icon: Code,
  },
  {
    slug: 'escrow-vs-net30',
    title: 'Why Escrow Beats Net-30 Payment Terms',
    excerpt: 'Net-30 invoices are broken for freelancers. Here\'s how on-chain escrow solves the trust problem and speeds up payments.',
    category: 'Business',
    author: 'Marcus Johnson',
    date: 'Mar 8, 2026',
    readTime: '6 min read',
    color: 'indigo',
    icon: Briefcase,
  },
  {
    slug: 'building-vaultlock',
    title: 'Building VaultLock: Our Hackathon Story',
    excerpt: 'The story of how VaultLock went from a weekend hackathon project to a full escrow platform on Stellar.',
    category: 'Behind The Scenes',
    author: 'Alex Nakamoto',
    date: 'Feb 28, 2026',
    readTime: '10 min read',
    color: 'violet',
    icon: BookOpen,
  },
];

const colorBorder: Record<string, string> = {
  indigo: 'border-indigo-500/20 hover:border-indigo-500/40',
  violet: 'border-violet-500/20 hover:border-violet-500/40',
};

const colorBadge: Record<string, string> = {
  indigo: 'badge-indigo', violet: 'badge-violet', cyan: 'badge-cyan', slate: 'badge-slate',
};

export default function BlogPage() {
  const [filter, setFilter] = useState<typeof categories[number]>('All');

  const filtered = filter === 'All' ? articles : articles.filter((a) => a.category === filter);

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-indigo mb-4 inline-block">Blog</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Insights & Updates</h1>
            <p className="text-slate-400">Learn about on-chain escrow, Stellar, and the future of freelancing</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  filter === c
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Articles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((article) => {
              const Icon = article.icon;
              return (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className={cn('card-surface p-6 border transition-all duration-300 hover:-translate-y-1 group', colorBorder[article.color])}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border mb-4',
                    article.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
                    article.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
                    'bg-violet-500/10 border-violet-500/20 text-violet-500'
                  )}>
                    <Icon size={18} />
                  </div>

                  <span className={cn(colorBadge[article.color], 'text-xs mb-3 inline-block')}>
                    {article.category}
                  </span>
                  <h3 className="text-base font-semibold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-3">{article.excerpt}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-2">
                      <User size={12} />
                      <span>{article.author}</span>
                    </div>
                    <span>{article.readTime}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
