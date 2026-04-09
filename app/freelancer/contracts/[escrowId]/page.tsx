'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { MilestoneTracker } from '@/components/shared/MilestoneTracker';

const statusConfig: Record<string, { label: string; badge: string }> = {
  draft: { label: 'Draft', badge: 'badge-sky' },
  active: { label: 'Active', badge: 'badge-indigo' },
  in_progress: { label: 'In Progress', badge: 'badge-amber' },
  completed: { label: 'Completed', badge: 'badge-violet' },
  disputed: { label: 'Disputed', badge: 'badge-rose' },
  cancelled: { label: 'Cancelled', badge: 'badge-sky' },
};

export default function FreelancerContractDetail() {
  const params = useParams();
  const escrowId = params.escrowId as string;
  const [escrow, setEscrow] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/escrows/${escrowId}`);
      if (res.ok) {
        const data = await res.json();
        setEscrow(data.escrow);
        setMilestones(data.milestones || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [escrowId]);

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-amber-500/5 rounded-xl shimmer" />)}</div>;
  }

  if (!escrow) {
    return <div className="text-center py-20"><p className="text-slate-400">Contract not found</p></div>;
  }

  const config = statusConfig[escrow.status] || statusConfig.draft;

  return (
    <div className="animate-in fade-in duration-500">
      <Link href="/freelancer/contracts" className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors">
        <ChevronLeft size={16} /><span>Back to Contracts</span>
      </Link>

      <div className="card-surface p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100">{escrow.title}</h1>
            {escrow.description && <p className="text-sm text-slate-400 mt-1">{escrow.description}</p>}
          </div>
          <span className={config.badge}>{config.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="badge-amber font-mono font-bold">{escrow.totalAmount} {escrow.currency || 'XLM'}</span>
          {escrow.escrowWallet && (
            <a href={`https://stellar.expert/explorer/testnet/account/${escrow.escrowWallet}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 text-xs">
              <ExternalLink size={12} /><span>View on Stellar</span>
            </a>
          )}
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-6">Milestones</h3>
        <MilestoneTracker milestones={milestones} escrowId={escrowId} role="freelancer" onAction={fetchData} />
      </div>
    </div>
  );
}
