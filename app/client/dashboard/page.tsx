'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, Search, DollarSign, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EscrowCard } from '@/components/shared/EscrowCard';
import { cn } from '@/lib/utils';
import WalletManager from '@/components/shared/WalletManager';
import SendXLMPanel from '@/components/shared/SendXLMPanel';
import { LiquidityPoolCard } from '@/components/shared/LiquidityPoolCard';
import { Activity } from 'lucide-react';

const chartData = [
  { month: 'Nov', amount: 0 },
  { month: 'Dec', amount: 200 },
  { month: 'Jan', amount: 500 },
  { month: 'Feb', amount: 1200 },
  { month: 'Mar', amount: 800 },
  { month: 'Apr', amount: 1500 },
];

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      const res = await fetch('/api/escrows');
      if (res.ok) {
        const data = await res.json();
        setEscrows(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalEscrowed = escrows.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const activeCount = escrows.filter((e) => ['active', 'in_progress'].includes(e.status)).length;
  const completedCount = escrows.filter((e) => e.status === 'completed').length;
  const pendingMilestones = escrows.reduce((sum, e) => {
    return sum + (e.milestones || []).filter((m: any) => m.status === 'submitted').length;
  }, 0);

  const filtered = escrows.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Client'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here&apos;s your escrow overview</p>
        </div>
        <Link href="/client/escrow/new" className="btn-primary flex items-center space-x-2 w-fit">
          <Plus size={18} />
          <span>Create New Escrow</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Escrowed', value: `${totalEscrowed.toLocaleString()} XLM`, icon: DollarSign, color: 'indigo' },
          { label: 'Active Contracts', value: activeCount.toString(), icon: Briefcase, color: 'indigo' },
          { label: 'Completed', value: completedCount.toString(), icon: CheckCircle2, color: 'violet' },
          { label: 'Pending Reviews', value: pendingMilestones.toString(), icon: Clock, color: 'cyan' },
        ].map((stat, i) => (
          <div key={i} className="card-surface card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border',
                stat.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
                stat.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
                stat.color === 'violet' ? 'bg-violet-500/10 border-violet-500/20 text-violet-500' :
                'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
              )}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stellar Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WalletManager />
        </div>
        <div className="lg:col-span-1">
          <SendXLMPanel compact />
        </div>
        <div className="lg:col-span-1">
          <LiquidityPoolCard />
        </div>
      </div>

      {/* Chart */}
      <div className="card-surface card-hover p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">XLM Escrowed (Last 6 months)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.1)" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#120f00', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#6366f1' }}
            />
            <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="url(#indigoGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Escrow Table */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-slate-300">Your Escrows</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search escrows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-1.5 text-sm w-60"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-indigo-500/5 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign size={48} className="mx-auto text-indigo-500/30 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No escrows yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first escrow to get started</p>
            <Link href="/client/escrow/new" className="btn-primary inline-flex items-center space-x-2">
              <Plus size={16} />
              <span>Create Escrow</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((escrow) => (
              <EscrowCard key={escrow._id} escrow={escrow} role="client" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
