'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, Send, AlertTriangle, DollarSign, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/context/ToastContext';

const statusConfig: Record<string, { color: string; icon: React.ReactNode; bg: string; dot?: boolean }> = {
  pending: { color: 'text-slate-400', icon: <Clock size={16} />, bg: 'bg-slate-500' },
  submitted: { color: 'text-indigo-400', icon: <Send size={16} />, bg: 'bg-indigo-500', dot: true },
  approved: { color: 'text-indigo-400', icon: <DollarSign size={16} />, bg: 'bg-indigo-500' },
  released: { color: 'text-violet-400', icon: <CheckCircle2 size={16} />, bg: 'bg-violet-500' },
  disputed: { color: 'text-rose-400', icon: <AlertTriangle size={16} />, bg: 'bg-rose-500' },
};

interface MilestoneTrackerProps {
  milestones: any[];
  escrowId: string;
  role: 'client' | 'freelancer';
  onAction?: () => void;
}

export function MilestoneTracker({ milestones, escrowId, role, onAction }: MilestoneTrackerProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (milestoneId: string) => {
    setLoading(milestoneId);
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerNotes: notes }),
      });
      if (res.ok) {
        showToast('Milestone submitted for review!', 'success');
        setNoteModal(null);
        setNotes('');
        onAction?.();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to submit', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleApprove = async (milestoneId: string) => {
    setLoading(milestoneId);
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientFeedback: feedback }),
      });
      if (res.ok) {
        showToast('Milestone approved! Claimable balance created.', 'success');
        setFeedback('');
        onAction?.();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to approve', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleClaim = async (milestoneId: string) => {
    setLoading(milestoneId);
    try {
      // In a real app, this would call claimBalance via Freighter
      // For now, we'll simulate the claim
      const res = await fetch(`/api/milestones/${milestoneId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: 'simulated-' + Date.now() }),
      });
      if (res.ok) {
        showToast('Payment claimed successfully!', 'success');
        // Trigger confetti
        import('@/components/shared/Confetti').then(({ triggerConfetti }) => {
          triggerConfetti();
        });
        onAction?.();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to claim', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleDispute = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to dispute this milestone?')) return;
    setLoading(milestoneId);
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/dispute`, {
        method: 'POST',
      });
      if (res.ok) {
        showToast('Dispute filed', 'warning');
        onAction?.();
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(null);
    }
  };

  const sorted = [...milestones].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-0">
      {sorted.map((milestone, index) => {
        const config = statusConfig[milestone.status] || statusConfig.pending;
        const isLast = index === sorted.length - 1;
        const isLoading = loading === milestone._id;

        return (
          <div key={milestone._id} className="relative flex">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center mr-4 shrink-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 relative',
                  milestone.status === 'released'
                    ? 'bg-violet-500/20 border-violet-500'
                    : milestone.status === 'submitted'
                    ? 'bg-indigo-500/20 border-indigo-500'
                    : milestone.status === 'approved'
                    ? 'bg-indigo-500/20 border-indigo-500'
                    : milestone.status === 'disputed'
                    ? 'bg-rose-500/20 border-rose-500'
                    : 'bg-[#120f00] border-slate-700'
                )}
              >
                {milestone.status === 'submitted' && (
                  <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
                  </span>
                )}
                <span className={cn('text-xs font-bold', config.color)}>
                  {milestone.status === 'released' ? '✓' : index + 1}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[40px]',
                    milestone.status === 'released'
                      ? 'bg-violet-500'
                      : 'border-l-2 border-dashed border-indigo-500/20'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="card-surface card-hover p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{milestone.description}</p>
                    )}
                  </div>
                  <span className="badge-indigo font-mono text-xs ml-3 shrink-0">
                    {milestone.amount} XLM
                  </span>
                </div>

                {/* Status + notes */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className={cn('flex items-center space-x-1 text-xs', config.color)}>
                    {config.icon}
                    <span className="capitalize">{milestone.status}</span>
                  </span>
                </div>

                {milestone.freelancerNotes && (
                  <p className="text-xs text-slate-400 bg-[#0a0800] rounded-lg p-2 mb-3 border border-indigo-900/10">
                    <span className="text-indigo-500 font-medium">Notes: </span>
                    {milestone.freelancerNotes}
                  </p>
                )}

                {milestone.clientFeedback && (
                  <p className="text-xs text-slate-400 bg-[#0a0800] rounded-lg p-2 mb-3 border border-indigo-900/10">
                    <span className="text-indigo-500 font-medium">Feedback: </span>
                    {milestone.clientFeedback}
                  </p>
                )}

                {milestone.txHash && milestone.status === 'released' && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-3">
                    <span className="font-mono-hash truncate max-w-[200px]">
                      {milestone.txHash}
                    </span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${milestone.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <ExternalLink size={12} />
                      <span>Stellar Expert</span>
                    </a>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  {/* Client: Approve submitted milestone */}
                  {role === 'client' && milestone.status === 'submitted' && (
                    <button
                      onClick={() => handleApprove(milestone._id)}
                      disabled={isLoading}
                      className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
                    >
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                      <span>Approve & Release</span>
                    </button>
                  )}

                  {/* Freelancer: Submit pending milestone */}
                  {role === 'freelancer' && milestone.status === 'pending' && (
                    <button
                      onClick={() => setNoteModal(milestone._id)}
                      className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-indigo-500/20 transition-colors"
                    >
                      <Send size={12} />
                      <span>Submit for Review</span>
                    </button>
                  )}

                  {/* Freelancer: Claim approved milestone */}
                  {role === 'freelancer' && milestone.status === 'approved' && (
                    <button
                      onClick={() => handleClaim(milestone._id)}
                      disabled={isLoading}
                      className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-violet-500/20 transition-colors"
                    >
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                      <span>Claim Payment</span>
                    </button>
                  )}

                  {/* Dispute (both roles, not if released) */}
                  {milestone.status !== 'released' && milestone.status !== 'disputed' && (
                    <button
                      onClick={() => handleDispute(milestone._id)}
                      className="text-xs text-rose-400/60 hover:text-rose-400 transition-colors px-2 py-1"
                    >
                      Dispute
                    </button>
                  )}
                </div>
              </div>

              {/* Submit notes modal */}
              {noteModal === milestone._id && (
                <div className="min-h-0">
                  <div className="mt-3 card-surface p-4 border-indigo-500/20">
                    <label className="block text-xs text-slate-400 mb-2">
                      Describe what you completed:
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field text-xs h-24 resize-none"
                      placeholder="I completed the wireframes, logo design, and brand guidelines..."
                    />
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => handleSubmit(milestone._id)}
                        disabled={isLoading}
                        className="btn-primary text-xs px-4 py-1.5 rounded-lg flex items-center space-x-1"
                      >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        <span>Submit</span>
                      </button>
                      <button
                        onClick={() => { setNoteModal(null); setNotes(''); }}
                        className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
