'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_TABS = ['all', 'completed', 'cancelled', 'disputed'] as const;

const statusBadges: Record<string, { label: string; badge: string }> = {
  completed: { label: 'Completed', badge: 'badge-violet' },
  cancelled: { label: 'Cancelled', badge: 'badge-sky' },
  disputed: { label: 'Disputed', badge: 'badge-rose' },
};

export default function HistoryPage() {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<typeof STATUS_TABS[number]>('all');

  useEffect(() => {
    fetch('/api/escrows')
      .then((r) => r.json())
      .then((data) => {
        setEscrows(data.filter((e: any) => ['completed', 'cancelled', 'disputed'].includes(e.status)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? escrows : escrows.filter((e) => e.status === tab);

  const exportCSV = async () => {
    const Papa = (await import('papaparse')).default;
    const csv = Papa.unparse(
      filtered.map((e) => ({
        Title: e.title,
        Amount: e.totalAmount,
        Status: e.status,
        Created: new Date(e.createdAt).toLocaleDateString(),
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vaultlock-history.csv';
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">History</h1>
          <p className="text-sm text-slate-400 mt-1">Past escrows and contracts</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary flex items-center space-x-2 text-sm">
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              tab === t
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-amber-500/5 rounded shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-900/10">
                  <th className="text-left py-3 px-6 text-xs text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const badge = statusBadges[e.status] || statusBadges.completed;
                  return (
                    <tr key={e._id} className="border-b border-amber-900/5 hover:bg-amber-500/5 transition-colors cursor-pointer">
                      <td className="py-3 px-6 text-slate-200 font-medium">{e.title}</td>
                      <td className="py-3 px-4 text-amber-400 font-mono">{e.totalAmount} XLM</td>
                      <td className="py-3 px-4"><span className={badge.badge}>{badge.label}</span></td>
                      <td className="py-3 px-4 text-slate-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Link href={`/client/escrow/${e._id}`} className="text-amber-400 hover:text-amber-300 text-xs">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
