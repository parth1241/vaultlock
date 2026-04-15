'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#6366f1', '#8b5cf6', '#f43f5e', '#06b6d4', '#64748b'];

export default function AnalyticsPage() {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/escrows')
      .then((r) => r.json())
      .then((data) => { setEscrows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalPaid = escrows
    .filter((e) => e.status === 'completed')
    .reduce((s, e) => s + e.totalAmount, 0);
  const avgSize = escrows.length > 0 ? (escrows.reduce((s, e) => s + e.totalAmount, 0) / escrows.length) : 0;
  const successRate = escrows.length > 0
    ? ((escrows.filter((e) => e.status === 'completed').length / escrows.length) * 100)
    : 0;

  // Monthly bar data
  const monthlyData = [
    { month: 'Nov', xlm: 0 }, { month: 'Dec', xlm: 200 },
    { month: 'Jan', xlm: 800 }, { month: 'Feb', xlm: 1200 },
    { month: 'Mar', xlm: 600 }, { month: 'Apr', xlm: 1500 },
  ];

  // Status pie data
  const statusCounts = ['active', 'in_progress', 'completed', 'disputed', 'cancelled', 'draft']
    .map((s) => ({ name: s, value: escrows.filter((e) => e.status === s).length }))
    .filter((s) => s.value > 0);

  // Line data for milestone completion
  const lineData = [
    { month: 'Nov', rate: 0 }, { month: 'Dec', rate: 50 },
    { month: 'Jan', rate: 75 }, { month: 'Feb', rate: 80 },
    { month: 'Mar', rate: 90 }, { month: 'Apr', rate: 95 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Your escrow performance overview</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Escrow Size', value: `${Math.round(avgSize)} XLM`, icon: DollarSign, color: 'indigo' },
          { label: 'Avg Completion', value: '12 days', icon: Clock, color: 'indigo' },
          { label: 'Total Paid Out', value: `${totalPaid} XLM`, icon: TrendingUp, color: 'violet' },
          { label: 'Success Rate', value: `${successRate.toFixed(0)}%`, icon: CheckCircle2, color: 'cyan' },
        ].map((s, i) => (
          <div key={i} className="card-surface card-hover p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border mb-3',
              s.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
              s.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
              s.color === 'violet' ? 'bg-violet-500/10 border-violet-500/20 text-violet-500' :
              'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
            )}>
              <s.icon size={20} />
            </div>
            <p className="text-xl font-bold text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card-surface card-hover p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">XLM Escrowed Per Month</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#120f00', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }} />
              <Bar dataKey="xlm" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card-surface card-hover p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Escrow Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusCounts.length > 0 ? statusCounts : [{ name: 'none', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {(statusCounts.length > 0 ? statusCounts : [{ name: 'none' }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#120f00', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {statusCounts.map((s, i) => (
              <div key={i} className="flex items-center space-x-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-slate-400 capitalize">{s.name.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div className="card-surface card-hover p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Milestone Completion Rate</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#120f00', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
