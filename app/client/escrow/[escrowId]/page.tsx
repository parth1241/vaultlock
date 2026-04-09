'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Copy, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { MilestoneTracker } from '@/components/shared/MilestoneTracker';
import { useToast } from '@/lib/context/ToastContext';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; badge: string }> = {
  draft: { label: 'Draft', badge: 'badge-sky' },
  active: { label: 'Active', badge: 'badge-indigo' },
  in_progress: { label: 'In Progress', badge: 'badge-amber' },
  completed: { label: 'Completed', badge: 'badge-violet' },
  disputed: { label: 'Disputed', badge: 'badge-rose' },
  cancelled: { label: 'Cancelled', badge: 'badge-sky' },
};

export default function EscrowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const escrowId = params.escrowId as string;

  const [escrow, setEscrow] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

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

  useEffect(() => {
    fetchData();
  }, [escrowId]);

  const copyInvite = () => {
    const url = `${window.location.origin}/invite/${escrow?.inviteToken}`;
    navigator.clipboard.writeText(url);
    showToast('Invite link copied!', 'success');
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this escrow? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/escrows/${escrowId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Escrow cancelled', 'success');
        router.push('/client/dashboard');
      }
    } catch {
      showToast('Failed to cancel', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-amber-500/5 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Escrow not found</p>
        <Link href="/client/dashboard" className="text-amber-400 text-sm mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const config = statusConfig[escrow.status] || statusConfig.draft;

  return (
    <div className="animate-in fade-in duration-500">
      <Link href="/client/dashboard" className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors">
        <ChevronLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="card-surface p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-100">{escrow.title}</h1>
                {escrow.description && (
                  <p className="text-sm text-slate-400 mt-1">{escrow.description}</p>
                )}
              </div>
              <span className={config.badge}>{config.label}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="badge-amber font-mono font-bold">
                {escrow.totalAmount} {escrow.currency || 'XLM'}
              </span>
              {escrow.escrowWallet && (
                <span className="font-mono-hash text-slate-400 truncate max-w-[200px]">
                  {escrow.escrowWallet}
                </span>
              )}
              {escrow.escrowWallet && (
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${escrow.escrowWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 text-xs"
                >
                  <ExternalLink size={12} />
                  <span>Stellar Expert</span>
                </a>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="card-surface p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Milestones</h3>
            <MilestoneTracker
              milestones={milestones}
              escrowId={escrowId}
              role="client"
              onAction={fetchData}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          {/* Freelancer info */}
          {escrow.freelancerId ? (
            <div className="card-surface p-5">
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Freelancer</h4>
              <p className="text-sm text-slate-200 font-medium">Freelancer Assigned</p>
              <p className="text-xs text-slate-500 mt-1">Working on milestones</p>
            </div>
          ) : (
            <div className="card-surface p-5">
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Invite</h4>
              {escrow.inviteToken && (
                <>
                  <p className="text-xs text-slate-400 mb-3">Share this link with your freelancer</p>
                  <button onClick={copyInvite} className="w-full btn-secondary flex items-center justify-center space-x-2 py-2 text-sm">
                    <Copy size={14} />
                    <span>Copy Invite Link</span>
                  </button>
                  {escrow.freelancerEmail && (
                    <p className="text-xs text-slate-500 mt-3">Sent to: {escrow.freelancerEmail}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Danger zone */}
          {escrow.status === 'draft' && (
            <div className="card-surface p-5 border-rose-500/20">
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Danger Zone</h4>
              <button
                onClick={handleCancel}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm hover:bg-rose-500/20 transition-colors"
              >
                <AlertTriangle size={14} />
                <span>Cancel Escrow</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
