'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Briefcase, Clock, DollarSign, Zap, Loader2 } from 'lucide-react';
import { EscrowCard } from '@/components/shared/EscrowCard';
import { useToast } from '@/lib/context/ToastContext';
import { triggerConfetti } from '@/components/shared/Confetti';
import { cn } from '@/lib/utils';

export default function FreelancerDashboard() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/escrows')
      .then((r) => r.json())
      .then((data) => { setEscrows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const activeContracts = escrows.filter((e) => ['active', 'in_progress'].includes(e.status));
  const pendingSubmit = escrows.reduce((sum, e) =>
    sum + (e.milestones || []).filter((m: any) => m.status === 'pending').length, 0
  );
  const totalEarned = escrows.reduce((sum, e) =>
    sum + (e.milestones || []).filter((m: any) => m.status === 'released').reduce((s: number, m: any) => s + m.amount, 0), 0
  );
  const claimableAmount = escrows.reduce((sum, e) =>
    sum + (e.milestones || []).filter((m: any) => m.status === 'approved').reduce((s: number, m: any) => s + m.amount, 0), 0
  );
  const claimableMilestones = escrows.flatMap((e) =>
    (e.milestones || []).filter((m: any) => m.status === 'approved').map((m: any) => ({ ...m, escrowTitle: e.title }))
  );

  const handleClaim = async (milestoneId: string) => {
    setClaimingId(milestoneId);
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: 'claim-' + Date.now() }),
      });
      if (res.ok) {
        showToast('Payment claimed!', 'success');
        triggerConfetti();
        // Refresh
        const data = await fetch('/api/escrows').then((r) => r.json());
        setEscrows(data);
      }
    } catch {
      showToast('Claim failed', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Hey, {session?.user?.name?.split(' ')[0] || 'Freelancer'} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">Your freelancer overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Contracts', value: activeContracts.length.toString(), icon: Briefcase, color: 'indigo' },
          { label: 'Pending Submits', value: pendingSubmit.toString(), icon: Clock, color: 'amber' },
          { label: 'Total Earned', value: `${totalEarned} XLM`, icon: DollarSign, color: 'violet' },
          { label: 'Claimable Now', value: `${claimableAmount} XLM`, icon: Zap, color: 'cyan' },
        ].map((s, i) => (
          <div key={i} className="card-surface card-hover p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border mb-3',
              s.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
              s.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
              s.color === 'violet' ? 'bg-violet-500/10 border-violet-500/20 text-violet-500' :
              'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
            )}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Claimable Balances */}
      {claimableMilestones.length > 0 && (
        <div className="card-surface p-6 border-cyan-500/20">
          <h3 className="text-sm font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
            <Zap size={16} />
            <span>Claimable Payments</span>
          </h3>
          <div className="space-y-3">
            {claimableMilestones.map((m: any) => (
              <div key={m._id} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0800] border border-cyan-900/10">
                <div>
                  <p className="text-sm text-slate-200 font-medium">{m.title}</p>
                  <p className="text-xs text-slate-500">{m.escrowTitle}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="badge-amber font-mono">{m.amount} XLM</span>
                  <button
                    onClick={() => handleClaim(m._id)}
                    disabled={claimingId === m._id}
                    className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-cyan-500/20 transition-colors flex items-center space-x-1"
                  >
                    {claimingId === m._id ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                    <span>Claim</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Contracts */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Active Contracts</h3>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-amber-500/5 rounded-xl shimmer" />)}
          </div>
        ) : activeContracts.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <Briefcase size={40} className="mx-auto text-indigo-500/30 mb-3" />
            <p className="text-slate-400">No active contracts</p>
            <p className="text-xs text-slate-500 mt-1">Contracts will appear when you accept an invite</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeContracts.map((e) => (
              <EscrowCard key={e._id} escrow={e} role="freelancer" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
