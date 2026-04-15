'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import { EscrowCard } from '@/components/shared/EscrowCard';
import { cn } from '@/lib/utils';

const TABS = ['all', 'active', 'completed', 'disputed'] as const;

export default function ContractsPage() {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<typeof TABS[number]>('all');

  useEffect(() => {
    fetch('/api/escrows')
      .then((r) => r.json())
      .then((data) => { setEscrows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered =
    tab === 'all'
      ? escrows
      : tab === 'active'
      ? escrows.filter((e) => ['active', 'in_progress'].includes(e.status))
      : escrows.filter((e) => e.status === tab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Contracts</h1>
        <p className="text-sm text-slate-400 mt-1">All your client contracts</p>
      </div>

      <div className="flex space-x-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              tab === t
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-indigo-500/5 rounded-xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <Filter size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">No contracts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((e) => (
            <EscrowCard key={e._id} escrow={e} role="freelancer" />
          ))}
        </div>
      )}
    </div>
  );
}
