'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Download, ExternalLink, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export default function EarningsPage() {
  const { data: session } = useSession();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/escrows')
      .then((r) => r.json())
      .then((data) => { setEscrows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allReleased = escrows.flatMap((e) =>
    (e.milestones || [])
      .filter((m: any) => m.status === 'released')
      .map((m: any) => ({ ...m, escrowTitle: e.title }))
  );

  const totalEarned = allReleased.reduce((s, m) => s + m.amount, 0);

  const monthlyData = [
    { month: 'Nov', earnings: 0 }, { month: 'Dec', earnings: 150 },
    { month: 'Jan', earnings: 400 }, { month: 'Feb', earnings: 800 },
    { month: 'Mar', earnings: 500 }, { month: 'Apr', earnings: 1200 },
  ];

  const exportCSV = async () => {
    const Papa = (await import('papaparse')).default;
    const csv = Papa.unparse(
      allReleased.map((m) => ({
        Milestone: m.title,
        Escrow: m.escrowTitle,
        Amount: m.amount,
        Date: new Date(m.releasedAt || m.updatedAt).toLocaleDateString(),
        TxHash: m.txHash || '',
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vaultlock-earnings.csv';
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Earnings</h1>
          <p className="text-sm text-slate-400 mt-1">Track your XLM income</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary flex items-center space-x-2 text-sm">
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Earned', value: `${totalEarned} XLM`, icon: DollarSign, color: 'violet' },
          { label: 'This Month', value: '1,200 XLM', icon: TrendingUp, color: 'indigo' },
          { label: 'Avg Per Project', value: `${escrows.length > 0 ? Math.round(totalEarned / escrows.length) : 0} XLM`, icon: Calendar, color: 'cyan' },
        ].map((s, i) => (
          <div key={i} className="card-surface card-hover p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border mb-3',
              s.color === 'violet' ? 'bg-violet-500/10 border-violet-500/20 text-violet-500' :
              s.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
              'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
            )}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card-surface card-hover p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Earnings</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.1)" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#120f00', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px' }} />
            <Bar dataKey="earnings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="card-surface overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Transaction History</h3>
        </div>
        {allReleased.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={40} className="mx-auto text-violet-500/30 mb-3" />
            <p className="text-slate-400">No earnings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-indigo-900/10">
                  <th className="text-left py-3 px-6 text-xs text-slate-500 uppercase">Milestone</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase">Escrow</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase">Tx</th>
                </tr>
              </thead>
              <tbody>
                {allReleased.map((m: any, i: number) => (
                  <tr key={i} className="border-b border-indigo-900/5 hover:bg-indigo-500/5 transition-colors">
                    <td className="py-3 px-6 text-slate-200">{m.title}</td>
                    <td className="py-3 px-4 text-slate-400">{m.escrowTitle}</td>
                    <td className="py-3 px-4 text-violet-400 font-mono">{m.amount} XLM</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(m.releasedAt || m.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {m.txHash && (
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${m.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                        >
                          <span className="font-mono-hash truncate max-w-[80px]">{m.txHash.slice(0, 8)}...</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
